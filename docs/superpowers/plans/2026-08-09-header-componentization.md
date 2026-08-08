# Header Componentization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the shared header's horizontal spacing fluid across viewport sizes and split its navigation responsibilities into focused, reusable Astro components.

**Architecture:** Move public link definitions and pathname matching into `src/data/navigation.ts`. Keep `Header.astro` as the shell/composer and give the brand, desktop links, and mobile disclosure menu separate presentational components receiving the same resolved item list. Use a scoped fluid container class so the header expands on wide screens without changing its height or the page body's reading width.

**Tech Stack:** Astro 7, TypeScript, global CSS, Node test runner.

---

## File map

- Create `src/data/navigation.ts`: canonical navigation labels, hrefs, active-route matching, and resolved item type.
- Create `src/components/global/HeaderBrand.astro`: site title link.
- Create `src/components/global/HeaderLinks.astro`: desktop navigation links and `aria-current` state.
- Create `src/components/global/HeaderMobileMenu.astro`: native mobile disclosure menu and links.
- Modify `src/components/global/Header.astro`: compose the shell and child components; use the responsive inner container.
- Modify `src/styles/global.css`: add the fluid header container rule without changing vertical padding or existing navigation interaction styles.
- Modify `test/header-navigation.test.mjs`: update route/data assertions and add component/container regression assertions.
- Modify `test/information-architecture.test.mjs`: assert public route ownership against the centralized navigation data.

### Task 1: Write failing componentization and spacing tests

**Files:**

- Modify: `test/header-navigation.test.mjs`
- Modify: `test/information-architecture.test.mjs`

- [ ] **Step 1: Update the header test fixture to read the new navigation data and child components.**

Add these fixtures:

```js
const navigation = readFileSync(resolve(root, 'src/data/navigation.ts'), 'utf8');
const headerBrand = readFileSync(resolve(root, 'src/components/global/HeaderBrand.astro'), 'utf8');
const headerLinks = readFileSync(resolve(root, 'src/components/global/HeaderLinks.astro'), 'utf8');
const headerMobileMenu = readFileSync(resolve(root, 'src/components/global/HeaderMobileMenu.astro'), 'utf8');
```

- [ ] **Step 2: Add a failing composition and fluid-spacing test.**

Add:

```js
test('header composes focused components inside a fluid responsive container', () => {
  assert.match(header, /getNavigationItems/);
  assert.match(header, /HeaderBrand/);
  assert.match(header, /HeaderLinks/);
  assert.match(header, /HeaderMobileMenu/);
  assert.match(header, /site-header__inner/);
  assert.match(styles, /\.site-header__inner[\s\S]*width: min\(calc\(100% - clamp\(2rem, 10vw, 10rem\)\), 72rem\)/);
  assert.match(navigation, /export function getNavigationItems/);
  assert.match(headerBrand, /interface Props/);
  assert.match(headerLinks, /aria-current/);
  assert.match(headerMobileMenu, /<details/);
});
```

- [ ] **Step 3: Update information-architecture assertions to inspect centralized navigation data.**

Read `src/data/navigation.ts` in that test and assert it contains the About and Work entries while not defining a Projects top-level entry:

```js
const navigation = readFileSync(resolve(root, 'src/data/navigation.ts'), 'utf8');

assert.match(navigation, /label: 'About', href: '\/about'/);
assert.match(navigation, /label: 'Work', href: '\/work'/);
assert.doesNotMatch(navigation, /label: 'Projects'/);
```

- [ ] **Step 4: Run the focused tests and verify the new contract fails.**

Run:

```bash
node --test test/header-navigation.test.mjs test/information-architecture.test.mjs
```

Expected: the existing tests pass where their old source assumptions still apply, and the new componentization test fails because the data file and child components do not yet exist.

### Task 2: Create navigation data and focused child components

**Files:**

- Create: `src/data/navigation.ts`
- Create: `src/components/global/HeaderBrand.astro`
- Create: `src/components/global/HeaderLinks.astro`
- Create: `src/components/global/HeaderMobileMenu.astro`

