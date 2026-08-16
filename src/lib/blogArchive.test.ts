import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  clampPage,
  getNextSelectionIndex,
  getPageCount,
  getPagePosts,
  groupPostsByYear,
  type ArchivePost,
} from '../features/blog/blogArchive.ts';

const posts: ArchivePost[] = Array.from({ length: 6 }, (_, index) => ({
  id: `post-${index + 1}`,
  title: `Post ${index + 1}`,
  description: 'A test post',
  date: `2026-0${index + 1}-01`,
  tags: [],
  year: index < 5 ? 2026 : 2025,
}));

describe('blog archive data helpers', () => {
  it('paginates posts in fixed-size pages', () => {
    assert.equal(getPageCount(posts.length), 2);
    assert.equal(clampPage(99, posts.length), 2);
    assert.deepEqual(getPagePosts(posts, 2).map((post) => post.id), ['post-6']);
  });

  it('clamps selection movement to the available posts', () => {
    assert.equal(getNextSelectionIndex(0, -1, posts.length), 0);
    assert.equal(getNextSelectionIndex(4, 1, posts.length), 5);
    assert.equal(getNextSelectionIndex(5, 1, posts.length), 5);
  });

  it('groups posts by their display year without losing order', () => {
    const groups = groupPostsByYear(posts);
    assert.deepEqual(groups.get(2026)?.map((post) => post.id), ['post-1', 'post-2', 'post-3', 'post-4', 'post-5']);
    assert.deepEqual(groups.get(2025)?.map((post) => post.id), ['post-6']);
  });
});
