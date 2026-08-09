import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');

test('blog uses the welcome title and removes the old lede', () => {
  const hero = read('src/components/blog/BlogHero.astro');
  assert.match(hero, /Welcome, Blog/);
  assert.doesNotMatch(hero, /A quiet index of things I’m learning/);
  assert.match(hero, /blog-hero__inner/);
});

test('blog is composed as two full viewport snap chapters', () => {
  const page = read('src/pages/blog/index.astro');
  const css = read('src/styles/blog.css');
  assert.match(page, /htmlClass="blog-scroll-snap"/);
  assert.match(page, /blog-chapter.*blog-chapter--hero/s);
  assert.match(page, /blog-chapter.*blog-chapter--archive/s);
  assert.match(page, /data-blog-chapter/);
  assert.match(css, /html\.blog-scroll-snap\s*\{[^}]*scroll-snap-type:\s*y mandatory/s);
  assert.match(css, /\.blog-chapter\s*\{[^}]*min-height:\s*calc\(100svh - var\(--site-header-height\)/s);
  assert.match(css, /scroll-snap-stop:\s*always/);
});

test('blog content and rail are centered and keyboard navigation is accessible', () => {
  const page = read('src/pages/blog/index.astro');
  const css = read('src/styles/blog.css');
  assert.match(page, /data-blog-chapter-rail/);
  assert.match(page, /aria-current="step"/);
  assert.match(page, /ArrowDown/);
  assert.match(page, /ArrowUp/);
  assert.match(css, /\.blog-hero__inner\s*\{[^}]*align-items:\s*center/s);
  assert.match(css, /text-align:\s*center/);
  assert.match(css, /\.blog-search\s*\{[^}]*margin-inline:\s*auto/s);
});
