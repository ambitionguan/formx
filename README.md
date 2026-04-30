# FormX

Headless dynamic form engine with framework-neutral view models and Vue + Element Plus rendering packages.

## Packages

| Package | Role |
| --- | --- |
| `@formx/core` | Framework-agnostic schema, rules, validation, resources, path, expression, and engine APIs. |
| `@formx/ui-core` | Framework-neutral `FormView` / `FieldView` model and field-group command protocol. |
| `@formx/vue-core` | Vue runtime bridge and composables for engine/view state. |
| `@formx/vue-ep` | Vue + Element Plus skin. |
| `@formx/vue` | Default Vue entry that re-exports the common Vue + Element Plus stack. |

## Quick Start

```sh
pnpm add @formx/vue vue element-plus
```

```ts
import { FormX, FormXEngine } from '@formx/vue'

const schema = {
  model: { name: '' },
  fields: [{ id: 'name', type: 'input', label: 'Name', rules: [{ required: true }] }]
}

const engine = new FormXEngine({ schema })
```

```vue
<template>
  <FormX :schema="schema" :engine="engine" />
</template>
```

## Development

```sh
pnpm install
pnpm build
pnpm typecheck
pnpm dev
```

This repository is intentionally split so `@formx/core` can be used without Vue, Element Plus, or any in-app i18n runtime.
