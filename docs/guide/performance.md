# 性能与诊断

复杂表单的难点不只是“渲染出来”，还包括规则重算范围、资源请求频率、数组规模、校验策略和调试能力。

FormX 在 Core 层提供性能策略和诊断入口。

## 执行器策略

```ts
const engine = new FormXEngine({
  schema,
  performance: {
    useGraph: 'auto',
    liteRuleThreshold: 30,
    recalcScope: 'siblings'
  }
})
```

常见配置：

| 配置 | 说明 |
| --- | --- |
| `useGraph` | `'auto'`、`'on'`、`'off'`，控制是否使用图执行。 |
| `liteRuleThreshold` | 超过规则数量后自动启用更适合复杂联动的策略。 |
| `recalcScope` | 通配监听命中时的重算范围。 |
| `debounceDefault` | 高频变化的默认去抖。 |
| `maxHops` | 防止循环联动。 |
| `aggregateCache` | 聚合表达式缓存。 |
| `debug` | 输出调试信息。 |

## 重算范围

数组通配规则容易导致大范围重算：

```txt
rules[].method
```

如果每一行只影响同级字段，可以使用：

```ts
performance: {
  recalcScope: 'siblings'
}
```

这能减少大型 `field-group` 的无意义重算。

## 诊断信息

```ts
const diagnostics = engine.getDiagnostics()
```

诊断信息可用于观察：

- 当前执行器类型。
- 规则数量。
- 路径注册情况。
- 依赖图状态。
- 最近一次执行统计。
- 字段状态和错误详情。

在文档演示和开发环境中，可以把诊断信息显示出来，帮助用户理解规则为何执行。

## 资源性能

远程资源也需要治理：

- 字典类资源使用 TTL 缓存。
- 搜索类资源使用 debounce。
- 快速输入使用 latest 策略。
- 级联资源在上游变化后清理下游值。
- 失败时提供 fallback，避免表单不可用。

## 大型表单建议

- 优先使用字段短写表达局部规则。
- 复杂规则明确 `watch`，避免监听过宽。
- 数组规则使用 `scope` 和 `$self`。
- 大型数组使用字段组虚拟化或分段展示。
- 自定义组件避免内部重复 watch 整个 model。
- 提交前使用 `getSubmitValues()`，不要直接提交 UI 临时状态。
- 开发时打开诊断，发布时关闭 debug。

## 常见性能问题

问题：一个字段变化导致全表重算。  
处理：检查规则 `watch` 是否过宽，数组规则是否缺少 `scope`。

问题：远程选项请求过多。  
处理：使用资源层 debounce、TTL、latest 和参数依赖。

问题：字段组很多行时卡顿。  
处理：减少跨行规则，使用 `recalcScope: 'siblings'`，必要时启用虚拟展示。

问题：校验频繁阻塞输入。  
处理：异步校验放到 blur 或 submit，避免每次输入都请求。
