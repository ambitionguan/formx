# Getting Started / 快速开始

## 中文

安装 Vue 默认入口和运行时依赖：

```sh
pnpm add @formx/vue vue element-plus
```

在入口文件加载 Element Plus 和 FormX 皮肤样式：

```ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@formx/vue-ep/style.css'

app.use(ElementPlus)
```

定义一份 schema，并把它交给 `FormX` 渲染：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormX } from '@formx/vue'
import type { FormSchema } from '@formx/vue'

const formModel = ref({ name: '', status: 'active' })

const schema: FormSchema = {
  version: '1.0.0',
  model: formModel.value,
  fields: [
    {
      id: 'name',
      type: 'input',
      label: 'Name',
      rules: [{ required: true, message: 'Name is required.' }]
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      props: {
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Paused', value: 'paused' }
        ]
      }
    }
  ]
}
</script>

<template>
  <FormX v-model:value="formModel" :schema="schema" />
</template>
```

`FormX` 会暴露 `validate()`、`resetFields()`、`getValues()`、`validateField()`、`getFieldGroupAPI()` 等方法，适合接到提交按钮、抽屉表单或设计器预览里。

## English

Install the default Vue entry and runtime dependencies:

```sh
pnpm add @formx/vue vue element-plus
```

Load Element Plus and the FormX skin stylesheet in your app entry:

```ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@formx/vue-ep/style.css'

app.use(ElementPlus)
```

Create a schema and render it with `FormX`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormX } from '@formx/vue'
import type { FormSchema } from '@formx/vue'

const formModel = ref({ name: '', status: 'active' })

const schema: FormSchema = {
  version: '1.0.0',
  model: formModel.value,
  fields: [
    { id: 'name', type: 'input', label: 'Name', rules: [{ required: true }] },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      props: {
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Paused', value: 'paused' }
        ]
      }
    }
  ]
}
</script>

<template>
  <FormX v-model:value="formModel" :schema="schema" />
</template>
```

The component exposes `validate()`, `resetFields()`, `getValues()`, `validateField()`, and `getFieldGroupAPI()` for submit flows, drawer forms, and designer previews.

## Local Development / 本地开发

```sh
pnpm install
pnpm docs:dev
pnpm docs:build
```

完整 workbench 示例仍保留在 `examples/vue-ep-basic`：

```sh
pnpm --filter @formx/example-vue-ep-basic dev
```
