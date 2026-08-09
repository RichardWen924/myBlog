import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const hero = readFileSync(resolve(root, 'src/components/react/FutureHero.tsx'), 'utf8');
const aboutHero = readFileSync(resolve(root, 'src/components/react/HeroReactive.tsx'), 'utf8');
const work = readFileSync(resolve(root, 'src/pages/work.astro'), 'utf8');
const about = readFileSync(resolve(root, 'src/pages/about.astro'), 'utf8');

test('Work hero composes BUILD FUTURE from a stroke outline into particle text', () => {
  assert.match(hero, /from ['"]\.\/bits\/StrokeText['"]/);
  assert.match(hero, /from ['"]\.\/bits\/ParticleText['"]/);
  assert.match(hero, /text="BUILD FUTURE"/g);
  assert.match(hero, /particleReady/);
  assert.match(hero, /setTimeout/);
  assert.match(hero, /stroke-text|future-wordmark/);
  assert.match(work, /FutureHero/);
  assert.match(work, /data-work-chapter="hero"/);
});

test('Work hero removes the previous copy and navigation payload', () => {
  assert.doesNotMatch(hero, /BlurText|DynamicIllustration|PromptNav/);
  assert.doesNotMatch(hero, /Personal site|从这里开始探索|Continue/);
});

test('About restores the personal reactive hero payload', () => {
  assert.match(about, /HeroReactive/);
  assert.match(about, /name=\{profile\.name\}/);
  assert.match(about, /title=\{profile\.title\}/);
  assert.match(about, /email=\{profile\.email\}/);
  assert.match(about, /scrollTarget="#the-path"/);
  assert.match(aboutHero, /BlurText|DynamicIllustration|PromptNav/);
});

test('React Bits component sources and styles are present', () => {
  for (const file of [
    'src/components/react/bits/StrokeText.tsx',
    'src/components/react/bits/StrokeText.css',
    'src/components/react/bits/ParticleText.tsx',
    'src/components/react/bits/ParticleText.css',
  ]) {
    assert.equal(existsSync(resolve(root, file)), true, file);
  }
});
