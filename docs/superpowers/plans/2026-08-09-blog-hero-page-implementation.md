# Blog Hero Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/blog` into a default-style editorial Hero with live search, a three-post recent list, a scroll cue, and the existing full year archive below it.

**Architecture:** Keep `getPublishedPosts()` as the single server-side data source. Add one focused Astro component that receives normalized post data, renders the initial three-post state, and owns a small inline client controller for matching all published posts. Add blog-only CSS through the existing global stylesheet entry, then compose the Hero and unchanged `YearGroup` archive in `src/pages/blog/index.astro`.

**Tech Stack:** Astro 7, Astro content collections, TypeScript-in-Astro, Tailwind 4 utility classes where already used, CSS custom properties from the existing design system, Node test runner.

---

## File map

- Create: `src/components/blog/BlogHero.astro` — server-rendered Hero markup, serialized search payload, and client-side query behavior.
- Create: `src/styles/blog.css` — scoped blog Hero/result/archive spacing and responsive styles using existing tokens.
- Modify: `src/pages/blog/index.astro` — normalize published posts, render `BlogHero`, and wrap the existing grouped archive with the scroll target.
- Modify: `src/styles/global.css` — import `blog.css` alongside the existing feature styles.
- Create: `test/blog-hero.test.mjs` — static contract tests for structure, three-post default, search payload, accessibility, and archive preservation.

The unrelated existing modifications in `src/components/react/SkillsOrbit.tsx`, `src/styles/global.css`, and `test/about-skills.test.mjs` must be preserved. When editing `src/styles/global.css`, only add the new `@import './blog.css';` line near the other feature imports.

### Task 1: Add failing blog Hero contract tests

**Files:**

- Create: `test/blog-hero.test.mjs`
- Read: `src/pages/blog/index.astro`, `src/components/blog/BlogHero.astro`, `src/styles/blog.css`

- [ ] **Step 1: Write the failing tests**

Create tests that read the page/component/style sources and assert the public contracts:

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');

test('blog page composes the Hero above the existing year archive', () => {
  const page = read('src/pages/blog/index.astro');
  assert.match(page, /BlogHero/);
  assert.match(page, /id="blog-archive"/);
  assert.match(page, /yearGroups/);
  assert.match(page, /YearGroup/);
});

test('blog Hero exposes welcome, search, results, clear, and scroll contracts', () => {
  assert.equal(existsSync(resolve(root, 'src/components/blog/BlogHero.astro')), true);
  const hero = read('src/components/blog/BlogHero.astro');
  assert.match(hero, /WELCOME, BLOG/);
  assert.match(hero, /role="search"/);
  assert.match(hero, /aria-controls="blog-results"/);
  assert.match(hero, /aria-live="polite"/);
  assert.match(hero, /data-blog-clear/);
  assert.match(hero, /href="#blog-archive"/);
});

test('blog Hero defaults to three recent posts and can search all posts', () => {
  const hero = read('src/components/blog/BlogHero.astro');
  assert.match(hero, /posts\.slice\(0, 3\)/);
  assert.match(hero, /data-blog-posts/);
  assert.match(hero, /title.*description.*tags/s);
  assert.match(hero, /toLowerCase\(\)/);
  assert.match(hero, /No matching posts/);
});

