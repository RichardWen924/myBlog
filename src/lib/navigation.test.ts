import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getNavigationItems, isNavigationItemActive } from '../data/navigation.ts';

describe('site navigation', () => {
  it('keeps the home link exclusive to the root route', () => {
    assert.equal(isNavigationItemActive('/', '/'), true);
    assert.equal(isNavigationItemActive('/about', '/'), false);
    assert.equal(isNavigationItemActive('/projects/my-blog', '/'), false);
  });

  it('groups project routes under Work', () => {
    assert.equal(isNavigationItemActive('/work/', '/work'), true);
    assert.equal(isNavigationItemActive('/projects', '/work'), true);
    assert.equal(isNavigationItemActive('/projects/my-blog', '/work'), true);
    assert.equal(isNavigationItemActive('/workshop', '/work'), false);
  });

  it('marks exactly the active top-level route', () => {
    const items = getNavigationItems('/blog/hello-blog');
    assert.deepEqual(
      items.filter((item) => item.active).map((item) => item.href),
      ['/blog'],
    );
  });
});
