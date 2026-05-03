# Introduction

FormX is a headless dynamic form engine for complex business applications. It describes business forms with JSON, executes state, linkage, validation, and remote resources in an independent core engine, then renders framework-neutral view models through replaceable UI skins.

It is not just a renderer for a few input fields. FormX is designed for forms with many fields, nested structures, dynamic arrays, remote options, async validation, and schema-driven product workflows.

## What FormX solves

| Problem | Traditional approach | FormX approach |
| --- | --- | --- |
| Repeated fields | Handwrite form items per page | Describe reusable fields with schema |
| Scattered linkage | Watchers and event callbacks | Centralize linkage with shortcuts and `rulesV2` |
| Remote options | Requests hidden inside components | Register resources once and bind them by key |
| Dynamic arrays | Handwrite add/remove/path/error logic | Use `field-group` and scoped rules |
| UI lock-in | Logic tied to one UI library | Keep logic in Core and render through skins |
| Hard to govern | Business rules hidden in code | Store, review, generate, and replay JSON DSL |

## Strengths

**Headless Core**  
`@formx/core` runs without Vue, React, or Element Plus. It can be used in browsers, Node.js, designers, tests, and preview tools.

**Unified Rules**  
Shortcuts such as `showWhen`, `requiredWhen`, `compute`, and `optionsFrom` compile into the same rule pipeline as `rulesV2`.

**Nested Business Models**  
FormX supports objects, dynamic arrays, nested arrays, `$self`, `$parent`, `$root`, and pattern paths. It is not limited to flat forms.

**Resource Runtime**  
Remote options, cascades, async validation, and business queries can be managed by `ResourceManager` with declarative params and runtime refresh.

**Replaceable Skins**  
The current Vue + Element Plus skin proves the model, while Core and UI Core stay reusable for other renderers.

## Runtime model

```txt
schema.json
  -> @formx/core
     compile shortcuts, execute rules, own values/state/resources/validation
  -> @formx/ui-core
     build FormView / FieldView / FieldGroupView
  -> @formx/vue-ep or another skin
     render into Vue, Element Plus, or a future UI stack
```

## When to use it

FormX fits:

- Admin CRUD dialogs and drawers.
- Policy configuration, connection configuration, approval workflows, and permission matrices.
- Low-code or configuration platforms that store form schema on the server.
- Designers that need preview, validation, export, and replay.
- Products that want one rule runtime with multiple UI skins.

For a very small static form with no reuse, no linkage, and no schema requirement, a native UI library form may be enough.
