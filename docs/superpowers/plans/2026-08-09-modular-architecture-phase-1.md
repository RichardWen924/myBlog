# Modular Architecture Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Isolate homepage chapter navigation from the page composition so future changes to scroll state and keyboard navigation do not require editing the homepage template.

**Architecture:** Create a self-contained `HomeChapterNavigation.astro` feature component that owns the chapter rail markup and its browser-only observer/keyboard behavior. Keep the page responsible only for ordering content; the component discovers the hero and chapter sections through stable data attributes.

**Tech Stack:** Astro 7, browser IntersectionObserver/KeyboardEvent APIs, Node test runner.

---

## File map

- Create `src/components/home/HomeChapterNavigation.astro`: chapter rail markup plus active-state and arrow-key behavior.
- Modify `src/pages/index.astro`: import and render the navigation component; remove its inline rail script and markup.
- Modify `test/home-keyboard-navigation.test.mjs`: assert the behavior lives in the feature component and the page remains composition-only.

### Task 1: Write the failing extraction tests

**Files:**

- Modify: `test/home-keyboard-navigation.test.mjs`

- [ ] **Step 1: Read the component source safely before it exists.**

Add `existsSync` to the fs import and load the future component as an empty string when absent:

```js
const navigationPath = resolve(root, 'src/components/home/HomeChapterNavigation.astro');
const navigation = existsSync(navigationPath) ? readFileSync(navigationPath, 'utf8') : '';
```

- [ ] **Step 2: Move the behavior assertions to the component contract.**

Require the component to own the rail links, chapter observer, arrow-key handling, and scroll behavior:

```js
test('homepage chapter navigation owns keyboard and active-section behavior', () => {
  assert.match(homepage, /HomeChapterNavigation/);
  assert.match(navigation, /data-rail-link/);
  assert.match(navigation, /IntersectionObserver/);
  assert.match(navigation, /addEventListener\(['"]keydown['"]/);
  assert.match(navigation, /ArrowDown/);
  assert.match(navigation, /ArrowUp/);
  assert.match(navigation, /scrollIntoView/);
  assert.match(navigation, /window\.scrollTo/);
  assert.match(navigation, /INPUT|TEXTAREA|SELECT|isContentEditable/);
  assert.doesNotMatch(homepage, /addEventListener\(['"]keydown['"]/);
});
```

- [ ] **Step 3: Run the focused test and verify it fails.**

Run:

```bash
node --test test/home-keyboard-navigation.test.mjs
```

Expected: the existing sticky-header border test passes and the new extraction test fails because the component does not exist and the page still owns the script.

### Task 2: Extract the homepage navigation component

**Files:**

- Create: `src/components/home/HomeChapterNavigation.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create the feature component with the existing rail markup.**

Render the four current chapter links unchanged, preserving `aria-label`, `data-rail-link`, and numeric labels.

- [ ] **Step 2: Move the existing browser behavior into the component script.**

Move the current IntersectionObserver, `setActiveChapter`, `homeSections`, text-control guard, current-section calculation, and ArrowUp/ArrowDown handler without changing selectors, thresholds, scroll behavior, or active-state attributes. Keep the component defensive when no chapters are rendered.

- [ ] **Step 3: Compose the component from `index.astro`.**

Import `HomeChapterNavigation`, render `<HomeChapterNavigation />` where the existing rail markup appears, and delete only the old inline navigation script. Leave all section markup and data loading unchanged.

### Task 3: Verify the isolated feature

**Files:**

- Test: `test/home-keyboard-navigation.test.mjs`
- Test: `test/*.test.mjs`

- [ ] **Step 1: Run the focused test and whitespace check.**

Run:

```bash
node --test test/home-keyboard-navigation.test.mjs
git diff --check
```

Expected: all focused tests pass and no whitespace errors are reported.

- [ ] **Step 2: Run the full suite and static build.**

Run:

```bash
node --test test/*.test.mjs
npm run build
```

Expected: every test passes and Astro builds the existing eight routes.

- [ ] **Step 3: Inspect scope.**

Run:

```bash
git diff --stat
git status --short
```

Expected: only the new feature component, homepage composition, and focused test are changed by this phase. Preserve unrelated user modifications in the main worktree.
