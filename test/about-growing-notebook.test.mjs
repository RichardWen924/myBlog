import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const aboutPath = resolve(root, 'src/pages/about.astro');
const aboutStylesPath = resolve(root, 'src/styles/about.css');
const base = readFileSync(resolve(root, 'src/layouts/Base.astro'), 'utf8');
const globalStyles = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');

test('About is composed as four growing-notebook sections', () => {
  const about = readFileSync(aboutPath, 'utf8');

  assert.match(about, /PageHero/);
  assert.match(about, /SectionHeading/);
  assert.match(about, /ContentDivider/);
  assert.match(about, /MotionReveal/);
  assert.match(about, /id="now"/);
  assert.match(about, /id="the-path"/);
  assert.match(about, /id="how-i-keep-growing"/);
  assert.match(about, /id="elsewhere"/);
  assert.match(about, /eyebrow="Now"/);
  assert.match(about, /label="The path"/);
  assert.match(about, /label="How I keep growing"/);
  assert.match(about, /label="Elsewhere"/);
  assert.doesNotMatch(about, /Now · 当前|The path · 走过的路|How I keep growing · 我如何继续|Elsewhere · 其他入口/);
});

test('About stays personal and does not duplicate technical proof', () => {
  const about = readFileSync(aboutPath, 'utf8');

  assert.doesNotMatch(about, /SkillsOrbit/);
  assert.doesNotMatch(about, /<Timeline/);
  assert.doesNotMatch(about, /getProjects/);
  assert.doesNotMatch(about, /Your Company/);
  assert.match(about, /profile\.bio/);
  assert.match(about, /profile\.email/);
});

test('About exposes Chinese document language through Base', () => {
  const about = readFileSync(aboutPath, 'utf8');

  assert.match(base, /lang\?: string/);
  assert.match(base, /lang = ['"]en['"]/);
  assert.match(base, /<html lang=\{lang\}/);
  assert.match(about, /<Base title="About" fullBleed lang="zh-CN">/);
});

test('About growth path uses ordered-list semantics when content exists', () => {
  const about = readFileSync(aboutPath, 'utf8');
  const aboutStyles = readFileSync(aboutStylesPath, 'utf8');

  assert.match(about, /<ol class="about-growth-path"/);
  assert.match(about, /<li class="about-path__item">/);
  assert.match(about, /about-growth-path--empty/);
  assert.match(aboutStyles, /\.about-growth-path\s*\{[\s\S]*list-style:\s*none/);
  assert.match(aboutStyles, /\.about-growth-path--empty/);
});

test('About keeps the real growth-practice writing and archive entrances', () => {
  const about = readFileSync(aboutPath, 'utf8');

  assert.match(about, /Notice the details/);
  assert.match(about, /Keep a trail/);
  assert.match(about, /Stay curious/);
  assert.match(about, /ArchiveLink/);
  assert.match(about, /<ArchiveLink href="\/work" label="Work" \/>/);
  assert.match(about, /\/blog/);
  assert.match(about, /GitHub|github/);
  assert.match(about, /mailto:/);
});

test('About style is a responsive, static-friendly growing path', () => {
  assert.equal(existsSync(aboutStylesPath), true);
  const aboutStyles = readFileSync(aboutStylesPath, 'utf8');

  assert.match(globalStyles, /@import ['"]\.\/about\.css['"]/);
  assert.match(aboutStyles, /about-growth-path/);
  assert.match(aboutStyles, /@media \(max-width: 767px\)/);
  assert.match(aboutStyles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(aboutStyles, /font-size:\s*1rem/);
  assert.match(aboutStyles, /\.about-path__meta\s*\{[\s\S]*color:\s*var\(--color-ink\)/);
  assert.match(aboutStyles, /\.about-path__content\s*\{[\s\S]*color:\s*var\(--color-ink\)/);
  assert.match(aboutStyles, /\.about-path__organization\s*\{[\s\S]*color:\s*var\(--color-ink\)/);
  assert.doesNotMatch(aboutStyles, /linear-gradient|radial-gradient|border-radius|backdrop-filter/);
});
