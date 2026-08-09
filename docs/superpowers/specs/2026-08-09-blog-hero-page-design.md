# Blog Hero Page Design

## Goal

Upgrade `/blog` from a plain archive heading into an editorial landing page that welcomes visitors, makes article discovery immediate, and still exposes the complete archive below the fold.

The reference image supplies the composition only: a large welcome line, a prominent search field, a short recent-updates block, and a downward continuation cue. The visual language remains the existing site's default system: warm paper background, serif display type, mono metadata, quiet borders, and sage/warm accents.

## Scope

### In scope

- Replace the current `/blog` page heading with a responsive Hero section.
- Show the three newest published posts by default in the Hero's recent-updates block.
- Add client-side, live article search in the Hero.
- Search all published posts, including posts older than the three default recent posts.
- Preserve the existing year-grouped archive below the Hero.
- Preserve existing article routes, Header, Footer, and content collection APIs.

### Out of scope

- Changes to the homepage, article detail layout, content schema, or CMS/admin behavior.
- New visual tokens, external font dependencies, image assets, or backend search endpoints.
- Pagination, tag filters, fuzzy ranking, or persisted search state.

## Page structure

The `/blog` page will render the following regions in order:

1. `blog-hero`: a near-viewport-height introduction with a restrained background treatment derived from existing paper/border/accent tokens.
2. `blog-hero__eyebrow`: a compact mono label such as `WELCOME, BLOG`.
3. `blog-hero__title`: a large serif title communicating that this is the personal archive.
4. `blog-search`: an accessible search form with a text input, search icon, and clear control that appears when the query is non-empty.
5. `blog-results`: the recent-updates list. With an empty query it contains the three newest posts. With a query it contains every matching published post.
6. `blog-scroll-cue`: a link to the archive section, with visible text and a decorative downward arrow.
7. `blog-archive`: the existing year-grouped list, wrapped in a stable anchor target.

The Hero must remain useful when there are no posts: the search control is still rendered, the result area shows a calm empty message, and the archive uses the existing `No posts yet.` state.

## Data flow and interaction

The page will continue to call `getPublishedPosts()` at build/render time. Each post will be normalized into the minimal client payload needed by the result list: title, slug, date, excerpt/description when available, and tags when available.

The Hero result list will be a small client-side island implemented with the framework already present in the repository. It will:

- initialize with the newest three posts;
- update on every input event without a submit or page reload;
- match case-insensitively against title, description/excerpt, and tags;
- show an explicit result count or no-results state;
- provide links to the existing `/blog/[...slug]` routes;
- clear the query and return to the newest three posts when the clear control is activated.

The full archive remains server-rendered and is not removed or mutated by search. The scroll cue targets the archive anchor and is keyboard-accessible.

## Visual direction

Use existing tokens and conventions:

- background: `--color-paper` with `--color-surface` for the search field;
- text: `--color-ink` and `--color-ink-soft`;
- accent: `--color-accent` for active/focus/arrow states and `--color-warm` for a restrained highlight;
- typography: `--font-serif` for the title and `--font-mono` for labels, dates, and utility text;
- borders and dividers: `--color-border`;
- motion: short opacity/translate reveal only, disabled or reduced under `prefers-reduced-motion`.

The reference's rounded search-bar silhouette is retained as a modest radius consistent with the existing site, without introducing a new card/grid system. The composition should feel spacious on desktop and stack naturally on small screens. The Hero's minimum height must account for the existing site header so the scroll cue is visible without clipping.

## Accessibility and responsive behavior

- Use a real `<form role="search">` with a visible label or an equivalent screen-reader label.
- The input must have a clear focus ring, usable placeholder, and `aria-controls` pointing to the result region.
- Result updates must be announced through a concise `aria-live="polite"` status without stealing focus.
- The clear button must have an accessible name and remain keyboard reachable.
- Links and controls must retain visible hover/focus states and meet the existing contrast approach.
- On mobile, the title, search field, result rows, and scroll cue remain in one readable column; no horizontal overflow is allowed.
- Respect `prefers-reduced-motion: reduce` for Hero reveal and scroll cue animation.

## Verification

Add or update focused tests to verify:

- the page contains the welcome label, search form, result region, scroll cue, and archive anchor;
- default Hero output is limited to three recent posts;
- the client search payload and matching fields include all published posts;
- clear/no-result semantics and article links are present;
- existing full archive rendering remains intact.

Run the project's relevant Node tests and `npm run build`. Manually inspect the rendered `/blog` page at desktop and narrow viewport widths when the local server is available.

## Decision

Implement a single-purpose blog Hero/results island above the existing archive, using the default visual system and client-side search over the already-loaded published-post collection. This keeps the page fast and self-contained while satisfying the requested composition and preserving existing content behavior.
