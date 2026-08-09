import assert from 'node:assert/strict';
import test from 'node:test';
import { getNextSelectionIndex } from './blogArchive.ts';

test('keeps the selection at the first item when moving up', () => {
  assert.equal(getNextSelectionIndex(0, -1, 3), 0);
});

test('keeps the selection at the last item when moving down', () => {
  assert.equal(getNextSelectionIndex(2, 1, 3), 2);
});

test('moves the selection for an in-range direction', () => {
  assert.equal(getNextSelectionIndex(0, 1, 3), 1);
  assert.equal(getNextSelectionIndex(2, -1, 3), 1);
});
