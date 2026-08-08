# Responsive Header Component Design

## Context

The shared header already exists as `Header.astro`, but it currently owns the brand link, route matching, desktop links, mobile disclosure menu, and their markup in one file. Its inner container also uses a fixed `max-w-4xl px-4`, which feels narrow on wide screens and does not express a reusable responsive spacing rule.

## Goals

- Make the header spacing adapt smoothly from mobile to wide desktop windows.
- Keep the existing sticky paper-toned visual style, height, active-route behavior, and mobile menu behavior.
- Separate navigation configuration, brand presentation, desktop links, and mobile menu into focused components.
- Make future menu changes local to configuration or the relevant presentation component.
- Avoid adding a client-side state store or changing page content layout.

## Non-goals

- No redesign of the page body, footer, typography tokens, or homepage chapter rail.
- No new navigation entries or route changes.
- No scroll-driven header resizing, hiding, or overlay navigation.

## Responsive layout

The header keeps its existing sticky shell and uses a dedicated inner container class. The container uses a fluid width with a comfortable viewport gutter and a `72rem` maximum width. The effective rule is equivalent to `width: min(calc(100% - 2rem), 72rem)` on small screens, expanding the gutter progressively on larger screens with `clamp`. This keeps mobile content at least `1rem` from either edge while preventing the desktop header from becoming as narrow as the reading column.

The existing vertical padding remains unchanged so hero height calculations and scroll behavior are unaffected. The mobile menu panel remains anchored to the inner container's right edge.

## Component boundaries

- `src/data/navigation.ts`: exports the canonical public navigation items and the pathname matcher. It contains labels, hrefs, and the Work mapping for `/work`, `/projects`, and nested project routes.
- `src/components/global/Header.astro`: owns the sticky shell, responsive inner container, current pathname, and composition of child components.
- `src/components/global/HeaderBrand.astro`: renders the site title link and accepts the title as a prop.
- `src/components/global/HeaderLinks.astro`: renders desktop links from navigation items and applies `aria-current` plus active styling.
- `src/components/global/HeaderMobileMenu.astro`: renders the native `details`/`summary` menu from the same navigation items.

Child components receive already-resolved navigation items, so they remain presentational and do not duplicate route-matching rules. The public navigation remains one canonical list rendered in both desktop and mobile contexts.

## Accessibility and behavior

- The top-level navigation keeps its explicit accessible label.
- Active links continue to use `aria-current="page"`.
- The mobile menu remains native `details`/`summary`, preserving keyboard and no-JavaScript operation.
- Existing focus-visible and reduced-motion behavior remains in the shared header styles.
- All links remain normal anchors and preserve current URLs.

## Testing and acceptance criteria

- Add focused source tests for the navigation data export, component composition, responsive container class, and child menu semantics.
- Preserve the existing tests for sticky positioning, active routes, information architecture, and mobile disclosure behavior.
- `node --test test/*.test.mjs` passes.
- `npm run build` passes and renders the existing eight static routes.
- `git diff --check` passes.
- No page body layout or homepage scroll behavior changes beyond the header's horizontal container width.
