import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const header = readFileSync(resolve(root, 'src/components/global/Header.astro'), 'utf8');
const about = readFileSync(resolve(root, 'src/pages/about.astro'), 'utf8');

test('public navigation separates personal About from technical Work', () => {
  assert.match(header, /href="\/about"/);
  assert.match(header, /href="\/work"/);
  assert.doesNotMatch(header, /href="\/projects"/);
});

test('work page owns skills, projects, and experience content', () => {
  const workPath = resolve(root, 'src/pages/work.astro');
  assert.equal(existsSync(workPath), true);
  const work = readFileSync(workPath, 'utf8');
  assert.match(work, /SkillsOrbit/);
  assert.match(work, /Timeline/);
  assert.match(work, /getProjects/);
  assert.match(work, /Technical practice|Systems I build/);
});

test('about page is personal rather than a duplicate technical profile', () => {
  assert.match(about, /About|Personal|Life|生活/);
  assert.doesNotMatch(about, /SkillsOrbit/);
  assert.doesNotMatch(about, /<Timeline/);
});
