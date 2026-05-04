# Frameworks and Skins

FormX does not hard-code the UI layer. The current open-source packages ship a Vue + Element Plus implementation, but that implementation is only one official skin.

The stable boundary is:

```txt
@formx/core
  -> rules, state, values, resources, validation, diagnostics

@formx/ui-core
  -> framework-neutral FormView / FieldView protocol

framework adapter
  -> bind the engine and view runtime to Vue, React, or another lifecycle model

skin
  -> render FieldView / FormView with a concrete component library
```

This is what makes future React, Ant Design Vue, Naive UI, Ant Design React, internal design system, or Web Components skins possible without copying the rule engine.

## Current Official Implementation

The current repository ships the Vue stack:

| Package | Layer | Responsibility |
| --- | --- | --- |
| `@formx/core` | Core engine | Runs schema, rules, resources, validation, values, and diagnostics. |
| `@formx/ui-core` | UI protocol | Builds `FormView`, `FieldView`, containers, and field-group views from the engine. |
| `@formx/vue-core` | Vue adapter | Provides `useFormXEngine`, `useFormViewState`, exposed form methods, and Vue state helpers. |
| `@formx/vue-ep` | Vue skin | Renders view models with Element Plus forms, fields, groups, and layouts. |
| `@formx/vue` | App entry | Aggregates the Vue runtime and the default Element Plus skin. |

There is no official React package yet. A React implementation should follow the same boundary instead of adding React behavior to `@formx/core`.

## Two Extension Types

FormX UI extension has two separate concerns.

### Framework Adapters

A framework adapter answers: how does the engine participate in a framework lifecycle and reactive model?

It should:

- Create or receive a `FormXEngine`.
- Sync external `value/defaultValue/schema/policy/messages` into the engine.
- Subscribe to engine changes and trigger framework renders.
- Use `@formx/ui-core` to build `FormView`.
- Expose form methods such as `validate()`, `resetFields()`, and `getValues()`.
- Dispose subscriptions and runtime state on unmount.

It should not:

- Render concrete input components.
- Hard-code Element Plus, Ant Design, or another UI library.
- Recompile rules or maintain another value tree.

`@formx/vue-core` is the Vue adapter. A future React stack can provide `@formx/react-core` with `useFormXEngine()`, `useFormViewState()`, and `createFormXHandle()`.

### Skins

A skin answers: how does a `FieldView` become concrete UI?

It should:

- Map `FieldView` to inputs, selects, date pickers, uploads, custom components, and other controls.
- Map `FormView` and `ContainerView` to layouts.
- Render labels, required state, help text, tooltips, errors, loading, disabled, and readOnly.
- Implement `field-group` add, remove, copy, sort, tabs, tables, cards, and lists.
- Bridge custom components.
- Provide DOM behavior such as `scrollToField(path)`.

It should not:

- Compile `rulesV2`.
- Run resources outside the engine contract.
- Mutate field state by bypassing Core.
- Keep business values inside controls in a way that conflicts with the engine.

`@formx/vue-ep` is the Vue + Element Plus skin. A React + Ant Design skin could be `@formx/react-antd`; a Vue skin for an internal design system could be `@formx/vue-company-ui`.

## React Extension Path

A React stack should be split into three packages:

```txt
@formx/react-core
  -> React hooks, subscriptions, ref handle, view state

@formx/react-antd
  -> React + Ant Design skin

@formx/react
  -> recommended React entry that aggregates react-core and the default skin
```

These names are recommendations; they are not published by the current repository. The important boundary is:

- `@formx/react-core` depends only on React, `@formx/core`, and `@formx/ui-core`.
- `@formx/react-antd` depends on React, Ant Design, and `@formx/react-core`.
- `@formx/react` exports the recommended application-facing component and types.

A minimal React adapter can follow this shape:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { FormXEngine } from '@formx/core'
import { createFormViewRuntime } from '@formx/ui-core'

export function useFormXEngine(props) {
  const engine = useMemo(() => {
    return props.engine ?? new FormXEngine({
      schema: { ...props.schema, model: props.value ?? props.defaultValue ?? props.schema.model }
    })
  }, [props.engine, props.schema])

  useEffect(() => {
    engine.dispatch('init')
  }, [engine])

  return engine
}

