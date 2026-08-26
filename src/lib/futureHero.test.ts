import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const workPageSource = readFileSync(
  new URL('../pages/work.astro', import.meta.url),
  'utf8',
);
const heroSource = readFileSync(
  new URL('../features/work/components/FutureHero.tsx', import.meta.url),
  'utf8',
);
const workStyles = readFileSync(
  new URL('../styles/work.css', import.meta.url),
  'utf8',
);

describe('BUILD FUTURE hero', () => {
  it('preserves the particle wordmark contract for the component', () => {
    assert.match(heroSource, /future-wordmark__particle/);
    assert.doesNotMatch(heroSource, /future-wordmark__outline/);
    assert.doesNotMatch(heroSource, /particleReady|WORK_HERO_SETTLE_MS/);
    assert.doesNotMatch(workStyles, /\.future-wordmark__outline/);
  });

  it('keeps the retired particle wordmark out of the redesigned Work route', () => {
    assert.doesNotMatch(workPageSource, /FutureHero|ParticleText|BUILD FUTURE/);
    assert.match(workPageSource, /Systems with a human scale\./);
  });
});
