import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readSiteStyles } from './site-styles.mjs';

const root = resolve(import.meta.dirname, '..');
const header = readFileSync(resolve(root, 'src/components/global/Header.astro'), 'utf8');
const styles = readSiteStyles(root);
const readOptional = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');
const navigation = readOptional(resolve(root, 'src/data/navigation.ts'));
const headerBrand = readOptional(resolve(root, 'src/components/global/HeaderBrand.astro'));
const headerLinks = readOptional(resolve(root, 'src/components/global/HeaderLinks.astro'));
const headerMobileMenu = readOptional(resolve(root, 'src/components/global/HeaderMobileMenu.astro'));
const footer = readOptional(resolve(root, 'src/components/global/Footer.astro'));

const cssBlock = (selector, source = styles, startAt = 0) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const selectorPattern = new RegExp(`(?:^|\\n)[ \\t]*${escapedSelector}\\s*\\{`, 'g');
  selectorPattern.lastIndex = startAt;
  let match;

  while ((match = selectorPattern.exec(source))) {
    if (!source.slice(0, match.index).trimEnd().endsWith(',')) break;
  }

  assert.ok(match, `${selector} should exist as a standalone rule`);
  const open = source.indexOf('{', match.index);
  let depth = 0;

  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }

  assert.fail(`${selector} should have a closed CSS block`);
};

test('top navigation stays visible while the page scrolls', () => {
  assert.match(header, /<header[^>]+sticky/);
  assert.match(header, /top-0/);
  assert.match(header, /z-\d+/);
});

test('navigation exposes active routes and a native mobile menu', () => {
  assert.match(header, /Astro\.url\.pathname/);
  assert.match(header, /getNavigationItems/);
  assert.match(header, /aria-label="Primary navigation"/);
  assert.match(headerLinks, /aria-current=/);
  assert.match(headerMobileMenu, /<details[^>]+site-header__mobile/);
  assert.match(headerMobileMenu, /<summary[^>]+site-header__menu/);
});

test('navigation covers top-level and nested routes with visible focus affordances', () => {
  assert.match(navigation, /currentPath === '\/'/);
  assert.match(navigation, /\/projects/);
  assert.match(navigation, /\/blog/);
  assert.match(navigation, /\/about/);
  assert.match(cssBlock('.site-header__brand:focus-visible'), /outline:/);
  assert.match(cssBlock('.site-header__menu'), /min-height:\s*2\.75rem/);
});

test('header composes focused components inside a fluid responsive container', () => {
  assert.match(header, /getNavigationItems/);
  assert.match(header, /HeaderBrand/);
  assert.match(header, /HeaderLinks/);
  assert.match(header, /HeaderMobileMenu/);
  assert.match(header, /site-header__inner/);
  assert.match(cssBlock('.site-header__inner'), /width:\s*min\(calc\(100% - clamp\(2\.5rem, 8vw, 8rem\)\), 74rem\)/);
  assert.match(cssBlock('.page-shell'), /width:\s*min\(calc\(100% - clamp\(2\.5rem, 8vw, 8rem\)\), 74rem\)/);
  assert.match(navigation, /export function getNavigationItems/);
  assert.match(headerBrand, /interface Props/);
  assert.match(headerBrand, /site-header__brand/);
  assert.match(headerLinks, /aria-current/);
  assert.match(headerMobileMenu, /<details/);
  assert.match(headerMobileMenu, /role="group"/);
  assert.match(footer, /PROFILE/);
  assert.match(footer, /mailto:\$\{PROFILE\.email\}/);
  assert.match(footer, /PROFILE\.socials\.github/);
});

test('header uses an opaque paper surface without glass treatment', () => {
  assert.match(header, /border-b border-border bg-paper/);
  assert.doesNotMatch(header, /bg-paper\/90/);
  assert.doesNotMatch(header, /backdrop-blur-sm/);
});
