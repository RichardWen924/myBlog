# Work Richard-Focus Transition Design

## Goal

Replace the progress-indicator transition with a restrained two-stage camera move anchored to the `Richard` brand in the upper-left corner. Preserve the completed Work Hero alignment, single particle handoff, and all Work page content.

## Approved motion narrative

The route transition communicates a theme change through spatial continuity rather than progress UI:

1. The current page recedes and contracts toward the visual center of the `Richard` brand.
2. At minimum scale, the brand point becomes a short lens-like focus aperture.
3. The route changes while the aperture owns the frame.
4. The destination page grows outward from the same point until it fills the viewport.
5. Entering and leaving Work use the same sequence with opposite source and destination themes.

The user approved removing the track, nodes, percentage, route label, and status copy.

## Focal point

- Measure the visible `.site-header__brand` bounding-box center at transition start.
- Store the focus as viewport pixel coordinates so scrolling does not move it during the transition.
- On compact layouts, use the same measured mobile brand; do not substitute the menu button.
- If the brand cannot be measured, fall back to a conservative responsive point near the upper-left header area.

## Motion phases

### Phase 1: Source absorption

- Duration share: approximately 45%.
- Source transform origin: the measured brand focus.
- Source scale: `1 → 0.055` with a smooth accelerating curve.
- Add a small depth blur and lower opacity only near the final part of contraction.
- Keep the source recognizable for most of the movement; avoid rotation or elastic overshoot.

### Phase 2: Destination expansion

- Duration share: approximately 55%.
- Destination starts at the same scale and transform origin as the contracted source.
- Destination scale: `0.055 → 1` with a decelerating endpoint-smooth curve.
- Reveal the destination through a circular aperture centered on the brand point.
- The aperture reaches full viewport coverage before the last frame, leaving a stable settle interval.

### Focus aperture

- Use one thin green ring, a restrained radial glow, and a short refraction pulse at the midpoint.
- Speed streaks may appear only around the focus point during contraction/expansion.
- Do not render a progress bar, number, status text, or full-screen loading copy.

## Work Hero handoff

- The transition clone remains inert SSR content and always shows the stable outline `BUILD FUTURE` state.
- When the destination finishes expanding, the clone and live Hero share identical wordmark geometry.
- After clone cleanup, the live Hero pauses briefly and particleizes exactly once.
- Cached or previously hydrated `astro-island` state must never run inside the transition clone.

## Responsive and reduced motion

- Desktop and mobile derive movement from the measured brand point.
- Compact screens use less blur and no speed streaks but preserve the contraction/expansion narrative.
- Reduced-motion users skip contraction, aperture, blur, and particle gathering; navigation swaps immediately to the stable destination.

## Verification

- Unit-test exact enter/exit endpoints, midpoint minimum scale, and stable final-frame values.
- Build the Astro project.
- Browser-test direct Work entry, Home → Work, Work → Home, repeated cached entry, compact viewport, and reduced motion.
- Confirm all six Work chapters remain present and transition clones are empty after cleanup.
