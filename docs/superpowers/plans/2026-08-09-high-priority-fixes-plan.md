# High-Priority Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the confirmed high-priority contact, blog rename, and local admin write-safety issues without changing the public page layout, styles, animations, or current data source.

**Architecture:** Keep `src/data` as the public site's source of truth. Make the About contact link use the canonical `profile.email`; isolate slug normalization/file selection in a small admin server utility so renames can be tested without starting Express; bind the admin API to loopback and reject unexpected browser origins for mutation routes.

**Tech Stack:** Astro 7, React 19, Express 4, Node test runner, TypeScript.

---

### Task 1: Lock in regressions with focused tests

**Files:**
- Create: `admin/server/blog-utils.mjs`
- Create: `admin/server/security-utils.mjs`
- Modify: `admin/server/module-utils.test.mjs`
- Modify: `test/information-architecture.test.mjs`

- [ ] **Step 1: Write failing tests**

Add tests that require canonical About email usage, slug normalization, and loopback admin origin validation. The new utility imports should fail before the utilities exist.

- [ ] **Step 2: Run the focused tests**

Run: `node --test test/information-architecture.test.mjs admin/server/module-utils.test.mjs`

Expected: FAIL because `admin/server/blog-utils.mjs` and `admin/server/security-utils.mjs` do not exist, and the About source still reads social email data.

### Task 2: Fix canonical contact data and safe blog renames

**Files:**
- Create: `admin/server/blog-utils.mjs`
- Modify: `src/pages/about.astro:6-10,64-70`
- Modify: `admin/src/components/BlogEditor.tsx:168-183`
- Modify: `admin/server/index.js:2-7,62-75,109-125`
- Modify: `admin/server/module-utils.test.mjs`

- [ ] **Step 1: Implement the smallest utility behavior**

Export `sanitizeBlogSlug(slug)` that trims, lowercases, replaces non-alphanumeric runs with `-`, removes leading/trailing hyphens, and throws for an empty result. Export `getBlogFile(CONTENT_DIR, slug)` that returns the existing `.md` or `.mdx` path, or `null`.

- [ ] **Step 2: Make About use the canonical profile email**

Build the social links from `profile.socials` excluding the stale `email` entry, then append one email link using `profile.email` and `mailto:${profile.email}`. Preserve the current list order and styling.

- [ ] **Step 3: Send the original slug from the admin editor**

Include `originalSlug: selectedSlug ?? detail.slug` in the blog publish payload. Keep the visible editor fields and publish UI unchanged.

- [ ] **Step 4: Rename the existing file before writing updated frontmatter**

Normalize both slugs, preserve the original `.md`/`.mdx` extension, reject a destination collision with HTTP 409, rename the old file when the slug changes, and then write the new content. Existing create/update behavior remains unchanged when the slug is not changed.

- [ ] **Step 5: Run focused tests**

Run: `node --test test/information-architecture.test.mjs admin/server/module-utils.test.mjs`

Expected: PASS.

### Task 3: Restrict admin mutation requests without changing the UI

**Files:**
- Create: `admin/server/security-utils.mjs`
- Modify: `admin/server/index.js:18-20,90-91,234-237`
- Modify: `admin/server/module-utils.test.mjs`

- [ ] **Step 1: Implement origin policy**

Allow requests with no `Origin` header for CLI/local tooling. Allow `http://localhost:5173`, `http://127.0.0.1:5173`, and an optional `ADMIN_ORIGIN`. Reject other origins only for `/api/sync/*` mutation requests with HTTP 403.

- [ ] **Step 2: Bind Express to loopback**

Use `ADMIN_HOST` with default `127.0.0.1` in `app.listen`, so the local admin server is not exposed on LAN interfaces by default.

- [ ] **Step 3: Run focused tests**

Run: `node --test admin/server/module-utils.test.mjs`

Expected: PASS.

### Task 4: Full verification

- [ ] **Step 1: Run the complete test suite**

Run: `node --test test/*.test.mjs admin/server/module-utils.test.mjs`

Expected: all tests pass.

- [ ] **Step 2: Run production builds and type checks**

Run: `npm run build`, `npm --prefix admin run build`, `npx tsc --noEmit`, and `npx --prefix admin tsc --noEmit`.

Expected: all commands exit successfully.

- [ ] **Step 3: Verify the built contact output and repository state**

Confirm `dist/about/index.html` contains the canonical `mailto:Wen314016548@163.com` link and does not contain `hello@example.com`; run `git diff --check` and `git status --short`.
