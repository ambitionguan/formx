# Package Architecture

FormX is published as small packages with explicit dependency direction:

```text
@formx/core
  -> @formx/ui-core
    -> @formx/vue-core
      -> @formx/vue-ep
        -> @formx/vue
```

## `@formx/core`

Pure headless engine. It owns schema types, rules, expression evaluation, validation, resources, path utilities, and diagnostics.

It must not depend on Vue, React, Element Plus, or app-level i18n.

## `@formx/ui-core`

Framework-neutral UI protocol. It converts engine state and schema into `FormView`, `FieldView`, container views, layout metadata, and commands.

It should not import Vue or Element Plus. React, Vue, Svelte, and Web Components adapters should be able to reuse it.

## `@formx/vue-core`

Vue runtime bridge. It handles Vue reactivity, engine lifecycle, `FormView` subscriptions, and composables.

It should not import Element Plus.

## `@formx/vue-ep`

Vue + Element Plus skin. It maps `FieldView` and `ContainerView` to Element Plus components and owns skin CSS.

## `@formx/vue`

Default convenience entry for Vue users. It re-exports the core engine, Vue runtime helpers, UI protocol types, and the Element Plus skin.
