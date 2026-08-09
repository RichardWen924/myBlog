import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const componentPath = resolve(root, 'src/components/entry/EntryProgressLoader.astro');
const base = readFileSync(resolve(root, 'src/layouts/Base.astro'), 'utf8');
const home = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');

const cssBlock = (source, selector, startAt = 0) => {
  const selectorStart = source.indexOf(`${selector} {`, startAt);
  assert.notEqual(selectorStart, -1, `${selector} should exist after offset ${startAt}`);
  const openBrace = source.indexOf('{', selectorStart);
  let depth = 0;

  for (let index = openBrace; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(openBrace + 1, index);
  }

  assert.fail(`${selector} should have a closed CSS block`);
};

test('entry loader exposes the five ordered progress milestones', () => {
  const source = readFileSync(componentPath, 'utf8');
  for (const value of ['0%', '25%', '50%', '75%', '100%']) {
    assert.match(source, new RegExp(`data-progress="${value}"`));
  }
  assert.match(source, /role="progressbar"/);
  assert.match(source, /aria-valuemin="0"/);
  assert.match(source, /aria-valuemax="100"/);
});

test('entry loader uses GSAP and respects reduced motion', () => {
  const source = readFileSync(componentPath, 'utf8');
  assert.match(source, /from ['"]gsap['"]/);
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /gsap\.timeline/);
  assert.match(source, /setTimeout/);
});

test('entry loader skips after a completed session and stays fail-open when storage is unavailable', () => {
  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /sessionStorage/);
  assert.match(source, /ENTRY_SESSION_KEY/);
  assert.match(source, /try\s*\{/);
  assert.match(source, /catch/);
  assert.match(source, /window\.sessionStorage\.getItem\(ENTRY_SESSION_KEY\)/);
  assert.match(source, /window\.sessionStorage\.setItem\(ENTRY_SESSION_KEY,\s*['"]true['"]\)/);
  assert.match(source, /catch\s*\{\s*return false;/s);
  assert.match(source, /ENTRY_PROGRESS_DURATION_MS\s*=\s*900/);
  assert.match(source, /data-entry-duration-ms="900"/);
  assert.match(source, /sessionAlreadyComplete/);
  assert.match(source, /unlockDocument\(\);\s*loader\?\.remove\(\);\s*announceCompletion\(\);/s);
  assert.doesNotMatch(source, /entry-progress-loader-fallback-exit\s*\{[^}]*2\.2s/s);
});

test('entry loader keeps the real overlay duration within 0.8 to 1.1 seconds', () => {
  const source = readFileSync(componentPath, 'utf8');
  const exitTween = source.match(/gsap\.to\(loader,\s*\{([\s\S]*?)\n\s*\}\);/)?.[1] ?? '';
  const desktopStep = source.match(/\.entry-progress__step\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? '';
  const mobileStep = source.match(/@media \(max-width: 520px\)[\s\S]*?(\.entry-progress__step\s*\{[\s\S]*?\n\s*\})/)?.[1] ?? '';

  assert.match(exitTween, /duration:\s*0\.1\b/);
  assert.match(desktopStep, /font-size:\s*0\.75rem/);
  assert.match(mobileStep, /font-size:\s*0\.75rem/);
});

test('entry loader fails open without JavaScript and isolates page content while active', () => {
  const source = readFileSync(componentPath, 'utf8');
  assert.match(source, /:not\(\[data-runtime\]\)/);
  assert.match(source, /data-entry-content/);
  assert.match(source, /setAttribute\(['"]inert['"],/);
  assert.match(source, /removeAttribute\(['"]inert['"]\)/);
});

test('entry loader disables no-JS fallback animations under reduced motion while staying fail-open', () => {
  const source = readFileSync(componentPath, 'utf8');
  const mediaStart = source.indexOf('@media (prefers-reduced-motion: reduce)');
  assert.notEqual(mediaStart, -1, 'reduced-motion media block should exist');
  const reducedMotion = source.slice(mediaStart);
  const loaderRule = cssBlock(reducedMotion, '.entry-progress-loader:not([data-runtime])');
  const fillRule = cssBlock(reducedMotion, '.entry-progress-loader:not([data-runtime]) .entry-progress__fill');

  assert.match(loaderRule, /animation:\s*none/);
  assert.match(loaderRule, /visibility:\s*hidden/);
  assert.match(loaderRule, /pointer-events:\s*none/);
  assert.match(fillRule, /animation:\s*none/);
});

test('entry loader announces completion only after it has released the page', () => {
  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /ENTRY_PROGRESS_COMPLETE_EVENT/);
  assert.match(source, /dataset\.entryReady\s*=\s*['"]true['"]/);
  assert.match(source, /dispatchEvent\(new CustomEvent\(ENTRY_PROGRESS_COMPLETE_EVENT\)\)/);

  const removeLoader = source.match(/const removeLoader = \(\) => \{[\s\S]*?\n  \};/)?.[0] ?? '';
  assert.ok(removeLoader, 'expected a removeLoader completion boundary');
  assert.match(
    removeLoader,
    /loader\?\.remove\(\);[\s\S]*announceCompletion\(\);/,
    'completion must be announced after the overlay is removed',
  );
  assert.match(removeLoader, /unlockDocument\(\);[\s\S]*loader\?\.remove\(\);[\s\S]*announceCompletion\(\);/);
});

test('entry loader rail follows the viewport instead of a fixed max width', () => {
  const source = readFileSync(componentPath, 'utf8');
  assert.match(source, /width:\s*100vw/);
  assert.match(source, /min-height:\s*100dvh/);
  assert.doesNotMatch(source, /min\(52rem/);
});

test('Base supports an optional loader and homepage enables it', () => {
  assert.match(base, /showEntryLoader\?: boolean/);
  assert.match(base, /showEntryLoader = false/);
  assert.match(base, /<EntryProgressLoader \/>/);
  assert.match(home, /showEntryLoader/);
});

test('Base supports the Work-only transition loader without changing homepage behavior', () => {
  const work = readFileSync(resolve(root, 'src/pages/work.astro'), 'utf8');
  assert.match(base, /showWorkTransition\?: boolean/);
  assert.match(base, /showWorkTransition = false/);
  assert.match(base, /<WorkTransitionProgress \/>/);
  assert.match(work, /showWorkTransition/);
  assert.match(work, /work-page/);
  assert.doesNotMatch(home, /showWorkTransition/);
});
