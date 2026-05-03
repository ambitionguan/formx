# Performance

Complex forms need controlled recomputation, resource governance, scalable array handling, and diagnostics.

## Engine options

```ts
const engine = new FormXEngine({
  schema,
  performance: {
    useGraph: 'auto',
    liteRuleThreshold: 30,
    recalcScope: 'siblings',
    debug: true
  }
})
```

| Option | Meaning |
| --- | --- |
| `useGraph` | `auto`, `on`, or `off`. |
| `liteRuleThreshold` | Rule-count threshold for choosing execution strategy. |
| `recalcScope` | Recalculation range for wildcard rules. |
| `maxHops` | Prevents infinite linkage loops. |
| `aggregateCache` | Caches aggregate expression results. |

## Diagnostics

```ts
const diagnostics = engine.getDiagnostics()
```

Diagnostics help inspect executor type, rule count, path registry, graph state, last hits, and validation details.

## Advice

- Keep `watch` paths precise.
- Use `scope` and `$self` for array rules.
- Use resource debounce and TTL.
- Avoid expensive async validation on every input event.
- Turn on diagnostics in development and turn off debug in production.
