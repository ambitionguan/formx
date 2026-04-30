# API Overview / API 总览

## Public Entries / 公共入口

| Entry | Main exports |
| --- | --- |
| `@formx/core` | `FormXEngine`, `ResourceManager`, schema/rule/validation types |
| `@formx/ui-core` | `FormView`, `FieldView`, container and field-group view types |
| `@formx/vue-core` | `useFormXEngine`, `useFormViewState`, exposed form helpers |
| `@formx/vue-ep` | `FormX`, `FormXVueEp`, Element Plus skin styles |
| `@formx/vue` | Default Vue entry for most applications |

## Runtime Methods / 运行时方法

Common `FormXEngine` methods:

```ts
engine.dispatch('init')
engine.setValue('path.to.field', value)
engine.getValues()
engine.getState()
engine.validate()
engine.validatePath('path.to.field')
engine.getErrors()
engine.getDiagnostics()
```

Common Vue component exposed methods:

```ts
formRef.value.validate()
formRef.value.resetFields()
formRef.value.getValues()
formRef.value.validateField('path.to.field')
formRef.value.getFieldGroupAPI('items')
```

完整 API 文档后续会按 `core`、`ui-core`、`vue-core`、`vue-ep` 分页展开。

Full API docs will be expanded by package: `core`, `ui-core`, `vue-core`, and `vue-ep`.
