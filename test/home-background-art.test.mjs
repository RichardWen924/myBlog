import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const homepage = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');

test('homepage chapter artwork is rendered as full-bleed background layers', () => {
  assert.match(homepage, /chapter-art[^>]+absolute inset-0/);
  assert.match(homepage, /section-introduction-orbit\.png/);
  assert.match(homepage, /section-build-route\.png/);
  assert.match(homepage, /section-notes-paper\.png/);
  assert.match(css, /chapter-art__image/);
  assert.match(css, /object-fit: cover/);
});

test('all generated chapter background assets exist', () => {
  for (const file of ['section-introduction-orbit.png', 'section-build-route.png', 'section-notes-paper.png']) {
    assert.equal(existsSync(resolve(root, 'public', file)), true, file);
  }
});
