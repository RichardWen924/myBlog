# Responsive Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the shared site navigation with route-aware active states, keyboard-visible focus states, and a native mobile disclosure menu while preserving the current visual language and page layout.

**Architecture:** Keep navigation data and pathname matching in `Header.astro`, render the desktop links and mobile `details` menu from the same item list, and isolate all new visual behavior under `site-header__*` styles in `global.css`. Use source-level Node tests because this static Astro project has no browser test harness.

**Tech Stack:** Astro 7, Astro template expressions, Tailwind utility classes, global CSS, Node test runner.

---

## File map

- Modify `src/components/global/Header.astro`: derive the active top-level route from `Astro.url.pathname`; render labeled desktop and mobile navigation using one shared item list.
- Modify `src/styles/global.css`: add scoped header link, active marker, disclosure panel, and focus styles; keep existing design tokens unchanged.
- Modify `test/header-navigation.test.mjs`: add regression assertions for route matching, `aria-current`, native disclosure markup, mobile hit areas, and focus affordances.
- Create `docs/superpowers/plans/2026-08-09-responsive-navigation.md`: this implementation plan only; it is not part of the runtime bundle.

### Task 1: Write the failing navigation contract tests

**Files:**

- Modify: `test/header-navigation.test.mjs`

- [ ] **Step 1: Extend the test fixture to read global styles.**

Add:

```js
const styles = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
```

- [ ] **Step 2: Add assertions for route-aware and accessible markup.**

Add a test that requires the header source to contain the pathname source, a shared navigation item list, an explicit primary-nav label, `aria-current`, and native `details`/`summary` mobile controls:

```js
test('navigation exposes active routes and a native mobile menu', () => {
  assert.match(header, /Astro\.url\.pathname/);
  assert.match(header, /const navItems/);
  assert.match(header, /aria-label="Primary navigation"/);
  assert.match(header, /aria-current=/);
  assert.match(header, /<details[^>]+site-header__mobile/);
  assert.match(header, /<summary[^>]+site-header__menu/);
});
```

- [ ] **Step 3: Add assertions for route coverage and interaction styling.**

Add a test requiring the route matcher to distinguish the home path and cover Work, project detail routes, Blog, and About, plus a visible focus selector and a mobile menu hit area:

```js
test('navigation covers top-level and nested routes with visible focus affordances', () => {
  assert.match(header, /pathname === '\/'/);
  assert.match(header, /\/projects/);
  assert.match(header, /\/blog/);
  assert.match(header, /\/about/);
  assert.match(styles, /\.site-header__link:focus-visible/);
  assert.match(styles, /\.site-header__menu[^\{]*\{[\s\S]*min-height: 2\.75rem/);
});
```

- [ ] **Step 4: Run the focused tests and verify they fail for missing behavior.**

Run:

```bash
node --test test/header-navigation.test.mjs
```

Expected: the existing sticky-header test passes and the two new tests fail because the current header has no route state, disclosure menu, or scoped interaction styles.

### Task 2: Implement route-aware shared header markup

**Files:**

- Modify: `src/components/global/Header.astro`

- [ ] **Step 1: Add pathname matching in the frontmatter.**

Define one `navItems` array and one `isActive` function. Match `/` exactly; match `/work`, `/projects`, and nested project routes to Work; match `/blog` and nested posts to Blog; match `/about` and nested About routes to About:

```astro
const pathname = Astro.url.pathname;
const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

const isActive = (href: string) => {
  if (href === '/') return pathname === '/';
  if (href === '/work') {
    return pathname === '/work' || pathname === '/projects' || pathname.startsWith('/projects/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};
```

- [ ] **Step 2: Render desktop links from `navItems`.**

Keep the existing brand and sticky header classes, add an explicit `aria-label="Primary navigation"` to the main nav, and render the desktop links with `aria-current={item.active ? 'page' : undefined}` and a scoped `site-header__link` class. Add `active: isActive(item.href)` to each item before rendering so both menus use identical state.

- [ ] **Step 3: Render the mobile disclosure menu from the same items.**

Add a `details` element hidden at the desktop breakpoint, with a `summary` labeled `Menu`, and render the same links in a vertical panel. Use real anchors and the same `aria-current` behavior; do not add client-side JavaScript or scroll locking.

### Task 3: Add scoped visual and responsive styles

**Files:**

- Modify: `src/styles/global.css`

- [ ] **Step 1: Add base link and active-marker styles.**

Create scoped `.site-header__link` rules using the existing ink/accent/border tokens. Keep the marker collapsed by default and reveal it for hover, focus-visible, and active states. Add a `:focus-visible` outline with enough contrast and no layout shift.

- [ ] **Step 2: Add the mobile summary and panel styles.**

Style `.site-header__menu` with a minimum 2.75rem hit area, hide the default disclosure marker, and make the open state visually clear. Position `.site-header__mobile-panel` below the nav with the paper background, border, and a subtle shadow; stack links with at least 2.75rem vertical hit areas.

- [ ] **Step 3: Add responsive visibility rules and reduced-motion fallback.**

Keep desktop links visible from the medium breakpoint upward and the disclosure control visible below it. Limit transitions to color, opacity, and `transform`; inside the existing reduced-motion media query, remove transition durations for the new header selectors.

- [ ] **Step 4: Run the focused tests and inspect the diff.**

Run:

```bash
node --test test/header-navigation.test.mjs
git diff --check
```

Expected: all header tests pass and the diff contains only the shared header, header styles, and header tests.

### Task 4: Run project verification

**Files:**

- Test: `test/*.test.mjs`

- [ ] **Step 1: Run the complete Node test suite.**

Run:

```bash
node --test test/*.test.mjs
```

Expected: all existing tests and the new navigation tests pass.

- [ ] **Step 2: Build the production site.**

Run:

```bash
npm run build
```

Expected: Astro completes the static build without errors and produces the existing routes.

- [ ] **Step 3: Verify whitespace and scope.**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only the intended header files and the plan/design documentation are modified or untracked. Do not stage the earlier homepage fix unless it was already staged by the user.

- [ ] **Step 4: Report verification results and any environment limitation.**

Report exact test and build results. If a local TypeScript executable is absent, do not claim a type-check pass; note that the Astro production build is the available compile-time verification.
