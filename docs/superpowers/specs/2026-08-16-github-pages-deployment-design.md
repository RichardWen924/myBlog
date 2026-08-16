# GitHub Pages Deployment Design

## Goal

Publish the current Astro site at `https://richardwen924.github.io/myBlog/` and automatically redeploy it whenever `main` changes.

## Deployment architecture

GitHub Actions will build the static Astro output and deploy the generated `dist/` directory with GitHub's official Pages actions. The repository's Pages build source will be set to GitHub Actions. The workflow will also support manual runs through `workflow_dispatch`.

The Astro configuration will use:

- `site: 'https://richardwen924.github.io'`
- `base: '/myBlog'`
- `output: 'static'`

This separates the GitHub Pages origin from the project-site path and lets Astro generate canonical URLs and sitemap entries for the final location.

## Base-path compatibility

The application currently contains root-relative links and public asset paths such as `/work` and `/favicon.svg`. On a project Pages site, those paths would point to the account root instead of `/myBlog/`.

Deployment work will introduce one base-path-aware URL convention and apply it to internal navigation, RSS, favicon, images, and dynamically generated blog or project links. Active-navigation matching will continue to operate on logical application paths so the `/myBlog` prefix does not change menu behavior.

External URLs and fragment-only links will remain unchanged.

## GitHub Actions workflow

The workflow will:

1. Trigger on pushes to `main` and on manual dispatch.
2. Check out the repository.
3. Configure Pages metadata.
4. Install locked dependencies with `npm ci`.
5. Build the Astro site with `npm run build`.
6. Upload `dist/` as the Pages artifact.
7. Deploy through the protected `github-pages` environment.

Permissions will be limited to `contents: read`, `pages: write`, and `id-token: write`. Concurrency will prevent overlapping deployments while allowing an in-progress deployment to finish safely.

## Validation and release

Before publishing, run the repository's unit tests, Astro type/content checks, and a production build. Inspect the generated output for `/myBlog/` asset and navigation URLs. Then commit the approved current working tree together with the deployment changes, push the publishing branch, integrate it into `main`, and monitor the Pages workflow to completion.

Success means:

- the Pages workflow completes successfully;
- `https://richardwen924.github.io/myBlog/` returns the site;
- primary navigation, public images, favicon, RSS, blog pages, and project pages remain under `/myBlog/`;
- future pushes to `main` redeploy automatically.

## Failure handling

If checks or the build fail, do not publish until the failure is corrected. If GitHub Pages cannot be enabled through the API, retain the committed workflow and report the exact repository setting that must be changed. If deployment succeeds but the public URL is not immediately available, poll the Pages deployment status because GitHub's CDN may take a short time to update.
