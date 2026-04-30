# Validation / 校验

## 中文

FormX 的校验分为字段规则、命名 pattern、命名 validator 和跨字段规则。UI 皮肤只消费 engine 写入的 `state[path].errors` 和 `state[path].validating`。

### 字段级规则

```json
{
  "id": "ownerEmail",
  "type": "input",
  "label": "Owner email",
  "rules": [
    { "required": true, "message": "Owner email is required." },
    { "pattern": "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", "message": "Invalid email." }
  ]
}
```

常用规则：

| Rule | 用途 |
| --- | --- |
| `required` | 必填。 |
| `minLength` / `maxLength` | 字符串或数组长度。 |
| `min` / `max` | 数字范围。 |
| `enum` | 枚举值。 |
| `pattern` | 正则或命名正则。 |
| `expression` | JSON 表达式。 |
| `use` | 命名 validator。 |

### 校验触发策略

`policy.validation.mode` 控制何时写入错误：

| Mode | 行为 |
| --- | --- |
| `touched` | 默认模式。用户触达后显示错误，提交时完整校验。 |
| `immediate` | 值变化后尽快校验。适合实时反馈。 |
| `submitOnly` | 只在提交或手动调用时显示错误。适合弹窗或向导。 |

```vue
<FormX
  ref="formRef"
  v-model:value="formModel"
  :schema="schema"
  :policy="{ validation: { mode: 'submitOnly' } }"
/>
```

### 命名 pattern

通用格式规则建议注册为命名 pattern，而不是把长正则复制到每个 schema：

```ts
import { FormXEngine } from '@formx/vue'

FormXEngine.registerPattern('slug', {
  source: '^[a-z][a-z0-9-]{2,31}$',
  message: 'Use 3-32 lowercase letters, numbers, or hyphens.'
})
```

schema 中引用：

```json
{
  "id": "slug",
  "type": "input",
  "label": "Slug",
  "rules": [{ "pattern": { "name": "slug" } }]
}
```

### 命名 validator

业务规则、异步唯一性、服务端校验适合注册为 validator：

```ts
FormXEngine.registerValidator('availableSlug', {
  async: true,
  debounceMs: 180,
  validate: async ({ value }) => {
    const reserved = new Set(['admin', 'root', 'system'])
    return reserved.has(String(value || '')) ? 'This slug is reserved.' : true
  }
})
```

schema 中引用：

```json
{
  "id": "slug",
  "type": "input",
  "label": "Slug",
  "rules": [
    { "required": true },
    { "pattern": { "name": "slug" } },
    { "use": "availableSlug", "async": true }
  ]
}
```

### 跨字段校验

跨字段校验可以使用 `rulesV2` 和 `validate` effect：

```json
{
  "id": "approval-reason-required",
  "watch": ["approvalRequired", "approvalReason"],
  "when": {
    "and": [
      { "==": [{ "var": "approvalRequired" }, true] },
      { "==": [{ "var": "approvalReason" }, ""] }
    ]
  },
  "effects": [
    {
      "type": "validate",
      "target": "approvalReason",
      "message": "Explain why approval is required."
    }
  ],
  "elseEffects": [{ "type": "validate", "target": "approvalReason" }]
}
```

### 提交时校验

Vue 组件暴露 `validate()`：

```ts
const ok = await formRef.value?.validate?.()
if (!ok) return

const values = formRef.value?.getValues?.()
```

核心引擎也可以直接校验：

```ts
const ok = await engine.validate()
const errors = engine.getErrors()
const firstPath = engine.getFirstErrorPath()
```

### 校验建议

- 字段内能完成的规则写在 `rules`。
- 通用格式写成命名 pattern。
- 可复用业务校验写成命名 validator。
- 跨字段和聚合校验写成 `rulesV2`。
- 异步校验记得配置 `async: true` 和可选 `debounceMs`。

## English

FormX validation includes field rules, named patterns, named validators, and cross-field rules. Renderers only consume `state[path].errors` and `state[path].validating`.

Use field rules for local checks, named patterns for reusable formats, named validators for business or async checks, and `rulesV2` for cross-field or aggregate validation. The Vue component exposes `validate()`, while the headless engine exposes `engine.validate()`, `engine.getErrors()`, and `engine.getFirstErrorPath()`.
