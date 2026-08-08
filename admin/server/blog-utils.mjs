import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function sanitizeBlogSlug(value) {
  if (typeof value !== 'string') throw new Error('Blog slug is required');

  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) throw new Error('Blog slug must contain letters or numbers');
  return slug;
}

export function getBlogFile(contentDir, slug) {
  for (const extension of ['.md', '.mdx']) {
    const file = join(contentDir, `${slug}${extension}`);
    if (existsSync(file)) return file;
  }
  return null;
}
