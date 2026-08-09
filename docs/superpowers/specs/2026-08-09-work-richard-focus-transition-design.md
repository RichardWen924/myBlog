# Work Richard-Focus Transition Design

## Goal

Replace the progress-indicator transition with a restrained two-stage camera move anchored to the `Richard` brand in the upper-left corner. Preserve the completed Work Hero alignment, single particle handoff, and all Work page content.

## Approved motion narrative

The route transition communicates a theme change through spatial continuity rather than progress UI:

1. The current page stays full-bleed while the camera zooms toward the visual center of the `Richard` brand.
2. At maximum magnification, the enlarged brand holds briefly and the surface color changes to the destination theme.
3. The route changes while the enlarged brand owns the frame.
4. The camera pulls back from the same magnified brand to reveal the full destination page.
5. Entering and leaving Work use the same sequence with opposite source and destination themes.

The user approved removing the track, nodes, percentage, route label, and status copy.

## Focal point

- Measure the visible `.site-header__brand` bounding-box center at transition start.
- Store the focus as viewport pixel coordinates so scrolling does not move it during the transition.
- This redesign targets the desktop layout only.
- If the desktop brand cannot be measured, fall back to a conservative fixed point near the upper-left header area.

## Motion phases

### Phase 1: Camera push-in

- Duration share: approximately 45%.
- Source transform origin: the measured brand focus.
- Source scale: `1 → approximately 5.6` around the measured brand point.
- The page always covers the viewport; it must never become a small floating rectangle.
- Add a small edge blur only near maximum magnification; avoid rotation or elastic overshoot.

### Phase 2: Camera pull-back

- Duration share: approximately 55%.
- Destination starts at the same maximum scale and transform origin as the magnified source.
- Crossfade source and destination theme colors during a short brand hold.
- Destination scale: `approximately 5.6 → 1` with a decelerating endpoint-smooth curve.
- Complete the pull-back before the last frame, leaving a stable settle interval.

### Focus treatment

- Use a restrained radial glow and short refraction pulse at the midpoint; the enlarged brand is the primary visual anchor.
- Speed streaks may appear only around the focus point during contraction/expansion.
- Do not render a progress bar, number, status text, or full-screen loading copy.

## Work Hero handoff

- The transition clone remains inert SSR content and always shows the stable outline `BUILD FUTURE` state.
- When the destination finishes expanding, the clone and live Hero share identical wordmark geometry.
- After clone cleanup, the live Hero pauses briefly and particleizes exactly once.
- Cached or previously hydrated `astro-island` state must never run inside the transition clone.

## Direct Work refresh

- A direct browser load or refresh of `/work` does not play the route camera transition.
- It displays the Work page immediately and replays only the Hero outline-to-particle sequence.
- The camera transition runs only when client-side navigation crosses the Work route boundary.

## Scope and reduced motion

- Only the desktop transition is redesigned and verified in this task.
- No new mobile transition rules, motion parameters, or mobile regression work are included.
- Reduced-motion users skip camera zoom, refraction, blur, and particle gathering; navigation swaps immediately to the stable destination.

## Verification

- Unit-test exact enter/exit endpoints, midpoint maximum scale, and stable final-frame values.
- Build the Astro project.
- Browser-test Work refresh, Home → Work, Work → Home, repeated cached entry, and reduced motion on desktop.
- Confirm all six Work chapters remain present and transition clones are empty after cleanup.
