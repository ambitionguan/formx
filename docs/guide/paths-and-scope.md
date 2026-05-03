# 路径与作用域

路径是 FormX 规则、校验、资源参数和错误定位的基础。

## 基础路径

对象路径使用点号：

```txt
name
database.host
database.port
```

数组实例路径使用下标：

```txt
rules[0].field
rules[1].condition.value
```

模式路径使用 `[]` 表示任意数组项：

```txt
rules[].field
rules[].conditions[].value
```

## 作用域变量

| 变量 | 说明 |
| --- | --- |
| `$root` | 整棵值树。 |
| `$self` | 当前作用域实例，常用于数组项。 |
| `$parent` | 父作用域。 |
| `$item` | 聚合表达式中的当前项。 |

## 数组项内联动

在 `field-group` 中，规则应绑定到数组作用域：

```ts
{
  id: 'rules-method-condition',
  scope: 'rules[]',
  watch: ['$self.method'],
  when: '$self.method === "custom"',
  effects: [
    { type: 'visible', target: '$self.condition', value: true }
  ],
  elseEffects: [
    { type: 'visible', target: '$self.condition', value: false }
  ]
}
```

这样每一行只影响自己，不影响其他行。

## 跨层读取

数组项可以读取根级字段：

```ts
{
  scope: 'rules[]',
  when: '$root.mode === "advanced" && $self.level === "high"',
  effects: [
    { type: 'required', target: '$self.reason', value: true }
  ]
}
```

也可以读取父对象：

```ts
{
  scope: 'groups[].rules[]',
  when: '$parent.enabled === true && $self.type === "custom"',
  effects: [
    { type: 'visible', target: '$self.config', value: true }
  ]
}
```

## 资源参数中的路径

资源参数使用模板读取当前值：

```ts
{
  optionsFrom: {
    requestKey: 'getChildren',
    params: {
      parentId: '${region.parentId}',
      keyword: '${keyword}'
    }
  }
}
```

数组作用域中可以使用 `$self`：

```ts
{
  scope: 'rules[]',
  effects: [
    {
      type: 'fetchOptions',
      target: '$self.field',
      requestKey: 'getFields',
      params: {
        source: '$self.source'
      }
    }
  ]
}
```

## 常见错误

错误：数组规则直接写固定下标。

```ts
watch: ['rules[0].method']
```

更稳的写法：

```ts
scope: 'rules[]',
watch: ['$self.method']
```

错误：把对象压平成字段名。

```txt
databaseHost
databasePort
```

更稳的写法：

```txt
database.host
database.port
```

## 设计建议

- 业务对象有层级，schema 也保留层级。
- 数组规则优先使用 `scope` 和 `$self`。
- 规则 target 尽量使用相对路径，减少下标依赖。
- 错误定位、资源参数、校验字段都应共享同一套路径模型。
