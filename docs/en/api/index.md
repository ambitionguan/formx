# API Overview

## Public entries

| Entry | Main exports |
| --- | --- |
| `@formxjs/core` | `FormXEngine`, `ResourceManager`, schema types, rule types, validation types. |
| `@formxjs/ui-core` | `FormView`, `FieldView`, `ContainerView`, `FieldGroupView`. |
| `@formxjs/vue-core` | `useFormXEngine`, `useFormViewState`, exposed form helpers. |
| `@formxjs/vue-ep` | `FormXVueEp`, Element Plus skin styles. |
| `@formxjs/vue` | Recommended Vue entry for applications. |

## Engine

```ts
const engine = new FormXEngine({
  schema,
  performance: { useGraph: 'auto' },
  policy: { validation: { mode: 'touched' } }
})
```

Common methods:

```ts
engine.dispatch('init')
engine.setValue('path.to.field', value)
engine.getValues()
engine.getSubmitValues()
engine.validate()
engine.validatePath('email')
engine.getErrors()
engine.getDiagnostics()
```

## ResourceManager

```ts
ResourceManager.register('getUsers', async (params) => api.users(params))
const users = await ResourceManager.fetch('getUsers', { keyword: 'tom' })
ResourceManager.invalidate('getUsers')
```

## Vue component methods

```ts
await formRef.value?.validate()
formRef.value?.resetFields()
formRef.value?.setValues(values, { replace: true })
formRef.value?.getValues()
formRef.value?.getSubmitValues()
formRef.value?.getErrors()
formRef.value?.getFirstErrorPath()
formRef.value?.getFieldGroupAPI('rules')
```
