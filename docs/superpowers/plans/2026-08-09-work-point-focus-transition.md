# Work Point-Focus Theme Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Work-only rainbow loader with a reversible Carbon-style point-focus portal that plays on every navigation into and out of `/work`.

**Architecture:** Enable Astro `ClientRouter` globally and keep a persistent `WorkThemeTransition` host outside the swappable site page. During `astro:before-preparation`, load the incoming document, import its server-rendered `[data-site-page]` as an inert temporary target layer, and drive source camera motion, target circular clipping, Work Hero scale, HUD percentage, and route swap from one GSAP progress value. Pure route and frame calculations live in a tested TypeScript module; page-specific scripts become idempotent `astro:page-load` initializers so ClientRouter revisits do not accumulate listeners.

**Tech Stack:** Astro 7, TypeScript, GSAP 3, CSS `clip-path`, Astro ClientRouter, Node 24 test runner

---

## File map

- Create `src/lib/workThemeTransition.ts`: pure route classification, viewport profile, easing, and frame derivation.
- Create `src/lib/workThemeTransition.test.ts`: route matrix and reversible frame tests using Node's test runner.
- Create `src/components/entry/WorkThemeTransition.astro`: persistent HUD, direct-entry source layer, speed field, and incoming-page target host.
- Create `src/components/entry/workThemeTransitionClient.ts`: Astro lifecycle integration, GSAP timeline, DOM cloning, locking, and cleanup.
- Create `src/styles/work-theme-transition.css`: Obsidian Circuit visuals, layer ordering, portal clipping, responsive and reduced-motion rules.
- Modify `src/layouts/Base.astro`: enable ClientRouter, add `[data-site-page]`, mount the transition globally, and remove `showWorkTransition`.
- Modify `src/pages/work.astro`: remove the obsolete prop, identify the real Work Hero, and make the page script re-entrant.
- Modify `src/components/entry/EntryProgressLoader.astro`: initialize and clean up on Astro lifecycle events.
- Modify `src/pages/blog/index.astro`: make archive observer/keyboard logic re-entrant.
- Modify `src/components/home/HomeLandingHero.astro`: make Hero motion re-entrant.
- Modify `src/components/home/HomeChapterNavigation.astro`: make chapter navigation re-entrant.
- Delete `src/components/entry/WorkTransitionProgress.astro`: remove the obsolete rainbow loader.
- Modify `package.json`: add a repeatable unit-test command.
- Modify `docs/design-system/work/README.md` and `docs/design-system/work/theme-transition.md`: mark the transition implemented and record the runtime file locations.

### Task 1: Add tested transition math

**Files:**
- Create: `src/lib/workThemeTransition.test.ts`
- Create: `src/lib/workThemeTransition.ts`
- Modify: `package.json`

- [ ] **Step 1: Add the failing route and frame tests**

```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getTransitionDirection,
  getTransitionFrame,
  isWorkPath,
} from './workThemeTransition.ts';

describe('Work route classification', () => {
  it('recognizes only the Work route', () => {
    assert.equal(isWorkPath('/work'), true);
    assert.equal(isWorkPath('/work/'), true);
    assert.equal(isWorkPath('/work#projects'), true);
    assert.equal(isWorkPath('/projects'), false);
  });

  it('returns enter and exit only when crossing the Work boundary', () => {
    assert.equal(getTransitionDirection('/about', '/work'), 'enter');
    assert.equal(getTransitionDirection('/work', '/blog'), 'exit');
    assert.equal(getTransitionDirection('/', '/blog'), null);
    assert.equal(getTransitionDirection('/work', '/work#projects'), null);
  });
});

describe('Work transition frames', () => {
  it('maps the enter endpoints from Archive to full-screen Work', () => {
    const start = getTransitionFrame('enter', 0, { width: 1440, height: 900 });
    const end = getTransitionFrame('enter', 1, { width: 1440, height: 900 });
    assert.equal(start.percent, 0);
    assert.equal(start.focusX, 88);
    assert.equal(start.workScale, 0.46);
    assert.equal(end.percent, 100);
    assert.equal(end.focusX, 50);
    assert.equal(end.workScale, 1);
    assert.equal(start.sourceShiftX, 0);
    assert.equal(end.sourceShiftX, -38);
    assert.ok(end.portalRadius > Math.hypot(1440, 900));
  });

  it('maps exit as the semantic reverse at the same viewport size', () => {
    const start = getTransitionFrame('exit', 0, { width: 1440, height: 900 });
    const end = getTransitionFrame('exit', 1, { width: 1440, height: 900 });
    assert.equal(start.percent, 100);
    assert.equal(start.focusX, 50);
    assert.equal(start.workScale, 1);
    assert.equal(end.percent, 0);
    assert.equal(end.focusX, 12);
    assert.equal(end.workScale, 0.46);
    assert.equal(start.sourceShiftX, 38);
    assert.equal(end.sourceShiftX, 0);
    assert.equal(end.portalRadius, 21);
  });

  it('reduces depth and uses safe node positions on compact viewports', () => {
    const frame = getTransitionFrame('enter', 0, { width: 390, height: 844 });
    assert.equal(frame.focusX, 84);
    assert.equal(frame.workScale, 0.62);
    assert.equal(frame.sourceDepthScale, 1);
  });
});
```

