# Work Transition Smoothing Design

## Goal

Improve the Archive-to-Work theme transition so that the camera motion feels continuous, the 100% arrival does not repeat or flash, and the `BUILD FUTURE` outline and particle treatments share the same visual geometry.

## Approved arrival sequence

The Work transition uses the approved “outline first, then particle” sequence:

1. The camera approaches and expands the Work portal.
2. At 100%, the transition target settles on a stable outline `BUILD FUTURE` wordmark.
3. The transition target hands off to the live Work page without changing the visible wordmark geometry.
4. After a short settling pause, the live outline transitions into particles exactly once.

The outline must not redraw after the handoff. The particle animation belongs only to the live Work Hero.

## Motion model

- Keep one normalized transition clock so the progress indicator, portal, camera, blur, scale, and speed field cannot drift apart.
- Use endpoint-smooth easing for camera and portal motion. Both velocity and visual acceleration should taper near 0% and 100%.
- Reserve the final portion of the clock for settling rather than continued high-speed scale growth.
- Keep the current semantic reverse when leaving Work, with the same smooth endpoints.
- Preserve the reduced-motion path, which swaps immediately without decorative transition layers.

## Hero handoff

- While a Work navigation is active, the live Hero starts in an arrival state: a fully resolved outline with its autonomous mount animation paused.
- The transition clone shows the same static outline state.
- After Astro swaps pages, cleanup removes the clone only after the live Hero is ready and an animation frame has painted it.
- Cleanup emits one completion event. `FutureHero` consumes this event once, waits for a short settle interval, and then mounts the particle treatment.
- Direct visits to `/work` use the same contract as client-side navigation.

This removes the current sequence where the clone displays one proxy wordmark and the live SVG immediately restarts a different drawing animation.

## Shared wordmark geometry

The transition proxy, SVG outline, and canvas particles share one typography contract:

- font family: resolved `--font-serif` (`Newsreader`, with the existing fallbacks)
- font weight: `800`
- letter spacing: one responsive token
- visual width and height: one responsive wordmark container
- horizontal fit limit: one shared percentage of the container width
- centered baseline and vertical optical offset: one shared rule

`ParticleText` must support letter spacing during measurement and drawing. It must wait for document fonts before sampling. The StrokeText layer must fill the same wordmark box instead of using an unrelated fixed rendered height.

Responsive rules change the shared geometry tokens, not individual component font sizes. This prevents desktop and mobile variants from diverging again.

## State ownership

- The route transition controller owns portal/camera progress and the transition-complete event.
- `FutureHero` owns the outline-to-particle sequence.
- Shared constants or CSS custom properties own typography and settle timings.
- `ParticleText` owns particle sampling and gathering, but not route-transition timing.

## Accessibility and resilience

- Preserve progressbar semantics and percentage updates.
- Keep transition clones inert and hidden from assistive technology.
- Do not delay navigation indefinitely if React hydration is unavailable; cleanup uses a bounded readiness fallback.
- With reduced motion, show the stable particle wordmark without the camera or gathering animation.
- Resize and font-load changes resample the particle geometry without replaying route navigation.

## Verification

- Unit-test endpoint smoothness and enter/exit endpoint values in the pure motion model.
- Unit-test the single-fire completion contract where practical.
- Build the Astro project.
- Test direct `/work`, Archive-to-Work, Work-to-Archive, repeated navigation, mobile viewport, and reduced-motion behavior in the browser.
- At the handoff frame, compare the transition outline and live outline bounding boxes and verify that they do not visibly jump.
