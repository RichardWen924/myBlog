import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const hero = readFileSync(resolve(root, 'src/components/react/HeroReactive.tsx'), 'utf8');
const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
const homepage = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
const baseLayout = readFileSync(resolve(root, 'src/layouts/Base.astro'), 'utf8');

test('Hero references the generated thinking-orbit asset', () => {
  assert.match(hero, /hero-thinking-orbit\.png/);
  assert.equal(existsSync(resolve(root, 'public/hero-thinking-orbit.png')), true);
});

test('Hero uses the thinking orbit as a background layer', () => {
  assert.match(hero, /hero-thinking-orbit pointer-events-none absolute inset-0/);
  assert.match(hero, /aria-hidden="true"/);
  assert.match(hero, /md:col-start-3/);
});

test('Hero motion has a reduced-motion fallback', () => {
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /hero-thinking-orbit/);
});

const promptNavPath = resolve(root, 'src/components/react/PromptNav.tsx');
const illustrationPath = resolve(root, 'src/components/react/DynamicIllustration.tsx');

test('Hero has a layered dynamic illustration and prompt navigation', () => {
  assert.equal(existsSync(promptNavPath), true);
  assert.equal(existsSync(illustrationPath), true);
  const promptNav = readFileSync(promptNavPath, 'utf8');
  const illustration = readFileSync(illustrationPath, 'utf8');
  assert.match(hero, /DynamicIllustration/);
  assert.match(hero, /PromptNav/);
  assert.match(illustration, /aria-hidden/);
  assert.match(illustration, /prefers-reduced-motion|useReducedMotion/);
  assert.match(promptNav, /href/);
  assert.match(hero, /\/projects/);
  assert.match(hero, /\/about/);
  assert.match(hero, /\/blog/);
});

test('Homepage sections use Claude-inspired chapter markers', () => {
  const homepage = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
  assert.match(homepage, /SectionEyebrow/);
  assert.match(homepage, /Things I build|Projects/);
  assert.match(homepage, /Notes from the desk|Recent Posts/);
});

test('Dynamic illustration motion is reduced for small screens and reduced motion', () => {
  assert.match(css, /dynamic-illustration/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width: 767px/);
});

test('Homepage Hero can escape the reading-width layout', () => {
  assert.match(baseLayout, /fullBleed/);
  assert.match(homepage, /<Base[^>]+fullBleed/);
  assert.match(homepage, /home-content/);
  assert.match(hero, /hero-stage/);
  assert.match(css, /100svh/);
});
