import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const header = readFileSync(resolve(root, 'src/components/global/Header.astro'), 'utf8');
const styles = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
const readOptional = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');
const navigation = readOptional(resolve(root, 'src/data/navigation.ts'));
const headerBrand = readOptional(resolve(root, 'src/components/global/HeaderBrand.astro'));
const headerLinks = readOptional(resolve(root, 'src/components/global/HeaderLinks.astro'));
const headerMobileMenu = readOptional(resolve(root, 'src/components/global/HeaderMobileMenu.astro'));

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
  assert.match(styles, /\.site-header__link:focus-visible/);
  assert.match(styles, /\.site-header__menu[^\{]*\{[\s\S]*min-height: 2\.75rem/);
});

test('header composes focused components inside a fluid responsive container', () => {
  assert.match(header, /getNavigationItems/);
  assert.match(header, /HeaderBrand/);
  assert.match(header, /HeaderLinks/);
  assert.match(header, /HeaderMobileMenu/);
  assert.match(header, /site-header__inner/);
  assert.match(styles, /\.site-header__inner[\s\S]*width: min\(calc\(100% - clamp\(2rem, 10vw, 10rem\)\), 72rem\)/);
  assert.match(navigation, /export function getNavigationItems/);
  assert.match(headerBrand, /interface Props/);
  assert.match(headerLinks, /aria-current/);
  assert.match(headerMobileMenu, /<details/);
});