test('blog styles use the default visual tokens and mobile layout', () => {
  const styles = read('src/styles/blog.css');
  assert.match(styles, /--color-paper/);
  assert.match(styles, /--font-serif/);
  assert.match(styles, /--font-mono/);
  assert.match(styles, /@media \(max-width: 767px\)/);
  assert.match(styles, /prefers-reduced-motion/);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
node --test test/blog-hero.test.mjs
```

Expected: FAIL because the new component/style/test contracts do not exist yet.

- [ ] **Step 3: Commit the test-only change**

```bash
git add test/blog-hero.test.mjs
git commit -m "test: define blog hero contracts"
```

### Task 2: Implement the BlogHero component and styles

**Files:**

- Create: `src/components/blog/BlogHero.astro`
- Create: `src/styles/blog.css`

- [ ] **Step 1: Add the server-rendered Hero markup**

Define a `BlogPostSummary` type with `id`, `title`, `description`, `date`, and `tags`. Accept `posts` and `recentPosts` props. Render:

```astro
<section class="blog-hero" aria-labelledby="blog-hero-title">
  <div class="page-shell blog-hero__inner">
    <p class="micro-label blog-hero__eyebrow">WELCOME, BLOG</p>
    <h1 id="blog-hero-title" class="blog-hero__title">Notes from the archive.</h1>
    <p class="blog-hero__lede">A quiet index of things I’m learning, making, and keeping.</p>

    <form class="blog-search" role="search" data-blog-search>
      <label class="sr-only" for="blog-search-input">Search articles</label>
      <span class="blog-search__icon" aria-hidden="true">⌕</span>
      <input id="blog-search-input" name="q" type="search" placeholder="Search the archive" autocomplete="off" aria-controls="blog-results" />
      <button type="button" class="blog-search__clear" data-blog-clear aria-label="Clear search" hidden>×</button>
    </form>

    <div class="blog-results" id="blog-results">
      <div class="blog-results__status" data-blog-status aria-live="polite"></div>
      <ul class="blog-results__list" data-blog-list>
        {recentPosts.map((post) => (
          <li class="blog-results__item">
            <a class="blog-results__link" href={`/blog/${post.id}`}>
              <span class="blog-results__copy">
                <span class="blog-results__title">{post.title}</span>
                <span class="blog-results__description">{post.description}</span>
              </span>
              <time class="blog-results__date" datetime={post.date.toISOString()}>
                {formatDate(post.date)}
              </time>
            </a>
          </li>
        ))}
      </ul>
    </div>

    <a class="blog-scroll-cue" href="#blog-archive">Scroll to archive <span aria-hidden="true">↓</span></a>
  </div>
</section>
```

Use actual links to `/blog/${post.id}`, `formatDate(post.date)`, and `datetime={post.date.toISOString()}`. Keep the decorative search glyph and arrows aria-hidden so the form and links remain understandable without them.

- [ ] **Step 2: Add the client-side search controller**

Serialize the complete normalized post list with an Astro `define:vars` script marked `data-blog-posts`. The controller must:

```js
const initialPosts = posts.slice(0, 3);
const searchable = [post.title, post.description, ...post.tags].join(' ').toLowerCase();
const matches = posts.filter((post) => searchable.includes(query));
```

On input, trim and lowercase the query. Render all matches when the query is non-empty, otherwise render `initialPosts`. Update the status text to `Showing the 3 latest posts`, `N matching posts`, or `No matching posts`. Toggle the clear button's `hidden` property and return focus to the input after clearing. Render links with DOM APIs and `textContent`, not `innerHTML`, so article metadata cannot become markup.

Keep the controller no-op safe if the expected data attributes are absent, and do not intercept normal article link navigation.

- [ ] **Step 3: Add blog-only responsive styles**

Create a style sheet that uses the existing tokens:

```css
.blog-hero {
  min-height: calc(100svh - var(--site-header-height));
  padding-block: clamp(4rem, 10vh, 8rem) clamp(3rem, 8vh, 6rem);
  background: var(--color-paper);
}

.blog-hero__title {
  max-width: 11ch;
  margin: 1rem 0 0;
  color: var(--color-ink);
  font-family: var(--font-serif);
  font-size: clamp(3.5rem, 9vw, 7.5rem);
  letter-spacing: -0.06em;
  line-height: 0.92;
}

.blog-search {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: clamp(2.5rem, 7vh, 5rem);
  padding: 0.8rem 1.15rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
}

.blog-search:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 16%, transparent);
}