- [ ] **Step 2: Add the test script and verify RED**

```json
"test": "node --test src/lib/*.test.ts"
```

Run: `npm test`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `workThemeTransition.ts`.

- [ ] **Step 3: Implement the minimal pure transition model**

```ts
export type WorkTransitionDirection = 'enter' | 'exit';

export interface TransitionViewport {
  width: number;
  height: number;
}

export interface WorkTransitionFrame {
  percent: number;
  workProgress: number;
  cameraProgress: number;
  portalProgress: number;
  focusX: number;
  portalRadius: number;
  workScale: number;
  sourceShiftX: number;
  sourceDepthScale: number;
  sourceBlur: number;
  speedOpacity: number;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, value: number) => from + (to - from) * value;
const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp01(value), 3);
const easeInOutCubic = (value: number) => {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const isWorkPath = (value: string | URL) => {
  const pathname = value instanceof URL ? value.pathname : new URL(value, 'https://local.invalid').pathname;
  return pathname.replace(/\/+$/, '') === '/work';
};

export const getTransitionDirection = (from: string | URL, to: string | URL): WorkTransitionDirection | null => {
  const fromWork = isWorkPath(from);
  const toWork = isWorkPath(to);
  if (fromWork === toWork) return null;
  return toWork ? 'enter' : 'exit';
};

export const getTransitionFrame = (
  direction: WorkTransitionDirection,
  rawProgress: number,
  viewport: TransitionViewport,
): WorkTransitionFrame => {
  const t = clamp01(rawProgress);
  const compact = viewport.width < 640;
  const medium = !compact && viewport.width < 1024;
  const startNode = compact ? 84 : medium ? 86 : 88;
  const endNode = compact ? 16 : medium ? 14 : 12;
  const initialScale = compact ? 0.62 : medium ? 0.54 : 0.46;
  const workProgress = direction === 'enter' ? t : 1 - t;
  const cameraProgress = direction === 'enter'
    ? easeOutCubic(clamp01((t - 0.04) / 0.84))
    : 1 - easeOutCubic(clamp01((t - 0.04) / 0.84));
  const portalProgress = direction === 'enter'
    ? easeInOutCubic(clamp01((t - 0.12) / 0.88))
    : 1 - easeInOutCubic(clamp01(t / 0.88));
  const focusX = direction === 'enter'
    ? lerp(startNode, 50, cameraProgress)
    : lerp(endNode, 50, cameraProgress);
  const fullRadius = Math.hypot(viewport.width, viewport.height) * 1.08;
  const portalRadius = lerp(21, fullRadius, Math.pow(portalProgress, 1.28));
  const workScale = lerp(initialScale, 1, portalProgress);
  const depthBudget = compact ? 0 : medium ? 0.16 : 0.24;
  const sourceDepthScale = 1 + depthBudget * cameraProgress;
  const sourceShiftX = direction === 'enter' ? focusX - startNode : focusX - endNode;
  const sourceBlur = compact ? 0 : 1.2 * cameraProgress;
  const speedOpacity = compact ? 0 : Math.min(0.24, cameraProgress * (1 - portalProgress) * 0.28);
  return {
    percent: Math.round(workProgress * 100),
    workProgress,
    cameraProgress,
    portalProgress,
    focusX,
    portalRadius,
    workScale,
    sourceShiftX,
    sourceDepthScale,
    sourceBlur,
    speedOpacity,
  };
};
```

