# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the Astro site at `https://richardwen924.github.io/myBlog/` through an automatic GitHub Pages workflow.

**Architecture:** Astro will build a static project site with the GitHub origin in `site` and `/myBlog` in `base`. A small tested URL helper will prefix internal root-relative links and public assets, while the official GitHub Pages actions will build and deploy `dist/` on every `main` push.

**Tech Stack:** Astro 7, TypeScript, Node test runner, GitHub Actions, GitHub Pages

---

## File map

- Create `src/lib/sitePath.ts`: one base-path URL helper shared by Astro and React components.
- Create `src/lib/sitePath.test.ts`: unit coverage for root, nested, already-prefixed, fragment, and external URLs.
- Modify `astro.config.mjs`: configure the GitHub Pages origin and project base.
- Modify `src/lib/constants.ts`: replace the placeholder production URL with the final Pages URL.
- Modify `src/data/navigation.ts` and `src/lib/navigation.test.ts`: emit base-prefixed links while matching active routes against logical paths.
- Modify internal-link and public-asset consumers under `src/components`, `src/features`, `src/layouts`, and `src/pages`: apply the shared helper at rendering boundaries.
- Create `.github/workflows/deploy.yml`: build and deploy the static artifact.

### Task 1: Add a tested project-base URL helper

**Files:**
- Create: `src/lib/sitePath.ts`
- Create: `src/lib/sitePath.test.ts`

- [ ] **Step 1: Write the failing helper tests**

```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { withBasePath } from './sitePath.ts';

describe('withBasePath', () => {
  it('prefixes root and nested site paths', () => {
    assert.equal(withBasePath('/', '/myBlog/'), '/myBlog/');
    assert.equal(withBasePath('/blog/post', '/myBlog/'), '/myBlog/blog/post');
  });

  it('does not prefix a path twice', () => {
    assert.equal(withBasePath('/myBlog/blog', '/myBlog/'), '/myBlog/blog');
  });

  it('preserves fragments and non-site URLs', () => {
    assert.equal(withBasePath('#intro', '/myBlog/'), '#intro');
    assert.equal(withBasePath('mailto:hello@example.com', '/myBlog/'), 'mailto:hello@example.com');
    assert.equal(withBasePath('https://example.com', '/myBlog/'), 'https://example.com');
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing-module failure**

Run: `node --test src/lib/sitePath.test.ts`

Expected: FAIL because `src/lib/sitePath.ts` does not exist.

- [ ] **Step 3: Implement the helper**

```ts
const NON_SITE_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

export function withBasePath(path: string, base = import.meta.env.BASE_URL): string {
  if (!path.startsWith('/') || NON_SITE_URL.test(path)) return path;

  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}`;
  if (normalizedBase === '/') return path;
  if (path === normalizedBase || path.startsWith(`${normalizedBase}/`)) return path;
  if (path === '/') return `${normalizedBase}/`;
  return `${normalizedBase}${path}`;
}
```

- [ ] **Step 4: Run the focused and complete unit tests**

Run: `node --test src/lib/sitePath.test.ts && npm test`

Expected: all tests pass.

### Task 2: Configure Astro and base-aware navigation

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/lib/constants.ts`
- Modify: `src/data/navigation.ts`
- Modify: `src/lib/navigation.test.ts`

- [ ] **Step 1: Add a failing navigation test for the project base**

Append this case to `src/lib/navigation.test.ts`:

```ts
it('prefixes links and matches routes under the configured base', () => {
  const items = getNavigationItems('/myBlog/projects/my-blog', '/myBlog/');
  assert.deepEqual(items.map((item) => item.href), [
    '/myBlog/',
    '/myBlog/work',
    '/myBlog/blog',
    '/myBlog/about',
  ]);
  assert.equal(items.find((item) => item.label === 'Work')?.active, true);
});
```

- [ ] **Step 2: Run the navigation test and confirm failure**

Run: `node --test src/lib/navigation.test.ts`

Expected: FAIL because `getNavigationItems` does not accept or apply a base path.

- [ ] **Step 3: Configure the final origin and project base**

Set `astro.config.mjs` to include:

```js
export default defineConfig({
  site: 'https://richardwen924.github.io',
  base: '/myBlog',
  output: 'static',
  // existing integrations, Vite plugins, and Markdown settings stay unchanged
});
```

Set the public URL in `src/lib/constants.ts`:

```ts
export const SITE_URL = 'https://richardwen924.github.io/myBlog/';
```

- [ ] **Step 4: Make navigation base-aware**

Import `withBasePath` into `src/data/navigation.ts`, strip the configured base before active-route comparison, and apply the base to emitted links:

```ts
export function getNavigationItems(
  pathname: string,
  base = import.meta.env.BASE_URL,
): NavigationItem[] {
  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}`;
  const logicalPath = normalizedBase === '/'
    ? pathname
    : pathname.replace(new RegExp(`^${normalizedBase}(?=/|$)`), '') || '/';

  return navigationLinks.map((item) => ({
    ...item,
    href: withBasePath(item.href, base),
    active: isNavigationItemActive(logicalPath, item.href),
  }));
}
```

- [ ] **Step 5: Run navigation tests**

Run: `node --test src/lib/navigation.test.ts`

