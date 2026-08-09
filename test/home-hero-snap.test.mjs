import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { readSiteStyles } from './site-styles.mjs';

const root = resolve(import.meta.dirname, '..');
const css = readSiteStyles(root);

test('homepage hero and chapters are all snap targets', () => {
  assert.match(
    css,
    /\.home-hero-panel\s*\{[^}]*scroll-snap-align:\s*start/s,
  );
  assert.match(
    css,
    /\.home-hero-panel\s*\{[^}]*scroll-snap-stop:\s*always/s,
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

test('mobile chapter rail is separated from hero copy and chapters do not leak into the first viewport', () => {
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.home-chapter-rail\s*\{[^}]*bottom:/s);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*?\.home-chapter-rail\s*\{[^}]*flex-direction:\s*row/s);
  assert.match(css, /\.home-landing-hero\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(
    css,
    /\.home-chapter\s*\{[^}]*min-height:\s*calc\(100svh - var\(--site-header-height\)\)/s,
  );
});

test('homepage chapters fill one header-adjusted viewport and snap as whole sections', () => {
  assert.match(
    css,
    /\.home-chapter\s*\{[^}]*min-height:\s*calc\(100svh - var\(--site-header-height\)\)/s,
  );
  assert.doesNotMatch(css, /\.home-chapter\s*\{[^}]*54svh/s);
  assert.match(css, /html\.home-scroll-snap\s*\{[^}]*scroll-snap-type:\s*y mandatory/s);
  assert.match(css, /\.home-chapter\s*\{[^}]*scroll-snap-stop:\s*always/s);
});
