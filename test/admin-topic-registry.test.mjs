import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const registryPath = resolve(root, 'admin/src/registry/topics.tsx');
const registry = existsSync(registryPath) ? readFileSync(registryPath, 'utf8') : '';
const app = readFileSync(resolve(root, 'admin/src/App.tsx'), 'utf8');
const nav = readFileSync(resolve(root, 'admin/src/components/Nav.tsx'), 'utf8');

test('admin routes and navigation are driven by one topic registry', () => {
  assert.match(registry, /export const topicRegistry/);
  assert.match(registry, /ProfileEditor/);
  assert.match(registry, /ProjectEditor/);
  assert.match(registry, /SkillsEditor/);
  assert.match(registry, /ExperienceEditor/);
  assert.match(registry, /BlogEditor/);
  assert.match(app, /topicRegistry\.map/);
  assert.match(nav, /topicRegistry\.map/);
});
