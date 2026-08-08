import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const componentPath = resolve(root, 'src/components/entry/EntryProgressLoader.astro');
const base = readFileSync(resolve(root, 'src/layouts/Base.astro'), 'utf8');
const home = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');

test('entry loader exposes the five ordered progress milestones', () => {
  const source = readFileSync(componentPath, 'utf8');
  for (const value of ['0%', '25%', '50%', '75%', '100%']) {
    assert.match(source, new RegExp(`data-progress="${value}"`));
  }
  assert.match(source, /role="progressbar"/);
  assert.match(source, /aria-valuemin="0"/);
  assert.match(source, /aria-valuemax="100"/);
});

test('entry loader uses GSAP and respects reduced motion', () => {
  const source = readFileSync(componentPath, 'utf8');
  assert.match(source, /from ['"]gsap['"]/);
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /gsap\.timeline/);
  assert.match(source, /setTimeout/);
});

test('entry loader fails open without JavaScript and isolates page content while active', () => {
  const source = readFileSync(componentPath, 'utf8');
  assert.match(source, /:not\(\[data-runtime\]\)/);
  assert.match(source, /data-entry-content/);
  assert.match(source, /setAttribute\(['"]inert['"],/);
  assert.match(source, /removeAttribute\(['"]inert['"]\)/);
});

test('entry loader rail follows the viewport instead of a fixed max width', () => {
  const source = readFileSync(componentPath, 'utf8');
  assert.match(source, /width:\s*100vw/);
  assert.match(source, /min-height:\s*100dvh/);
  assert.doesNotMatch(source, /min\(52rem/);
});

test('Base supports an optional loader and homepage enables it', () => {
  assert.match(base, /showEntryLoader\?: boolean/);
  assert.match(base, /showEntryLoader = false/);
  assert.match(base, /<EntryProgressLoader \/>/);
  assert.match(home, /showEntryLoader/);
});
