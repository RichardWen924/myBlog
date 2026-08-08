import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const home = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
const work = readFileSync(resolve(root, 'src/pages/work.astro'), 'utf8');

test('home owns the GSAP landing hero while work owns the previous reactive hero', () => {
  const heroPath = resolve(root, 'src/components/home/HomeLandingHero.astro');

  assert.equal(existsSync(heroPath), true);
  assert.match(home, /HomeLandingHero/);
  assert.doesNotMatch(home, /HeroReactive/);
  assert.match(work, /HeroReactive/);

  const hero = readFileSync(heroPath, 'utf8');
  assert.match(hero, /from ['"]gsap['"]/);
  assert.match(hero, /ScrollTrigger/);
  assert.match(hero, /prefers-reduced-motion/);
});

test('home hero uses a welcome message and keeps the copy visible after scroll reset', () => {
  const heroPath = resolve(root, 'src/components/home/HomeLandingHero.astro');
  const hero = readFileSync(heroPath, 'utf8');
  const copyTween = hero.match(/gsap\.to\(copy,[\s\S]*?\n      \}\);/)?.[0];

  assert.match(hero, /<span>Welcome to<\/span>/);
  assert.match(hero, /<em>Richard's notes\.<\/em>/);
  assert.doesNotMatch(hero, /<em>in progress\.<\/em>/);
  assert.ok(copyTween, 'expected a scroll tween for the hero copy');
  assert.doesNotMatch(copyTween, /autoAlpha|opacity/);
});

test('home hero archive metadata has no decorative divider', () => {
  const heroPath = resolve(root, 'src/components/home/HomeLandingHero.astro');
  const stylesPath = resolve(root, 'src/styles/global.css');
  const hero = readFileSync(heroPath, 'utf8');
  const styles = readFileSync(stylesPath, 'utf8');

  assert.doesNotMatch(hero, /home-landing-hero__index-rule/);
  assert.doesNotMatch(styles, /home-landing-hero__index-rule/);
});
