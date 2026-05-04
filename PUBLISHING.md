# Publishing

This document covers the first public release workflow for FormX.

## Repository

The package metadata currently points to:

```txt
https://github.com/ambitionguan/formx
```

If the GitHub repository uses a different owner or name, update these fields before publishing:

- root `package.json` `repository`, `bugs`, `homepage`
- every `packages/*/package.json` `repository`, `bugs`, `homepage`
- docs nav GitHub links in `docs/.vitepress/config.ts`
- docs deploy base in `.github/workflows/docs.yml`

## Docs Deployment

The docs site is built with VitePress.

For the default GitHub Pages URL:

```txt
https://ambitionguan.github.io/formx/
```

the workflow sets:

```txt
DOCS_BASE=/formx/
```

Local development still runs at the root path:

```bash
pnpm docs:dev
pnpm docs:build
```

GitHub setup:

1. Open the repository on GitHub.
2. Go to `Settings -> Pages`.
3. Set `Build and deployment -> Source` to `GitHub Actions`.
4. Push to `main`, or run the `Deploy Docs` workflow manually.

If you use a custom domain, change the docs workflow `DOCS_BASE` to `/` and configure the domain in GitHub Pages.

## npm Scope

The public package names are:

```txt
@formxjs/core
@formxjs/ui-core
@formxjs/vue-core
@formxjs/vue-ep
@formxjs/vue
```

The npm account or organization must own the `@formx` scope.

Do not commit npm tokens. For GitHub Actions publishing, add a repository secret:

```txt
NPM_TOKEN
```

The token needs permission to publish packages under the `@formx` scope.

## First Release Recommendation

For the first public release, publish with the `alpha` dist-tag:

```bash
npm publish ./packages/core --access public --tag alpha
npm publish ./packages/ui-core --access public --tag alpha
npm publish ./packages/vue-core --access public --tag alpha
npm publish ./packages/vue-ep --access public --tag alpha
npm publish ./packages/vue --access public --tag alpha
```

When the API is ready to be installed by default:

```bash
npm dist-tag add @formxjs/core@0.1.0 latest
npm dist-tag add @formxjs/ui-core@0.1.0 latest
npm dist-tag add @formxjs/vue-core@0.1.0 latest
npm dist-tag add @formxjs/vue-ep@0.1.0 latest
npm dist-tag add @formxjs/vue@0.1.0 latest
```

## GitHub Actions Publish

The `Publish Packages` workflow is manual.

Inputs:

- `tag`: `alpha` or `latest`
- `dry_run`: defaults to `true`

Recommended sequence:

1. Run `Publish Packages` with `dry_run=true`.
2. Verify the dry-run output.
3. Run `Publish Packages` with `dry_run=false` and `tag=alpha`.

The workflow publishes packages in dependency order:

```txt
@formxjs/core
@formxjs/ui-core
@formxjs/vue-core
@formxjs/vue-ep
@formxjs/vue
```

## Local Verification

Run this before publishing:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm docs:build
pnpm --filter @formxjs/example-vue-ep-basic typecheck
pnpm --filter @formxjs/example-vue-ep-basic build
```

Verify package contents:

```bash
npm pack ./packages/core --dry-run
npm pack ./packages/ui-core --dry-run
npm pack ./packages/vue-core --dry-run
npm pack ./packages/vue-ep --dry-run
npm pack ./packages/vue --dry-run
```
