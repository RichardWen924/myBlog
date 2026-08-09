import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const styles = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');

const cssBlock = (selector, source = styles, startAt = 0) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const selectorPattern = new RegExp(`(?:^|\\n)[ \\t]*${escapedSelector}\\s*\\{`, 'g');
  selectorPattern.lastIndex = startAt;
  let match;

  while ((match = selectorPattern.exec(source))) {
    if (!source.slice(0, match.index).trimEnd().endsWith(',')) break;
  }

  assert.ok(match, `${selector} should exist as a standalone rule`);
  const start = match.index + (match[0].startsWith('\n') ? 1 : 0);
  const open = source.indexOf('{', start);
  let depth = 0;

  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }

  assert.fail(`${selector} should have a closed CSS block`);
};

const readComponent = (name) => {
  const path = resolve(root, 'src/components/global', name);
  assert.equal(existsSync(path), true, `${name} should exist`);
  return readFileSync(path, 'utf8');
};

test('global visual tokens expose the approved palette and font roles', () => {
  for (const token of [
    '--color-paper: #f4f0e8',
    '--color-surface: #faf8f3',
    '--color-ink: #1d1d1a',
    '--color-ink-soft: #6e706a',
    '--color-border: #d8d2c7',
    '--color-accent: #64745d',
    '--color-warm: #c97858',
    '--color-steel: #6f7f86',
  ]) {
    assert.match(styles, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(styles, /--font-serif:\s*'Newsreader'/);
  assert.match(styles, /--font-sans:\s*'IBM Plex Sans'/);
  assert.match(styles, /--font-mono:\s*'IBM Plex Mono'/);
  assert.match(cssBlock('.page-shell'), /width:\s*min\(calc\(100% - clamp\(2\.5rem, 8vw, 8rem\)\), 74rem\)/);
  assert.match(cssBlock('.micro-label'), /font-size:\s*0\.75rem/);
  assert.match(cssBlock('.site-header__link'), /font-size:\s*0\.75rem/);
  assert.match(cssBlock('.site-header__menu'), /font-size:\s*0\.75rem/);
  assert.match(cssBlock('.skill-orbit__center-meta'), /font-size:\s*0\.75rem/);
  assert.match(cssBlock('.skill-orbit__item-label'), /font-size:\s*0\.75rem/);
  const orbitMobile = cssBlock(
    '@media (max-width: 767px)',
    styles,
    styles.indexOf('.skill-orbit'),
  );
  assert.match(cssBlock('.skill-orbit__item-label', orbitMobile), /font-size:\s*0\.75rem/);
  assert.match(cssBlock('.page-hero__inner'), /display:\s*grid/);
  const pageHeroMobile = cssBlock('@media (max-width: 767px)', styles);
  assert.match(cssBlock('.page-hero__inner', pageHeroMobile), /display:\s*block/);
});

test('global motion styles remain safe and readable when motion is reduced', () => {
  const reduceMotion = cssBlock('@media (prefers-reduced-motion: reduce)');
  const skillReduceMotion = cssBlock(
    '@media (prefers-reduced-motion: reduce)',
    styles,
    styles.indexOf('.skill-orbit__canvas'),
  );
  const heroReduceMotion = cssBlock(
    '@media (prefers-reduced-motion: reduce)',
    styles,
    styles.indexOf('.hero-thinking-orbit'),
  );

  assert.match(cssBlock('html', reduceMotion), /scroll-behavior:\s*auto/);
  assert.match(cssBlock('.glow-layer', reduceMotion), /animation:\s*none/);
  assert.match(cssBlock('a', reduceMotion), /transition-duration:\s*0ms/);
  assert.match(cssBlock('.motion-reveal[data-motion-reveal]', reduceMotion), /animation:\s*none/);
  assert.match(cssBlock('.skill-orbit__canvas', skillReduceMotion), /transform:\s*none/);
  assert.match(cssBlock('.skill-orbit *', skillReduceMotion), /animation:\s*none\s*!important/);
  assert.match(cssBlock('.hero-thinking-orbit', heroReduceMotion), /animation:\s*none/);
  assert.doesNotMatch(cssBlock('.motion-reveal[data-motion-reveal]'), /opacity:\s*0/);
});

test('page hero variants change the shared accent channel', () => {
  assert.match(cssBlock('.page-hero__eyebrow'), /color:\s*var\(--page-hero-accent\)/);
  assert.match(cssBlock('.page-hero__visual'), /color:\s*var\(--page-hero-accent\)/);
  assert.match(cssBlock('.page-hero--quiet'), /--page-hero-accent:\s*var\(--color-ink-soft\)/);
  assert.match(cssBlock('.page-hero--notebook'), /--page-hero-accent:\s*var\(--color-warm\)/);
  assert.match(cssBlock('.page-hero--atlas'), /--page-hero-accent:\s*var\(--color-steel\)/);
});

test('shared reading primitives expose their single-purpose class contracts', () => {
  const pageHero = readComponent('PageHero.astro');
  const sectionHeading = readComponent('SectionHeading.astro');
  const archiveLink = readComponent('ArchiveLink.astro');

  assert.match(pageHero, /interface Props/);
  assert.match(pageHero, /eyebrow/);
  assert.match(pageHero, /title/);
  assert.match(pageHero, /description/);
  assert.match(pageHero, /page-hero__title/);
  assert.match(pageHero, /class="page-shell page-hero__inner"/);
  assert.match(pageHero, /<h1/);
  assert.match(pageHero, /<slot/);

  assert.match(sectionHeading, /interface Props/);
  assert.match(sectionHeading, /section-heading__title/);
  assert.match(sectionHeading, /section-heading__label/);
  assert.match(sectionHeading, /section-heading__description/);

  assert.match(archiveLink, /interface Props/);
  assert.match(archiveLink, /archive-link/);
  assert.match(archiveLink, /href/);
  assert.match(archiveLink, /aria-hidden="true"/);

  const contentDivider = readComponent('ContentDivider.astro');
  const motionReveal = readComponent('MotionReveal.astro');

  assert.match(contentDivider, /class="content-divider"/);
  assert.match(contentDivider, /<hr/);
  assert.match(motionReveal, /data-motion-reveal/);
  assert.match(motionReveal, /motion-reveal/);
  assert.match(motionReveal, /reduced-motion-safe/);
  assert.match(cssBlock('.content-divider'), /border-top:\s*1px solid var\(--color-border\)/);
  assert.match(cssBlock('.motion-reveal[data-motion-reveal]'), /animation:\s*var\(--animate-reveal\)/);
  assert.doesNotMatch(styles, /@keyframes\s+motion-reveal-in/);
  assert.match(cssBlock('.motion-reveal'), /opacity:\s*1/);
  assert.match(cssBlock('.reduced-motion-safe'), /will-change:\s*auto/);
});
