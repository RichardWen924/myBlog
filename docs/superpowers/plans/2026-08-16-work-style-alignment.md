# Work Style Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Work's dark technology theme with the shared warm paper-archive visual system while preserving its content, interactions, and motion.

**Architecture:** Keep the existing Work component tree and interaction code. Consolidate page colors onto global design tokens, then tune Work-specific hero, orbit, timeline, project, and rail selectors for low-contrast paper surfaces. Validate with static CSS/build checks and responsive browser measurements.

**Tech Stack:** Astro, Tailwind CSS v4, CSS custom properties, React islands, Node test runner

---

## File map

- Modify `src/styles/work.css`: remove the dark token override and retheme Work visuals, borders, rails, and responsive states.
- Do not modify component or content files unless CSS inspection proves a required visual class is missing.
- Keep existing motion tests and component APIs unchanged.

### Task 1: Replace the Work page theme tokens

**Files:**
- Modify: `src/styles/work.css:3-30`

- [ ] **Step 1: Capture the dark-theme baseline**

Run: `rg -n "#080909|#111313|#f3f0e8|#a4aaa5|#2b302f|#8ee6c2|#ff9b76|html\\.work-page" src/styles/work.css`

Expected: matches show the dark Work token block and neon palette.

- [ ] **Step 2: Remove the dark token override**

Delete the `html.work-page` custom-property block and retain this light-page glow rule:

```css
html.work-page .glow-layer {
  opacity: 0.58;
  background: radial-gradient(
    ellipse 68% 50% at 52% 0%,
    color-mix(in srgb, var(--color-accent) 7%, transparent),
    transparent 72%
  );
}
```

- [ ] **Step 3: Verify no dark Work tokens remain**

Run: `rg -n "#080909|#111313|#f3f0e8|#a4aaa5|#2b302f|html\\.work-page" src/styles/work.css`

Expected: no matches. Shared `var(--color-paper)`, `var(--color-ink)`, `var(--color-border)`, `var(--color-accent)`, and `var(--color-warm)` references remain valid.

- [ ] **Step 4: Validate**

Run: `npm run check && npm run build`

Expected: zero Astro diagnostics and eight generated static pages.

- [ ] **Step 5: Commit**

Run: `git add src/styles/work.css && git commit -m "style: align Work page with paper theme"`

### Task 2: Recolor Work-specific visual primitives

**Files:**
- Modify: `src/styles/work.css` selectors for `.future-wordmark`, `.work-whoami-*`, `.skill-orbit-*`, `.work-section`, project/timeline rows, and the chapter rail.

- [ ] **Step 1: Replace hard-coded palette values with global tokens**

Use `var(--color-paper)` for canvas, `var(--color-surface)` for surfaces, `var(--color-ink)` for primary text, `var(--color-ink-soft)` for muted text, `var(--color-border)` for separators, `var(--color-accent)` for the sage signal, and `var(--color-warm)` for the terracotta signal. Keep `color-mix`, but mix against `transparent`, `var(--color-paper)`, or `var(--color-border)` rather than dark literals.

- [ ] **Step 2: Reduce decorative contrast without changing motion**

Keep animation names, durations, IntersectionObserver behavior, and component markup unchanged. Tune line and glow opacity for paper, for example:

```css
.work-whoami-lines::before { opacity: 0.45; }
.line-sidebar__label,
.skill-orbit__category-label,
.skill-orbit__item-label { color: var(--color-ink-soft); }
```

- [ ] **Step 3: Preserve visible focus states**

Ensure focus outlines use `color-mix(in srgb, var(--color-accent) 72%, transparent)` and remain visible on `var(--color-paper)`.

- [ ] **Step 4: Audit literals**

Run: `rg -n "#080909|#111313|#f3f0e8|#a4aaa5|#2b302f|#8ee6c2|#ff9b76" src/styles/work.css`

Expected: no old dark/neon literals remain in Work CSS.

- [ ] **Step 5: Commit**

Run: `git add src/styles/work.css && git commit -m "style: soften Work visual primitives"`

### Task 3: Validate responsive and cross-page consistency

**Files:**
- Modify: `src/styles/work.css` only if responsive validation finds a regression.

- [ ] **Step 1: Run the complete suite**

Run: `npm test && npm run check && npm run build && git diff --check`

Expected: all tests pass, zero Astro diagnostics, successful build, and no whitespace errors.

- [ ] **Step 2: Verify generated CSS contains Work rules and shared references**

Run: `css_file=$(rg -l --glob '*.css' --fixed-strings 'work-chapter-rail' dist/_astro | head -1); test -n "$css_file"; rg -q --fixed-strings 'var(--color-paper)' src/styles/work.css; rg -q --fixed-strings 'var(--color-accent)' src/styles/work.css`

Expected: all checks exit successfully.

- [ ] **Step 3: Check mobile at 390x844**

Measure `.work-chapter-rail` and `.work-content` on `/work/` with the browser viewport override. Expected rail height below `64px`, no horizontal overflow, warm paper background, and readable shared ink hierarchy.

- [ ] **Step 4: Check desktop at 1440x900**

Measure the same page at desktop width. Expected vertically centered rail, unchanged content width, and no horizontal overflow.

- [ ] **Step 5: Commit only responsive corrections**

If a correction is required, run: `git add src/styles/work.css && git commit -m "fix: preserve Work responsive layout"`

### Task 4: Publish the style alignment

**Files:**
- Publish the approved commits from Tasks 1–3.

- [ ] **Step 1: Review scope**

Run: `git status --short --branch; git log --oneline --decorate -5; git diff origin/main...HEAD --stat`

Expected: only the Work style design/plan documents and `src/styles/work.css` changes are in scope.

- [ ] **Step 2: Push and create a draft PR**

Run: `git push -u origin agent/work-style-alignment` and create a draft PR targeting `main`. The PR body must mention paper token alignment, retained interactions, responsive checks, and the exact verification commands.

- [ ] **Step 3: Merge and monitor Pages**

After marking the PR ready, merge into `main`; monitor `deploy.yml` until successful and verify the public Work route returns HTTP 200.
