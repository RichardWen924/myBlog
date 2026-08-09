# Work Transition Smoothing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Work portal motion settle smoothly, remove the duplicated arrival frame, and align the `BUILD FUTURE` outline and particle wordmarks.

**Architecture:** Keep the route transition on one pure normalized motion model, then hand ownership to the live React Hero through a single completion event. Replace the transition-only wordmark approximation with an SSR-safe HTML outline and make the canvas particle sampler consume the same typography tokens, including letter spacing.

**Tech Stack:** Astro 7 view transitions, React 19, GSAP 3, Canvas 2D, CSS custom properties, Node test runner.

---

## File map

- Modify `src/lib/workThemeTransition.ts`: endpoint-smooth progress and exported arrival event contract.
- Modify `src/lib/workThemeTransition.test.ts`: motion endpoint and settle regression tests.
- Create `src/lib/particleTextLayout.ts`: pure glyph-run width calculation.
- Create `src/lib/particleTextLayout.test.ts`: spacing and fitting regression tests.
- Modify `src/layouts/Base.astro`: SSR marker that keeps the Work Hero in arrival state.
- Modify `src/pages/work.astro`: opt the Work page into the arrival marker.
- Modify `src/components/entry/workThemeTransitionClient.ts`: one-shot completion handoff after the live page paints.
- Modify `src/components/react/FutureHero.tsx`: static outline arrival followed by one particle transition.
- Modify `src/components/react/bits/ParticleText.tsx`: font-ready, letter-spaced canvas sampling.
- Modify `src/styles/work.css`: shared responsive wordmark typography and aligned layers.
- Modify `src/styles/work-theme-transition.css`: remove the independent proxy wordmark.

### Task 1: Smooth the shared motion clock

**Files:**
- Modify: `src/lib/workThemeTransition.test.ts`
- Modify: `src/lib/workThemeTransition.ts`

- [ ] **Step 1: Add a failing endpoint-settle test**

Add a test that compares the portal, camera, and scale deltas from `0.99` to `1` against their mid-transition deltas and expects the ending deltas to be zero or materially smaller. Add the equivalent exit assertion near `1`.

```ts
it('settles camera and portal motion before the final frame', () => {
  const viewport = { width: 1440, height: 900 };
  const almost = getTransitionFrame('enter', 0.99, viewport);
  const end = getTransitionFrame('enter', 1, viewport);

  assert.ok(Math.abs(end.portalRadius - almost.portalRadius) < 0.01);
  assert.ok(Math.abs(end.workScale - almost.workScale) < 0.0001);
  assert.ok(Math.abs(end.focusX - almost.focusX) < 0.0001);
});
```

- [ ] **Step 2: Run the test and verify the regression fails**

Run: `npm test -- --test-name-pattern="settles camera"`

Expected: FAIL because enter portal growth currently continues through the final frame.

- [ ] **Step 3: Add endpoint-smooth progress**

Add a quintic smoother-step helper and drive camera/portal windows from it. Complete the camera and portal before the final few percent so the last frame is a true settle frame. Keep enter and exit semantically reversed and preserve compact viewport values.

```ts
const smootherStep = (value: number) => {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
```

- [ ] **Step 4: Run motion tests**

Run: `npm test -- --test-name-pattern="Work transition frames"`

Expected: PASS.

- [ ] **Step 5: Commit the motion model**

```bash
git add src/lib/workThemeTransition.ts src/lib/workThemeTransition.test.ts
git commit -m "Smooth Work transition motion endpoints"
```

### Task 2: Add shared particle text geometry

**Files:**
- Create: `src/lib/particleTextLayout.ts`
- Create: `src/lib/particleTextLayout.test.ts`
- Modify: `src/components/react/bits/ParticleText.tsx`

- [ ] **Step 1: Write failing glyph-layout tests**

```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getSpacedGlyphRunWidth } from './particleTextLayout.ts';

describe('particle text layout', () => {
  it('includes spacing only between glyphs', () => {
    assert.equal(getSpacedGlyphRunWidth([10, 12, 8], -2), 26);
    assert.equal(getSpacedGlyphRunWidth([], -2), 0);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- --test-name-pattern="particle text layout"`

Expected: FAIL because `particleTextLayout.ts` does not exist.

- [ ] **Step 3: Implement the pure width helper**

```ts
export const getSpacedGlyphRunWidth = (glyphWidths: number[], letterSpacing: number) => {
  if (glyphWidths.length === 0) return 0;
  return glyphWidths.reduce((total, width) => total + width, 0)
    + letterSpacing * (glyphWidths.length - 1);
};
```

- [ ] **Step 4: Add letter spacing to `ParticleText`**

Add `letterSpacing?: number | string` and `maxWidthRatio?: number` props. Resolve the CSS length using a hidden probe, await `document.fonts.ready`, measure each glyph, calculate its spaced run width with `getSpacedGlyphRunWidth`, and draw glyphs individually into the sampling canvas. When text must scale down, scale letter spacing by the same ratio as font size.

