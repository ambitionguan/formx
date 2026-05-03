<script setup>
import BasicFormDemo from '../../.vitepress/theme/components/formx/BasicFormDemo.vue'
</script>

# Basic Form

This example shows the smallest Vue + Element Plus integration.

<ClientOnly>
  <BasicFormDemo />
</ClientOnly>

```vue
<FormX ref="formRef" v-model:value="formModel" :schema="schema" />
```

```ts
const valid = await formRef.value?.validate()
const values = formRef.value?.getValues()
```
