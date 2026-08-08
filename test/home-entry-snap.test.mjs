import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { readSiteStyles } from './site-styles.mjs';

const root = resolve(import.meta.dirname, '..');
const css = readSiteStyles(root);

test('homepage snap does not force-correct the initial scroll position', () => {
  const snapRule = css.match(/html\.home-scroll-snap\s*\{([^}]+)\}/)?.[1] ?? '';

  assert.match(snapRule, /scroll-snap-type:\s*y\s+proximity/);
  assert.doesNotMatch(snapRule, /scroll-snap-type:\s*y\s+mandatory/);
});
