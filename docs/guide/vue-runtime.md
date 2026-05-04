# Vue 接入

Vue 接入层的目标是让应用像使用普通表单组件一样使用 FormX，同时保留 Core 的独立能力。

当前推荐入口是 `@formxjs/vue`。它面向应用侧聚合了 Vue 运行时和 Element Plus 皮肤。

## 基础组件接入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormX } from '@formxjs/vue'
import type { FormSchema } from '@formxjs/vue'
import '@formxjs/vue/style.css'

const formRef = ref<InstanceType<typeof FormX>>()

const model = ref({
  name: '',
  enabled: true
})

const schema: FormSchema = {
  version: '1.0.0',
  model: model.value,
  fields: [
    { id: 'name', type: 'input', label: '名称', rules: [{ required: true }] },
    { id: 'enabled', type: 'switch', label: '启用' }
  ]
}

async function submit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  console.log(formRef.value?.getValues())
}
</script>

<template>
  <FormX ref="formRef" v-model:value="model" :schema="schema" />
  <button type="button" @click="submit">提交</button>
</template>
```

## 组件暴露 API

Vue 组件会暴露常用表单方法：

```ts
await formRef.value?.validate()
await formRef.value?.validateField('name')
formRef.value?.resetFields()
formRef.value?.clearValidate()
formRef.value?.setValues({ name: 'demo' })
formRef.value?.setFieldValue('name', 'demo')
formRef.value?.getValues()
formRef.value?.getSubmitValues()
formRef.value?.getErrors()
formRef.value?.getFirstErrorPath()
formRef.value?.getFieldGroupAPI('rules')
```

这些方法背后仍然是 Core 引擎。UI 层只负责把交互映射到 engine。

## Dialog 和 Drawer

业务系统最常见的问题是：弹窗打开、详情接口返回、表单挂载、初始值重置之间的时序。

推荐模式是“会话化”：

```ts
const visible = ref(false)
const loading = ref(false)
const formModel = ref({})
let sessionId = 0

async function openEdit(row: { id: string }) {
  visible.value = true
  loading.value = true
  const current = ++sessionId

  const detail = await fetchDetail(row.id)
  if (current !== sessionId) return

  formModel.value = detail
  formRef.value?.setValues(detail, { replace: true })
  loading.value = false
}

function close() {
  sessionId++
  visible.value = false
  formRef.value?.resetFields()
}
```

重点：

- 不要假设 Dialog 打开后 `formRef` 已经立即存在。
- 详情返回要防止竞态。
- 整份详情回填用 replace 语义，局部修正才用 merge。
- 弹窗关闭后要让旧请求失效。

更多模式见 [异步运行时](/guide/async-runtime)。

## 自定义组件

自定义字段可以通过 `custom` 类型接入。schema 只保存组件标识，不保存组件实例。

```ts
{
  id: 'userPicker',
  type: 'custom',
  label: '用户',
  component: 'UserPicker',
  props: {
    multiple: true
  }
}
```

运行时注册组件：

```ts
const components = {
  UserPicker
}
```

```vue
<FormX :schema="schema" :components="components" />
```

自定义组件应该遵守 FormX 的字段协议：

- 接收当前值。
- 触发值变更。
- 支持 disabled、readOnly、loading、error 等状态。
- 不在组件内部私自维护与 engine 冲突的业务状态。

## 皮肤和默认入口

`@formxjs/vue` 是应用推荐入口：

```ts
import { FormX } from '@formxjs/vue'
```

如果你明确要使用 Element Plus 皮肤：

```ts
import { FormXVueEp } from '@formxjs/vue-ep'
```

如果你要实现自己的 Vue 皮肤，通常使用：

```ts
import { useFormXEngine, useFormViewState } from '@formxjs/vue-core'
```

再从 `@formxjs/ui-core` 获取中立视图模型。

## Vue 接入建议

- 页面只关心业务数据和提交，不要把规则写回组件 watch。
- 远程选项、异步校验、级联请求走资源层。
- 弹窗编辑要处理挂载时序和竞态。
- 自定义组件只做交互和展示，不要绕开 engine 修改值。
- 如果业务需要设计器，schema 必须保持可序列化。
