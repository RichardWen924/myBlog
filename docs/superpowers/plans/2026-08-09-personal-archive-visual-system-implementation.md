# Personal Archive Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved four-page visual system: restrained Home, growing-note About, light technical-atlas Work, and quiet archive Blog, while preserving the existing Astro content contracts and responsive behavior.

**Architecture:** Keep Astro pages as the composition layer, keep page-specific CSS in feature modules, and keep React islands limited to interactive visualizations. Global tokens and shared navigation remain the only cross-page visual dependencies. Existing uncommitted homepage work is treated as the starting state and must not be discarded.

**Tech Stack:** Astro 7, Tailwind CSS 4, React 19, GSAP, Framer Motion, Node test runner.

---

## Current file map

- `src/styles/global.css`: global tokens, base typography, links, header utilities, global motion preferences.
- `src/styles/home.css`: homepage chapters, hero, chapter rail, and homepage responsive rules.
- `src/pages/index.astro`: homepage composition and chapter content.
- `src/components/home/HomeLandingHero.astro`: homepage hero copy and motion bootstrap.
- `src/components/home/HomeHeroCanvas.astro`: homepage visual canvas and real current-content signal.
- `src/components/home/homeHeroMotion.ts`: GSAP hero reveal, pointer movement, and scroll movement.
- `src/pages/about.astro`: personal narrative page.
- `src/pages/work.astro`: work hero, experience, skills, and projects.
- `src/components/react/SkillsOrbit.tsx`: interactive skill map and reduced-motion behavior.
- `src/components/react/Timeline.tsx`: experience list and reveal behavior.
- `src/pages/blog/index.astro`: blog archive list.
- `src/pages/blog/[...slug].astro`: article page.
- `src/data/profile.json`: canonical profile data.
- `src/data/experience.json`: experience data.
- `src/data/skills.json`: skill groups and levels.
- `src/data/projects.json`: project data.
- `src/styles/illustration.css`: existing shared illustration styles; only modify when a selector is shared by an active page.
- `test/*.test.mjs`: source-level regression tests and style contract checks.

## Execution rules

- Use TDD for each behavior change: write one focused failing test, run it and observe the expected failure, implement the smallest change, run the focused test, then run the full suite.
- Do not invent experience, project outcomes, metrics, company names, or articles. If content is missing, render an explicit empty state or keep the existing data contract unchanged.
- Do not create a second global design system. New page variants must consume the global tokens.
- Do not add decorative micro-labels unless the label communicates real content.
- Preserve public routes and existing navigation behavior.
- Verify at desktop width, tablet width, and a 390px mobile viewport after each page-level task.

