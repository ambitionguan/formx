# Vue Runtime / Vue 接入

## 中文

当前开源仓库维护的完整渲染路径是 Vue 3 + Element Plus。大多数 Vue 用户直接使用 `@formx/vue` 即可。

```ts
import { FormX, ResourceManager, FormXEngine } from '@formx/vue'
import '@formx/vue-ep/style.css'
```

### 基础组件接入

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormX } from '@formx/vue'
import type { FormSchema } from '@formx/vue'

const formRef = ref<any>()
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

async function submit() {
  const ok = await formRef.value?.validate?.()
  if (!ok) return
  const values = formRef.value?.getValues?.()
  console.log(values)
}
</script>

<template>
  <FormX ref="formRef" v-model:value="formModel" :schema="schema" />
  <el-button type="primary" @click="submit">Submit</el-button>
</template>
```

### 组件暴露 API

`FormX` 通过 `ref` 暴露常用方法：

| API | 说明 |
| --- | --- |
| `engine` | 底层 `FormXEngine` 实例。高级操作和诊断可直接读取。 |
| `validate(trigger?)` | 校验整个表单，返回 boolean。 |
| `validateField(path, trigger?)` | 校验单个字段。 |
| `getValues()` | 获取当前值树深拷贝。 |
| `resetFields()` | 重置为当前组件实例创建时的初始值。 |
| `getValidationDetails(path?)` | 获取校验细节。 |
| `isValidating(path?)` | 判断是否正在异步校验。 |
| `getFieldGroupAPI(groupId)` | 获取字段组命令。 |

### Dialog 和异步回填

弹窗、抽屉和编辑页常见问题是：接口数据回来时，FormX 实例可能还没挂载。推荐模式是让外部模型先持有异步数据，FormX 挂载后再通过 `v-model:value` 同步进去。

```ts
const visible = ref(false)
const formModel = ref<Record<string, any>>({})
const formKey = ref(0)

async function openEdit(id: string) {
  visible.value = true
  const detail = await fetchDetail(id)
  formModel.value = detail
  formKey.value += 1
}
```

```vue
<el-dialog v-model="visible">
  <FormX
    v-if="visible"
    :key="formKey"
    ref="formRef"
    v-model:value="formModel"
    :schema="schema"
  />
</el-dialog>
```

如果需要保留同一个组件实例，也可以在接口返回后直接更新 `formModel`，当前 `FormX` 实例会同步外部值变化。

### 自定义组件

`custom` 字段可以通过 `components` 或 `customComponents` 传入渲染组件：

```json
{
  "id": "summary",
  "type": "custom",
  "label": "Summary",
  "render": { "component": "ReleaseSummary" }
}
```

```vue
<FormX
  v-model:value="formModel"
  :schema="schema"
  :components="{ ReleaseSummary }"
/>
```

自定义组件适合图文摘要、复杂卡片、小型领域编辑器和非标准控件。建议让自定义组件仍通过 FormX 的 view、group 或 engine API 与表单交互，避免重新引入散乱状态。

### 皮肤和默认入口

| Import | 用途 |
| --- | --- |
| `@formx/vue` | 推荐 Vue 默认入口，重导出 engine、类型、runtime 和 EP 皮肤。 |
| `@formx/vue-ep` | 直接使用 Vue + Element Plus 皮肤。 |
| `@formx/vue-core` | 只使用 Vue runtime bridge，自行做皮肤。 |
| `@formx/core` | 纯逻辑引擎，不渲染 UI。 |

## English

The currently maintained full renderer is Vue 3 + Element Plus. Most Vue users should import from `@formx/vue`.

The component exposes a practical API through `ref`: `engine`, `validate()`, `validateField()`, `getValues()`, `resetFields()`, `getValidationDetails()`, `isValidating()`, and `getFieldGroupAPI()`.

For dialogs and edit-backfill flows, keep the external model as the source of incoming async data. FormX will sync external `v-model:value` changes into the engine after mount. Use a `key` when you intentionally want a fresh engine instance for each opened record.
