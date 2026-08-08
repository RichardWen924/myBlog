# Responsive Navigation Design

## Context

The shared site header currently renders the site title and four plain links in a single horizontal row. It is visually compatible with the paper-toned design, but it does not expose the active route, has limited keyboard focus feedback, and can become crowded on narrow screens.

## Goals

- Preserve the existing paper, serif, thin-border, sticky-header visual language.
- Make the current page obvious without adding a heavy selected-tab treatment.
- Provide a reliable mobile navigation pattern for narrow viewports.
- Make route state and keyboard focus state available to assistive technology.
- Keep the implementation small, CSS-first, and independent of page-specific scroll behavior.

## Non-goals

- No redesign of page content, typography tokens, footer, or homepage chapter rail.
- No scroll-driven header shrinking, hiding, or large motion effects.
- No client-side router or global navigation state store.

## Design

### Desktop navigation

The header remains sticky with its existing translucent paper background, border, and backdrop blur. The site title remains on the left in the existing serif style. The links remain on the right but use the existing mono style at a compact size with light tracking.

Each link receives `aria-current="page"` only when it represents the current route. The active link uses the accent color and a short bottom rule; inactive links retain the existing soft ink color. Hover and `:focus-visible` states use the accent color, with a restrained underline transition.

Route matching is pathname-based:

- `/` activates Home only.
- `/work` and `/projects/*` activate Work.
- `/blog` and `/blog/*` activate Blog.
- `/about` and `/about/*` activate About.

### Mobile navigation

At the mobile breakpoint, the desktop link row is replaced by a native `details`/`summary` menu control labeled `Menu`. The expanded panel uses the paper background, a top border, and vertically stacked links with comfortable hit areas. The active route keeps the accent treatment and adds a small visual marker.

Using native disclosure behavior keeps the menu usable without JavaScript and provides keyboard support by default. The menu does not alter document scroll locking or introduce an overlay, so it remains compatible with the homepage scroll sequence.

### Accessibility and motion

- The navigation has an explicit accessible label.
- The current page is represented with `aria-current="page"`.
- The menu control has a visible focus ring and native expanded state.
- Link targets remain real anchors.
- Animations are limited to color, underline, and small transform transitions; the existing reduced-motion rules continue to disable nonessential motion.

## Implementation boundaries

- Update `src/components/global/Header.astro` for route state, desktop/mobile markup, and accessible labels.
- Add focused header styles to `src/styles/global.css` without changing shared color or typography tokens.
- Add source-level regression tests for route matching hooks, `aria-current`, native mobile disclosure, and focus affordances.
- Verify with the full Node test suite, Astro production build, and `git diff --check`.

## Acceptance criteria

1. Desktop navigation keeps the current visual character and clearly marks the active route.
2. Mobile navigation fits without horizontal overflow and can be opened and operated from the keyboard.
3. Nested blog and project routes highlight the expected top-level section.
4. No homepage scroll-snap, hero animation, or page layout behavior is changed.
5. All existing tests pass, new navigation tests pass, and the production build succeeds.
