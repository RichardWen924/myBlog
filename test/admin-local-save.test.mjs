import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const server = readFileSync(resolve(root, 'admin/server/index.js'), 'utf8');
const app = readFileSync(resolve(root, 'admin/src/App.tsx'), 'utf8');
const nav = readFileSync(resolve(root, 'admin/src/components/Nav.tsx'), 'utf8');
const saveButton = readFileSync(resolve(root, 'admin/src/components/SaveButton.tsx'), 'utf8');

test('admin saves local content without invoking git', () => {
  assert.match(server, /\/api\/save\/data/);
  assert.match(server, /\/api\/save\/blog/);
  assert.doesNotMatch(server, /gitCommitPush|git push|execFileSync/);
  assert.match(saveButton, /\/api\/save\//);
});

test('admin no longer exposes the unused modules editor', () => {
  assert.doesNotMatch(app, /ModulesEditor|\/modules/);
  assert.doesNotMatch(nav, /Modules|content\/modules|trusted/);
});
