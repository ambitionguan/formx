# Getting Started / 快速开始

## 中文

这一页只做一件事：在 Vue 3 + Element Plus 项目里跑起一个可提交、可校验、可观察值变化的 FormX 表单。完整概念请先看 [Introduction / 介绍](/guide/introduction)。

## 1. 安装

```sh
pnpm add @formx/vue vue element-plus
```

`@formx/vue` 是 Vue 默认入口，内部重导出常用类型、核心引擎和 Element Plus 皮肤。

## 2. 注册 Element Plus 和样式

在应用入口加载 Element Plus 以及 FormX 皮肤样式：

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@formx/vue-ep/style.css'
import App from './App.vue'

createApp(App).use(ElementPlus).mount('#app')
```

如果你直接使用 `@formx/vue-ep`，也需要同样加载 `@formx/vue-ep/style.css`。

## 3. 创建第一份 schema

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormX } from '@formx/vue'
import type { FormSchema } from '@formx/vue'

const formRef = ref<any>()
const formModel = ref({
  name: '',
  status: 'active',
  notifyBy: 'email',
  email: ''
})

const schema = computed<FormSchema>(() => ({
  version: '1.0.0',
  model: formModel.value,
  ui: {
    labelWidth: '120px',
    labelSuffix: ':'
  },
  fields: [
    {
      id: 'name',
      type: 'input',
      label: 'Name',
      props: { placeholder: 'Enter a name', clearable: true },
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
    },
    {
      id: 'notifyBy',
      type: 'radio',
      label: 'Notify by',
      props: {
        options: [
          { label: 'Email', value: 'email' },
          { label: 'None', value: 'none' }
        ]
      }
    },
    {
      id: 'email',
      type: 'input',
      label: 'Email',
      showWhen: { field: 'notifyBy', eq: 'email' },
      requiredWhen: { field: 'notifyBy', eq: 'email' },
      props: { placeholder: 'name@example.test' },
      rules: [
        { pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', message: 'Invalid email.' }
      ]
    }
  ]
}))

async function submit() {
  const ok = await formRef.value?.validate?.()
  if (!ok) return

  const values = formRef.value?.getValues?.()
  console.log(values)
}

function reset() {
  formRef.value?.resetFields?.()
}
</script>

<template>
  <FormX ref="formRef" v-model:value="formModel" :schema="schema" />

  <el-space>
    <el-button @click="reset">Reset</el-button>
    <el-button type="primary" @click="submit">Submit</el-button>
  </el-space>
</template>
```

这个例子已经包含：

- 值同步：`v-model:value="formModel"`。
- 字段校验：`rules`。
- 条件显示：`showWhen`。
- 动态必填：`requiredWhen`。
- 表单提交：`formRef.value.validate()`。
- 值读取：`formRef.value.getValues()`。

## 4. 加一个远程选项

注册资源：

```ts
import { ResourceManager } from '@formx/vue'

ResourceManager.register('demo:getOwners', async () => [
  { label: 'Ada Lovelace', value: 'ada' },
  { label: 'Grace Hopper', value: 'grace' }
])
```

schema 中引用：

```json
{
  "id": "owner",
  "type": "select",
  "label": "Owner",
  "optionsFrom": "demo:getOwners",
  "fetchOnMount": true,
  "props": { "clearable": true, "filterable": true }
}
```

资源函数可以是真实 HTTP 请求，也可以是文档、测试或 Storybook 中的 mock。

## 5. 开发和文档

```sh
pnpm install
pnpm docs:dev
pnpm docs:build
```

完整 workbench 示例：

```sh
pnpm --filter @formx/example-vue-ep-basic dev
```

下一步建议按顺序阅读：

1. [Schema Model / Schema 模型](/guide/schema)
2. [Rules and Shortcuts / 规则与短写](/guide/rules-and-shortcuts)
3. [Resources / 远程资源](/guide/resources)
4. [Validation / 校验](/guide/validation)
5. [Vue Runtime / Vue 接入](/guide/vue-runtime)

## English

This page gets a Vue 3 + Element Plus form running with submit validation and value synchronization. For the full concept, start with [Introduction](/guide/introduction).

Install the default Vue entry:

```sh
pnpm add @formx/vue vue element-plus
```

Register Element Plus and load the FormX skin stylesheet:

```ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@formx/vue-ep/style.css'

app.use(ElementPlus)
```

Render a schema with `FormX`:

```vue
<FormX ref="formRef" v-model:value="formModel" :schema="schema" />
```

Use the exposed methods for submit flows:

```ts
const ok = await formRef.value?.validate?.()
if (!ok) return

const values = formRef.value?.getValues?.()
```

Register remote resources through `ResourceManager` and reference them from schema with `optionsFrom`. Read the dedicated guide pages for schema structure, rules, resources, validation, and Vue runtime integration.
