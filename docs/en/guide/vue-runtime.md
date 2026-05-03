# Vue Runtime

The recommended Vue entry is `@formx/vue`. It lets application code use FormX like a normal form component while the core engine stays independent.

## Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormX } from '@formx/vue'
import '@formx/vue/style.css'

const formRef = ref<InstanceType<typeof FormX>>()
const model = ref({ name: '', enabled: true })

const schema = {
  version: '1.0.0',
  model: model.value,
  fields: [
    { id: 'name', type: 'input', label: 'Name', rules: [{ required: true }] },
    { id: 'enabled', type: 'switch', label: 'Enabled' }
  ]
}
</script>

<template>
  <FormX ref="formRef" v-model:value="model" :schema="schema" />
</template>
```

## Exposed methods

```ts
await formRef.value?.validate()
formRef.value?.resetFields()
formRef.value?.setValues(values, { replace: true })
formRef.value?.setFieldValue('name', 'demo')
formRef.value?.getValues()
formRef.value?.getSubmitValues()
formRef.value?.getErrors()
formRef.value?.getFirstErrorPath()
formRef.value?.getFieldGroupAPI('rules')
```

## Dialogs and drawers

Protect async detail loading against race conditions:

```ts
let sessionId = 0

async function openEdit(id: string) {
  visible.value = true
  const current = ++sessionId
  const detail = await api.detail(id)
  if (current !== sessionId) return
  formRef.value?.setValues(detail, { replace: true })
}

function close() {
  sessionId++
  visible.value = false
}
```

## Custom components

Use `custom` fields and pass runtime components:

```ts
{
  id: 'userPicker',
  type: 'custom',
  component: 'UserPicker'
}
```

```vue
<FormX :schema="schema" :components="{ UserPicker }" />
```
