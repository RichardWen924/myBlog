import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');

test('homepage hero is outside the chapter snap sequence', () => {
  assert.doesNotMatch(
    css,
    /\.home-hero-panel\s*,\s*\.home-chapter\s*\{[^}]*scroll-snap-align/s,
  );
  assert.match(css, /\.home-chapter\s*\{[^}]*scroll-snap-align/s);
});
