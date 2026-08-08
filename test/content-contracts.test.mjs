import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const readOptional = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');
const contracts = readOptional(resolve(root, 'packages/content-contracts/src/index.ts'));
const adminTypes = readFileSync(resolve(root, 'admin/src/data-types.ts'), 'utf8');
const publicData = ['profile', 'projects', 'skills', 'experience']
  .map((topic) => readFileSync(resolve(root, `src/data/${topic}.ts`), 'utf8'))
  .join('\n');

test('public site and admin share one content contract module', () => {
  assert.match(contracts, /export interface Profile/);
  assert.match(contracts, /export interface Project/);
  assert.match(contracts, /export interface SkillCategory/);
  assert.match(contracts, /export interface ExperienceItem/);
  assert.match(contracts, /export type ContentTopic/);
  assert.match(adminTypes, /packages\/content-contracts\/src/);
  assert.match(publicData, /packages\/content-contracts\/src/);
});
