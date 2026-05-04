# 校验

FormX 的校验分为三类：

- 字段级规则：写在 `fields[].rules`。
- 动态校验：由 `requiredWhen`、`rulesV2` 或运行时状态控制。
- 注册式校验：命名 pattern、命名 validator、异步资源校验。

校验是 Core 能力，不绑定 Element Plus。UI 皮肤只负责展示错误和触发用户交互。

## 字段级规则

```ts
{
  id: 'email',
  type: 'input',
  label: '邮箱',
  rules: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}
```

常用配置：

| 字段 | 说明 |
| --- | --- |
| `required` | 必填。 |
| `type` | 内置类型，例如 `email`、`number`。 |
| `pattern` | 正则字符串或命名 pattern。 |
| `min`、`max` | 数字范围。 |
| `minLength`、`maxLength` | 字符串或数组长度。 |
| `message` | 错误文案。 |
| `trigger` | 触发方式，例如 `blur`、`change`、`submit`。 |

## 校验触发策略

可以在 engine 或 schema policy 中设置：

```ts
{
  policy: {
    validation: {
      mode: 'touched',
      skipHidden: true,
      skipDisabled: true,
      skipReadOnly: true
    }
  }
}
```

常见模式：

| 模式 | 行为 |
| --- | --- |
| `immediate` | 值变化后尽快写入错误。 |
| `touched` | 字段被触碰后再展示错误，适合表单编辑体验。 |
| `submitOnly` | 提交时才写入错误，适合强流程型表单。 |

## 动态必填

简单场景使用 `requiredWhen`：

```ts
{
  id: 'rejectReason',
  type: 'textarea',
  label: '驳回原因',
  requiredWhen: 'action === "reject"'
}
```

复杂场景使用规则：

```ts
{
  id: 'rule-reject-reason-required',
  watch: ['action', 'riskLevel'],
  when: 'action === "reject" || riskLevel === "high"',
  effects: [{ type: 'required', target: 'rejectReason', value: true }],
  elseEffects: [{ type: 'required', target: 'rejectReason', value: false }]
}
```

## 命名 pattern

命名 pattern 适合复用正则：

```ts
import { FormXEngine } from '@formxjs/core'

FormXEngine.registerPattern('mobileCN', /^1[3-9]\d{9}$/)
```

schema 中引用：

```ts
{
  id: 'phone',
  type: 'input',
  label: '手机号',
  rules: [{ pattern: 'mobileCN', message: '手机号格式不正确' }]
}
```

## 命名 validator

命名 validator 适合复杂同步或异步校验：

```ts
FormXEngine.registerValidator('uniqueUsername', async ({ value }) => {
  if (!value) return true
  const result = await fetch(`/api/users/check?name=${value}`).then((res) => res.json())
  return result.available || '用户名已存在'
})
```

schema 中引用：

```ts
{
  id: 'username',
  type: 'input',
  label: '用户名',
  rules: [
    { required: true, message: '请输入用户名' },
    { validator: 'uniqueUsername', trigger: 'blur' }
  ]
}
```

## 跨字段校验

跨字段校验推荐通过命名 validator 读取上下文：

```ts
FormXEngine.registerValidator('endAfterStart', ({ value, values }) => {
  if (!value || !values.startTime) return true
  return value > values.startTime || '结束时间必须晚于开始时间'
})
```

```ts
{
  id: 'endTime',
  type: 'date-picker',
  label: '结束时间',
  rules: [{ validator: 'endAfterStart', trigger: 'change' }]
}
```

如果校验本身会影响其他字段状态，可以结合 `rulesV2`。

## 提交时校验

Vue 组件暴露 `validate()`：

```ts
const valid = await formRef.value?.validate()
if (!valid) {
  const firstError = formRef.value?.getFirstErrorPath?.()
  return
}

const values = formRef.value?.getValues()
```

Core 引擎也可以独立校验：

```ts
const engine = new FormXEngine({ schema })
const result = await engine.validate()
```

## 错误定位

大型表单建议提供滚动到第一个错误的体验：

```ts
const valid = await formRef.value?.validate()
if (!valid) {
  const firstPath = formRef.value?.getFirstErrorPath?.()
  formRef.value?.scrollToField?.(firstPath)
}
```

具体滚动实现由 UI 皮肤决定。Core 只提供路径和错误详情。

## 校验建议

- 必填和格式校验优先写在字段 `rules`。
- 动态必填优先用 `requiredWhen`，复杂场景再用 `rulesV2`。
- 复用正则用命名 pattern，复用业务校验用命名 validator。
- 异步校验要处理 loading、并发和过期结果。
- 默认跳过隐藏、禁用、只读字段，避免用户无法修复的错误阻塞提交。
