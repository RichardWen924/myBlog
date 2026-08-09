# Dynamic Editorial Hero Design

## Intent

Redesign the homepage Hero as an original, Claude-inspired editorial workspace. The result should feel warm, intelligent, active, and personal without copying Claude's product interface or introducing visual noise that conflicts with the existing archive-style homepage.

## Content hierarchy

- Keep `Personal archive` and `Shanghai · 2026` as the identifying eyebrow.
- Replace the oversized welcome composition with the value-led headline `Thoughts, built into systems.`
- Preserve `Welcome to Richard's notes` in the supporting sentence so the homepage still reads as a personal welcome.
- Keep a single primary action that enters chapter `01`.
- Keep `Scroll to enter` inside the Hero's bottom safe area.

## Composition

Desktop uses an asymmetric two-column layout. The left side owns the headline and primary action. The right side contains a layered editorial workspace made from paper panels, route lines, moving nodes, and a current-thread card. The workspace is decorative and hidden from assistive technology; all meaningful content remains in the left copy.

The background remains warm paper with a restrained terracotta wash, sparse grain, and fine structural lines. Large circular orbits and continuous mechanical rotation are removed. The sticky header remains visually separate, and the Hero does not draw an additional line under it.

Mobile collapses to one column. The workspace becomes a shorter supporting panel below the copy, decorative layers are reduced, and typography scales down without overflow. Short viewports may extend the Hero rather than exposing the next chapter prematurely.

## Motion language

GSAP owns three coordinated layers:

1. Entrance: eyebrow fades in, headline lines reveal through masks, supporting copy follows, paper layers settle from an offset angle, route lines draw, and nodes appear.
2. Ambient: paper layers breathe by a few pixels, route dashes travel slowly, and nodes drift along short paths. No element performs a full continuous rotation.
3. Interaction: pointer movement creates depth-separated parallax. ScrollTrigger moves copy and workspace at different rates, fades the scroll cue, and reverses cleanly when the user returns to the top.

Reduced-motion users receive the complete final composition without entrance, ambient, pointer, or scroll animation. Motion code must clean up listeners and GSAP contexts during Astro page swaps.

## Component boundaries

- `HomeLandingHero.astro`: semantic section, copy, CTA, scroll cue, and composition.
- `HomeHeroCanvas.astro`: decorative workspace markup only.
- `homeHeroMotion.ts`: GSAP timelines, pointer parallax, ScrollTrigger behavior, and cleanup.
- `home.css`: Hero layout, visual tokens, responsive rules, hover states, and reduced-motion CSS.

## Acceptance criteria

- The Hero occupies at least the viewport below the sticky header and does not reveal chapter `01` at normal desktop sizes.
- `Scroll to enter` remains visible inside the Hero.
- Returning to the top restores all copy and workspace layers.
- The layout remains usable at mobile, tablet, desktop, and short viewport sizes.
- Motion is visibly dynamic but uses restrained amplitude and no continuous 360-degree orbit.
- Existing homepage chapter navigation, snap behavior, and sections remain unchanged.
- Source tests, the complete Node test suite, Astro build, and `git diff --check` pass.
