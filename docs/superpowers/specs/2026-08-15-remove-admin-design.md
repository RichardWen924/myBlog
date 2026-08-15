# Remove Admin Design

## Goal

Temporarily remove the admin application completely so the repository only ships the personal page's static presentation. The admin can be rebuilt later as a separate effort.

## Scope

- Delete the complete `admin/` directory, including its Vite frontend, Node API server, package manifest, and lockfile.
- Keep `packages/content-contracts/` because the static site imports its shared TypeScript types.
- Do not alter the static site's pages, data, content, or existing unrelated working-tree changes.

## Verification

- Search the repository for admin runtime/configuration references and confirm none remain outside deleted files.
- Run the static site's existing test command: `npm test`.
- Run the static site's production build: `npm run build`.

