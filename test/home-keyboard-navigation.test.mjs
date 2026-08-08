import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const homepage = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
const navigationPath = resolve(root, 'src/components/home/HomeChapterNavigation.astro');
const navigation = existsSync(navigationPath) ? readFileSync(navigationPath, 'utf8') : '';

test('homepage provides explicit arrow-key chapter navigation', () => {
  assert.match(homepage, /HomeChapterNavigation/);
  assert.match(navigation, /addEventListener\(['"]keydown['"]/);
  assert.match(navigation, /ArrowDown/);
  assert.match(navigation, /ArrowUp/);
  assert.match(navigation, /scrollIntoView/);
  assert.match(navigation, /window\.scrollTo/);
  assert.match(navigation, /INPUT|TEXTAREA|SELECT|isContentEditable/);
});

test('homepage chapter navigation owns keyboard and active-section behavior', () => {
  assert.match(homepage, /HomeChapterNavigation/);
  assert.match(navigation, /data-rail-link/);
  assert.match(navigation, /IntersectionObserver/);
  assert.match(navigation, /addEventListener\(['"]keydown['"]/);
  assert.match(navigation, /ArrowDown/);
  assert.match(navigation, /ArrowUp/);
  assert.match(navigation, /scrollIntoView/);
  assert.match(navigation, /window\.scrollTo/);
  assert.match(navigation, /INPUT|TEXTAREA|SELECT|isContentEditable/);
  assert.doesNotMatch(homepage, /addEventListener\(['"]keydown['"]/);
});

test('hero does not draw a second line under the sticky header', () => {
  const heroRule = css.match(/\.home-landing-hero\s*\{([^}]+)\}/s)?.[1] ?? '';

  assert.doesNotMatch(heroRule, /border-top/);
});
