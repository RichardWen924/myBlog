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