## Task 1: Establish the mother system and shared reading primitives

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/global/Header.astro`
- Modify: `src/components/global/HeaderBrand.astro`
- Modify: `src/components/global/HeaderLinks.astro`
- Modify: `src/components/global/HeaderMobileMenu.astro`
- Modify: `src/components/global/Footer.astro`
- Create: `src/components/global/PageHero.astro`
- Create: `src/components/global/SectionHeading.astro`
- Create: `src/components/global/ArchiveLink.astro`
- Modify: `test/header-navigation.test.mjs`
- Create: `test/visual-system.test.mjs`

- [ ] **Step 1: Add failing token and primitive contract tests.**

Add assertions to `test/visual-system.test.mjs` that `global.css` contains the paper, surface, ink, ink-soft, border, sage, terracotta, and steel custom properties; that it contains display, body, and mono font roles; and that the new primitives exist with their intended class names.

Run:

```bash
node --test test/visual-system.test.mjs
```

Expected: FAIL because the new tokens and primitives do not exist yet.

- [ ] **Step 2: Implement the global tokens and typography roles.**

Update `@theme` in `src/styles/global.css` to use:

```css
--color-paper: #f4f0e8;
--color-surface: #faf8f3;
--color-ink: #1d1d1a;
--color-ink-soft: #6e706a;
--color-border: #d8d2c7;
--color-accent: #64745d;
--color-warm: #c97858;
--color-steel: #6f7f86;
--font-serif: 'Newsreader', 'Noto Serif SC', Georgia, serif;
--font-sans: 'IBM Plex Sans', 'Noto Sans SC', system-ui, sans-serif;
--font-mono: 'IBM Plex Mono', 'SF Mono', monospace;
```

Keep local/system fallbacks so content remains readable without external font loading. Update the base `html` font-family to the body role. Add a `.page-shell` utility for the shared 1184px content width and a `.micro-label` utility with a minimum 12px size. Preserve the existing focus-visible and reduced-motion rules.

- [ ] **Step 3: Add shared components without adding page behavior.**

Create `PageHero.astro` with props `eyebrow`, `title`, `description`, and `variant`; render one semantic `h1`, optional description, and a slot for page-specific visual content. Create `SectionHeading.astro` with props `index`, `label`, `title`, and optional `description`; render at most one structural label. Create `ArchiveLink.astro` with `href`, `label`, and optional `external` props; render the existing arrow-link treatment with a visible focus state.

Refactor the header width class into `.site-header__inner` using the shared page width and remove duplicate width declarations from child components. Keep current route-based `aria-current` behavior and the native mobile `<details>` menu.

- [ ] **Step 4: Run focused and full tests.**

```bash
node --test test/visual-system.test.mjs test/header-navigation.test.mjs
node --test test/*.test.mjs
```

Expected: all tests pass.

- [ ] **Step 5: Commit the isolated task.**

```bash
git add src/styles/global.css src/components/global test/visual-system.test.mjs test/header-navigation.test.mjs
git commit -m "refactor: establish personal archive visual system"
```

## Task 2: Recompose Home as a restrained introduction

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/home/HomeLandingHero.astro`
- Modify: `src/components/home/HomeHeroCanvas.astro`
- Modify: `src/components/home/homeHeroMotion.ts`
- Modify: `src/components/home/HomeChapterNavigation.astro`
- Modify: `src/styles/home.css`
- Modify: `src/components/entry/EntryProgressLoader.astro`
- Modify: `test/home-gsap-hero.test.mjs`
- Modify: `test/home-hero-snap.test.mjs`
- Modify: `test/entry-progress-loader.test.mjs`
- Create: `test/home-archive-entry.test.mjs`

- [ ] **Step 1: Add failing Home content and timing assertions.**

Add tests that the homepage contains the concise identity sentence, links to `/about`, `/work`, and `/blog`, and does not contain the old repeated `systems` headline or decorative `ACTIVE`/`IDEA → SYSTEM` labels. Add an assertion that the loader has a session-skip marker and an entry duration no longer than 1.1 seconds in its runtime data/config.

Run:

```bash
node --test test/home-archive-entry.test.mjs test/home-gsap-hero.test.mjs test/entry-progress-loader.test.mjs
```

Expected: FAIL because the current Home still uses the old copy, decorative card status, and full loader sequence.

- [ ] **Step 2: Replace the Home hero copy and remove fake system labels.**

Use this structure in `HomeLandingHero.astro`:

```astro
<p class="home-landing-hero__overline">把复杂的事，慢慢做清楚。</p>
<h1 id="home-landing-title" class="home-landing-hero__title">Richard's notes.</h1>
<p class="home-landing-hero__lede">
  我是 Richard，一名正在成长的开发者。这里保存我做过的系统、走过的路径，以及还没有想完的事。
</p>
```

Keep the eyebrow as a single real context line, and use `About me`, `Work`, and `Blog` as the three archive entry links. Remove `CURRENT THREAD`, `ACTIVE`, and `IDEA → SYSTEM` from the visual canvas unless they are backed by real content data.

- [ ] **Step 3: Simplify the canvas to one real supporting signal.**

Keep one paper/route composition in `HomeHeroCanvas.astro`, but render one current content item from available content data. Do not render a second large headline in the canvas. Use `aria-hidden="true"` only for decorative route and paper layers; the current-content link must remain semantic and keyboard accessible.

- [ ] **Step 4: Shorten the loader and make it session-aware.**

Preserve progressbar semantics and the reduced-motion branch. Add a `sessionStorage` marker only after successful completion. If the marker exists, remove the loader synchronously and dispatch the existing completion event after the content is unlocked. Otherwise animate five milestones in a total of 0.8–1.1 seconds, then remove the overlay. Never hide page content permanently when storage is unavailable.

- [ ] **Step 5: Keep Home motion restrained.**

Change `homeHeroMotion.ts` so the complete hero reveal finishes within 1.2 seconds. Keep one path-draw animation and one paper drift; remove simultaneous node, signal, route, and card loops that do not carry content. Preserve `prefers-reduced-motion`, pointer coarse fallback, `ScrollTrigger` cleanup, and the existing entry completion event.

- [ ] **Step 6: Rebuild the homepage entry sections.**

Keep the existing introduction, projects, notes, and contact routes, but present the first three as wide editorial rows instead of three equal card blocks. Each row has one heading, one short description, and one `ArchiveLink`. The contact section keeps the canonical profile email and does not add a second contact form.

- [ ] **Step 7: Verify Home.**

```bash
node --test test/home-archive-entry.test.mjs test/home-gsap-hero.test.mjs test/home-hero-snap.test.mjs test/entry-progress-loader.test.mjs
npm run build
```

Open the page at 1280×720, 834×1112, and 390×844. Confirm the scroll cue is visible, no next section leaks into the viewport, no chapter rail overlaps copy, and the second visit in the same session does not block on the loader.

- [ ] **Step 8: Commit the isolated task.**

```bash
git add src/pages/index.astro src/components/home src/components/entry/EntryProgressLoader.astro src/styles/home.css test/home-archive-entry.test.mjs test/home-gsap-hero.test.mjs test/home-hero-snap.test.mjs test/entry-progress-loader.test.mjs
git commit -m "refactor: make homepage a restrained archive introduction"
```

## Task 3: Recompose About as a growing notebook

**Files:**
- Modify: `src/pages/about.astro`
- Create: `src/styles/about.css`
- Modify: `src/styles/global.css`
- Modify: `src/data/experience.json` only when replacing verified user content
- Create: `test/about-growing-notebook.test.mjs`
- Modify: `test/information-architecture.test.mjs`

- [ ] **Step 1: Add failing About structure assertions.**

Test that About has a single page hero, a growth path, a current-state section, and no repeated skill-orbit or technical timeline components. Test that the page imports `about.css` through the global style entry and contains no more than one decorative micro-label per section.

Run:

```bash
node --test test/about-growing-notebook.test.mjs
```

Expected: FAIL because the current page is a generic three-column statement layout.

- [ ] **Step 2: Implement the About content structure.**

Use four sections: `Now`, `The path`, `How I keep growing`, and `Elsewhere`. Render verified experience or education nodes from data when present; render no invented node when data is missing. Keep the page about personal development and working style, and link to Work for technical evidence.

- [ ] **Step 3: Add the growing-notebook visual treatment.**

Create `about.css` with one low-contrast vertical growth path, one optional texture layer, and responsive two-column-to-single-column behavior. Use larger Chinese/English statements as the expressive layer. Do not add coordinate labels or repeated annotations. Add reduced-motion rules that replace path growth with a static line.

- [ ] **Step 4: Verify About.**

```bash
node --test test/about-growing-notebook.test.mjs test/information-architecture.test.mjs
npm run build
```

Open `/about` at 1280×720 and 390×844. Confirm the growth path does not reduce text contrast or overlap links.

- [ ] **Step 5: Commit the isolated task.**

```bash
git add src/pages/about.astro src/styles/about.css src/styles/global.css test/about-growing-notebook.test.mjs test/information-architecture.test.mjs
git commit -m "refactor: shape about page as a growing notebook"
```

## Task 4: Recompose Work as a light technical atlas

**Files:**
- Modify: `src/pages/work.astro`
- Modify: `src/components/react/SkillsOrbit.tsx`
- Modify: `src/components/react/Timeline.tsx`
- Create: `src/components/work/ProjectCaseSummary.astro`
- Create: `src/styles/work.css`
- Modify: `src/styles/global.css`
- Modify: `src/data/experience.json` only when replacing verified user content
- Modify: `src/data/skills.json` only when normalizing verified skills
- Modify: `src/data/projects.json` only when normalizing verified projects
- Create: `test/work-technical-atlas.test.mjs`
- Modify: `test/about-skills.test.mjs`
- Modify: `test/information-architecture.test.mjs`

- [ ] **Step 1: Add failing Work structure assertions.**

Test that Work preserves the existing `HeroReactive` entry and renders the order Hero, experience, `SkillsOrbit`, and project case summaries; and that the skill map includes a mobile text fallback. Test that project summaries expose problem, role, system, decision, and outcome fields when data provides them.

Run:

```bash
node --test test/work-technical-atlas.test.mjs
```

Expected: FAIL because the current page places projects before experience and uses the old reactive hero.

- [ ] **Step 2: Create the light atlas hero.**

Keep the existing `HeroReactive` component and its route/scroll behavior. Do not replace or duplicate the Work Hero. Add the light paper/steel-blue technical-atlas treatment below it, beginning with the experience section and continuing through the skills map and project cases. Do not add fake numeric metrics.

- [ ] **Step 3: Reorder Work and expose experience first.**

Update `work.astro` to render: hero, experience, skills map, projects, then two archive links. Keep `Timeline` data-driven. Replace decorative bullets with actual description text and keep template organizations hidden or visibly marked until real data exists.

- [ ] **Step 4: Make the skill map an evidence map.**

Keep `SkillsOrbit` as the desktop visualization, but use `aria-describedby` and a visible adjacent details panel for the focused category. Add an ordered mobile fallback list that is present in the DOM and hidden only when the desktop visualization is usable. Replace subjective five-star semantics with category/group relationships; preserve keyboard focus and reduced-motion behavior.

- [ ] **Step 5: Add project case summaries.**

Create `ProjectCaseSummary.astro` with a stable structure: title/year, problem, role, system, decisions, outcome, and technologies. It must omit empty fields rather than render invented copy. Keep the existing project route and `ProjectCard` compatibility for the index page.

- [ ] **Step 6: Add the light technical atlas styles.**

Create `work.css` with pale paper background, steel grid, thin connections, and restrained motion. Avoid dark mode, glow, neon, glass, and dense terminal panels. Ensure the visual map is decorative around real content, not a replacement for it. At 390px, switch to a readable list and keep all interactive targets at least 44px.

- [ ] **Step 7: Verify Work.**

```bash
node --test test/work-technical-atlas.test.mjs test/about-skills.test.mjs test/information-architecture.test.mjs
npm run build
```

Open `/work` at 1280×720 and 390×844. Confirm the page reads as technical without switching to a dark dashboard and that the experience appears before the skill map and project cases.

- [ ] **Step 8: Commit the isolated task.**

```bash
git add src/pages/work.astro src/components/react/SkillsOrbit.tsx src/components/react/Timeline.tsx src/components/work src/styles/work.css src/styles/global.css test/work-technical-atlas.test.mjs test/about-skills.test.mjs test/information-architecture.test.mjs
git commit -m "refactor: shape work page as a light technical atlas"
```

## Task 5: Recompose Blog as a quiet reading archive

**Files:**
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/blog/[...slug].astro`
- Create: `src/styles/blog.css`
- Modify: `src/styles/global.css`
- Create: `test/blog-reading-archive.test.mjs`

- [ ] **Step 1: Add failing Blog structure assertions.**

Test that the archive list groups posts by year, shows title/date/summary/tags, and avoids grid cards; test that the article page has a readable content width, article metadata, and previous/next navigation without decorative status labels.

Run:

```bash
node --test test/blog-reading-archive.test.mjs
```

Expected: FAIL if the current archive or article page does not meet the structure.

- [ ] **Step 2: Implement the quiet archive list.**

Keep the existing content collection and sort order. Render one short introduction, year groups, and editorial rows with a single `ArchiveLink` per post. Keep two visible tags maximum and do not add a filter panel.

- [ ] **Step 3: Implement the article reading layout.**

Set article content to a 680–760px readable column, keep title/date/summary above the body, preserve Markdown code and quote styles, and add only one reading aid: a simple back-to-archive link. Add previous/next links after the article when neighboring posts exist.

- [ ] **Step 4: Add quiet reading styles.**

Create `blog.css` with stable typography, generous vertical rhythm, clear code blocks, and no continuous ambient motion. Apply reduced-motion rules and ensure links/focus states remain visible.

- [ ] **Step 5: Verify Blog.**

```bash
node --test test/blog-reading-archive.test.mjs
npm run build
```

Open `/blog` and an article route at desktop and mobile widths. Confirm reading order, code wrapping, and navigation.

- [ ] **Step 6: Commit the isolated task.**

```bash
git add src/pages/blog src/styles/blog.css src/styles/global.css test/blog-reading-archive.test.mjs
git commit -m "refactor: make blog a quiet reading archive"
```

## Task 6: Full regression and visual acceptance

**Files:**
- Modify only files required by failing verification.
- Create: `docs/superpowers/reports/2026-08-09-personal-archive-visual-verification.md`

- [ ] **Step 1: Run the full source test suite.**

```bash
node --test test/*.test.mjs
```

Expected: all tests pass with no unhandled errors.

- [ ] **Step 2: Run the production build.**

```bash
npm run build
```

Expected: Astro build completes successfully with no broken route or asset errors.

- [ ] **Step 3: Run responsive browser verification.**

Start the local server with the repository instruction:

```bash
astro dev --background
```

Verify Home, About, Work, Blog list, and one article at 1280×720, 834×1112, and 390×844. Check content overflow, sticky header spacing, focus rings, reduced motion, and same-session loader behavior.

- [ ] **Step 4: Record evidence.**

Write the verified routes, viewport sizes, test/build output, and any remaining content-only limitations to `docs/superpowers/reports/2026-08-09-personal-archive-visual-verification.md`. Do not claim content is complete while source data still contains template entries.

- [ ] **Step 5: Run a final diff review.**

```bash
git diff --check
git status --short
```

Confirm no obsolete plan or one-off validation files were recreated and no unrelated files were changed.

- [ ] **Step 6: Commit the verification report and final fixes.**

```bash
git add docs/superpowers/reports
git commit -m "docs: record personal archive visual verification"
```
