import express from 'express';
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { getBlogFile, sanitizeBlogSlug } from './blog-utils.mjs';
import { isAllowedAdminOrigin } from './security-utils.mjs';

const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));

// Blog repo root: admin/ is one level deep, so repo root is ../.. from server/
const BLOG_ROOT = resolve(__dirname, '../..');
const DATA_DIR = join(BLOG_ROOT, 'src/data');
const CONTENT_DIR = join(BLOG_ROOT, 'src/content/blog');

const app = express();
app.use(express.json());
app.use('/api/save', (req, res, next) => {
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

// --- Local save APIs ---

// POST /api/save/data  { topic, data }
// Writes src/data/<topic>.json. Git is intentionally managed separately.
app.post('/api/save/data', (req, res) => {
  const { topic, data } = req.body;
  const safe = ['profile', 'projects', 'skills', 'experience'].includes(topic);
  if (!safe) return res.status(400).json({ error: 'Unknown topic' });
  const file = join(DATA_DIR, `${topic}.json`);
  try {
    writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    res.json({ ok: true, files: [file] });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/save/blog  { slug, originalSlug, data, content }
// Writes/renames a post in src/content/blog/. Git is intentionally managed separately.
app.post('/api/save/blog', (req, res) => {
  const { slug, originalSlug = slug, data, content } = req.body;
  if (!slug || !data || typeof content !== 'string') return res.status(400).json({ error: 'slug/data/content required' });
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
    res.json({ ok: true, files: [file] });
  } catch (e) {
    res.status(400).json({ error: String(e.message ?? e) });
  }
});

function toYmd(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
}

const PORT = process.env.PORT || 8787;
const HOST = process.env.ADMIN_HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`[admin] API server running at http://${HOST}:${PORT}`);
  console.log(`[admin] data dir: ${DATA_DIR}`);
});
