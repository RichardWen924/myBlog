import express from 'express';
import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));

// Blog repo root: admin/ is one level deep, so repo root is ../.. from server/
const BLOG_ROOT = resolve(__dirname, '../..');
const DATA_DIR = join(BLOG_ROOT, 'src/data');
const CONTENT_DIR = join(BLOG_ROOT, 'src/content/blog');

const app = express();
app.use(express.json());

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
  const { slug } = req.params;
  const file = join(CONTENT_DIR, `${slug}.md`);
  const fileMdx = join(CONTENT_DIR, `${slug}.mdx`);
  const target = existsSync(file) ? file : existsSync(fileMdx) ? fileMdx : null;
  if (!target) return res.status(404).json({ error: 'Post not found' });
  try {
    const parsed = matter(readFileSync(target, 'utf-8'));
    res.json({ slug, data: parsed.data, content: parsed.content });
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
  const { slug, data, content, message } = req.body;
  if (!slug || !data || !content) return res.status(400).json({ error: 'slug/data/content required' });
  if (!message) return res.status(400).json({ error: 'Commit message required' });
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  const file = join(CONTENT_DIR, `${safeSlug}.md`);
  const frontmatter = matter.stringify(content, data);
  try {
    writeFileSync(file, frontmatter, 'utf-8');
    const result = gitCommitPush(message);
    res.json({ ok: true, files: [file], ...result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/sync/delete  { path }  — delete a file (e.g. a blog post) then commit+push
app.post('/api/sync/delete', (req, res) => {
  const { file: relPath, message } = req.body;
  if (!relPath || !message) return res.status(400).json({ error: 'file + message required' });
  const full = resolve(BLOG_ROOT, relPath);
  if (!full.startsWith(BLOG_ROOT)) return res.status(400).json({ error: 'Path outside repo' });
  if (!existsSync(full)) return res.status(404).json({ error: 'File not found' });
  try {
    execSync(`git rm "${full}"`, { cwd: BLOG_ROOT });
    const result = gitCommitPush(message);
    res.json({ ok: true, files: [relPath], ...result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/git/status  →  summary of changed files + last commit (for UI diff display)
app.post('/api/git/status', (req, res) => {
  try {
    const changed = execSync('git status --porcelain', { cwd: BLOG_ROOT, encoding: 'utf-8' })
      .split('\n').filter(Boolean);
    const last = execSync('git log -1 --oneline', { cwd: BLOG_ROOT, encoding: 'utf-8' }).trim();
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
  const safeMessage = message.replace(/["`]/g, '');
  const add = execSync('git add src/data src/content/blog', { cwd: BLOG_ROOT, encoding: 'utf-8' });
  let commit;
  try {
    commit = execSync(`git commit -m "${safeMessage}"`, { cwd: BLOG_ROOT, encoding: 'utf-8' });
  } catch (e) {
    // Nothing staged to commit (no changes) — not an error
    if (String(e.stderr ?? '').includes('nothing to commit')) {
      return { committed: false, reason: 'nothing to commit' };
    }
    throw e;
  }
  const push = execSync('git push origin main', { cwd: BLOG_ROOT, encoding: 'utf-8' });
  return { committed: true, commit: commit.trim(), push: push.trim() };
}

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`[admin] API server running at http://localhost:${PORT}`);
  console.log(`[admin] data dir: ${DATA_DIR}`);
});
