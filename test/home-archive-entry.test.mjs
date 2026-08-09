import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const home = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');
const hero = readFileSync(resolve(root, 'src/components/home/HomeLandingHero.astro'), 'utf8');
const canvas = readFileSync(resolve(root, 'src/components/home/HomeHeroCanvas.astro'), 'utf8');
const navigation = readFileSync(resolve(root, 'src/components/home/HomeChapterNavigation.astro'), 'utf8');
const homeCss = readFileSync(resolve(root, 'src/styles/home.css'), 'utf8');

const cssBlock = (source, selector, startAt = 0) => {
  const selectorStart = source.indexOf(`${selector} {`, startAt);
  assert.notEqual(selectorStart, -1, `${selector} should exist after offset ${startAt}`);
  const openBrace = source.indexOf('{', selectorStart);
  let depth = 0;

  for (let index = openBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openBrace + 1, index);
  }

  assert.fail(`${selector} should have a closed CSS block`);
};

test('home exposes the three archive destinations with editorial entry rows', () => {
  for (const href of ['/about', '/work', '/blog']) {
    assert.match(home, new RegExp(`href="${href}"`));
  }

  for (const label of ['About me', 'Work', 'Blog']) {
    assert.match(home, new RegExp(label));
  }

  assert.match(home, /home-archive-entry/);
  assert.match(home, /ArchiveLink/);
  assert.doesNotMatch(home, /grid-cols-3/);
  assert.doesNotMatch(home, /rounded-(?:lg|xl|2xl)/);
});

test('home canvas keeps decorative layers hidden while exposing one real current-content link', () => {
  assert.match(canvas, /data-home-hero-current-link/);
  assert.match(canvas, /href=\{currentContentHref\}/);
  assert.match(canvas, /aria-hidden="true"/);
  assert.doesNotMatch(canvas, /CURRENT THREAD|ACTIVE|IDEA → SYSTEM/);
  assert.doesNotMatch(canvas, /Building calm/);

  const workspaceOpeningTag = canvas.match(/<div class="home-landing-hero__workspace"[^>]*>/)?.[0] ?? '';
  assert.doesNotMatch(workspaceOpeningTag, /aria-hidden/);
});

test('home supporting content stays subordinate and readable', () => {
  const currentTitle = homeCss.match(/\.home-landing-hero__current-content h2\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const currentDescription = homeCss.match(/\.home-landing-hero__current-content p\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const lede = homeCss.match(/\.home-landing-hero__lede\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(currentTitle, /font-size:\s*clamp\(1\.4rem,\s*2vw,\s*1\.7rem\)/);
  assert.match(currentDescription, /font-size:\s*1rem/);
  assert.match(lede, /font-size:\s*clamp\(1rem,/);
  assert.doesNotMatch(canvas, /home-landing-hero__paper-footer|RICHARD \/ SHANGHAI/);
});

test('mobile hero lede keeps the readable 1rem minimum', () => {
  const mobileMediaStart = homeCss.indexOf('@media (max-width: 767px)');
  assert.notEqual(mobileMediaStart, -1, 'mobile home media block should exist');

  const mobileLede = cssBlock(homeCss, '.home-landing-hero__lede', mobileMediaStart);
  assert.match(mobileLede, /(?:^|\n)\s*font-size:\s*1rem;\s*$/m);
});

test('home stylesheet does not retain removed layout selector contracts', () => {
  for (const selector of [
    '.home-landing-hero__paper-footer',
    '.home-chapter__inner--copy-left',
    '.home-chapter__inner--copy-right',
    '.home-chapter__copy',
  ]) {
    assert.doesNotMatch(homeCss, new RegExp(`\\${selector}`));
  }
});

test('home preserves the four public chapter anchors and keeps the mobile rail accessible', () => {
  for (const id of ['introduction', 'projects', 'notes', 'contact']) {
    assert.match(home, new RegExp(`id="${id}"`));
    assert.match(navigation, new RegExp(`href="#${id}"`));
  }

  assert.match(navigation, /aria-label="Homepage chapters"/);
  assert.match(navigation, /aria-current/);
});
