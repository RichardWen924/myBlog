# Work Richard-Focus Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Work progress UI with a brand-anchored camera push-in, theme hold, and destination pull-back transition.

**Architecture:** A pure frame model divides one normalized clock into source camera push-in, magnified brand hold, and target camera pull-back. The persistent Astro controller measures the visible `Richard` brand once, applies frame values through CSS custom properties, and swaps inert SSR destination content without allowing cloned React islands to hydrate.

**Tech Stack:** Astro 7 view transitions, TypeScript, GSAP 3, React 19, CSS transforms/clip-path, Node test runner.

---

### Task 1: Replace portal progress with two-stage camera frames

**Files:**
- Modify: `src/lib/workThemeTransition.test.ts`
- Modify: `src/lib/workThemeTransition.ts`

- [ ] **Step 1: Write failing source/target phase tests**

Assert that the source starts full-size, both pages meet at maximum magnification near the midpoint, and the target ends full-size with a stable final frame.

```ts
const start = getTransitionFrame('enter', 0, viewport);
const midpoint = getTransitionFrame('enter', 0.46, viewport);
const end = getTransitionFrame('enter', 1, viewport);

assert.equal(start.sourceScale, 1);
assert.equal(start.targetOpacity, 0);
assert.ok(midpoint.sourceScale >= 5);
assert.ok(midpoint.targetScale >= 5);
assert.equal(end.targetScale, 1);
assert.equal(end.sourceOpacity, 0);
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm test -- --test-name-pattern="Richard focus"`

Expected: FAIL because the new frame fields do not exist.

- [ ] **Step 3: Implement the new frame model**

Replace camera/portal-specific fields with `sourceScale`, `sourceOpacity`, `targetScale`, `targetOpacity`, `sourceBlur`, `focusPulse`, and `streakOpacity`. Use endpoint-smooth zoom curves, a short midpoint color hold, and complete target pull-back before the final frame.

- [ ] **Step 4: Run all motion tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/workThemeTransition.ts src/lib/workThemeTransition.test.ts
git commit -m "Model Richard-focus route transition"
```

### Task 2: Remove progress UI and measure the brand focus

**Files:**
- Modify: `src/components/entry/WorkThemeTransition.astro`
- Modify: `src/components/entry/workThemeTransitionClient.ts`

- [ ] **Step 1: Simplify persistent transition markup**

Remove the progressbar, nodes, badge, percent, status, route label, and full-screen conic speed field. Keep the inert target host, localized focus treatment, and restrained streak layer. Direct page loads no longer use a route-transition source.

- [ ] **Step 2: Remove HUD dependencies from controller initialization**

The controller must require only host and target nodes. Remove percent/status rendering and ARIA progress updates.

- [ ] **Step 3: Measure the visual brand center**

At `prepareStaticState`, find the visible desktop `.site-header__brand`, read its bounding rectangle, and set viewport focus X/Y custom properties. Use a fixed desktop fallback point when unavailable. Also store document-space Y for the source transform origin.

- [ ] **Step 4: Map new frame values to CSS variables**

Render source scale/opacity/blur, target scale/opacity, focus pulse, and streak opacity. Keep theme-tone state only for the midpoint color change.

- [ ] **Step 5: Preserve clone and Hero handoff safety**

Keep `astro-island` unwrapping, cached particle-state removal, two-frame cleanup, and the one-shot Work Hero arrival event. Remove direct `/work` route-transition playback so refresh triggers only the Hero animation.

- [ ] **Step 6: Build and commit**

Run: `npm test && npm run build`

```bash
git add src/components/entry/WorkThemeTransition.astro src/components/entry/workThemeTransitionClient.ts
git commit -m "Anchor Work transition to Richard brand"
```

### Task 3: Implement camera push-in, color hold, and pull-back styling

**Files:**
- Modify: `src/styles/work-theme-transition.css`

- [ ] **Step 1: Apply source camera push-in**

Scale the current `[data-work-transition-source]` above `1` around measured focus coordinates so the camera pushes into the brand while the page continues covering the viewport.

- [ ] **Step 2: Apply destination camera pull-back**

Start the inert destination page at the same magnification, crossfade theme surfaces during the brand hold, and pull the destination back to scale `1`.

- [ ] **Step 3: Style the focus treatment**

Create a thin accent ring, subtle radial glow, and short pulse driven by `--work-transition-focus-pulse`. Localize optional streaks around the desktop focus.

- [ ] **Step 4: Delete all progress-system CSS**

Remove track, node, badge, percentage, status, route, and HUD selectors. Preserve reduced-motion fail-open rules.

- [ ] **Step 5: Build and commit**

Run: `npm run build && git diff --check`

```bash
git add src/styles/work-theme-transition.css
git commit -m "Style Richard-focus theme transition"
```

### Task 4: Browser regression verification

**Files:**
- Modify only for scoped, reproduced regressions.

- [ ] **Step 1: Hard-reload the isolated preview**

Open `http://127.0.0.1:4326/` in a fresh page so the persistent controller uses the latest module.

- [ ] **Step 2: Verify desktop Home → Work**

Capture source camera push-in, magnified brand color hold, target pull-back, stable outline arrival, and final particles. Confirm there is no progress UI.

- [ ] **Step 3: Verify Work → Home and repeated cached entry**

Confirm both directions use the measured brand point, cached clones contain no islands or particle layer, and no blank/repeated final frame occurs. Refresh `/work` and confirm only the Hero particle sequence replays.

- [ ] **Step 4: Verify page integrity**

Confirm all six Work chapters remain and the transition target is empty after cleanup. Mobile-specific verification is out of scope.

- [ ] **Step 5: Final verification**

Run: `npm test && npm run build && git status --short`

Expected: tests and build pass; only intentional plan tracking changes remain.
