# Resources

Resources centralize remote options, cascades, async validation, and business queries.

## Register a request

```ts
import { ResourceManager } from '@formxjs/vue'

ResourceManager.register('getCities', async (params) => {
  return api.getCities(params)
})
```

## Bind from schema

```ts
{
  id: 'city',
  type: 'select',
  label: 'City',
  optionsFrom: {
    requestKey: 'getCities',
    params: {
      province: '${province}'
    }
  }
}
```

## Why it matters

Requests stay outside schema while schema remains declarative. The runtime can manage params, refresh, cache, debounce, retry, and diagnostics.

## Advice

- Use TTL for dictionaries.
- Use debounce and latest strategy for search.
- Clear downstream values when cascade parents change.
- Keep request implementations in runtime registration, not inside schema.
