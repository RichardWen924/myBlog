import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  WELCOME_WORDS,
  getGreetingCycle,
  getGreetingRotation,
  getHomeMotionProfile,
} from '../features/home/homeHero.ts';

const homePageSource = readFileSync(new URL('../pages/index.astro', import.meta.url), 'utf8');
const heroSource = readFileSync(
  new URL('../features/home/components/HomeLandingHero.astro', import.meta.url),
  'utf8',
);
const baseSource = readFileSync(new URL('../layouts/Base.astro', import.meta.url), 'utf8');
const motionSource = readFileSync(
  new URL('../features/home/homeHeroMotion.ts', import.meta.url),
  'utf8',
);
const homeStyles = readFileSync(new URL('../styles/home.css', import.meta.url), 'utf8');

describe('homepage greeting cycle', () => {
  it('keeps eight unique greetings in a stable international sequence', () => {
    assert.equal(WELCOME_WORDS.length, 8);
    assert.equal(new Set(WELCOME_WORDS.map((word) => word.label)).size, 8);
    assert.deepEqual(WELCOME_WORDS.slice(0, 3).map((word) => word.label), [
      'HELLO',
      '你好',
      'BONJOUR',
    ]);
  });

  it('wraps previous, current, and next greetings at either edge', () => {
    assert.deepEqual(getGreetingCycle(0), {
      previous: WELCOME_WORDS[7],
      current: WELCOME_WORDS[0],
      next: WELCOME_WORDS[1],
      position: 1,
      total: 8,
    });
    assert.equal(getGreetingCycle(8).current, WELCOME_WORDS[0]);
    assert.equal(getGreetingCycle(-1).current, WELCOME_WORDS[7]);
  });

  it('keeps the orbit rotation moving forward across every greeting cycle', () => {
    const rotations = Array.from({ length: 17 }, (_, step) => getGreetingRotation(step));

    assert.deepEqual(rotations.slice(0, 3), [45, 90, 135]);
    assert.equal(rotations[8], 405);
    assert.ok(rotations.every((rotation, index) => index === 0 || rotation > rotations[index - 1]!));
  });

  it('removes looping and translation for reduced motion', () => {
    assert.deepEqual(getHomeMotionProfile(true), {
      entranceDuration: 0,
      transitionDuration: 0,
      greetingHold: 0,
      greetingLoop: false,
      pointerShift: 0,
    });
    assert.equal(getHomeMotionProfile(false).greetingLoop, true);
  });
});

describe('quiet threshold homepage structure', () => {
  it('renders one Hero without the former chapter sequence', () => {
    assert.match(homePageSource, /<HomeLandingHero\s*\/>/);
    assert.doesNotMatch(homePageSource, /HomeChapterNavigation|home-chapter|FadeSection/);
    assert.match(homePageSource, /lang="en"/);
  });

  it('renders every visual greeting from the shared data source', () => {
    assert.match(heroSource, /WELCOME_WORDS\.map/);
    assert.match(heroSource, /data-home-greeting-item/);
    assert.doesNotMatch(heroSource, />你好</);
  });

  it('generates About, Work, and Blog as equal route rows', () => {
    assert.match(heroSource, /const routes = \[/);
    assert.match(heroSource, /label: 'About'/);
    assert.match(heroSource, /label: 'Work'/);
    assert.match(heroSource, /label: 'Blog'/);
    assert.match(heroSource, /routes\.map/);
    assert.match(heroSource, /class="quiet-hero__route"/);
  });

  it('lets the homepage opt out of the shared header and footer', () => {
    assert.match(baseSource, /showHeader\?: boolean/);
    assert.match(baseSource, /showFooter\?: boolean/);
    assert.match(baseSource, /showHeader && <Header \/>/);
    assert.match(baseSource, /showFooter && <Footer \/>/);
    assert.match(homePageSource, /showHeader=\{false\}/);
    assert.match(homePageSource, /showFooter=\{false\}/);
  });
});

describe('quiet threshold motion and hierarchy', () => {
  it('uses one GSAP entrance timeline and a self-renewing greeting timeline', () => {
    assert.match(motionSource, /gsap\.timeline/);
    assert.match(motionSource, /gsap\.matchMedia/);
    assert.match(motionSource, /buildGreetingLoop/);
    assert.match(motionSource, /getGreetingRotation/);
    assert.match(motionSource, /data-home-greeting-item/);
    assert.doesNotMatch(motionSource, /ScrollTrigger/);
  });

  it('animates route exit before Astro client navigation', () => {
    assert.match(motionSource, /data-home-route/);
    assert.match(motionSource, /from 'astro:transitions\/client'/);
    assert.match(motionSource, /navigate\(href/);
    assert.doesNotMatch(motionSource, /window\.location\.assign/);
    assert.match(motionSource, /event\.preventDefault\(\)/);
  });

  it('uses reusable pointer setters and kills interactive tweens during cleanup', () => {
    assert.match(motionSource, /gsap\.quickTo/);
    assert.match(motionSource, /exitTimeline\?\.kill\(\)/);
    assert.match(motionSource, /gsap\.killTweensOf\(welcome\)/);
  });

  it('keeps every route at the same type size and weight', () => {
    assert.match(homeStyles, /\.quiet-hero__route-label\s*\{[\s\S]*?font-size:\s*clamp\(/);
    assert.doesNotMatch(homeStyles, /quiet-hero__route:(?:first|nth)-child[\s\S]*?font-size/);
    assert.doesNotMatch(homeStyles, /quiet-hero__route--primary/);
  });

  it('provides explicit reduced-motion styling', () => {
    assert.match(homeStyles, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(motionSource, /reduceMotion:\s*'\(prefers-reduced-motion: reduce\)'/);
  });

  it('uses an opaque focus color against the paper background', () => {
    assert.match(homeStyles, /outline:\s*2px solid var\(--color-accent\)/);
  });
});
