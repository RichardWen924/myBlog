import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readSiteStyles } from './site-styles.mjs';

const root = resolve(import.meta.dirname, '..');
const work = readFileSync(resolve(root, 'src/pages/work.astro'), 'utf8');
const orbitPath = resolve(root, 'src/components/react/SkillsOrbit.tsx');

test('Work renders the interactive skills orbit instead of progress bars', () => {
  assert.equal(existsSync(orbitPath), true);
  assert.match(work, /SkillsOrbit/);

  const orbit = readFileSync(orbitPath, 'utf8');
  assert.match(orbit, /viewBox/);
  assert.match(orbit, /skill-orbit__category/);
  assert.match(orbit, /skill-orbit__item/);
  assert.match(orbit, /onPointerEnter|onMouseEnter/);
});

test('Skills orbit includes motion and accessibility fallbacks', () => {
  const orbit = readFileSync(orbitPath, 'utf8');
  const css = readSiteStyles(root);

  assert.match(orbit, /useReducedMotion/);
  assert.match(orbit, /aria-label/);
  assert.match(css, /skill-orbit/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width: 767px/);
});

test('Decorative orbit paths stay as strokes instead of filled shapes', () => {
  const orbit = readFileSync(orbitPath, 'utf8');
  assert.match(orbit, /<path[^>]+fill="none"[^>]+stroke="currentColor"/);
});
