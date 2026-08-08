import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeBlogSlug } from './blog-utils.mjs';
import { moveModule, sortModules, validateModules } from './module-utils.mjs';
import { isAllowedAdminOrigin } from './security-utils.mjs';

const modules = [
  { id: 'project', type: 'project', group: 'projects', title: 'Project', order: 20, visible: true },
  { id: 'hero', type: 'hero', group: 'home', title: 'Hero', order: 10, visible: true },
  { id: 'hidden', type: 'profile', group: 'profile', title: 'Hidden', order: 30, visible: false },
];

test('sortModules orders by order and uses id as a deterministic tie breaker', () => {
  const sorted = sortModules([
    { ...modules[0], order: 10 },
    { ...modules[1], order: 10 },
  ]);

  assert.deepEqual(sorted.map((module) => module.id), ['hero', 'project']);
});

test('moveModule returns a reordered copy and normalizes order values', () => {
  const moved = moveModule(modules, 2, 0);

  assert.deepEqual(moved.map((module) => module.id), ['hidden', 'project', 'hero']);
  assert.deepEqual(moved.map((module) => module.order), [0, 10, 20]);
  assert.deepEqual(modules.map((module) => module.order), [20, 10, 30]);
});

test('validateModules accepts a complete module entry', () => {
  assert.doesNotThrow(() => validateModules([modules[0]]));
});

test('validateModules rejects duplicate ids and invalid fields', () => {
  assert.throws(
    () => validateModules([
      modules[0],
      { ...modules[0], title: '' },
    ]),
    /duplicate id/i,
  );

  assert.throws(
    () => validateModules([{ ...modules[0], visible: 'yes' }]),
    /visible/i,
  );
});

test('sanitizeBlogSlug produces a safe stable filename slug', () => {
  assert.equal(sanitizeBlogSlug('  Hello, New Post!  '), 'hello-new-post');
  assert.throws(() => sanitizeBlogSlug('---'), /slug/i);
});

test('admin mutation origin policy allows local tools and rejects foreign origins', () => {
  assert.equal(isAllowedAdminOrigin(undefined), true);
  assert.equal(isAllowedAdminOrigin('http://localhost:5173'), true);
  assert.equal(isAllowedAdminOrigin('http://127.0.0.1:5173'), true);
  assert.equal(isAllowedAdminOrigin('https://attacker.example'), false);
});
