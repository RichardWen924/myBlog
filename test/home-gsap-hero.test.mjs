import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const home = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
const work = readFileSync(resolve(root, 'src/pages/work.astro'), 'utf8');
const globalCss = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');

test('home owns the GSAP landing hero while work owns the previous reactive hero', () => {
  const heroPath = resolve(root, 'src/components/home/HomeLandingHero.astro');
  const canvasPath = resolve(root, 'src/components/home/HomeHeroCanvas.astro');
  const motionPath = resolve(root, 'src/components/home/homeHeroMotion.ts');

  assert.equal(existsSync(heroPath), true);
  assert.equal(existsSync(canvasPath), true);
  assert.equal(existsSync(motionPath), true);
  assert.match(home, /HomeLandingHero/);
  assert.doesNotMatch(home, /HeroReactive/);
  assert.match(work, /HeroReactive/);

  const hero = readFileSync(heroPath, 'utf8');
  const canvas = readFileSync(canvasPath, 'utf8');
  const motion = readFileSync(motionPath, 'utf8');

  assert.match(hero, /HomeHeroCanvas/);
  assert.match(hero, /initHomeHeroMotion/);
  assert.match(canvas, /data-home-hero-workspace/);
  assert.match(canvas, /CURRENT THREAD/);
  assert.match(motion, /from ['"]gsap['"]/);
  assert.match(motion, /ScrollTrigger/);
  assert.match(motion, /prefers-reduced-motion/);
});

test('home hero uses an editorial systems message and keeps the personal welcome', () => {
  const heroPath = resolve(root, 'src/components/home/HomeLandingHero.astro');
  const hero = readFileSync(heroPath, 'utf8');

  assert.match(hero, /Thoughts,/);
  assert.match(hero, /built into/);
  assert.match(hero, /systems\./);
  assert.match(hero, /Welcome to Richard's notes/);
  assert.doesNotMatch(hero, /<em>in progress\.<\/em>/);
});

test('home hero motion combines ambient, pointer and reversible scroll movement', () => {
  const motionPath = resolve(root, 'src/components/home/homeHeroMotion.ts');
  const motion = readFileSync(motionPath, 'utf8');

  assert.match(motion, /pointermove/);
  assert.match(motion, /scrub:/);
  assert.match(motion, /data-home-hero-title-line/);
  assert.match(motion, /data-home-hero-paper/);
  assert.match(motion, /data-home-hero-route/);
  assert.match(motion, /context\.revert/);
  assert.doesNotMatch(motion, /rotation:\s*360/);
});

test('home hero waits for the entry loader before playing its reveal timeline', () => {
  const motionPath = resolve(root, 'src/components/home/homeHeroMotion.ts');
  const motion = readFileSync(motionPath, 'utf8');

  assert.match(motion, /ENTRY_PROGRESS_COMPLETE_EVENT/);
  assert.match(motion, /timeline\(\{[\s\S]*?paused:\s*true/);
  assert.match(motion, /dataset\.entryReady\s*===\s*['"]true['"]/);
  assert.match(motion, /addEventListener\(ENTRY_PROGRESS_COMPLETE_EVENT/);
  assert.match(motion, /removeEventListener\(ENTRY_PROGRESS_COMPLETE_EVENT/);
  assert.match(motion, /intro\.play\(0\)/);
});

test('legacy hero selectors do not leak from global styles into the module', () => {
  assert.doesNotMatch(
    globalCss,
    /home-landing-hero__(?:art|halo|orbit|note|grid|index|index-rule|caption|scroll-line)/,
  );
});
