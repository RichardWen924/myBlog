# Remove BUILD FUTURE Outline Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the BUILD FUTURE particle wordmark immediately and remove only its initial outline animation.

**Architecture:** Keep `FutureHero` as the owner of the wordmark markup and `ParticleText` as the owner of particle rendering. Simplify `FutureHero` to render the particle layer directly, then remove CSS that exists only to stage and crossfade the outline.

**Tech Stack:** React, TypeScript, Astro, CSS, Node test runner.

---

### Task 1: Add a regression test

**Files:**
- Create: `src/lib/futureHero.test.ts`

- [ ] **Step 1: Add a source-level regression test**

Read `src/features/work/components/FutureHero.tsx` and `src/styles/work.css` relative to the test file and assert that the hero source contains `future-wordmark__particle`, but does not contain `future-wordmark__outline`, `particleReady`, or `WORK_HERO_SETTLE_MS`; assert the stylesheet does not contain `.future-wordmark__outline`.

- [ ] **Step 2: Run the test and confirm it fails**

Run `node --test src/lib/futureHero.test.ts`. It must fail against the current implementation because the outline markup and delayed readiness logic still exist.

### Task 2: Remove the delayed outline stage

**Files:**
- Modify: `src/features/work/components/FutureHero.tsx`
- Modify: `src/styles/work.css`
- Modify: `src/lib/workHero.test.ts`
- Remove: `src/features/work/workHero.ts`

- [ ] **Step 1: Render the particle wordmark immediately**

Remove the React state/effect and `workHero` imports. Keep the `<ParticleText>` props unchanged, render its wrapper unconditionally, and remove the outline element and readiness class.

- [ ] **Step 2: Remove outline-only styles and obsolete helper coverage**

Delete `.future-wordmark__outline` from `work.css`, remove the outline/particle opacity and transform transition rules, and delete the obsolete `workHero.ts` and `workHero.test.ts` files because no production code references the delayed start-mode helper after Task 2.

- [ ] **Step 3: Run the regression test**

Run `node --test src/lib/futureHero.test.ts`. Expect it to pass.

### Task 3: Verify the project

**Files:**
- Test: `src/lib/*.test.ts`

- [ ] **Step 1: Run all tests**

Run `npm test` and expect zero failures.

- [ ] **Step 2: Build the site**

Run `npm run build` and expect Astro to complete successfully, including `/work`.
