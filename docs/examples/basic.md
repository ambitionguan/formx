<script setup>
import BasicFormDemo from '../.vitepress/theme/components/formx/BasicFormDemo.vue'
</script>

# 基础表单

这个示例展示最小 Vue + Element Plus 接入：`FormX` 组件负责渲染，业务侧通过 `v-model:value` 持有模型，通过 `validate()` 触发表单校验。

<ClientOnly>
  <BasicFormDemo />
</ClientOnly>

核心用法：

```vue
<FormX ref="formRef" v-model:value="formModel" :schema="schema" />
```

```ts
const valid = await formRef.value?.validate()
if (valid) {
  const values = formRef.value?.getValues()
}
```

这个例子适合确认三件事：

- schema 能驱动字段渲染。
- 表单值由业务侧持有。
- 校验和提交通过 FormX 暴露 API 完成。
