import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getAdjacentChapterIndex } from './chapterNavigation.ts';

describe('chapter navigation', () => {
  it('moves one chapter in the requested direction without leaving the bounds', () => {
    assert.equal(getAdjacentChapterIndex(1, 1, 4), 2);
    assert.equal(getAdjacentChapterIndex(1, -1, 4), 0);
    assert.equal(getAdjacentChapterIndex(0, -1, 4), 0);
    assert.equal(getAdjacentChapterIndex(3, 1, 4), 3);
  });
});
