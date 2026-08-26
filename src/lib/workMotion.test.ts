import test from 'node:test';
import assert from 'node:assert/strict';
import { getWorkMotionProfile, timelineItemDelay } from './workMotion.ts';

test('keeps the first timeline item immediate and staggers later items by the configured interval', () => {
  assert.equal(timelineItemDelay(0, 1.2, 2.4), 2.4);
  assert.ok(Math.abs(timelineItemDelay(1, 1.2, 2.4) - 3.6) < 1e-9);
  assert.equal(timelineItemDelay(3, 1.2, 2.4), 6);
});

test('preserves the compact default interval for other timeline instances', () => {
  assert.equal(timelineItemDelay(2, 0.1), 0.2);
});

test('keeps Work motion restrained and consistent with the paper archive', () => {
  assert.deepEqual(getWorkMotionProfile({ reducedMotion: false, finePointer: true }), {
    revealDuration: 0.72,
    revealOffset: 20,
    revealStart: 'top 82%',
    revealStagger: 0.08,
    heroParallaxPercent: -6,
    heroScrub: 0.8,
    progressScrub: 0.6,
    skillParallax: {
      x: 8,
      y: 6,
      rotation: 0.35,
      duration: 0.8,
    },
  });
});

test('disables decorative Work motion when reduced motion is requested', () => {
  assert.deepEqual(getWorkMotionProfile({ reducedMotion: true, finePointer: true }), {
    revealDuration: 0,
    revealOffset: 0,
    revealStart: 'top 100%',
    revealStagger: 0,
    heroParallaxPercent: 0,
    heroScrub: 0,
    progressScrub: 0,
    skillParallax: {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0,
    },
  });
});

test('does not expose pointer parallax on coarse pointer devices', () => {
  assert.deepEqual(getWorkMotionProfile({ reducedMotion: false, finePointer: false }).skillParallax, {
    x: 0,
    y: 0,
    rotation: 0,
    duration: 0,
  });
});
