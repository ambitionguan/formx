# Package Boundaries

FormX uses multiple packages so the core logic, view protocol, framework runtime, and UI skin can evolve independently.

| Package | Responsibility | UI dependency |
| --- | --- | --- |
| `@formxjs/core` | Schema, rules, expressions, values, state, validation, resources, diagnostics. | No |
| `@formxjs/ui-core` | Converts engine state into framework-neutral view models. | No |
| `@formxjs/vue-core` | Vue lifecycle and reactivity adapters. | Vue |
| `@formxjs/vue-ep` | Vue + Element Plus skin. | Vue and Element Plus |
| `@formxjs/vue` | Recommended Vue entry for applications. | Vue packages |

## Why split packages

Splitting packages keeps `@formxjs/core` usable in designers, tests, Node.js, and future non-Vue renderers. It also avoids forcing UI dependencies onto users who only need the engine.

Most Vue + Element Plus apps should install:

```bash
pnpm add @formxjs/vue vue element-plus
```

Headless-only usage:

```bash
pnpm add @formxjs/core
```

Custom skin authors usually depend on:

```bash
pnpm add @formxjs/core @formxjs/ui-core
```

## Future Package Naming

Future React or custom UI skins should keep the same layering:

| Scenario | Suggested package | Notes |
| --- | --- | --- |
| React framework adapter | `@formxjs/react-core` | React hooks, subscriptions, ref handle, and view state. |
| React + Ant Design skin | `@formxjs/react-antd` | Render `FieldView` with Ant Design components. |
| Recommended React entry | `@formxjs/react` | Application-facing entry that aggregates the React adapter and default skin. |
| Vue + another UI library | `@formxjs/vue-naive`, `@formxjs/vue-antd` | Reuse `@formxjs/vue-core` and replace only the skin. |
| Internal design system | `@formxjs/vue-company-ui` or `@formxjs/react-company-ui` | Reuse Core and UI Core, render with company components. |

These packages should not re-implement rules, resources, or validation. Framework packages adapt lifecycle and reactivity; skin packages consume the `@formxjs/ui-core` view model.
