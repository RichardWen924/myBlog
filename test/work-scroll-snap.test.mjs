import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { readSiteStyles } from './site-styles.mjs';

const root = resolve(import.meta.dirname, '..');
const page = readFileSync(resolve(root, 'src/pages/work.astro'), 'utf8');
const navigation = readFileSync(resolve(root, 'src/components/work/WorkChapterNavigation.astro'), 'utf8');
const css = readSiteStyles(root);

test('work page uses full-page magnetic chapters', () => {
  assert.match(page, /htmlClass="work-scroll-snap"/);
  assert.match(page, /data-work-chapter="hero"/);
  assert.match(page, /data-work-chapter="systems"/);
  assert.match(page, /data-work-chapter="projects"/);
  assert.match(page, /data-work-chapter="experience"/);
  assert.match(page, /data-work-chapter="more"/);
  assert.match(css, /html\.work-scroll-snap\s*\{[^}]*scroll-snap-type:\s*y mandatory/s);
  assert.match(css, /\.work-chapter\s*\{[^}]*scroll-snap-align:\s*start/s);
  assert.match(css, /\.work-chapter\s*\{[^}]*scroll-snap-stop:\s*always/s);
});

test('work page provides accessible rail and keyboard chapter navigation', () => {
  assert.match(navigation, /data-work-rail-link/);
  assert.match(page, /IntersectionObserver/);
  assert.match(page, /addEventListener\(['"]keydown['"]/);
  assert.match(page, /ArrowDown/);
  assert.match(page, /ArrowUp/);
  assert.match(page, /scrollIntoView/);
  assert.match(page, /window\.scrollTo/);
  assert.match(page, /prefers-reduced-motion/);
  assert.match(page, /INPUT|TEXTAREA|SELECT|BUTTON|A|SUMMARY|isInteractiveControl/);
  assert.match(page, /closest\('a, button, summary/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.work-chapter-rail a\s*\{[^}]*width:\s*2\.75rem[^}]*height:\s*2\.75rem/s);
});

test('work magnetic scrolling turns off for reduced-motion users', () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?html\.work-scroll-snap\s*\{[^}]*scroll-snap-type:\s*none/s);
});
