import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readSiteStyles } from './site-styles.mjs';

const root = resolve(import.meta.dirname, '..');
const hero = readFileSync(resolve(root, 'src/components/react/FutureHero.tsx'), 'utf8');
const css = readSiteStyles(root);
const work = readFileSync(resolve(root, 'src/pages/work.astro'), 'utf8');
const workCss = readFileSync(resolve(root, 'src/styles/work.css'), 'utf8');
const about = readFileSync(resolve(root, 'src/pages/about.astro'), 'utf8');
const homepage = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
const baseLayout = readFileSync(resolve(root, 'src/layouts/Base.astro'), 'utf8');

test('Work Hero renders the BUILD FUTURE outline and particle sequence', () => {
  assert.match(hero, /StrokeText/);
  assert.match(hero, /ParticleText/);
  assert.match(hero, /text="BUILD FUTURE"/g);
  assert.match(hero, /future-wordmark/);
  assert.match(work, /<FutureHero client:load \/>/);
});

test('Work Hero no longer renders the previous copy and navigation payload', () => {
  assert.doesNotMatch(hero, /BlurText|DynamicIllustration|PromptNav/);
  assert.doesNotMatch(hero, /Personal site|Continue|从这里开始探索/);
});

test('Work Hero motion has a reduced-motion fallback', () => {
  assert.match(workCss, /prefers-reduced-motion/);
  assert.match(workCss, /future-wordmark/);
});

test('About keeps the restored personal hero', () => {
  assert.match(about, /name=\{profile\.name\}/);
  assert.match(about, /title=\{profile\.title\}/);
  assert.match(about, /scrollTarget="#the-path"/);
});

test('Homepage sections use Claude-inspired chapter markers', () => {
  const homepage = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
  assert.match(homepage, /SectionEyebrow/);
  assert.match(homepage, /Things I build|Projects/);
  assert.match(homepage, /Notes from the desk|Recent Posts/);
});

test('Work Hero can escape the reading-width layout', () => {
  assert.match(baseLayout, /fullBleed/);
  assert.match(work, /<Base[^>]+fullBleed/);
  assert.match(work, /work-sequence/);
  assert.match(hero, /hero-stage/);
  assert.match(workCss, /100svh/);
});