Expected: all navigation tests pass.

### Task 3: Prefix internal links and public assets

**Files:**
- Modify: `src/components/site/HeaderBrand.astro`
- Modify: `src/components/site/Footer.astro`
- Modify: `src/components/ui/ArchiveLink.astro`
- Modify: `src/components/ui/BackLink.astro`
- Modify: `src/features/about/components/HeroReactive.tsx`
- Modify: `src/features/blog/components/ArchivePostRow.tsx`
- Modify: `src/features/blog/components/BlogHero.astro`
- Modify: `src/features/home/components/HomeHeroCanvas.astro`
- Modify: `src/features/projects/components/ProjectCard.tsx`
- Modify: `src/layouts/Base.astro`
- Modify: `src/pages/404.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/rss.xml.js`
- Modify: `src/pages/work.astro`

- [ ] **Step 1: Route generic component props through the helper**

For `ArchiveLink.astro` and `BackLink.astro`, import `withBasePath` and render `href={withBasePath(href)}`. For `HeaderBrand.astro` and `Footer.astro`, use `withBasePath('/')` and `withBasePath('/rss.xml')` respectively. External, email, and fragment values remain unchanged because the helper preserves them.

- [ ] **Step 2: Prefix generated feature links**

Import `withBasePath` and apply it at each internal-link boundary:

```tsx
href={withBasePath(`/projects/${project.id}`)}
href={withBasePath(`/blog/${post.id}`)}
```

Use the same helper for the About prompt links and `/hero-thinking-orbit.png`, and for the Home hero's current blog link.

- [ ] **Step 3: Prefix page links and public images**

In `src/pages/index.astro`, apply `withBasePath` to the three `/section-*.png` image paths. Generic `ArchiveLink` handles its internal links. In `src/pages/work.astro` and `src/pages/404.astro`, apply the helper directly to hard-coded anchors.

- [ ] **Step 4: Correct document metadata and RSS URLs**

In `src/layouts/Base.astro`, use:

```astro
href={new URL(withBasePath('/rss.xml'), Astro.site)}
href={withBasePath('/favicon.svg')}
```

In `src/pages/rss.xml.js`, generate item links with:

```js
link: withBasePath(`/blog/${post.id}`),
```

- [ ] **Step 5: Scan for missed root-relative site URLs**

Run:

```bash
rg -n '(href|src)=\{?[`"'"']/((about|blog|projects|work)(/|[`"'"'])|favicon\.svg|hero-|section-)' src
```

Expected: no unwrapped internal root-relative URL matches. Fragment links, external URLs, and test fixtures may remain.

- [ ] **Step 6: Run all unit tests and Astro checks**

Run: `npm test && npm run check`

Expected: all unit tests pass and Astro reports zero errors.

### Task 4: Add the GitHub Pages deployment workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add the official Pages workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Validate YAML shape and production build**

Run:

```bash
npx --yes prettier@3.8.1 --check .github/workflows/deploy.yml
npm run build
```

Expected: Prettier accepts the workflow and Astro finishes with the generated site in `dist/`.

- [ ] **Step 3: Inspect the built output for the project base**

Run:

```bash
rg -n 'href="/(about|blog|projects|work)|src="/(favicon\.svg|hero-|section-)' dist
rg -n '/myBlog/' dist/index.html dist/about/index.html dist/work/index.html
```

Expected: the first command finds no broken root-relative site URLs; the second finds project-prefixed links and assets.

### Task 5: Publish and verify GitHub Pages

**Files:**
- Commit all user-approved working-tree changes plus Tasks 1-4.

- [ ] **Step 1: Run the final local verification suite**

Run: `npm test && npm run check && npm run build && git diff --check`

Expected: every command exits successfully.

- [ ] **Step 2: Review and commit the approved release scope**

Run:

```bash
git status --short
git diff --stat
git add -A
git commit -m "feat: deploy site to GitHub Pages"
```

Expected: the commit includes the previously approved current site changes and the Pages deployment implementation.

- [ ] **Step 3: Push the deployment branch and open a reviewable pull request**

Run:

```bash
git push -u origin agent/github-pages-deployment
gh pr create --draft --base main --head agent/github-pages-deployment --title "Deploy site to GitHub Pages" --body-file <prepared-markdown-file>
```

Expected: GitHub returns a pull-request URL targeting `main`.

- [ ] **Step 4: Enable Pages Actions as the build source**

Run:

```bash
gh api --method POST repos/RichardWen924/myBlog/pages -f build_type=workflow
```

Expected: GitHub returns the Pages site configuration. If Pages already exists, update it with `PUT repos/RichardWen924/myBlog/pages -f build_type=workflow`.

- [ ] **Step 5: Integrate the approved deployment into `main`**

After confirming the PR checks and Pages configuration, mark the PR ready and merge it through GitHub. This push to `main` triggers `Deploy to GitHub Pages`.

- [ ] **Step 6: Monitor the deployment and verify the public URL**

Run:

```bash
gh run list --workflow deploy.yml --limit 1
gh run watch <run-id> --exit-status
curl --fail --location --retry 6 --retry-delay 10 https://richardwen924.github.io/myBlog/
```

Expected: the workflow succeeds and the public URL returns HTML with a successful HTTP status.
