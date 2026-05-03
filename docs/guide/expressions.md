# 表达式 DSL

FormX 表达式用于 `showWhen`、`requiredWhen`、`compute`、`rulesV2.when`、资源参数和部分动态配置。

表达式的目标不是替代 JavaScript，而是提供一套可序列化、可审查、可在设计器中编辑的业务表达方式。

## 基础变量

字段可以直接读取同级值：

```ts
showWhen: 'status === "disabled"'
compute: 'price * count'
```

对象路径：

```ts
showWhen: 'database.type === "mysql"'
```

数组作用域：

```ts
showWhen: '$self.method === "custom"'
```

## 逻辑与比较

```ts
enabled === true
status !== "disabled"
count > 0
level === "high" && enabled
type === "mysql" || type === "postgres"
```

## 字符串与空值

```ts
name != null
name !== ""
remark ?? "无"
```

## 计算值

```ts
compute: 'price * count'
compute: 'firstName + " " + lastName'
compute: 'enabled ? "启用" : "停用"'
```

## 数组聚合

数组场景可以表达“是否任意项满足条件”：

```ts
when: 'rules.some($item.level === "high")'
```

或“所有项满足条件”：

```ts
when: 'rules.every($item.enabled === true)'
```

具体聚合能力会随 DSL 演进继续补充。原则是保持表达式可读，而不是把大量业务算法塞进字符串。

## 资源参数模板

资源参数可以从值树取值：

```ts
params: {
  province: '${province}',
  keyword: '${ownerKeyword}'
}
```

数组作用域中可以引用当前项：

```ts
params: {
  source: '${$self.source}'
}
```

## 什么时候不要用表达式

不要把以下内容塞进表达式：

- 复杂业务算法。
- 网络请求。
- DOM 操作。
- 需要复用和测试的大段逻辑。
- 包含副作用的操作。

这些应该通过规则 effect、资源注册、命名 validator 或业务函数桥接实现。

## 编写建议

- 表达式越短越好。
- 对复杂逻辑先拆中间字段，再用规则组合。
- 数组项内优先使用 `$self`。
- 需要复用的判断可以沉淀为规则模板或设计器能力。
