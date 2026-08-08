import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const header = readFileSync(resolve(root, 'src/components/global/Header.astro'), 'utf8');
const styles = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');

test('top navigation stays visible while the page scrolls', () => {
  assert.match(header, /<header[^>]+sticky/);
  assert.match(header, /top-0/);
  assert.match(header, /z-\d+/);
});

test('navigation exposes active routes and a native mobile menu', () => {
  assert.match(header, /Astro\.url\.pathname/);
  assert.match(header, /const navItems/);
  assert.match(header, /aria-label="Primary navigation"/);
  assert.match(header, /aria-current=/);
  assert.match(header, /<details[^>]+site-header__mobile/);
  assert.match(header, /<summary[^>]+site-header__menu/);
});

test('navigation covers top-level and nested routes with visible focus affordances', () => {
  assert.match(header, /pathname === '\/'/);
  assert.match(header, /\/projects/);
  assert.match(header, /\/blog/);
  assert.match(header, /\/about/);
  assert.match(styles, /\.site-header__link:focus-visible/);
  assert.match(styles, /\.site-header__menu[^\{]*\{[\s\S]*min-height: 2\.75rem/);
});
