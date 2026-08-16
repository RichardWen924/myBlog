# Work Page Style Alignment Design

## Goal

Make the Work page visually consistent with the site's primary paper-archive language used by Home, About, and Blog, while preserving Work's existing content structure, navigation, and motion behavior.

## Visual direction

The Work page will inherit the shared light paper system instead of defining a separate dark technology theme:

- paper and surface backgrounds use the global warm neutrals;
- primary text uses the global ink colors;
- sage remains the primary accent;
- terracotta remains the warm secondary accent;
- steel is retained only for secondary diagram details where it improves contrast.

The result should read as a notebook/archive chapter rather than a separate dark dashboard. Thin rules, numbered labels, restrained borders, and low-contrast paper illustrations remain the main visual vocabulary.

## Scope of changes

### Theme tokens

Remove or neutralize the `html.work-page` dark token overrides in `src/styles/work.css`. Keep the page-specific glow and image treatments, but recolor them through global variables and lower their contrast so they match the paper background.

### Work components

Update Work-specific selectors in `src/styles/work.css` for:

- the future hero wordmark and encrypted/decrypted text;
- the Who Am I information rails;
- skills orbit lines, nodes, and labels;
- timeline and project separators;
- the desktop and mobile chapter rail.

The existing React component APIs and chapter IDs remain unchanged. This is a style-only change; no navigation, content, or interaction behavior is intentionally altered.

### Responsive behavior

Keep the current mobile chapter rail fix: a centered, compact horizontal control that does not cover page content. Ensure the paper colors and focus states remain legible at both desktop and mobile breakpoints.

### Motion and accessibility

Preserve all existing transform/opacity animations and the `prefers-reduced-motion` rules. Focus outlines must maintain a visible accent contrast on the light surface. No new motion or persistent overlay will be introduced.

## Validation

- Run the unit test suite, Astro diagnostics, and production build.
- Inspect generated CSS for the absence of the dark Work background token and the presence of global paper/ink tokens.
- Check Work at desktop and mobile widths for readable contrast, consistent borders, and no horizontal overflow.
- Verify the chapter rail remains compact and does not cover the main content.

## Success criteria

- Work, Home, About, and Blog share the same warm paper background and core text hierarchy.
- Work retains its information architecture and motion-driven storytelling.
- No Work-specific dark canvas, neon treatment, or high-contrast dashboard appearance remains.
- Existing tests and static build continue to pass.
