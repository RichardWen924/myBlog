import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const heroSource = readFileSync(
  new URL('../features/work/components/FutureHero.tsx', import.meta.url),
  'utf8',
);
const workStyles = readFileSync(
  new URL('../styles/work.css', import.meta.url),
  'utf8',
);
const workMotionSource = readFileSync(
  new URL('../features/work/workPageMotion.ts', import.meta.url),
  'utf8',
);

describe('BUILD FUTURE hero', () => {
  it('renders the particle wordmark without an outline stage or delay', () => {
    assert.match(heroSource, /future-wordmark__particle/);
    assert.doesNotMatch(heroSource, /future-wordmark__outline/);
    assert.doesNotMatch(heroSource, /particleReady|WORK_HERO_SETTLE_MS/);
    assert.doesNotMatch(workStyles, /\.future-wordmark__outline/);
  });

  it('keeps page-level GSAP off the React-owned FutureHero subtree', () => {
    assert.match(workMotionSource, /data-work-chapter=\\?['"]hero/);
    assert.doesNotMatch(workMotionSource, /\.work-future-hero \.future-wordmark/);
  });
});
