import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { readSiteStyles } from './site-styles.mjs';

const root = resolve(import.meta.dirname, '..');
const css = readSiteStyles(root);

test('homepage hero is outside the chapter snap sequence', () => {
  assert.doesNotMatch(
    css,
    /\.home-hero-panel\s*,\s*\.home-chapter\s*\{[^}]*scroll-snap-align/s,
  );
  assert.match(css, /\.home-chapter\s*\{[^}]*scroll-snap-align/s);
});

test('homepage viewport sections account for the sticky header and keep the scroll cue visible', () => {
  assert.match(css, /--site-header-height:\s*calc\(2\.75rem \+ 2rem \+ 1px\)/);
  assert.match(css, /\.home-landing-hero\s*\{[^}]*min-height: calc\(100svh - var\(--site-header-height\)\)/s);
  assert.match(
    css,
    /@media \(max-height: 720px\) and \(min-width: 768px\)[\s\S]*?\.home-landing-hero\s*\{[^}]*min-height: max\(calc\(100svh - var\(--site-header-height\)\), 38rem\)/s,
  );
  assert.match(css, /\.home-chapter\s*\{[^}]*scroll-margin-top: var\(--site-header-height\)/s);
  assert.match(css, /\.home-landing-hero__scroll\s*\{[^}]*bottom: clamp\(2\.75rem, 5vw, 3\.5rem\)/s);
  assert.match(
    css,
    /@media \(max-width: 767px\)[\s\S]*?\.home-landing-hero\s*\{[^}]*min-height: max\(calc\(100svh - var\(--site-header-height\)\), 44rem\)[\s\S]*?\.home-landing-hero__workspace\s*\{[^}]*height: 16rem/s,
  );
});