- [ ] **Step 4: Verify GREEN**

Run: `npm test`

Expected: 5 tests PASS, 0 failures.

- [ ] **Step 5: Commit the tested model**

```bash
git add package.json src/lib/workThemeTransition.ts src/lib/workThemeTransition.test.ts
git commit -m "Add Work transition motion model"
```

### Task 2: Build the persistent transition host and visual system

**Files:**
- Create: `src/components/entry/WorkThemeTransition.astro`
- Create: `src/styles/work-theme-transition.css`
- Modify: `src/layouts/Base.astro`
- Modify: `src/pages/work.astro`
- Delete: `src/components/entry/WorkTransitionProgress.astro`

- [ ] **Step 1: Create the persistent semantic HUD**

The component must render a `display: contents` persistent host so the source backdrop, target layer, speed field, and HUD can occupy separate z-index levels:

```astro
---
import '../../styles/work-theme-transition.css';
---

<div data-work-theme-transition transition:persist="work-theme-transition">
  <div class="work-theme-transition__direct-source" data-work-transition-direct-source aria-hidden="true">
    <div class="work-theme-transition__paper-grid"></div>
  </div>
  <div class="work-theme-transition__target" data-work-transition-target aria-hidden="true" inert></div>
  <div class="work-theme-transition__speed" data-work-transition-speed aria-hidden="true"></div>
  <div class="work-theme-transition__hud" data-work-transition-hud aria-hidden="true">
    <div class="work-theme-transition__topline"><span>RICHARD / ARCHIVE</span><span>THEME TRANSITION</span></div>
    <div class="work-theme-transition__progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Entering Work theme">
      <div class="work-theme-transition__track"><i data-work-transition-fill></i></div>
      <div class="work-theme-transition__node work-theme-transition__node--zero"><span>0 / ARCHIVE</span></div>
      <div class="work-theme-transition__node work-theme-transition__node--shift"><span>50 / SHIFT</span></div>
      <div class="work-theme-transition__node work-theme-transition__node--work"><span>100 / WORK</span></div>
      <div class="work-theme-transition__ring" data-work-transition-ring></div>
      <div class="work-theme-transition__badge" data-work-transition-badge><strong data-work-transition-value>0%</strong><span>WORK THEME</span></div>
    </div>
    <div class="work-theme-transition__status"><small data-work-transition-status>CAMERA APPROACH</small><b data-work-transition-route>ARCHIVE → WORK</b></div>
  </div>
</div>

<script>
  import { initWorkThemeTransition } from './workThemeTransitionClient';
  initWorkThemeTransition();
</script>
```

- [ ] **Step 2: Implement the Obsidian Circuit visual layers**

The stylesheet must define these stable contracts:

```css
[data-work-theme-transition] { display: contents; }
.work-theme-transition__direct-source,
.work-theme-transition__target,
.work-theme-transition__speed,
.work-theme-transition__hud { position: fixed; inset: 0; visibility: hidden; pointer-events: none; }
html[data-work-transition-active] .work-theme-transition__hud,
html[data-work-transition-active] .work-theme-transition__speed,
html[data-work-transition-active] .work-theme-transition__target { visibility: visible; }
.work-theme-transition__direct-source { z-index: 50; background: #f4f0e8; }
.work-theme-transition__target { z-index: 65; overflow: hidden; clip-path: circle(calc(var(--work-transition-radius) * 1px) at calc(var(--work-transition-focus-x) * 1%) 50%); transform: scale(var(--work-transition-work-scale)); transform-origin: calc(var(--work-transition-focus-x) * 1%) 50%; }
.work-theme-transition__speed { z-index: 70; opacity: var(--work-transition-speed-opacity); }
.work-theme-transition__hud { z-index: 80; color: #1d1d1a; }
html[data-work-transition-direction='exit'] .work-theme-transition__target { z-index: 50; clip-path: none; transform: translateX(calc(var(--work-transition-target-shift) * 1vw)) scale(var(--work-transition-source-scale)); }
html[data-work-transition-direction='exit'] [data-work-transition-source] { position: relative; z-index: 65; clip-path: circle(calc(var(--work-transition-radius) * 1px) at calc(var(--work-transition-focus-x) * 1%) 50%); transform: scale(var(--work-transition-work-scale)); transform-origin: calc(var(--work-transition-focus-x) * 1%) 50%; }
```

