# Package Boundaries

FormX uses multiple packages so the core logic, view protocol, framework runtime, and UI skin can evolve independently.

| Package | Responsibility | UI dependency |
| --- | --- | --- |
| `@formx/core` | Schema, rules, expressions, values, state, validation, resources, diagnostics. | No |
| `@formx/ui-core` | Converts engine state into framework-neutral view models. | No |
| `@formx/vue-core` | Vue lifecycle and reactivity adapters. | Vue |
| `@formx/vue-ep` | Vue + Element Plus skin. | Vue and Element Plus |
| `@formx/vue` | Recommended Vue entry for applications. | Vue packages |

## Why split packages

Splitting packages keeps `@formx/core` usable in designers, tests, Node.js, and future non-Vue renderers. It also avoids forcing UI dependencies onto users who only need the engine.

Most Vue + Element Plus apps should install:

```bash
pnpm add @formx/vue vue element-plus
```

Headless-only usage:

```bash
pnpm add @formx/core
```

Custom skin authors usually depend on:

```bash
pnpm add @formx/core @formx/ui-core
```

## Future Package Naming

Future React or custom UI skins should keep the same layering:

| Scenario | Suggested package | Notes |
| --- | --- | --- |
| React framework adapter | `@formx/react-core` | React hooks, subscriptions, ref handle, and view state. |
| React + Ant Design skin | `@formx/react-antd` | Render `FieldView` with Ant Design components. |
| Recommended React entry | `@formx/react` | Application-facing entry that aggregates the React adapter and default skin. |
| Vue + another UI library | `@formx/vue-naive`, `@formx/vue-antd` | Reuse `@formx/vue-core` and replace only the skin. |
| Internal design system | `@formx/vue-company-ui` or `@formx/react-company-ui` | Reuse Core and UI Core, render with company components. |

These packages should not re-implement rules, resources, or validation. Framework packages adapt lifecycle and reactivity; skin packages consume the `@formx/ui-core` view model.
