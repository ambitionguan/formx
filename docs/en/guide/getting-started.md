# Getting Started

This page gets a Vue 3 + Element Plus FormX form running with rendering, validation, and submit values.

## Install

```bash
pnpm add @formx/vue vue element-plus
```

## Register styles

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@formx/vue/style.css'
import App from './App.vue'

createApp(App).use(ElementPlus).mount('#app')
```

## Create a schema

```ts
import type { FormSchema } from '@formx/vue'

export const schema: FormSchema = {
  version: '1.0.0',
  formId: 'account-create',
  model: {
    username: '',
    role: 'user',
    needReason: false,
    reason: ''
  },
  fields: [
    {
      id: 'username',
      type: 'input',
      label: 'Username',
      props: { placeholder: 'Enter username', clearable: true },
      rules: [{ required: true, message: 'Username is required' }]
    },
    {
      id: 'role',
      type: 'select',
      label: 'Role',
      props: {
        options: [
          { label: 'User', value: 'user' },
          { label: 'Admin', value: 'admin' }
        ]
      }
    },
    {
      id: 'needReason',
      type: 'switch',
      label: 'Require reason'
    },
    {
      id: 'reason',
      type: 'textarea',
      label: 'Reason',
      showWhen: 'needReason === true',
      requiredWhen: 'needReason === true'
    }
  ]
}
```

## Render in Vue

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormX } from '@formx/vue'
import { schema } from './schema'

const formRef = ref<InstanceType<typeof FormX>>()
const formModel = ref({ ...schema.model })

async function submit() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  console.log(formRef.value?.getValues())
}
</script>

<template>
  <FormX ref="formRef" v-model:value="formModel" :schema="schema" />
  <button type="button" @click="submit">Submit</button>
</template>
```

Next: read [Schema Model](/en/guide/schema), [Rules and Shortcuts](/en/guide/rules-and-shortcuts), and [Resources](/en/guide/resources).
