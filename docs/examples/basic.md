<script setup>
import BasicFormDemo from '../.vitepress/theme/components/formx/BasicFormDemo.vue'
</script>

# Basic Form / 基础表单

## 中文

这个示例展示最小 Vue + Element Plus 接入：`FormX` 组件负责渲染，业务侧通过 `v-model:value` 持有模型，通过 `validate()` 触发表单校验。

## English

This example shows the smallest Vue + Element Plus integration: `FormX` renders the schema, the app owns values through `v-model:value`, and `validate()` runs submit validation.

<ClientOnly>
  <BasicFormDemo />
</ClientOnly>

```vue
<FormX ref="formRef" v-model:value="formModel" :schema="schema" />
```

```ts
await formRef.value?.validate()
const values = formRef.value?.getValues()
```
