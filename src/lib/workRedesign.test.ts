import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const workPageSource = readFileSync(new URL('../pages/work.astro', import.meta.url), 'utf8');
const timelineSource = readFileSync(
  new URL('../features/work/components/Timeline.tsx', import.meta.url),
  'utf8',
);
const motionSource = readFileSync(
  new URL('../features/work/workPageMotion.ts', import.meta.url),
  'utf8',
);
const logoLoopSource = readFileSync(
  new URL('../features/work/components/LogoLoop.tsx', import.meta.url),
  'utf8',
);
const workStyles = readFileSync(new URL('../styles/work.css', import.meta.url), 'utf8');
const globalStyles = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');
const logoLoopPath = new URL('../features/work/components/LogoLoop.tsx', import.meta.url);
const logoLoopStylesPath = new URL('../features/work/components/LogoLoop.css', import.meta.url);
const technologyLoopsPath = new URL('../features/work/components/TechnologyLoops.tsx', import.meta.url);

describe('work page redesign', () => {
  it('uses a concise sequence with one hero, profile, systems, projects, and now sections', () => {
    assert.match(workPageSource, /data-work-section="hero"/);
    assert.match(workPageSource, /data-work-section="profile"/);
    assert.match(workPageSource, /data-work-section="systems"/);
    assert.match(workPageSource, /data-work-section="projects"/);
    assert.match(workPageSource, /data-work-section="experience"/);
    assert.doesNotMatch(workPageSource, /FutureHero|WhoAmIIntro|SkillsOrbit|WorkChapterNavigation/);
    assert.doesNotMatch(workPageSource, /work-chapter--/);
  });

  it('keeps the public copy short and gives every primary section one clear heading', () => {
    assert.match(workPageSource, /Systems with a human scale\./);
    assert.match(workPageSource, /Selected work/);
    assert.match(workPageSource, /Tools I use/);
    assert.match(workPageSource, /Path so far/);
    assert.doesNotMatch(workPageSource, /Build with clarity|Connect the pieces|Keep exploring/);
  });

  it('uses a compact timeline without repeated description bullets', () => {
    assert.match(timelineSource, /data-work-timeline-item/);
    assert.match(timelineSource, /work-timeline__marker/);
    assert.match(timelineSource, /work-timeline__date/);
    assert.doesNotMatch(timelineSource, /item\.description\.map/);
    assert.doesNotMatch(timelineSource, /from 'framer-motion'/);
  });

  it('provides three accessible technology LogoLoop lanes', () => {
    assert.equal(existsSync(logoLoopPath), true);
    assert.equal(existsSync(logoLoopStylesPath), true);
    assert.equal(existsSync(technologyLoopsPath), true);
    assert.match(workPageSource, /TechnologyLoops/);
    const technologySource = readFileSync(technologyLoopsPath, 'utf8');
    assert.match(technologySource, /Frontend/);
    assert.match(technologySource, /Backend/);
    assert.match(technologySource, /Agent/);
    assert.match(technologySource, /<LogoLoop/);
    assert.match(technologySource, /ariaLabel/);
  });

  it('renders real icon nodes inside every technology LogoLoop item', () => {
    const technologySource = readFileSync(technologyLoopsPath, 'utf8');
    assert.match(technologySource, /function TechnologyIcon/);
    assert.match(technologySource, /<svg/);
    assert.match(technologySource, /<TechnologyIcon name={name} \/>/);
    assert.match(technologySource, /React/);
    assert.match(technologySource, /Node\.js/);
    assert.match(technologySource, /OpenAI/);
    assert.doesNotMatch(technologySource, /const marks/);
    assert.doesNotMatch(technologySource, /work-technology-mark__symbol/);
  });

  it('uses one ordered GSAP page timeline with safe reduced-motion handling', () => {
    assert.match(motionSource, /gsap\.matchMedia/);
    assert.match(motionSource, /gsap\.timeline/);
    assert.match(motionSource, /data-work-reveal/);
    assert.match(motionSource, /data-work-timeline-item/);
    assert.match(motionSource, /data-work-loop/);
    assert.doesNotMatch(motionSource, /ScrollTrigger/);
    assert.doesNotMatch(motionSource, /heroParallaxPercent/);
    assert.match(motionSource, /gsap\.quickTo/);
    assert.match(motionSource, /new Set\(\[/);
    assert.match(motionSource, /heroRing/);
    assert.match(motionSource, /gsap\.killTweensOf\(\[progressFill, heroMark, heroRing\]\)/);
  });

  it('stops LogoLoop work entirely when reduced motion is requested', () => {
    assert.match(logoLoopSource, /reducedMotion/);
    assert.match(logoLoopSource, /if \(reducedMotion\) return/);
    assert.match(logoLoopSource, /onFocusCapture/);
  });

  it('keeps display type and motion fallbacks within the design system', () => {
    assert.match(workStyles, /\.work-redesign__title\s*\{[\s\S]*?font-size:\s*clamp\([^;]*6rem/);
    assert.match(workStyles, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(workStyles, /work-redesign__project a:focus-visible/);
    assert.match(workStyles, /\.work-technology-loop\s*\{[\s\S]*?grid-template-columns/);
    assert.match(workStyles, /\.work-timeline__marker::after\s*\{[\s\S]*?height:\s*auto/);
    assert.match(globalStyles, /\.glow-layer\s*\{[\s\S]*?animation:\s*glow-drift/);
    assert.match(globalStyles, /prefers-reduced-motion: reduce[\s\S]*?\.glow-layer[\s\S]*?animation:\s*none/);
  });
});