.blog-results__list {
  margin-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.blog-results__item {
  border-bottom: 1px solid var(--color-border);
}

@media (max-width: 767px) {
  .blog-hero__title { font-size: clamp(3rem, 16vw, 5rem); }
  .blog-results__link { align-items: flex-start; flex-direction: column; gap: 0.4rem; }
}

@media (prefers-reduced-motion: reduce) {
  .blog-hero *, .blog-hero *::before, .blog-hero *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Use spacious desktop sizing, a single-column mobile layout under `767px`, visible focus styles, and a reduced-motion block that removes the scroll-cue animation and Hero reveal. Do not add new colors, gradients, image placeholders, or external assets.

- [ ] **Step 4: Run the focused tests to verify the component passes**

Run:

```bash
node --test test/blog-hero.test.mjs
```

Expected: PASS for all blog Hero contracts.

- [ ] **Step 5: Commit the component and styles**

```bash
git add src/components/blog/BlogHero.astro src/styles/blog.css test/blog-hero.test.mjs
git commit -m "feat: add searchable blog hero"
```

### Task 3: Compose the Hero with the existing archive

**Files:**

- Modify: `src/pages/blog/index.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Normalize and pass article data**

Keep the existing `getPublishedPosts()` and `groupByYear(posts)` calls. Pass the full posts to `BlogHero` in a serializable shape and pass `posts.slice(0, 3)` as `recentPosts`. Use the existing post ID route shape:

```astro
const summaries = posts.map((post) => ({
  id: post.id,
  title: post.data.title,
  description: post.data.description,
  date: post.data.date,
  tags: post.data.tags,
}));
const yearGroups = groupByYear(posts);
```

Render `<BlogHero posts={summaries} recentPosts={summaries.slice(0, 3)} />`, then render the archive in a section with `id="blog-archive"` and an accessible heading. Preserve the current empty-state branch exactly for the archive.

- [ ] **Step 2: Import the new feature stylesheet**

Add only this line to the feature imports in `src/styles/global.css`:

```css
@import './blog.css';
```

- [ ] **Step 3: Run the focused tests and production build**

Run:

```bash
node --test test/blog-hero.test.mjs test/information-architecture.test.mjs
npm run build
```

Expected: all selected tests pass and Astro completes the production build without content-route errors.

- [ ] **Step 4: Start the local server in the repository's required background mode**

Run:

```bash
astro dev --background
astro dev status
```

Use the server logs/status to confirm the app is serving before manually checking `/blog`. Stop it with `astro dev stop` when verification is complete unless the user wants it left running.

- [ ] **Step 5: Commit the page composition**

```bash
git add src/pages/blog/index.astro src/styles/global.css
git commit -m "feat: compose blog archive landing page"
```

### Task 4: Full verification and handoff

**Files:**

- Verify: `src/components/blog/BlogHero.astro`
- Verify: `src/styles/blog.css`
- Verify: `src/pages/blog/index.astro`
- Verify: `test/blog-hero.test.mjs`

- [ ] **Step 1: Run the complete project test suite**

Run:

```bash
node --test test/*.test.mjs
```

Expected: all existing and new tests pass. If an existing test fails because of an unrelated pre-existing change, report the exact test and preserve that unrelated work.

- [ ] **Step 2: Run the final production build**

Run:

```bash
npm run build
```

Expected: build exits 0 and generates `/blog/index.html` plus all published article routes.

- [ ] **Step 3: Review the final diff and working tree**

Run:

```bash
git diff HEAD~3 -- src/pages/blog/index.astro src/components/blog/BlogHero.astro src/styles/blog.css src/styles/global.css test/blog-hero.test.mjs
git status --short
```

Confirm no unrelated files were staged or changed by this work, and that the pre-existing modifications remain untouched.

- [ ] **Step 4: Report verification evidence**

Hand off the exact test/build commands and results, the changed files, the default three-post behavior, and the search behavior. Do not claim completion without fresh passing command output.
