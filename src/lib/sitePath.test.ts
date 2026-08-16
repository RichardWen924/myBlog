import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { withBasePath } from './sitePath.ts';

describe('withBasePath', () => {
  it('prefixes root and nested site paths', () => {
    assert.equal(withBasePath('/', '/myBlog/'), '/myBlog/');
    assert.equal(withBasePath('/blog/post', '/myBlog/'), '/myBlog/blog/post');
  });

  it('does not prefix a path twice', () => {
    assert.equal(withBasePath('/myBlog/blog', '/myBlog/'), '/myBlog/blog');
  });

  it('uses the root base outside a Vite runtime', () => {
    assert.equal(withBasePath('/blog'), '/blog');
  });

  it('preserves fragments and non-site URLs', () => {
    assert.equal(withBasePath('#intro', '/myBlog/'), '#intro');
    assert.equal(withBasePath('mailto:hello@example.com', '/myBlog/'), 'mailto:hello@example.com');
    assert.equal(withBasePath('https://example.com', '/myBlog/'), 'https://example.com');
  });
});
