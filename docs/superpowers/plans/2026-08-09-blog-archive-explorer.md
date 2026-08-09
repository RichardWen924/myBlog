# Blog Archive Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a paged Archive and an AnimatedList-inspired quick-browse mode to `/blog` while preserving static content generation and existing chapter navigation.

**Architecture:** Keep content loading in `src/pages/blog/index.astro` and hydrate one `BlogArchiveExplorer` React island with serializable post summaries. The island owns mode, page, URL history, and accessibility state; `ArchivePostRow` is shared by paged and quick modes, while `AnimatedArchiveList` owns the bounded animated scroller.

**Tech Stack:** Astro 7, React 19, TypeScript, existing `framer-motion`, CSS custom properties from `src/styles/blog.css`, static output.

---

### Task 1: Define the serialized Archive model and pure pagination helpers

**Files:**
- Create: `src/components/react/blogArchive.ts`
- Test/verify: `npm run build`

- [ ] **Step 1: Add the model and deterministic helpers before UI code**

Define `ArchivePost`, `PAGE_SIZE = 5`, `getPageCount`, `clampPage`, `getPagePosts`, and `groupPostsByYear`. The helpers must accept ISO date strings and never mutate the input array. `clampPage` returns `1` when the total is empty or the requested page is invalid.

- [ ] **Step 2: Verify the helpers compile through the existing Astro build**

Run: `npm run build`

Expected: the build reaches type checking/bundling without a missing export or TypeScript error.

- [ ] **Step 3: Commit the model/helpers**

```bash
git add src/components/react/blogArchive.ts
git commit -m "feat(blog): add archive pagination model"
```

### Task 2: Extract the shared article row

**Files:**
- Create: `src/components/react/ArchivePostRow.tsx`
- Modify: `src/styles/blog.css`

- [ ] **Step 1: Implement a link-first row component**

Accept an `ArchivePost`, optional `selected` state, and optional `compact` state. Render the existing archive row class names (`blog-archive-row`, `blog-archive-row__link`, `blog-archive-row__main`, `blog-archive-row__title`, `blog-archive-row__tags`, `blog-archive-row__date`, and `blog-archive-row__media`) so the current visual language is reused. The entire row must link to `/blog/${post.id}`; tags and dates must remain text content, not click targets.

- [ ] **Step 2: Add only scoped styles required by the React row**

Extend `src/styles/blog.css` for selected/compact states and focus styling. Keep the existing Astro `YearGroup` selectors intact until the page integration is complete. Add a mobile rule that keeps metadata readable and prevents horizontal overflow.

- [ ] **Step 3: Build-check the isolated component**

Run: `npm run build`

Expected: PASS; no JSX, CSS, or TypeScript errors.

### Task 3: Port the AnimatedList reference into a bounded article scroller

**Files:**
- Create: `src/components/react/AnimatedArchiveList.tsx`
- Modify: `src/styles/blog.css`

- [ ] **Step 1: Implement the failing interaction contract**

Implement props `{ posts, onItemSelect, displayScrollbar, showGradients, enableArrowNavigation }` and internal state for selected index, keyboard navigation, and top/bottom gradient opacity. Use `motion.div` and `useInView` from `framer-motion`, not a new dependency. Each item must render `ArchivePostRow` and invoke `onItemSelect` only for an intentional click/Enter activation.

- [ ] **Step 2: Scope keyboard navigation to the list**

Use a focusable list container with `tabIndex={0}`. Handle ArrowUp/ArrowDown and Tab only while focus is inside that container; keep the selected item visible with `scrollIntoView`/`scrollTo`. Do not attach a global keydown listener, so the existing blog chapter handler continues to own page-level arrows.

- [ ] **Step 3: Add bounded scrolling and gradient styles**

Add a fixed-height responsive `.blog-quick-list` frame, overflow-y scrolling, custom scrollbar styling, top/bottom gradient overlays, reduced-motion overrides, and a no-scrollbar variant. Use existing paper/surface/border/ink variables rather than hard-coded dark React Bits colors.

