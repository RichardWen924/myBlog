# Remove BUILD FUTURE Outline Animation Design

## Goal

Make the Work page's `BUILD FUTURE` hero show its particle wordmark immediately, without the initial outline stage or its delay.

## Scope

- Remove the `particleReady` state and timer from `FutureHero.tsx`.
- Render the existing `ParticleText` element immediately with its current visual parameters.
- Remove the outline layer and outline-to-particle transition CSS from `work.css`.
- Preserve the particle interaction, colors, typography, responsive sizing, and all other Work animations.

## Validation

- Add a regression test that verifies the hero source no longer contains the outline stage or delayed readiness logic.
- Run the full test suite and production build.
