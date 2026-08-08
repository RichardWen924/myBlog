import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const homepage = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');

test('homepage provides explicit arrow-key chapter navigation', () => {
  assert.match(homepage, /addEventListener\(['"]keydown['"]/);
  assert.match(homepage, /ArrowDown/);
  assert.match(homepage, /ArrowUp/);
  assert.match(homepage, /scrollIntoView/);
  assert.match(homepage, /window\.scrollTo/);
  assert.match(homepage, /INPUT|TEXTAREA|SELECT|isContentEditable/);
});

test('hero does not draw a second line under the sticky header', () => {
  const heroRule = css.match(/\.home-landing-hero\s*\{([^}]+)\}/s)?.[1] ?? '';

  assert.doesNotMatch(heroRule, /border-top/);
});
