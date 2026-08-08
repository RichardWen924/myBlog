import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const header = readFileSync(resolve(root, 'src/components/global/Header.astro'), 'utf8');

test('top navigation stays visible while the page scrolls', () => {
  assert.match(header, /<header[^>]+sticky/);
  assert.match(header, /top-0/);
  assert.match(header, /z-\d+/);
});
