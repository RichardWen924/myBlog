import test from 'node:test';
import assert from 'node:assert/strict';
import { timelineItemDelay } from './workMotion.ts';

test('keeps the first timeline item immediate and staggers later items by the configured interval', () => {
  assert.equal(timelineItemDelay(0, 1.2, 2.4), 2.4);
  assert.ok(Math.abs(timelineItemDelay(1, 1.2, 2.4) - 3.6) < 1e-9);
  assert.equal(timelineItemDelay(3, 1.2, 2.4), 6);
});

test('preserves the compact default interval for other timeline instances', () => {
  assert.equal(timelineItemDelay(2, 0.1), 0.2);
});
