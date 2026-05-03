# API 总览

这一页列出公开入口和常用 API。详细类型以源码导出为准，文档会随包发布继续拆分为更细的 reference 页面。

## 公共入口

| 入口 | 主要导出 |
| --- | --- |
| `@formx/core` | `FormXEngine`、`ResourceManager`、schema 类型、规则类型、校验类型。 |
| `@formx/ui-core` | `FormView`、`FieldView`、`ContainerView`、`FieldGroupView`、视图构建运行时。 |
| `@formx/vue-core` | `useFormXEngine`、`useFormViewState`、表单暴露方法。 |
| `@formx/vue-ep` | `FormXVueEp`、Element Plus 皮肤和样式。 |
| `@formx/vue` | 推荐 Vue 入口，导出 `FormX` 和常用能力。 |

## `FormXEngine`

创建引擎：

```ts
import { FormXEngine } from '@formx/core'

const engine = new FormXEngine({
  schema,
  performance: {
    useGraph: 'auto',
    recalcScope: 'siblings'
  },
  policy: {
    validation: {
      mode: 'touched',
      skipHidden: true
    }
  }
})
```

构造参数：

```ts
type FormXEngineOptions = {
  schema: FormSchema
  performance?: PerformanceConfig
  policy?: PolicyConfig
  messages?: FormXMessageResolver | { resolve: FormXMessageResolver }
}
```

## 值与状态

```ts
engine.dispatch('init')
engine.setValue('path.to.field', value)
engine.getValue('path.to.field')
engine.getValues()
engine.getSubmitValues()
engine.getState()
```

常见用途：

- 页面初始化后执行 `dispatch('init')`。
- 用户交互后使用 `setValue` 修改字段。
- 提交时读取 `getSubmitValues()`。
- 调试时读取 `getState()`。

## 校验

```ts
await engine.validate()
await engine.validatePath('email')
engine.getErrors()
engine.getFirstErrorPath()
engine.getValidationDetails()
engine.isValidating()
```

注册 pattern：

```ts
FormXEngine.registerPattern('mobileCN', /^1[3-9]\d{9}$/)
```

注册 validator：

```ts
FormXEngine.registerValidator('uniqueName', async ({ value, values }) => {
  return true
})
```

## 事件和订阅

```ts
const stop = engine.subscribe((snapshot) => {
  console.log(snapshot.values)
})

const stopPath = engine.subscribePaths(['status', 'rules[].method'], () => {
  console.log('watched paths changed')
})

engine.on('change', (event) => {
  console.log(event)
})
```

订阅适合外部调试、设计器面板、状态同步和测试断言。

## Schema Patch

运行时可以对 schema 做补丁：

```ts
engine.applySchemaPatch({
  op: 'replace',
  path: '/fields/0/props/placeholder',
  value: '请输入名称'
})
```

这适合设计器、运行时动态扩展和配置中心下发变更。普通业务联动优先使用 `rulesV2` effect。

## 诊断

```ts
const diagnostics = engine.getDiagnostics()
```

诊断信息用于观察：

- 执行器类型。
- 规则数量。
- 路径注册表。
- 图执行状态。
- 最近一次规则命中。
- 错误详情。

大型表单建议在开发环境显示诊断信息。

## `ResourceManager`

注册请求：

```ts
import { ResourceManager } from '@formx/core'

ResourceManager.register('getUsers', async (params) => {
  return api.users(params)
})
```

手动请求：

```ts
const users = await ResourceManager.fetch('getUsers', { keyword: 'tom' })
```

失效缓存：

```ts
ResourceManager.invalidate('getUsers')
ResourceManager.clearCache()
```

schema 绑定：

```ts
{
  id: 'owner',
  type: 'select',
  optionsFrom: {
    requestKey: 'getUsers',
    params: {
      keyword: '${ownerKeyword}'
    }
  }
}
```

## Vue 组件 API

`@formx/vue` 的 `FormX` 组件暴露：

```ts
await formRef.value?.validate()
await formRef.value?.validateField('email')
formRef.value?.resetFields()
formRef.value?.clearValidate()
formRef.value?.setValues(values, { replace: true })
formRef.value?.setFieldValue('name', 'demo')
formRef.value?.getValues()
formRef.value?.getSubmitValues()
formRef.value?.getErrors()
formRef.value?.getFirstErrorPath()
formRef.value?.scrollToField('email')
formRef.value?.getFieldGroupAPI('rules')
```

字段组 API 用于增删复制数组项：

```ts
const api = formRef.value?.getFieldGroupAPI('rules')
api?.add()
api?.remove(0)
api?.copy(0)
api?.move(0, 1)
```

## 类型导入建议

应用侧通常从 `@formx/vue` 导入：

```ts
import { FormX, ResourceManager } from '@formx/vue'
import type { FormSchema } from '@formx/vue'
```

只使用核心引擎时从 `@formx/core` 导入：

```ts
import { FormXEngine } from '@formx/core'
import type { FormSchema, RuleV2 } from '@formx/core'
```
