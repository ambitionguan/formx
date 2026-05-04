# Contributing

Thanks for taking the time to improve FormX.

## Development

```sh
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @formxjs/example-vue-ep-basic typecheck
pnpm --filter @formxjs/example-vue-ep-basic build
```

## Pull Requests

- Keep changes focused and include tests when behavior changes.
- Update documentation when public APIs, package names, schema fields, or examples change.
- Do not commit credentials, private customer data, internal URLs, or generated dependency folders.
- For package changes, run `npm pack --dry-run --json` from the affected package before publishing.

## Package Boundaries

- `@formxjs/core`: headless schema, rules, validation, resources, paths, and diagnostics.
- `@formxjs/ui-core`: framework-neutral view model and field-group commands.
- `@formxjs/vue-core`: Vue runtime bridge and composables.
- `@formxjs/vue-ep`: Vue + Element Plus skin.
- `@formxjs/vue`: default Vue entry point.
