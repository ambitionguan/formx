# Rules and Shortcuts / 规则与短写

## 中文

FormX 有两层联动表达方式：

1. 字段级短写：适合常见局部联动，schema 更易读。
2. `rulesV2`：适合跨字段、跨数组、多个 effect、事件触发和高级表达式。

推荐先用短写，短写表达不清楚时再使用 `rulesV2`。

## 字段级短写

### `showWhen`

```json
{
  "id": "approvalReason",
  "type": "textarea",
  "label": "Approval reason",
  "showWhen": { "field": "approvalRequired", "eq": true }
}
```

当 `approvalRequired` 为 `true` 时显示该字段，否则隐藏。

### `requiredWhen`

```json
{
  "id": "webhookUrl",
  "type": "input",
  "label": "Webhook URL",
  "requiredWhen": {
    "field": "notifyMode",
    "eq": "webhook",
    "message": "Webhook URL is required."
  }
}
```

动态必填最终会写入 `state[path].required`，并参与提交校验。

### `disableWhen` 和 `readOnlyWhen`

```json
{
  "id": "releaseWindow",
  "type": "date-picker",
  "label": "Release window",
  "disableWhen": { "field": "deployMode", "eq": "manual" }
}
```

这类短写适合 UI 状态随字段变化的场景。

### `compute`

```json
{
  "id": "monthlyPrice",
  "type": "number",
  "label": "Monthly price",
  "readonly": true,
  "compute": {
    "watch": ["plan", "seats"],
    "expr": {
      "*": [
        { "var": "seats" },
        { "iif": [{ "==": [{ "var": "plan" }, "enterprise"] }, 39, 19] }
      ]
    }
  }
}
```

`compute` 会编译成 `set` effect。它适合金额、评分、摘要、派生字段等场景。

### `optionsFrom`

```json
{
  "id": "service",
  "type": "select",
  "label": "Service",
  "optionsFrom": "docs:getServices",
  "params": { "team": { "var": "team" } },
  "fetchOnMount": true
}
```

`optionsFrom` 会触发远程资源加载，并把结果写入 `state[path].options`。

## `rulesV2`

`rulesV2` 是更底层的规则数组。一个规则通常包含：

| Key | 说明 |
| --- | --- |
| `id` | 全局唯一规则 ID，便于诊断。 |
| `scope` | 可选作用域，常用于 `field-group`。 |
| `watch` | 监听的值路径或路径模式。 |
| `trigger` | 自定义事件触发，例如 `event:submitDraft`。 |
| `when` | JSON 表达式。 |
| `effects` | 条件成立时执行的 effect。 |
| `elseEffects` | 条件不成立时执行的 effect。 |

示例：

```json
{
  "id": "prod-requires-approval",
  "watch": ["environment"],
  "when": { "==": [{ "var": "environment" }, "prod"] },
  "effects": [{ "type": "set", "target": "approvalRequired", "value": true }],
  "elseEffects": [{ "type": "set", "target": "approvalRequired", "value": false }]
}
```

### 常用 effect

| Effect | 用途 |
| --- | --- |
| `set` | 写入表单值。 |
| `patch` | 动态修改字段 UI 属性，例如 label、props。 |
| `setVisible` | 控制可见性。 |
| `setDisabled` | 控制禁用。 |
| `setRequired` | 控制必填。 |
| `setReadOnly` | 控制只读。 |
| `setOptions` | 动态下发选项。 |
| `fetch` | 拉取远程资源。 |
| `validate` | 写入或清理校验结果。 |
| `addItem` / `removeItem` / `splice` | 操作数组字段。 |
| `dispatch` | 派发自定义事件。 |

### 数组作用域

`field-group` 内部规则建议使用 `scope` 和 `$self`：

```json
{
  "id": "owner-email-required",
  "scope": "contacts[]",
  "watch": ["$self.role"],
  "when": { "==": [{ "var": "$self.role" }, "owner"] },
  "effects": [{ "type": "setRequired", "target": "$self.email", "value": true }],
  "elseEffects": [{ "type": "setRequired", "target": "$self.email", "value": false }]
}
```

这条规则会对 `contacts` 数组中的每一项分别运行，`$self.email` 总是指向当前项的邮箱。

### 规则编写建议

- 每条规则的 `id` 保持稳定且唯一。
- 能用字段短写表达的，不必升级到全局规则。
- 多个 effect 有明显业务含义时，用一条规则聚合，避免到处散落。
- 跨数组和聚合表达式要显式声明 `scope`。
- 远程请求优先用 `fetch` effect 或 `optionsFrom`，不要把请求函数放进 schema。

## English

FormX has two levels of linkage:

1. Field shortcuts for common local behavior.
2. `rulesV2` for cross-field, scoped, event-driven, or multi-effect behavior.

Prefer shortcuts first. Use `rulesV2` when the behavior needs more structure.

Common shortcuts include `showWhen`, `requiredWhen`, `disableWhen`, `readOnlyWhen`, `compute`, and `optionsFrom`. `rulesV2` contains stable rule IDs, watches, optional scopes, JSON expressions, effects, and optional else effects.

In `field-group`, use `scope` and `$self` so the same rule can run for each array item safely.
