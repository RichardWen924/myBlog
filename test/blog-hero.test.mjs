import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');

test('blog page composes the Hero above the existing year archive', () => {
  const page = read('src/pages/blog/index.astro');
  assert.match(page, /BlogHero/);
  assert.match(page, /id="blog-archive"/);
  assert.match(page, /yearGroups/);
  assert.match(page, /YearGroup/);
});

test('blog Hero exposes welcome, search, results, clear, and scroll contracts', () => {
  assert.equal(existsSync(resolve(root, 'src/components/blog/BlogHero.astro')), true);
  const hero = read('src/components/blog/BlogHero.astro');
  assert.match(hero, /WELCOME, BLOG/);
  assert.match(hero, /role="search"/);
  assert.match(hero, /aria-controls="blog-results"/);
  assert.match(hero, /aria-live="polite"/);
  assert.match(hero, /data-blog-clear/);
  assert.match(hero, /href="#blog-archive"/);
});

test('blog Hero defaults to three recent posts and can search all posts', () => {
  const hero = read('src/components/blog/BlogHero.astro');
  assert.match(hero, /posts\.slice\(0, 3\)/);
  assert.match(hero, /data-blog-posts/);
  assert.match(hero, /title.*description.*tags/s);
  assert.match(hero, /toLowerCase\(\)/);
  assert.match(hero, /No matching posts/);
});

test('blog styles use the default visual tokens and mobile layout', () => {
  const styles = read('src/styles/blog.css');
  assert.match(styles, /--color-paper/);
  assert.match(styles, /--font-serif/);
  assert.match(styles, /--font-mono/);
  assert.match(styles, /@media \(max-width: 767px\)/);
  assert.match(styles, /prefers-reduced-motion/);
});
