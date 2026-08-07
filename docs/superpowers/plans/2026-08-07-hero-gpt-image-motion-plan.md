# Hero GPT Image 2 Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an original GPT Image 2-generated abstract visual to the homepage Hero and give it restrained, accessible motion that matches the existing paper-and-ink visual system.

**Architecture:** Keep HeroReactive.tsx as the single interactive Hero island. Store the generated PNG under public/, render it with explicit dimensions and alt text, and animate only its wrapper using transform/opacity so the page layout remains stable. Respect reduced-motion preferences through a CSS media query.

**Tech Stack:** Astro 7, React, TypeScript, Tailwind CSS 4, CSS keyframes, Node built-in test runner, GPT Image 2 through the built-in image generation tool.

---

### Task 1: Add a failing contract test for the Hero visual

**Files:**
- Create: test/hero-visual.test.mjs

- [ ] **Step 1: Write the failing test**

Create a Node test that asserts the Hero references the planned public asset and that the reduced-motion rule exists in the global stylesheet:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const hero = readFileSync(resolve(root, "src/components/react/HeroReactive.tsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles/global.css"), "utf8");

test("Hero references the generated thinking-orbit asset", () => {
  assert.match(hero, /hero-thinking-orbit\.png/);
  assert.equal(existsSync(resolve(root, "public/hero-thinking-orbit.png")), true);
});

test("Hero motion has a reduced-motion fallback", () => {
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /hero-thinking-orbit/);
});
```

- [ ] **Step 2: Run the test and verify the correct failure**

Run:

```bash
node --test test/hero-visual.test.mjs
```

Expected: FAIL because the Hero does not reference hero-thinking-orbit.png, the asset does not exist, and the CSS motion contract has not been added.

### Task 2: Generate and validate the image asset

**Files:**
- Create: public/hero-thinking-orbit.png

- [ ] **Step 1: Generate one wide image with GPT Image 2**

Use the built-in image generation tool with this prompt:

```text
Use case: stylized-concept
Asset type: homepage Hero visual for a personal developer blog
Primary request: Create an original abstract hand-drawn illustration about thoughts gathering and taking shape, inspired by editorial ink sketches and tactile paper, not by any existing brand asset.
Scene/backdrop: warm off-white paper background with generous negative space and no horizon or room.
Subject: one loose organic orbit made from imperfect ink lines and a single muted terracotta focal form, with a small low-saturation sage-green accent shape.
Style/medium: refined editorial hand-drawn illustration, visible paper grain, slightly uneven brush/ink edges, quiet and sophisticated rather than playful or cartoonish.
Composition/framing: wide landscape composition, visual weight toward the left half so it can sit beside Hero copy, centered subject with safe margins, no hard rectangular frame.
Lighting/mood: soft diffuse warm light, subtle terracotta halo, calm curious atmosphere.
Color palette: #FAF8F5 paper, #1A1A1A ink, #5B7553 sage green, #C97B5A terracotta, very restrained contrast.
Materials/textures: matte paper grain and dry ink texture.
Text (verbatim): none.
Constraints: original artwork; no logo; no brand marks; no recognizable face or person; no UI; no product mockup; no words; no letters; no watermark; no border; no neon; no photorealism.
Avoid: Claude or Anthropic visual identity, copied composition, multicolor gradients, glossy 3D, geometric tech patterns, emoji, icons, cards, and dense detail.
```

Save the selected generated image into the project as public/hero-thinking-orbit.png without overwriting another asset.

- [ ] **Step 2: Inspect the generated asset**

Confirm it is a readable PNG with a wide composition, no text or watermark, and visual colors compatible with the existing paper palette. Reject and regenerate once with a targeted prompt change if it violates any constraint.

### Task 3: Implement the Hero visual and motion

**Files:**
- Modify: src/components/react/HeroReactive.tsx
- Modify: src/styles/global.css

- [ ] **Step 1: Add the image wrapper in the existing left visual column**

Replace only the existing decorative circle SVG with an accessible image wrapper:

```tsx
<div className="hero-thinking-orbit flex items-start justify-center pt-6 md:col-span-2">
  <img
    src="/hero-thinking-orbit.png"
    alt="手绘线条围绕陶土橙色焦点形成的思考轨道"
    width="557"
    height="557"
    loading="eager"
    decoding="async"
    className="h-auto w-full max-w-[22rem] object-contain"
  />
</div>
```

Keep the right-side title, subtitle, underline, prompt input, email link, and existing grid breakpoints unchanged.

- [ ] **Step 2: Add a single wrapper motion rule**

Add to global.css:

```css
.hero-thinking-orbit {
  animation: hero-orbit-drift 22s ease-in-out infinite alternate;
  transform-origin: 50% 50%;
  will-change: transform;
}

@keyframes hero-orbit-drift {
  0% {
    opacity: 0.92;
    transform: translate3d(0, 0, 0) rotate(-0.8deg);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, -10px, 0) rotate(0.8deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-thinking-orbit {
    animation: none;
    transform: none;
  }
}
```

Do not add layout-affecting animation, extra looping gradients, or a second animation library.

### Task 4: Run the tests and build

**Files:**
- Verify: test/hero-visual.test.mjs
- Verify: src/components/react/HeroReactive.tsx
- Verify: src/styles/global.css

- [ ] **Step 1: Run the contract test after implementation**

Run node --test test/hero-visual.test.mjs and expect all tests to pass.

- [ ] **Step 2: Build the Astro site**

Run npm run build and expect Astro to report a successful build with no TypeScript, JSX, or asset errors.

- [ ] **Step 3: Inspect the rendered Hero in a browser**

Open the local site at http://localhost:4321, confirm the image loads from the project, the first viewport remains full-height, and the visual does not overlap the title or prompt field at desktop and mobile widths. Check the browser console for errors.

- [ ] **Step 4: Commit the implementation**

```bash
git add public/hero-thinking-orbit.png src/components/react/HeroReactive.tsx src/styles/global.css test/hero-visual.test.mjs
git commit -m "feat: add animated GPT Image 2 hero visual"
```
