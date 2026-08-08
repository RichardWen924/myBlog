# Main Admin Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将模块管理页及其 API 接入 main 分支现有 admin 应用。

**Architecture:** 复用现有 React/Vite admin，增加 `/modules` 路由和 `ModulesEditor`；Express API 负责读取、校验、写入模块 JSON/受信任 TS 并复用现有发布流程。Astro 只新增 modules collection 和类型/注册边界，不改首页现有渲染。

**Tech Stack:** Astro 7, React 19, React Router, Vite, Express, Tailwind CSS 4, Node ESM.

---

### Task 1: Add module content primitives

**Files:**
- Create: `src/lib/module-types.ts`
- Create: `src/lib/trusted-module-registry.ts`
- Create: `src/content/modules/*.json`
- Create: `src/modules/README.md`
- Modify: `src/content.config.ts`

- [ ] **Step 1: Add the module type contract and collection.** Define the module union (`hero`, `profile`, `skill`, `project`, `experience`, `post`, `trusted`) and fields `id`, `group`, `title`, `order`, `visible`, optional `sourceId`, and optional record data. Register a JSON glob collection with a Zod schema that validates those fields.
- [ ] **Step 2: Add initial module JSON entries.** Mirror the current main data sources into stable ids such as `hero`, `profile`, `skill-languages`, `skill-frontend`, `skill-tools`, `project-my-blog`, `experience-software-engineer`, and `post-hello-blog`, preserving display metadata and order.
- [ ] **Step 3: Add the trusted source boundary.** Add a registry that eagerly loads only `src/modules/trusted/*.ts` and a README documenting that uploaded trusted files are explicit source code and must use `React.createElement` rather than JSX.
- [ ] **Step 4: Run Astro type/build verification.** Run `npm run build` and expect the existing site build to pass with the new collection registered.

### Task 2: Add server-side module APIs and pure utilities

**Files:**
- Create: `admin/server/module-utils.mjs`
- Create: `admin/server/module-utils.test.mjs`
- Modify: `admin/server/index.js`

- [ ] **Step 1: Add pure sorting, moving, and validation helpers.** Implement deterministic order normalization, bounded item movement, and validation for module ids, types, groups, titles, numeric orders, visibility, and record data.
- [ ] **Step 2: Add utility tests.** Cover sorting by order/id, moving first/middle/last items, rejecting invalid ids/types, and accepting a valid module list.
- [ ] **Step 3: Add `GET /api/modules`.** Read only `.json` files from `src/content/modules`, parse them, sort them through the pure helper, and return `[]` when the directory is absent.
- [ ] **Step 4: Add `POST /api/sync/modules`.** Validate modules and source mappings, create module directories, remove stale module JSON files, write the submitted order, write trusted `.ts` sources, and call a scoped git commit/push helper.
- [ ] **Step 5: Run the server utility tests.** Run `node --test admin/server/module-utils.test.mjs` and expect all tests to pass.

### Task 3: Add the React module editor

**Files:**
- Create: `admin/src/components/ModulesEditor.tsx`
- Modify: `admin/src/App.tsx`
- Modify: `admin/src/components/Nav.tsx`
- Modify: `admin/src/components/PublishButton.tsx`
- Modify: `admin/src/data-types.ts`
- Modify: `admin/vite.config.ts`

- [ ] **Step 1: Add `ModuleEntry` and module type definitions.** Keep the API shape aligned with the Astro collection and add `modules` to the publish topic union.
- [ ] **Step 2: Build the module editor state flow.** Fetch `/api/modules`, maintain edited entries, support visibility toggles, drag reorder, keyboard move up/down, edit fields and JSON data, and show API errors.
- [ ] **Step 3: Add publishing.** Send the complete ordered module list and trusted source map to `/api/sync/modules` through the existing publish interaction, with a module-specific default commit message.
- [ ] **Step 4: Wire routes and navigation.** Make `/` redirect to `/modules`, add `/modules`, preserve the existing Profile/Projects/Skills/Experience editors unchanged, and keep `/blog` on `BlogEditor`.
- [ ] **Step 5: Run `npm run build` in `admin`.** Expect a successful Vite production build.

### Task 4: End-to-end validation on main

**Files:**
- Modify only if verification exposes an integration defect.

- [ ] **Step 1: Start the Astro site with `astro dev --background`.** Confirm the main site still serves its home page.
- [ ] **Step 2: Start the admin app with `npm run dev` in `admin`.** Confirm the Vite UI and Express API start on their configured ports.
- [ ] **Step 3: Request `/api/modules`.** Confirm it returns the seeded module list in order.
- [ ] **Step 4: Open `/modules`.** Confirm the module editor renders and the browser console has no route or API errors.
- [ ] **Step 5: Report the final URLs and verification results.** Do not claim publish success unless a real publish request was intentionally executed.
