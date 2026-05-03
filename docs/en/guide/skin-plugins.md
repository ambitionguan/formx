# Skins and Plugins

The current Vue + Element Plus renderer is a skin, not the whole FormX architecture.

```txt
@formx/core
  -> logic runtime
@formx/ui-core
  -> framework-neutral view model
@formx/vue-ep
  -> Vue + Element Plus rendering skin
```

## What skins do

Skins map `FieldView` and `FormView` into concrete components, layouts, errors, field-group interactions, and DOM behavior such as scrolling to errors.

Skins should not re-implement rules, own a separate value tree, or run resources outside the engine contract.

## Custom fields

```ts
{
  id: 'userPicker',
  type: 'custom',
  label: 'User',
  component: 'UserPicker'
}
```

```vue
<FormX :schema="schema" :components="{ UserPicker }" />
```

Custom components should follow the field protocol: receive value and state, emit changes, and respect disabled, readOnly, loading, and error states.

## New skin checklist

- Reuse `@formx/core` and `@formx/ui-core`.
- Map all supported field types.
- Implement common field wrappers.
- Implement containers and `field-group`.
- Bridge custom components.
- Expose consistent form methods.