- [ ] **Step 4: Build-check the scroller**

Run: `npm run build`

Expected: PASS with the React island bundle included.

### Task 4: Build the Archive Explorer state machine

**Files:**
- Create: `src/components/react/BlogArchiveExplorer.tsx`
- Modify: `src/styles/blog.css`

- [ ] **Step 1: Render the confirmed Archive structure**

Accept `posts: ArchivePost[]`. Render an accessible heading row with `Archive`, a labelled checkbox/switch, and an `aria-live` status. In paged mode render the current page grouped by year, using `ArchivePostRow` and Previous/Next/page buttons. In quick mode render `AnimatedArchiveList` with all posts.

- [ ] **Step 2: Implement URL and history behavior**

Initialize page from `new URLSearchParams(window.location.search)`, clamp it against `getPageCount`, and keep a valid `?page=N` in sync using `history.pushState`. Listen for `popstate` and clean up listeners on unmount. Toggling quick mode changes only local React state; it must not add a mode query parameter.

- [ ] **Step 3: Implement accessible controls and edge states**

Hide pagination controls when there is one page, disable Previous/Next at boundaries, set `aria-current="page"` on the active page, and render “No posts yet.” with the switch/pagination hidden when `posts.length === 0`. Add focus-visible styles and reduced-motion behavior.

- [ ] **Step 4: Add responsive styles**

Keep the switch beside the heading on desktop; allow the heading row to wrap on narrow screens. Ensure the quick list fits inside the Archive chapter without changing the chapter rail or scroll-snap rules.

- [ ] **Step 5: Build-check the complete island**

Run: `npm run build`

Expected: PASS with no hydration warnings introduced by the component.

### Task 5: Replace the Astro YearGroup rendering with the island

**Files:**
- Modify: `src/pages/blog/index.astro`
- Modify: `src/styles/blog.css` (only if obsolete Archive selectors are now unused)

- [ ] **Step 1: Pass serializable post data from Astro**

Remove the direct `YearGroup` render from the Archive section and import `BlogArchiveExplorer`. Map each published post to `ArchivePost` with ISO date and numeric year, then render `<BlogArchiveExplorer client:load posts={archivePosts} />`. Keep `BlogHero`, the chapter IDs, the chapter rail, IntersectionObserver, and page-level ArrowUp/ArrowDown handler unchanged.

- [ ] **Step 2: Remove only dead imports and data calculations**

Remove `YearGroup` and `groupByYear` imports/variables if no longer referenced. Do not remove `getPublishedPosts`, chapter navigation, or the existing `blog-archive` wrapper.

- [ ] **Step 3: Build and inspect the generated page**

Run: `npm run build`

Expected: PASS; `/blog/index.html` contains the Archive heading, initial paged markup, and the island client script.

### Task 6: Verify interaction, responsive behavior, and regression safety

**Files:**
- Verify: `/blog`, `src/pages/blog/index.astro`, `src/components/react/BlogArchiveExplorer.tsx`

- [ ] **Step 1: Start the project in the required background mode**

Run: `astro dev --background`

Expected: the dev server reports a local URL. Use `astro dev status` and `astro dev logs` if needed.

- [ ] **Step 2: Exercise the acceptance matrix**

Verify default pagination, five-item page boundaries, Previous/Next/page buttons, direct `?page=2`, browser back/forward, switch toggling, bounded wheel/touch scrolling, ArrowUp/ArrowDown/Tab/Enter within the list, article links, empty-state rendering, mobile wrapping, and `prefers-reduced-motion`.

- [ ] **Step 3: Run the final production build**

Run: `npm run build`

Expected: PASS with no console errors or hydration mismatch warnings during manual inspection.

- [ ] **Step 4: Commit the integrated implementation**

```bash
git add src/pages/blog/index.astro src/components/react src/styles/blog.css
git commit -m "feat(blog): add paged and quick archive browsing"
```
