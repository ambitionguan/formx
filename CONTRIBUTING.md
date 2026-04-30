# Contributing

Thanks for taking the time to improve FormX.

## Development

```sh
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @formx/example-vue-ep-basic typecheck
pnpm --filter @formx/example-vue-ep-basic build
```

## Pull Requests

- Keep changes focused and include tests when behavior changes.
- Update documentation when public APIs, package names, schema fields, or examples change.
- Do not commit credentials, private customer data, internal URLs, or generated dependency folders.
- For package changes, run `npm pack --dry-run --json` from the affected package before publishing.

## Package Boundaries

- `@formx/core`: headless schema, rules, validation, resources, paths, and diagnostics.
- `@formx/ui-core`: framework-neutral view model and field-group commands.
- `@formx/vue-core`: Vue runtime bridge and composables.
- `@formx/vue-ep`: Vue + Element Plus skin.
- `@formx/vue`: default Vue entry point.