- [ ] **Step 1: Create the canonical navigation data module.**

Implement the exact public entries and normalized pathname matching:

```ts
export interface NavigationItem {
  label: string;
  href: string;
  active: boolean;
}

const navigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
] as const;

const normalizePathname = (pathname: string) => {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
};

export const isNavigationItemActive = (pathname: string, href: string) => {
  const currentPath = normalizePathname(pathname);
  if (href === '/') return currentPath === '/';
  if (href === '/work') {
    return currentPath === '/work' || currentPath === '/projects' || currentPath.startsWith('/projects/');
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
};

export function getNavigationItems(pathname: string): NavigationItem[] {
  return navigationLinks.map((item) => ({
    ...item,
    active: isNavigationItemActive(pathname, item.href),
  }));
}
```

- [ ] **Step 2: Create `HeaderBrand.astro` with a typed title prop.**

Render the existing brand anchor unchanged in appearance:

```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<a href="/" class="font-serif text-xl font-bold text-ink no-underline">{title}</a>
```

- [ ] **Step 3: Create `HeaderLinks.astro` as a presentational desktop list.**

Accept `NavigationItem[]`, render the existing desktop wrapper, and preserve `site-header__link`, `is-active`, and `aria-current` behavior. Do not import or recompute pathname state in this component.

- [ ] **Step 4: Create `HeaderMobileMenu.astro` as a presentational disclosure.**

Accept the same `NavigationItem[]`, render the existing `details`/`summary` structure and the same anchor attributes, and keep the existing `site-header__mobile`, `site-header__menu`, and `site-header__mobile-panel` class names.

### Task 3: Recompose the header and apply fluid horizontal spacing

**Files:**

- Modify: `src/components/global/Header.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Reduce `Header.astro` to shell composition.**

Import `SITE_TITLE`, `getNavigationItems`, `HeaderBrand`, `HeaderLinks`, and `HeaderMobileMenu`. Resolve `const navItems = getNavigationItems(Astro.url.pathname);` and render:

```astro
<header class="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur-sm">
  <nav class="site-header__inner relative flex items-center justify-between py-4" aria-label="Primary navigation">
    <HeaderBrand title={SITE_TITLE} />
    <HeaderLinks items={navItems} />
    <HeaderMobileMenu items={navItems} />
  </nav>
</header>
```

- [ ] **Step 2: Add the responsive inner-container rule.**

Add this scoped rule near the existing header styles, preserving the current vertical padding supplied by `py-4`:

```css
.site-header__inner {
  width: min(calc(100% - clamp(2rem, 10vw, 10rem)), 72rem);
  margin-inline: auto;
}
```

At narrow widths this keeps at least `1rem` on each side; on wide screens it grows until the 72rem cap. Do not change `main` width utilities or hero sizing rules.

- [ ] **Step 3: Run focused tests and whitespace checks.**

Run:

```bash
node --test test/header-navigation.test.mjs test/information-architecture.test.mjs
git diff --check
```

Expected: all focused tests pass and no whitespace errors are reported.

### Task 4: Run complete verification and inspect scope

**Files:**

- Test: `test/*.test.mjs`

- [ ] **Step 1: Run the full Node test suite.**

Run:

```bash
node --test test/*.test.mjs
```

Expected: all tests pass, including sticky-header, active-route, mobile-menu, and information-architecture coverage.

- [ ] **Step 2: Build the static site.**

Run:

```bash
npm run build
```

Expected: Astro completes successfully and renders the existing eight routes.

- [ ] **Step 3: Verify scope and inspect the final diff.**

Run:

```bash
git diff --check
git diff --stat
git status --short
```

Expected: only the navigation data/component/style/test files and the implementation plan are changed. The design specification remains unchanged.

- [ ] **Step 4: Report exact verification results.**

Report the test count, build result, and the final files changed. If no local TypeScript executable exists, rely on Astro's generated types/build and state that no standalone `tsc` pass was claimed.
