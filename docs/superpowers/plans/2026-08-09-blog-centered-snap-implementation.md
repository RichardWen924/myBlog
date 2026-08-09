# Centered Blog Snap Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/blog` a centered two-chapter page with the homepage's mandatory scroll snap and keyboard page navigation.

**Architecture:** Keep the existing `BlogHero` search controller and archive data flow. Add Blog-specific snap classes to `Base`, wrap the Hero and archive in two viewport-sized chapters, and add a small local chapter rail plus keyboard controller modeled on the homepage. Keep all visual rules in `src/styles/blog.css`.

**Tech Stack:** Astro 7, existing Base layout, CSS scroll snap, browser IntersectionObserver, Node test runner.

---

## File map

- Modify: `src/layouts/Base.astro` — accept an optional `htmlClass` so Blog can opt into its own document snap class without affecting other pages.
- Modify: `src/pages/blog/index.astro` — use `htmlClass="blog-scroll-snap"`, remove the lede through the component update, wrap the Hero/archive in two chapters, and add the chapter rail/keyboard controller.
- Modify: `src/components/blog/BlogHero.astro` — change title to `Welcome, Blog`, remove the lede node, and center the Hero structure.
- Modify: `src/styles/blog.css` — add centered layout, full-height chapter/snap rules, rail styles, and reduced-motion behavior.
- Create: `test/blog-centered-snap.test.mjs` — focused static contracts for title, removed lede, snap, centered alignment, chapter rail, and keyboard navigation.

### Task 1: Add failing behavior contracts

**Files:**

- Create: `test/blog-centered-snap.test.mjs`

- [ ] **Step 1: Write the failing tests**

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');

test('blog uses the welcome title and removes the old lede', () => {
  const hero = read('src/components/blog/BlogHero.astro');
  assert.match(hero, /Welcome, Blog/);
  assert.doesNotMatch(hero, /A quiet index of things I’m learning/);
  assert.match(hero, /blog-hero__inner/);
});

test('blog is composed as two full viewport snap chapters', () => {
  const page = read('src/pages/blog/index.astro');
  const css = read('src/styles/blog.css');
  assert.match(page, /htmlClass="blog-scroll-snap"/);
  assert.match(page, /blog-chapter.*blog-chapter--hero/s);
  assert.match(page, /blog-chapter.*blog-chapter--archive/s);
  assert.match(page, /data-blog-chapter/);
  assert.match(css, /html\.blog-scroll-snap\s*\{[^}]*scroll-snap-type:\s*y mandatory/s);
  assert.match(css, /\.blog-chapter\s*\{[^}]*min-height:\s*calc\(100svh - var\(--site-header-height\)/s);
  assert.match(css, /scroll-snap-stop:\s*always/);
});

test('blog content and rail are centered and keyboard navigation is accessible', () => {
  const page = read('src/pages/blog/index.astro');
  const css = read('src/styles/blog.css');
  assert.match(page, /data-blog-chapter-rail/);
  assert.match(page, /aria-current="step"/);
  assert.match(page, /ArrowDown/);
  assert.match(page, /ArrowUp/);
  assert.match(css, /\.blog-hero__inner\s*\{[^}]*align-items:\s*center/s);
  assert.match(css, /text-align:\s*center/);
  assert.match(css, /\.blog-search\s*\{[^}]*margin-inline:\s*auto/s);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run `node --test test/blog-centered-snap.test.mjs`. It must fail because the current title, lede, layout, and snap contracts are not present.

- [ ] **Step 3: Commit the test-only change**

Run `git add test/blog-centered-snap.test.mjs && git commit -m "test: define centered blog snap contracts"`.

### Task 2: Implement centered two-chapter navigation

**Files:**

- Modify: `src/layouts/Base.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/components/blog/BlogHero.astro`

- [ ] **Step 1: Add the optional HTML class to Base**

Add `htmlClass?: string` to Base props, destructure it with an empty default, and add it to the existing `<html>` class list without changing other pages:

```astro
<html class:list={[htmlClass, { 'home-scroll-snap': scrollSnap }]}>
```

- [ ] **Step 2: Update BlogHero copy**

Replace the current Hero `<h1>` text with `Welcome, Blog` and remove the entire `blog-hero__lede` paragraph. Keep the search form, result list, clear behavior, status, and scroll cue unchanged.

- [ ] **Step 3: Wrap Blog in two chapter sections**

Change the Base usage to `<Base title="Archive" fullBleed htmlClass="blog-scroll-snap">`. Render the Hero in `<section class="blog-chapter blog-chapter--hero" data-blog-chapter="hero">`, and render the existing archive in `<section id="blog-archive" class="blog-chapter blog-chapter--archive" data-blog-chapter="archive">`. Add a two-link rail with `data-blog-chapter-rail`, `data-blog-rail-link="hero|archive"`, and `aria-current="step"` on the active link.

- [ ] **Step 4: Add the homepage-style controller**

Use an IntersectionObserver with the same root margin pattern as the homepage to update `aria-current`. Track `[heroChapter, archiveChapter]` and on ArrowDown/ArrowUp call `scrollTo({ top: 0 })` for Hero or `scrollIntoView({ block: 'start' })` for archive. Ignore events from input, textarea, select, or contenteditable targets, and use `auto` when reduced motion is enabled. Disconnect the observer and remove the keydown listener on `astro:before-swap`.

- [ ] **Step 5: Run focused tests and build**

Run `node --test test/blog-centered-snap.test.mjs test/blog-hero.test.mjs && npm run build`. Expected: all focused tests pass and Astro builds `/blog/index.html`.

- [ ] **Step 6: Commit the implementation**

Run `git add src/layouts/Base.astro src/pages/blog/index.astro src/components/blog/BlogHero.astro src/styles/blog.css test/blog-centered-snap.test.mjs && git commit -m "feat: center and snap blog chapters"`.

### Task 3: Verify and integrate

**Files:**

- Verify: `src/layouts/Base.astro`
- Verify: `src/pages/blog/index.astro`
- Verify: `src/components/blog/BlogHero.astro`
- Verify: `src/styles/blog.css`
- Verify: `test/blog-centered-snap.test.mjs`

- [ ] **Step 1: Run the complete test suite**

Run `node --test test/*.test.mjs` and require zero failures.

- [ ] **Step 2: Run the production build**

Run `npm run build` and require exit code 0 with `/blog/index.html` generated.

- [ ] **Step 3: Check the final diff**

Run `git diff --check`, `git status --short --branch`, and `git diff HEAD~2 --stat`. Confirm only the planned files changed.