export function useFormViewState(engine, schema) {
  const runtime = useMemo(() => createFormViewRuntime(engine, schema), [engine, schema])
  const [version, setVersion] = useState(0)

  useEffect(() => runtime.subscribe(() => setVersion((v) => v + 1)), [runtime])

  useEffect(() => () => runtime.dispose(), [runtime])

  return useMemo(() => runtime.getFormView(), [runtime, version])
}
```

This snippet explains the structure, not a current public API. A production implementation also needs external value sync, schema updates, message resolvers, policy handling, subscription cleanup, and submit events.

The React skin then consumes the adapter:

```tsx
import { forwardRef, useImperativeHandle } from 'react'
import { Form } from 'antd'
import { useFormXEngine, useFormViewState, createFormXHandle } from '@formx/react-core'

export const FormXReactAntd = forwardRef(function FormXReactAntd(props, ref) {
  const engine = useFormXEngine(props)
  const formView = useFormViewState(engine, props.schema)

  useImperativeHandle(ref, () => createFormXHandle(engine), [engine])

  return (
    <Form layout={formView.formUi.labelPosition === 'top' ? 'vertical' : 'horizontal'}>
      {formView.containers.map((container) => (
        <ContainerRenderer key={container.path || container.id} view={container} />
      ))}
    </Form>
  )
})
```

`ContainerRenderer`, `FieldRenderer`, and `FieldGroupRenderer` should only consume view models and component-library mappings. They should not know how rules are executed.

## Field Renderer Mapping

Every skin needs a field renderer map:

```ts
const fieldRenderers = {
  input: InputField,
  number: NumberField,
  textarea: TextareaField,
  select: SelectField,
  checkbox: CheckboxField,
  radio: RadioField,
  switch: SwitchField,
  'date-picker': DatePickerField,
  'field-group': FieldGroupRenderer,
  custom: CustomField
}
```

A field renderer should generally receive:

```ts
type FieldRendererProps = {
  view: FieldView
  components?: Record<string, unknown>
}
```

The control reads from `view.value`, writes through `view.setValue(next)`, and calls `view.validate?.('change')` or `view.validate?.('blur')` at the appropriate time.

## Custom Component Protocol

Use `custom` fields when built-in controls are not enough. The schema stores a component key, not a component instance:

```ts
{
  id: 'userPicker',
  type: 'custom',
  label: 'User Picker',
  component: 'UserPicker',
  props: {
    multiple: true
  }
}
```

Vue skins pass components at runtime:

```vue
<FormX :schema="schema" :components="{ UserPicker }" />
```

React skins can use the same pattern:

```tsx
<FormX schema={schema} components={{ UserPicker }} />
```

Custom components should:

- Receive the current value and field state.
- Write values through the standard callback.
- Respect `disabled`, `readOnly`, `loading`, `required`, and `errors`.
- Avoid mutating the external model directly.
- Avoid running requests that conflict with the FormX resource layer.

## New Skin Checklist

1. Decide whether you are replacing only the UI library or the framework too.
2. If you only replace the Vue UI library, reuse `@formx/vue-core`.
3. If you move to React, build a framework adapter similar to `@formx/react-core` first.
4. Use `@formx/ui-core` to build `FormView`.
5. Map every supported field type.
6. Implement common field wrappers: label, required, error, help, loading.
7. Implement containers, layout, and `field-group`.
8. Bridge custom components.
9. Expose the same core API as the official Vue skin.
10. Document a capability matrix for supported field types and known limitations.

## Recommended API

Skins should expose a consistent application-facing API:

```ts
validate()
validateField(path)
resetFields()
clearValidate()
setValues(values, options)
setFieldValue(path, value)
getValues()
getSubmitValues()
getErrors()
getFirstErrorPath()
scrollToField(path)
getFieldGroupAPI(path)
```

This keeps application submission and validation code stable when moving from Vue + Element Plus to React + Ant Design, or from an open-source UI library to an internal design system.

## Design Rules

- Core is the only source of rules and value state.
- UI Core is the shared view protocol between skins.
- Framework adapters handle lifecycle and reactivity, not component-library rendering.
- Skins consume view models and do not parse raw rules.
- Custom components follow the field protocol and do not bypass the engine.
- Package names and exports should stay clear, so applications do not depend on internal paths.
- Skin documentation must list supported field types, layout capabilities, and limitations.

When these boundaries are respected, FormX is not an Element Plus form wrapper. It is a cross-framework runtime for complex business forms.