Also implement the 1px track, square/round structural nodes, `#050708` target work surface, `#8AD7AF` signal, responsive node positions, Compact label shortening, reduced-motion hiding, and `.work-theme-transition__target[data-target-theme='work']`/`non-work` token scopes.

- [ ] **Step 3: Wire ClientRouter and the global transition host**

In `Base.astro`:

```astro
import { ClientRouter } from 'astro:transitions';
import WorkThemeTransition from '../components/entry/WorkThemeTransition.astro';
```

Remove the `showWorkTransition` prop. Add `<ClientRouter fallback="animate" />` in `<head>`, set `transition:animate="none"` on `<html>`, wrap all visible site UI except the transition host in `<div data-site-page>`, and mount `<WorkThemeTransition />` as the final child of `<body>`.

In `work.astro`, remove `showWorkTransition` and add `data-work-hero-page` to the Hero section. Delete `WorkTransitionProgress.astro` only after Base no longer imports it.

- [ ] **Step 4: Run the build and commit the visual host**

Run: `npm run build`

Expected: 8 Astro pages build successfully; the new host remains hidden because the controller is not added until Task 3.

```bash
git add src/components/entry src/layouts/Base.astro src/pages/work.astro src/styles/work-theme-transition.css
git commit -m "Add persistent Work transition host"
```

### Task 3: Implement the route controller and Base integration

**Files:**
- Create: `src/components/entry/workThemeTransitionClient.ts`

- [ ] **Step 1: Implement the singleton lifecycle controller**

`workThemeTransitionClient.ts` must:

1. Guard initialization with `window.__workThemeTransitionController`.
2. Listen to `astro:before-preparation`, save the original loader, and replace it with an async wrapper.
3. Await the original loader so `event.newDocument` and its styles are ready.
4. Determine enter/exit with `getTransitionDirection(event.from, event.to)`.
5. Import the incoming document's direct child `[data-site-page]`, remove `script`, `.entry-progress-loader`, and duplicate transition hosts, set `aria-hidden` and `inert`, then append it to the target host.
6. Mark the current direct child `[data-site-page]` as `data-work-transition-source`.
7. Lock scroll and set the source inert.
8. Run one GSAP tween from `t = 0` to `t = 1` for `1.28s`, calling `getTransitionFrame()` on update.
9. Write CSS variables, `aria-valuenow`, percentage, fill, ring, badge, status, and direction from that frame.
10. Let Astro perform the real swap only after the timeline resolves.
11. On `astro:after-swap`, wait one animation frame, then remove the imported target and all locks.

The event wrapper uses Astro's writable loader contract:

```ts
const handleBeforePreparation = (event: Event) => {
  const transitionEvent = event as TransitionBeforePreparationEvent;
  const direction = getTransitionDirection(transitionEvent.from, transitionEvent.to);
  if (!direction) return;
  const defaultLoader = transitionEvent.loader;
  transitionEvent.loader = async () => {
    prepareStaticState(direction);
    await defaultLoader();
    if (transitionEvent.signal.aborted || transitionEvent.defaultPrevented) {
      cleanup();
      return;
    }
    const incomingPage = transitionEvent.newDocument.body.querySelector(':scope > [data-site-page]');
    if (!(incomingPage instanceof HTMLElement)) {
      cleanup();
      return;
    }
    mountIncomingPage(incomingPage, direction);
    await play(direction);
  };
};
```

The only tween is:

```ts
const state = { value: 0 };
await gsap.to(state, {
  value: 1,
  duration: 1.28,
  ease: 'none',
  onUpdate: () => renderFrame(getTransitionFrame(direction, state.value, viewport)),
}).then();
```

- [ ] **Step 2: Implement direct `/work` entry**

On the first `astro:page-load`, when `location.pathname` is Work and no client navigation is pending:

- show the warm direct-source layer;
- mark the real `[data-site-page]` as `data-work-transition-direct-target`;
- play the same enter timeline;
- remove the source layer and locks on completion;
- store only an in-memory `initialPageHandled` boolean so reload still plays again.

