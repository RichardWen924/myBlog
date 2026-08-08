import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const globalStyles = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
const illustrationPath = resolve(root, 'src/styles/illustration.css');
const illustrationStyles = existsSync(illustrationPath)
  ? readFileSync(illustrationPath, 'utf8')
  : '';
const homePath = resolve(root, 'src/styles/home.css');
const homeStyles = existsSync(homePath) ? readFileSync(homePath, 'utf8') : '';

test('dynamic illustration styles live in a dedicated imported module', () => {
  assert.match(globalStyles, /@import ['"]\.\/illustration\.css['"]/);
  assert.match(illustrationStyles, /\.dynamic-illustration\s*\{/);
  assert.doesNotMatch(globalStyles, /\.dynamic-illustration\s*\{/);
});

test('homepage chapter styles live in a dedicated imported module', () => {
  assert.match(globalStyles, /@import ['"]\.\/home\.css['"]/);
  assert.match(homeStyles, /\.home-landing-hero\s*\{/);
  assert.doesNotMatch(globalStyles, /\.home-landing-hero\s*\{/);
});
