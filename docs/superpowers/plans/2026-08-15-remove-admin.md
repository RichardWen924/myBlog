# Remove Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the standalone admin application while preserving the static personal site and its shared content types.

**Architecture:** The repository will retain the Astro static site and `packages/content-contracts` type package. The independent `admin/` application and its API server will be deleted as one self-contained unit.

**Tech Stack:** Astro, TypeScript, React, Node.js, npm.

---

### Task 1: Remove the standalone admin application

**Files:**
- Delete: `admin/` and all files beneath it.
- Preserve: `packages/content-contracts/` and all static-site files.

- [x] **Step 1: Delete the admin directory**

Remove the complete `admin/` tree, including `admin/package.json`, `admin/package-lock.json`, `admin/src/`, `admin/server/`, `admin/index.html`, and `admin/vite.config.ts`.

- [x] **Step 2: Verify no admin runtime references remain**

Run:

```bash
rg -n -i --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!dist/**' --glob '!.astro/**' 'admin|blog-admin|ADMIN_API_URL|ADMIN_ORIGIN|ADMIN_HOST|ADMIN_PORT'
```

Expected: no matches in source/configuration files; any match in the design or implementation plan is documentation only.

### Task 2: Verify the static site

**Files:**
- No source changes expected.

- [x] **Step 1: Run the existing tests**

Run `npm test` from the repository root.

Expected: the command exits successfully.

- [x] **Step 2: Run the production build**

Run `npm run build` from the repository root.

Expected: Astro completes a production build successfully.

- [x] **Step 3: Review the final diff**

Run `git status --short` and `git diff --stat -- admin packages src`.

Expected: only the standalone `admin/` tree is deleted by this task; unrelated pre-existing changes remain untouched.