Reduced motion must immediately render the final frame and clean up without the 1.28 second delay.

- [ ] **Step 3: Verify unit tests and build**

Run: `npm test && npm run build`

Expected: all unit tests PASS and 8 Astro pages build.

- [ ] **Step 4: Commit the global transition**

```bash
git add src/components/entry/workThemeTransitionClient.ts
git commit -m "Implement Work point-focus theme transition"
```

### Task 4: Make existing page scripts ClientRouter-safe

**Files:**
- Modify: `src/components/entry/EntryProgressLoader.astro`
- Modify: `src/components/home/HomeLandingHero.astro`
- Modify: `src/components/home/HomeChapterNavigation.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/work.astro`

- [ ] **Step 1: Convert every page script to an idempotent initializer**

Use this exact lifecycle shape in each bundled module:

```ts
let cleanup = () => {};

const setupWorkPage = () => {
  cleanup();
  const chapters = [...document.querySelectorAll<HTMLElement>('[data-work-chapter]')];
  const railLinks = [...document.querySelectorAll<HTMLElement>('[data-work-rail-link]')];
  if (chapters.length === 0 || railLinks.length === 0) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveChapter((visible.target as HTMLElement).dataset.workChapter);
    },
    { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] },
  );
  chapters.forEach((chapter) => observer.observe(chapter));
  window.addEventListener('keydown', handleKeyDown);
  cleanup = () => {
    observer.disconnect();
    window.removeEventListener('keydown', handleKeyDown);
    cleanup = () => {};
  };
};

document.addEventListener('astro:page-load', setupWorkPage);
document.addEventListener('astro:before-swap', () => cleanup());
```

Use these concrete roots in the other modules: `.entry-progress-loader`, `[data-home-landing-hero]`, `[data-home-chapter-rail]`, and `[data-blog-chapter]`. For `HomeLandingHero`, `cleanup` calls each `initHomeHeroMotion()` disposer. For `EntryProgressLoader`, setup queries the current loader, removes it immediately on revisits already completed in the same session, and always removes locks during cleanup.

- [ ] **Step 2: Verify repeat initialization does not duplicate handlers**

Run: `npm test && npm run build`

Expected: all tests PASS; all 8 pages build without script compilation warnings.

- [ ] **Step 3: Commit lifecycle safety**

```bash
git add src/components/entry/EntryProgressLoader.astro src/components/home/HomeLandingHero.astro src/components/home/HomeChapterNavigation.astro src/pages/blog/index.astro src/pages/work.astro
git commit -m "Make page scripts safe for Astro navigation"
```

### Task 5: Visual verification, regression checks, and documentation

**Files:**
- Modify: `docs/design-system/work/README.md`
- Modify: `docs/design-system/work/theme-transition.md`

- [ ] **Step 1: Start the required background dev server**

Run: `npx astro dev --background`

Expected: Astro reports a background server URL and running status.

- [ ] **Step 2: Verify the navigation matrix in a real browser**

Check each path at desktop `1440×900` and mobile `390×844`:

1. `/` → `/work`: full `0 → 100`, camera moves toward the Work point, Work Hero grows inside the circle, no second fade.
2. `/work` → `/blog`: full `100 → 0`, Work shrinks toward the Archive point, Blog appears behind.
3. `/blog` → `/about`: no Work transition.
4. Browser back and forward across `/work`: correct direction each time.
5. Reload `/work`: full direct-entry animation.
6. Rapid double-click during transition: one navigation, no stuck `inert` or scroll lock.
7. Reduced motion: immediate navigation, no forced delay.

Inspect the console for duplicate listener, hydration, promise, and View Transition errors.

- [ ] **Step 3: Run final automated checks**

Run: `npm test && npm run build && git diff --check`

Expected: tests PASS, 8 pages build, and `git diff --check` prints nothing.

- [ ] **Step 4: Update documentation status**

Change the transition status to `已实现` and list the actual runtime files. Do not change the confirmed motion parameters unless visual verification found a specific measured issue.

- [ ] **Step 5: Commit verified documentation**

```bash
git add docs/design-system/work/README.md docs/design-system/work/theme-transition.md
git commit -m "Record implemented Work transition"
```

- [ ] **Step 6: Stop the background dev server**

Run: `npx astro dev stop`

Expected: Astro confirms the background server stopped.
