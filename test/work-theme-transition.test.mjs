import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { readSiteStyles } from './site-styles.mjs';

const root = resolve(import.meta.dirname, '..');
const work = readFileSync(resolve(root, 'src/pages/work.astro'), 'utf8');
const base = readFileSync(resolve(root, 'src/layouts/Base.astro'), 'utf8');
const transition = readFileSync(resolve(root, 'src/components/entry/WorkTransitionProgress.astro'), 'utf8');
const css = readSiteStyles(root);

test('Work enters through a dedicated theme transition loader', () => {
  assert.match(work, /showWorkTransition/);
  assert.match(work, /work-page/);
  assert.match(base, /WorkTransitionProgress/);
  assert.match(transition, /role="progressbar"/);
  assert.match(transition, /data-work-transition-duration-ms="1100"/);
});

test('Work transition uses a moving gradient and changes from paper to black', () => {
  assert.match(transition, /linear-gradient\(90deg, #6e8cff 0%, #9b6cff 28%, #ed6f9d 62%, #ffb56e 100%\)/);
  assert.match(transition, /@keyframes work-transition-gradient/);
  assert.match(transition, /backgroundColor: '#080909'/);
  assert.match(transition, /color: '#f3f0e8'/);
  assert.match(css, /html\.work-page\s*\{[\s\S]*?--color-paper:\s*#080909/);
});

test('Work transition locks content and has a reduced-motion fallback', () => {
  assert.match(transition, /entry-progress-lock/);
  assert.match(transition, /setAttribute\('inert'/);
  assert.match(transition, /prefers-reduced-motion/);
  assert.match(transition, /setTimeout\(removeLoader, 0\)/);
});
