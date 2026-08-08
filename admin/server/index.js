import express from 'express';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { getBlogFile, sanitizeBlogSlug } from './blog-utils.mjs';
import { sortModules, validateModules } from './module-utils.mjs';
import { isAllowedAdminOrigin } from './security-utils.mjs';

const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));

// Blog repo root: admin/ is one level deep, so repo root is ../.. from server/
const BLOG_ROOT = resolve(__dirname, '../..');
const DATA_DIR = join(BLOG_ROOT, 'src/data');
const CONTENT_DIR = join(BLOG_ROOT, 'src/content/blog');
const MODULES_DIR = join(BLOG_ROOT, 'src/content/modules');
const TRUSTED_MODULES_DIR = join(BLOG_ROOT, 'src/modules/trusted');

const app = express();
app.use(express.json());
app.use('/api/sync', (req, res, next) => {
  if (isAllowedAdminOrigin(req.get('origin'))) return next();
  return res.status(403).json({ error: 'Origin not allowed' });
});

// --- Read APIs ---

// GET /api/data/:topic  →  reads src/data/<topic>.json
app.get('/api/data/:topic', (req, res) => {
  const { topic } = req.params;
  const safe = ['profile', 'projects', 'skills', 'experience'].includes(topic);
  if (!safe) return res.status(400).json({ error: 'Unknown topic' });
  const file = join(DATA_DIR, `${topic}.json`);
  if (!existsSync(file)) return res.status(404).json({ error: 'File not found' });
  try {
    res.json(JSON.parse(readFileSync(file, 'utf-8')));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/blog  →  lists blog posts (title, date, draft, tags) without full content
app.get('/api/blog', (req, res) => {
  try {
    if (!existsSync(CONTENT_DIR)) return res.json([]);
    const files = readdirSync(CONTENT_DIR).filter((f) => /\.(md|mdx)$/.test(f));
    const posts = files.map((f) => {
      const raw = readFileSync(join(CONTENT_DIR, f), 'utf-8');
      const { data } = matter(raw);
      return {
        slug: f.replace(/\.(md|mdx)$/, ''),
        title: data.title ?? f,
        // gray-matter converts YAML dates to Date objects; normalize to YYYY-MM-DD
        date: toYmd(data.date),
        draft: data.draft ?? false,
        tags: data.tags ?? [],
        description: data.description ?? '',
      };
    });
    posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/blog/:slug  →  returns full frontmatter + content of one post
app.get('/api/blog/:slug', (req, res) => {
  let slug;
  try {
    slug = sanitizeBlogSlug(req.params.slug);
  } catch {
    return res.status(400).json({ error: 'Invalid post slug' });
  }
  const target = getBlogFile(CONTENT_DIR, slug);
  if (!target) return res.status(404).json({ error: 'Post not found' });
  try {
    const parsed = matter(readFileSync(target, 'utf-8'));
    res.json({ slug, data: parsed.data, content: parsed.content });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/modules → returns the current module collection entries.
app.get('/api/modules', (req, res) => {
  try {
    if (!existsSync(MODULES_DIR)) return res.json([]);
    const modules = readdirSync(MODULES_DIR)
      .filter((file) => file.endsWith('.json'))
      .map((file) => JSON.parse(readFileSync(join(MODULES_DIR, file), 'utf-8')));
    res.json(sortModules(modules));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// --- Sync APIs ---

// POST /api/sync/data  { topic, data, message }
// Writes src/data/<topic>.json, then git commit + push
app.post('/api/sync/data', (req, res) => {
  const { topic, data, message } = req.body;
  const safe = ['profile', 'projects', 'skills', 'experience'].includes(topic);
  if (!safe) return res.status(400).json({ error: 'Unknown topic' });
  if (!message) return res.status(400).json({ error: 'Commit message required' });
  const file = join(DATA_DIR, `${topic}.json`);
  try {
    writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    const result = gitCommitPush(message);
    res.json({ ok: true, files: [file], ...result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/sync/blog  { slug, data, content, message }
// Writes/creates <slug>.md in src/content/blog/, then git commit + push
app.post('/api/sync/blog', (req, res) => {
  const { slug, originalSlug = slug, data, content, message } = req.body;
  if (!slug || !data || typeof content !== 'string') return res.status(400).json({ error: 'slug/data/content required' });
  if (!message) return res.status(400).json({ error: 'Commit message required' });
  try {
    const safeSlug = sanitizeBlogSlug(slug);
    const safeOriginalSlug = sanitizeBlogSlug(originalSlug);
    const originalFile = getBlogFile(CONTENT_DIR, safeOriginalSlug);
    const existingTarget = getBlogFile(CONTENT_DIR, safeSlug);
    if (existingTarget && existingTarget !== originalFile) {
      return res.status(409).json({ error: 'A post with that slug already exists' });
    }

    const extension = originalFile?.endsWith('.mdx') ? '.mdx' : '.md';
    const file = join(CONTENT_DIR, `${safeSlug}${extension}`);
    const frontmatter = matter.stringify(content, data);
    writeFileSync(file, frontmatter, 'utf-8');
    if (originalFile && originalFile !== file) unlinkSync(originalFile);
    const result = gitCommitPush(message);
    res.json({ ok: true, files: [file], ...result });
  } catch (e) {
    res.status(400).json({ error: String(e.message ?? e) });
  }
});

// POST /api/sync/modules { modules, sources, message }
// Writes the complete module collection and optional trusted TS sources, then commits and pushes.
app.post('/api/sync/modules', (req, res) => {
  const { modules, sources = {}, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Commit message required' });
  try {
    validateModules(modules);
    if (!sources || typeof sources !== 'object' || Array.isArray(sources)) {
      return res.status(400).json({ error: 'sources must be an object' });
    }
    for (const [id, source] of Object.entries(sources)) {
      if (!/^[a-z0-9][a-z0-9-_]*$/.test(id) || typeof source !== 'string') {
        return res.status(400).json({ error: `Invalid trusted module source: ${id}` });
      }
      if (!modules.some((module) => module.id === id && module.type === 'trusted')) {
        return res.status(400).json({ error: `Trusted source has no trusted module entry: ${id}` });
      }
    }

    mkdirSync(MODULES_DIR, { recursive: true });
    mkdirSync(TRUSTED_MODULES_DIR, { recursive: true });

    const currentFiles = readdirSync(MODULES_DIR).filter((file) => file.endsWith('.json'));
    const nextFiles = new Set(modules.map((module) => `${module.id}.json`));
    for (const file of currentFiles) {
      if (!nextFiles.has(file)) unlinkSync(join(MODULES_DIR, file));
    }
    for (const module of modules) {
      writeFileSync(join(MODULES_DIR, `${module.id}.json`), JSON.stringify(module, null, 2) + '\n', 'utf-8');
    }

    const files = modules.map((module) => join('src/content/modules', `${module.id}.json`));
    for (const [id, source] of Object.entries(sources)) {
      writeFileSync(join(TRUSTED_MODULES_DIR, `${id}.ts`), source, 'utf-8');
      files.push(join('src/modules/trusted', `${id}.ts`));
    }

    const result = gitCommitPush(message);
    res.json({ ok: true, files, ...result });
  } catch (e) {
    res.status(400).json({ error: String(e.message ?? e) });
  }
});

// POST /api/sync/delete  { file, message } — delete a file, then commit+push
app.post('/api/sync/delete', (req, res) => {
  const { file: relPath, message } = req.body;
  if (!relPath || !message) return res.status(400).json({ error: 'file + message required' });
  // Restrict deletes to known writable dirs (src/data + src/content/blog), never arbitrary paths.
  const allowed = /^(src\/data\/[A-Za-z0-9_-]+\.json|src\/content\/blog\/[A-Za-z0-9_-]+\.(md|mdx))$/.test(relPath);
  if (!allowed) return res.status(400).json({ error: 'Path not allowed' });
  const full = join(BLOG_ROOT, relPath);
  if (!existsSync(full)) return res.status(404).json({ error: 'File not found' });
  try {
    execFileSync('git', ['rm', full], { cwd: BLOG_ROOT, encoding: 'utf-8' });
    const result = gitCommitPush(message);
    res.json({ ok: true, files: [relPath], ...result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/git/status  →  summary of changed files + last commit (for UI diff display)
app.post('/api/git/status', (req, res) => {
  try {
    const changed = execFileSync('git', ['status', '--porcelain'], { cwd: BLOG_ROOT, encoding: 'utf-8' })
      .split('\n').filter(Boolean);
    const last = execFileSync('git', ['log', '-1', '--oneline'], { cwd: BLOG_ROOT, encoding: 'utf-8' }).trim();
    res.json({ changed, last });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

function toYmd(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
}

function gitCommitPush(message) {
  // execFileSync passes args as an array — no shell interpolation, no injection.
  execFileSync('git', ['add', 'src/data', 'src/content/blog', 'src/content/modules', 'src/modules'], {
    cwd: BLOG_ROOT,
    encoding: 'utf-8',
  });
  let commit;
  try {
    commit = execFileSync('git', ['commit', '-m', message], {
      cwd: BLOG_ROOT,
      encoding: 'utf-8',
    });
  } catch (e) {
    // Nothing staged to commit (no changes) — not an error
    if (String(e.stderr ?? '').includes('nothing to commit')) {
      return { committed: false, reason: 'nothing to commit' };
    }
    throw e;
  }
  const push = execFileSync('git', ['push', 'origin', 'main'], {
    cwd: BLOG_ROOT,
    encoding: 'utf-8',
  });
  return { committed: true, commit: commit.trim(), push: push.trim() };
}

const PORT = process.env.PORT || 8787;
const HOST = process.env.ADMIN_HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`[admin] API server running at http://${HOST}:${PORT}`);
  console.log(`[admin] data dir: ${DATA_DIR}`);
});
