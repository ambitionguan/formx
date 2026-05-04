# 快速开始

这一页只做一件事：在 Vue 3 + Element Plus 项目里跑起一个可提交、可校验、可观察值变化的 FormX 表单。

如果你只想看核心引擎如何独立运行，可以直接看 [纯核心引擎示例](/examples/headless-core)。

## 安装

```bash
pnpm add @formxjs/vue vue element-plus
```

`@formxjs/vue` 是 Vue 项目的推荐入口。它聚合了 Vue 运行时和当前默认的 Element Plus 皮肤。

## 注册样式

在应用入口导入 Element Plus 和 FormX 样式：

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@formxjs/vue/style.css'
import App from './App.vue'

createApp(App).use(ElementPlus).mount('#app')
```

## 定义第一份 schema

FormX 的 schema 是普通 JSON 数据。字段、默认值、校验和联动都可以放进去。

```ts
import type { FormSchema } from '@formxjs/vue'

export const schema: FormSchema = {
  version: '1.0.0',
  formId: 'account-create',
  model: {
    username: '',
    role: 'user',
    email: '',
    needReason: false,
    reason: ''
  },
  fields: [
    {
      id: 'username',
      type: 'input',
      label: '用户名',
      props: { placeholder: '请输入用户名', clearable: true },
      rules: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
    },
    {
      id: 'role',
      type: 'select',
      label: '角色',
      props: {
        options: [
          { label: '普通用户', value: 'user' },
          { label: '管理员', value: 'admin' }
        ]
      }
    },
    {
      id: 'email',
      type: 'input',
      label: '邮箱',
      props: { placeholder: '请输入邮箱' },
      rules: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }]
    },
    {
      id: 'needReason',
      type: 'switch',
      label: '填写申请原因'
    },
    {
      id: 'reason',
      type: 'textarea',
      label: '申请原因',
      showWhen: 'needReason === true',
      requiredWhen: 'needReason === true',
      props: { rows: 3, placeholder: '请说明申请原因' }
    }
  ]
}
```

这里已经体现了 FormX 的基本工作方式：

- `model` 是初始值树。
- `fields` 描述字段。
- `rules` 描述字段级校验。
- `showWhen` 和 `requiredWhen` 是联动短写，会编译成规则。

## 在 Vue 中渲染

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormX } from '@formxjs/vue'
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
  <button type="button" @click="submit">提交</button>
</template>
```

业务侧持有 `formModel`，FormX 负责渲染、联动和校验。你不需要为每个字段手写 `el-form-item`，也不需要把显隐逻辑散落在模板里。

## 接入远程选项

远程数据建议统一注册为请求，而不是在每个组件里写生命周期请求。

```ts
import { ResourceManager } from '@formxjs/vue'

ResourceManager.register('getDepartments', async () => {
  return [
    { label: '研发部', value: 'rd' },
    { label: '产品部', value: 'product' },
    { label: '运营部', value: 'operation' }
  ]
})
```

然后在 schema 里引用：

```ts
{
  id: 'department',
  type: 'select',
  label: '部门',
  optionsFrom: {
    requestKey: 'getDepartments'
  }
}
```

带参数的场景也可以声明依赖：

```ts
{
  id: 'owner',
  type: 'select',
  label: '负责人',
  optionsFrom: {
    requestKey: 'searchUsers',
    params: {
      department: '${department}',
      keyword: '${ownerKeyword}'
    }
  }
}
```

当依赖值变化时，资源层可以重新请求并更新选项。

## 真实项目中的推荐路径

不要一上来就把所有表单写成巨大 schema。更稳的方式是：

1. 先把字段和值树建好。
2. 再补字段级校验。
3. 用短写处理简单联动。
4. 用 `rulesV2` 收敛复杂业务规则。
5. 把远程选项、异步校验、级联数据放到 `ResourceManager`。
6. 最后再处理布局、字段组、自定义组件和诊断。

下一步建议阅读：

- [Schema 模型](/guide/schema)
- [规则与短写](/guide/rules-and-shortcuts)
- [远程资源](/guide/resources)
- [Vue 接入](/guide/vue-runtime)
- [构建复杂表单](/guide/building-forms)
