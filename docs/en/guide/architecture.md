# Architecture

FormX treats complex forms as a runtime protocol rather than a single UI component.

```txt
@formxjs/core      headless runtime
@formxjs/ui-core   framework-neutral view protocol
@formxjs/vue-core  Vue reactivity and lifecycle adapter
@formxjs/vue-ep    Vue + Element Plus skin
@formxjs/vue       application entry
```

## Core

`@formxjs/core` parses schema, compiles shortcuts, executes `rulesV2`, owns values and field state, runs validation, manages resources, and exposes diagnostics.

It can run without UI:

```ts
import { FormXEngine } from '@formxjs/core'

const engine = new FormXEngine({ schema })
engine.dispatch('init')
engine.setValue('status', 'disabled')
console.log(engine.getDiagnostics())
```

## UI Core

`@formxjs/ui-core` converts engine state into `FormView`, `FieldView`, and `FieldGroupView`. Skins consume these view models instead of re-implementing form logic.

## Skin

A skin maps view models to concrete components. `@formxjs/vue-ep` renders them with Vue and Element Plus. A future React or internal design-system skin should reuse Core and UI Core.

## Design principles

- Keep schema serializable.
- Keep Core UI-independent.
- Keep skins focused on rendering and DOM behavior.
- Make diagnostics a first-class capability.
- Keep simple cases simple and complex cases governable.
