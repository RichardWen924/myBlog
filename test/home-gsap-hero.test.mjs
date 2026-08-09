import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const home = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
const work = readFileSync(resolve(root, 'src/pages/work.astro'), 'utf8');
const globalCss = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');

test('home owns the GSAP landing hero while About owns the previous reactive hero', () => {
  const heroPath = resolve(root, 'src/components/home/HomeLandingHero.astro');
  const canvasPath = resolve(root, 'src/components/home/HomeHeroCanvas.astro');
  const motionPath = resolve(root, 'src/components/home/homeHeroMotion.ts');
  const about = readFileSync(resolve(root, 'src/pages/about.astro'), 'utf8');

  assert.equal(existsSync(heroPath), true);
  assert.equal(existsSync(canvasPath), true);
  assert.equal(existsSync(motionPath), true);
  assert.match(home, /HomeLandingHero/);
  assert.doesNotMatch(home, /HeroReactive/);
  assert.match(about, /HeroReactive/);
  assert.doesNotMatch(work, /HeroReactive/);

  const hero = readFileSync(heroPath, 'utf8');
  const canvas = readFileSync(canvasPath, 'utf8');
  const motion = readFileSync(motionPath, 'utf8');

  assert.match(hero, /HomeHeroCanvas/);
  assert.match(hero, /initHomeHeroMotion/);
  assert.match(canvas, /data-home-hero-workspace/);
  assert.match(canvas, /data-home-hero-current-link/);
  assert.doesNotMatch(canvas, /CURRENT THREAD|ACTIVE|IDEA → SYSTEM/);
  assert.match(motion, /from ['"]gsap['"]/);
  assert.match(motion, /ScrollTrigger/);
  assert.match(motion, /prefers-reduced-motion/);
});

test('home hero uses the restrained archive introduction copy', () => {
  const heroPath = resolve(root, 'src/components/home/HomeLandingHero.astro');
  const hero = readFileSync(heroPath, 'utf8');

  assert.match(hero, /把复杂的事，慢慢做清楚。/);
  assert.match(hero, /Richard's notes\./);
  assert.match(hero, /我是 Richard，一名正在成长的开发者。这里保存我做过的系统、走过的路径，以及还没有想完的事。/);
  assert.doesNotMatch(hero, /A life in systems/);
  assert.doesNotMatch(hero, /Thoughts,/);
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
  assert.match(motion, /coarsePointer/);
  assert.match(motion, /context\.revert/);
  assert.match(motion, /HERO_REVEAL_DURATION/);
  assert.doesNotMatch(motion, /routeFlow/);
  assert.doesNotMatch(motion, /nodeDrift/);
  assert.doesNotMatch(motion, /rotation:\s*360/);
});

test('home hero reveal duration is applied to the GSAP timeline', () => {
  const motionPath = resolve(root, 'src/components/home/homeHeroMotion.ts');
  const motion = readFileSync(motionPath, 'utf8');

  assert.match(motion, /intro\.duration\(HERO_REVEAL_DURATION\)/);
});

test('home hero cleanup removes listeners and reverts the GSAP context', () => {
  const motionPath = resolve(root, 'src/components/home/homeHeroMotion.ts');
  const motion = readFileSync(motionPath, 'utf8');

  assert.match(motion, /return \(\) => \{/);
  assert.match(motion, /removeEventListener\('pointermove'/);
  assert.match(motion, /removeEventListener\('pointerleave'/);
  assert.match(motion, /removeEventListener\(ENTRY_PROGRESS_COMPLETE_EVENT/);
  assert.match(motion, /context\.revert\(\)/);
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