- [ ] **Step 5: Run tests and build**

Run: `npm test && npm run build`

Expected: all tests pass and Astro builds without TypeScript errors.

- [ ] **Step 6: Commit canvas typography support**

```bash
git add src/lib/particleTextLayout.ts src/lib/particleTextLayout.test.ts src/components/react/bits/ParticleText.tsx
git commit -m "Align particle text glyph spacing"
```

### Task 3: Make the Hero handoff single-shot

**Files:**
- Modify: `src/lib/workThemeTransition.ts`
- Modify: `src/layouts/Base.astro`
- Modify: `src/pages/work.astro`
- Modify: `src/components/entry/workThemeTransitionClient.ts`
- Modify: `src/components/react/FutureHero.tsx`

- [ ] **Step 1: Add a failing arrival-contract test**

Export `getWorkHeroStartMode(reducedMotion, arrivalPending)` and test all three modes.

```ts
assert.equal(getWorkHeroStartMode(true, true), 'particles');
assert.equal(getWorkHeroStartMode(false, true), 'await-transition');
assert.equal(getWorkHeroStartMode(false, false), 'settle');
```

Run: `npm test -- --test-name-pattern="Hero arrival"`

Expected: FAIL because the helper is not implemented.

- [ ] **Step 2: Implement the arrival contract**

Export the helper, `WORK_HERO_ARRIVAL_EVENT`, a short settle delay, and a bounded fallback delay from `workThemeTransition.ts`.

- [ ] **Step 3: Add an SSR pending marker**

Add a `workHeroArrival?: boolean` prop to `Base.astro`, render `data-work-hero-arrival="pending"` on `<html>` when true, and pass `workHeroArrival` from `work.astro`.

- [ ] **Step 4: Dispatch completion only after the live page paints**

In `workThemeTransitionClient.ts`, capture the finishing direction, wait two animation frames after `astro:after-swap`, remove the transition clone, set the root marker to `complete`, and dispatch `WORK_HERO_ARRIVAL_EVENT` once for enter/direct Work transitions. Do not dispatch on exit.

- [ ] **Step 5: Replace the animated SVG arrival with one stable outline**

In `FutureHero.tsx`, render an SSR-safe `.future-wordmark__outline` text layer. Initialize particles immediately for reduced motion; otherwise wait for the completion event when the SSR marker is pending, or use the settle delay when no route transition is pending. Keep a bounded fallback and clear every event listener and timer on unmount.

- [ ] **Step 6: Run contract tests and build**

Run: `npm test && npm run build`

Expected: all tests pass and the Work React island compiles.

- [ ] **Step 7: Commit the handoff**

```bash
git add src/lib/workThemeTransition.ts src/lib/workThemeTransition.test.ts src/layouts/Base.astro src/pages/work.astro src/components/entry/workThemeTransitionClient.ts src/components/react/FutureHero.tsx
git commit -m "Prevent duplicate Work hero arrival"
```

### Task 4: Unify outline, clone, and particle styling

**Files:**
- Modify: `src/styles/work.css`
- Modify: `src/styles/work-theme-transition.css`

- [ ] **Step 1: Define one wordmark typography contract**

Add responsive custom properties to `.future-wordmark` for font size, weight, letter spacing, line height, and maximum visual width. Make outline and particle layers fill and center within the same box.

- [ ] **Step 2: Remove the transition-only approximation**

Delete `.future-wordmark::after` and the rules that hide the real Hero layers inside the inert clone. The SSR outline from `FutureHero` must be the transition outline.

- [ ] **Step 3: Verify production build**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 4: Commit shared styling**

```bash
git add src/styles/work.css src/styles/work-theme-transition.css
git commit -m "Unify Work hero wordmark geometry"
```

### Task 5: Browser regression verification

**Files:**
- Modify only if a verified regression requires a scoped correction.

- [ ] **Step 1: Restart the isolated Astro preview**

Run: `astro dev stop`, then `astro dev --background --host 127.0.0.1 --port 4326` from the isolated worktree.

Expected: Astro reports `http://127.0.0.1:4326/`.

- [ ] **Step 2: Verify direct Work entry**

Open `/work` in a fresh browser tab. Verify progress reaches 100%, the arrival outline remains stationary across clone cleanup, and particles begin once after the settle pause.

- [ ] **Step 3: Verify both navigation directions**

Navigate Archive → Work → Archive → Work. Verify enter/exit motion settles cleanly, percentage direction is correct, Work content remains present, and no final-frame replay occurs.

- [ ] **Step 4: Verify visual alignment**

At desktop and mobile widths, inspect the outline and particle wordmark bounding boxes. Their center, width, baseline, and letter spacing must remain visually aligned.

- [ ] **Step 5: Verify accessibility and resilience**

Emulate reduced motion, confirm the decorative transition is skipped and stable particles appear. Confirm browser console has no new errors and all six Work chapters remain in the document.

- [ ] **Step 6: Run final checks**

Run: `npm test && npm run build && git status --short`

Expected: tests and build pass; status contains only intentional changes.
