# 规则与短写

FormX 的联动能力分两层：

- 字段级短写：适合常见的显隐、必填、禁用、只读、计算、远程选项。
- `rulesV2`：适合跨字段、跨数组、多个 effect、异步资源和复杂业务规则。

两者不是两套体系。短写最终会被编译成规则，统一进入引擎执行链。

## 字段级短写

### `showWhen`

根据表达式控制字段可见性。

```ts
{
  id: 'reason',
  type: 'textarea',
  label: '停用原因',
  showWhen: 'status === "disabled"'
}
```

### `requiredWhen`

根据表达式动态必填。

```ts
{
  id: 'approvalComment',
  type: 'textarea',
  label: '审批意见',
  requiredWhen: 'action === "reject"'
}
```

### `disableWhen` 和 `readOnlyWhen`

控制字段是否可编辑。

```ts
{
  id: 'quota',
  type: 'number',
  label: '额度',
  disableWhen: 'mode === "readonly"'
}
```

### `compute`

计算字段值。

```ts
{
  id: 'total',
  type: 'number',
  label: '合计',
  compute: 'price * count'
}
```

计算适合派生值，例如总价、显示名称、开关状态、策略摘要。避免在 `compute` 中做有副作用的请求或复杂业务流程。

### `optionsFrom`

声明远程选项来源。

```ts
{
  id: 'city',
  type: 'select',
  label: '城市',
  optionsFrom: {
    requestKey: 'getCities',
    params: {
      province: '${province}'
    }
  }
}
```

`optionsFrom` 会交给资源层处理。它不是简单的回调，而是可被缓存、去抖、重试、诊断和刷新的一部分。

## `rulesV2`

当一个业务规则不能用单个字段短写表达时，使用 `rulesV2`。

```ts
{
  id: 'admin-requires-reason',
  watch: ['role', 'enabled'],
  when: 'role === "admin" && enabled === false',
  effects: [
    { type: 'visible', target: 'reason', value: true },
    { type: 'required', target: 'reason', value: true },
    { type: 'setValue', target: 'level', value: 'high' }
  ],
  elseEffects: [
    { type: 'visible', target: 'reason', value: false },
    { type: 'required', target: 'reason', value: false }
  ]
}
```

常用字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 规则标识，建议可读、稳定。 |
| `scope` | 规则作用域，数组场景常用。 |
| `watch` | 监听路径。 |
| `when` | 条件表达式。 |
| `effects` | 条件成立时执行的动作。 |
| `elseEffects` | 条件不成立时执行的动作。 |

## 常用 effect

| effect | 说明 |
| --- | --- |
| `setValue` | 设置字段值。 |
| `visible` | 设置可见性。 |
| `disabled` | 设置禁用状态。 |
| `readOnly` | 设置只读状态。 |
| `required` | 设置动态必填。 |
| `setOptions` | 设置选项。 |
| `patchProps` | 补丁式更新字段 props。 |
| `fetchOptions` | 触发资源请求并写入选项。 |
| `validate` | 触发校验。 |
| `schemaPatch` | 运行时修改 schema。 |
| `addItem`、`removeItem`、`splice` | 操作数组字段。 |

## 数组作用域

数组规则的关键是 `scope`。例如在每一条规则项中，根据 `method` 控制 `threshold`：

```ts
{
  id: 'rule-threshold-visible',
  scope: 'rules[]',
  watch: ['$self.method'],
  when: '$self.method === "threshold"',
  effects: [
    { type: 'visible', target: '$self.threshold', value: true },
    { type: 'required', target: '$self.threshold', value: true }
  ],
  elseEffects: [
    { type: 'visible', target: '$self.threshold', value: false },
    { type: 'required', target: '$self.threshold', value: false }
  ]
}
```

`$self` 会绑定到当前数组项实例，因此不会误伤其他行。

## 什么时候用短写，什么时候用规则

| 场景 | 推荐 |
| --- | --- |
| 单字段显隐、必填、禁用 | 字段短写 |
| 单字段计算 | `compute` |
| 远程选项 | `optionsFrom` |
| 多个字段联动 | `rulesV2` |
| 数组项内联动 | 带 `scope` 的 `rulesV2` |
| 需要多个 effect | `rulesV2` |
| 需要诊断规则链 | `rulesV2` |

## 规则编写建议

- 规则 `id` 要稳定，方便诊断和日志定位。
- `watch` 尽量精确，减少无意义重算。
- 数组内规则优先使用 `scope` 和 `$self`。
- 避免在表达式里写复杂业务算法，复杂逻辑应拆成字段或资源。
- effect 不要互相打架，例如一条规则隐藏字段，另一条规则又强制显示同一字段。
- 对大型表单开启诊断，看规则数量、执行器类型和重算范围。
