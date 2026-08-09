# Centered Blog Snap Page Design

## Goal

Refine `/blog` to match the homepage's chapter experience: centered content, full viewport sections, mandatory vertical scroll snapping, and section-to-section navigation through the existing archive flow.

## Changes

- Change the Hero title to `Welcome, Blog`.
- Remove the Hero lede sentence entirely.
- Center-align the Hero eyebrow, title, search field, recent-results status/list, and scroll cue.
- Keep the existing project visual system: paper background, serif display typography, mono labels, quiet borders, and accent colors.
- Make the Hero and the complete archive two scroll chapters, each sized to the viewport after the sticky header.
- Enable `scroll-snap-type: y mandatory` on the Blog document through a Blog-specific class on `<html>`.
- Preserve live search, default latest-three behavior, article links, and the existing year-grouped archive.
- Add keyboard ArrowUp/ArrowDown navigation between the Hero and archive, respecting text controls and reduced motion.

## Implementation

`src/pages/blog/index.astro` will pass a `scrollSnap` prop to `Base`, wrap the Hero and archive in a Blog sequence, and add a small two-step chapter rail. `src/components/blog/BlogHero.astro` will retain the existing search controller but use centered markup and the new title with no lede node. `src/styles/blog.css` will own the Blog scroll-snap class, full-height chapter sizing, centered layout, and mobile behavior. Existing Home styles and navigation remain unchanged.

The archive remains fully accessible below the fold; the scroll cue points to `#blog-archive`, the chapter rail uses `aria-current="step"`, and keyboard navigation calls `scrollIntoView` with smooth behavior unless reduced motion is requested.

## Verification

Add focused static tests for centered title/content, removed lede, Blog snap CSS, two chapter targets, and keyboard navigation. Run the full Node test suite and `npm run build`.
