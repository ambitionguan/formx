# @formx/core

Headless FormX engine package. It contains schema types, rule execution, path helpers, validation, resource loading, and diagnostics without any UI framework dependency.

```ts
import { FormXEngine } from '@formx/core'

const engine = new FormXEngine({
  schema,
  messages: (key, params) => t(key, params)
})
```
