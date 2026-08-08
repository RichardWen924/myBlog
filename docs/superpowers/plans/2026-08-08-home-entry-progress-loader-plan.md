# Home Entry Progress Loader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GSAP-powered, homepage-only full-screen entry loader that advances through `0%`, `25%`, `50%`, `75%`, and `100%` before revealing the existing blog Hero.

**Architecture:** Create one focused Astro component that owns the loader markup, local styles, accessibility state, and client-side GSAP timeline. Pass a boolean from `Base.astro` so the loader renders only on the homepage; keep the existing Hero and document flow unchanged. Use the existing paper/sage/warm tokens and system font stacks rather than shipping proprietary brand fonts.

**Tech Stack:** Astro 7, React island already used by the homepage, GSAP 3, TypeScript-compatible Astro scripts, Node built-in test runner, npm build.

---

### Task 1: Add failing static coverage for the entry loader contract

**Files:**
- Create: `test/entry-progress-loader.test.mjs`
- Modify: `src/layouts/Base.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Write the failing tests**

Create `test/entry-progress-loader.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const componentPath = resolve(root, 'src/components/entry/EntryProgressLoader.astro');
const base = readFileSync(resolve(root, 'src/layouts/Base.astro'), 'utf8');
const home = readFileSync(resolve(root, 'src/pages/index.astro'), 'utf8');

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
});

test('Base supports an optional loader and homepage enables it', () => {
  assert.match(base, /showEntryLoader\?: boolean/);
  assert.match(base, /showEntryLoader = false/);
  assert.match(base, /<EntryProgressLoader \/>/);
  assert.match(home, /showEntryLoader/);
});
```

- [ ] **Step 2: Run the new test and verify the expected failure**

Run: `node --test test/entry-progress-loader.test.mjs`

Expected: FAIL because `src/components/entry/EntryProgressLoader.astro` does not exist and `Base.astro` does not yet expose `showEntryLoader`.

### Task 2: Implement the minimal GSAP loader component

**Files:**
- Create: `src/components/entry/EntryProgressLoader.astro`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add GSAP as a runtime dependency**

Run: `npm install gsap`

Expected: `package.json` and `package-lock.json` contain `gsap`, with no unrelated dependency changes.

- [ ] **Step 2: Implement the component**

Create `src/components/entry/EntryProgressLoader.astro` with five milestone elements carrying `data-progress="0%"`, `25%`, `50%`, `75%`, and `100%`; a `role="progressbar"` wrapper; local styles using `--color-paper`, `--color-accent`, `--color-warm`, and `--color-border`; and a client script that imports `gsap` and runs this timeline:

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const milestones = gsap.utils.toArray('.entry-progress__step');
const fill = document.querySelector('.entry-progress__fill');
const loader = document.querySelector('.entry-progress-loader');
const progressbar = document.querySelector('[role="progressbar"]');

const setProgress = (value) => {
  progressbar?.setAttribute('aria-valuenow', String(value));
  milestones.forEach((step) => {
    const stepValue = Number(step.dataset.value);
    step.classList.toggle('is-complete', stepValue <= value);
    step.classList.toggle('is-current', stepValue === value);
  });
};

if (prefersReducedMotion) {
  setProgress(100);
  gsap.set(fill, { scaleX: 1 });
  gsap.set(loader, { autoAlpha: 0, pointerEvents: 'none' });
} else {
  const timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.65,
        ease: 'power3.inOut',
        onComplete: () => loader.remove(),
      });
    },
  });

  [0, 25, 50, 75, 100].forEach((value, index) => {
    timeline.to({}, {
      duration: index === 0 ? 0.08 : 0.305,
      onStart: () => setProgress(value),
    });
    timeline.to(fill, { scaleX: value / 100, duration: index === 0 ? 0.08 : 0.305 }, '<');
  });
}
```

The component must set `aria-hidden="true"` only after the exit begins or the loader is removed, and its CSS must include a mobile layout where the progress rail remains usable at narrow widths.

- [ ] **Step 3: Run the new test and verify it passes**

Run: `node --test test/entry-progress-loader.test.mjs`

Expected: PASS for all loader contract tests.

### Task 3: Mount the loader on the homepage only

**Files:**
- Modify: `src/layouts/Base.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Extend the Base props and render the component**

In `Base.astro`, import `EntryProgressLoader`, extend `Props` with `showEntryLoader?: boolean`, default it to `false`, and render `<EntryProgressLoader />` inside the outer `relative z-10` wrapper before `Header` only when `showEntryLoader` is true.

- [ ] **Step 2: Enable the loader on the homepage**

In `index.astro`, change the root layout invocation to `<Base title="Home" description={SITE_DESCRIPTION} fullBleed showEntryLoader>`; do not change the Hero props or downstream sections.

- [ ] **Step 3: Run the full static test suite**

Run: `node --test test/*.test.mjs`

Expected: PASS with existing Hero tests and the new entry loader tests.

### Task 4: Verify build output and browser behavior

**Files:**
- Modify only files identified by the preceding tasks if a verification fix is required.

- [ ] **Step 1: Build the Astro site**

Run: `npm run build`

Expected: Astro build completes successfully without TypeScript, CSS, or client bundle errors.

- [ ] **Step 2: Run the project dev server in the required background mode**

Run: `astro dev --background`

Expected: Astro reports a local URL and remains available through `astro dev status`.

- [ ] **Step 3: Inspect the homepage in a real browser**

Verify the homepage shows only the five-step progress loader on first load, advances in order across roughly 1.3 seconds, exits upward once, then reveals the unchanged Hero. Verify `/about`, `/blog`, and `/projects` do not show the loader.

- [ ] **Step 4: Check responsive and accessibility behavior**

Use a narrow viewport and confirm the five labels remain readable and the rail does not overflow. Emulate `prefers-reduced-motion: reduce` and confirm the loader completes without the long animation. Check browser console output for errors and missing assets.

- [ ] **Step 5: Re-run the tests after any verification fix**

Run: `node --test test/*.test.mjs && npm run build`

Expected: all tests pass and the build completes successfully.
