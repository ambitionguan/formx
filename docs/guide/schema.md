# Schema 模型

Schema 是 FormX 的核心协议。它描述表单的字段、容器、默认值、布局、校验、联动和远程资源。

你可以把 schema 放在代码里，也可以放在服务端、配置中心或表单设计器里。只要它是可序列化数据，FormX 就能编译并运行它。

## 顶层结构

```ts
type FormSchema = {
  version: string
  formId?: string
  model?: Record<string, unknown>
  fields: FieldSchema[]
  rulesV2?: RuleV2[]
  ui?: FormUiConfig
  policy?: FormPolicy
}
```

常用字段：

| 字段 | 说明 |
| --- | --- |
| `version` | schema 版本，建议保留，方便迁移。 |
| `formId` | 表单标识，可用于诊断、埋点和设计器。 |
| `model` | 初始值树。 |
| `fields` | 字段树，是 FormX 渲染和运行的主体。 |
| `rulesV2` | 表单级规则数组，用于复杂联动。 |
| `ui` | 表单级布局配置。 |
| `policy` | 隐藏提交、校验触发、资源加载等策略。 |

## 字段基础结构

```ts
type FieldSchema = {
  id: string
  type: string
  label?: string
  props?: Record<string, unknown>
  rules?: ValidationRule[]
  showWhen?: string
  requiredWhen?: string
  disableWhen?: string
  readOnlyWhen?: string
  compute?: string
  optionsFrom?: ResourceBinding
  fields?: FieldSchema[]
  template?: FieldSchema[]
  defaultItem?: Record<string, unknown>
}
```

`id` 是字段在值树里的路径片段。普通字段会直接落到 `model[id]`；容器字段会继续向下构建对象或数组。

## 字段类型

当前 Vue + Element Plus 皮肤覆盖常见业务控件：

| 类型 | 用途 |
| --- | --- |
| `input`、`textarea`、`number` | 文本、多行文本、数字。 |
| `select`、`radio`、`checkbox` | 选项型控件。 |
| `date-picker`、`time-picker`、`time-select` | 日期和时间。 |
| `switch`、`slider` | 布尔值和范围值。 |
| `cascader`、`tree-select`、`autocomplete` | 层级数据、树形数据、搜索输入。 |
| `upload` | 上传字段。 |
| `text`、`divider`、`separator`、`spacer` | 展示和布局辅助。 |
| `form-object` | 对象容器。 |
| `field-group` | 数组对象容器。 |
| `custom` | 自定义组件桥接。 |

## 对象容器

`form-object` 用来表达对象结构。它不会把所有字段压平，而是保留值树层级。

```ts
{
  id: 'database',
  type: 'form-object',
  label: '数据库配置',
  fields: [
    { id: 'host', type: 'input', label: '地址' },
    { id: 'port', type: 'number', label: '端口' }
  ]
}
```

对应值：

```json
{
  "database": {
    "host": "127.0.0.1",
    "port": 3306
  }
}
```

## 数组容器

`field-group` 用来表达数组对象。适合规则列表、联系人列表、策略明细、连接参数等场景。

```ts
{
  id: 'rules',
  type: 'field-group',
  label: '规则列表',
  defaultItem: { field: '', operator: 'eq', value: '' },
  props: {
    mode: 'table',
    addText: '添加规则'
  },
  template: [
    { id: 'field', type: 'select', label: '字段' },
    { id: 'operator', type: 'select', label: '操作符' },
    { id: 'value', type: 'input', label: '值' }
  ]
}
```

对应值：

```json
{
  "rules": [
    { "field": "status", "operator": "eq", "value": "enabled" }
  ]
}
```

## 字段短写

字段级短写适合表达局部联动：

```ts
{
  id: 'reason',
  type: 'textarea',
  label: '原因',
  showWhen: 'enabled === false',
  requiredWhen: 'enabled === false'
}
```

这些短写会被编译成规则。对于简单场景，短写更清晰；对于跨组、批量、异步、多 effect 的场景，应使用 `rulesV2`。

## 路径和作用域

FormX 的路径使用点号表达对象层级，用数组下标表达实例路径：

```txt
database.host
rules[0].field
rules[0].conditions[2].value
```

规则和 schema 中也可以使用模式路径：

```txt
rules[].field
rules[].conditions[].value
```

在数组作用域里：

- `$self` 表示当前数组项。
- `$parent` 表示父作用域。
- `$root` 表示整棵值树。
- `$item` 可用于聚合表达式中的当前项。

详情见 [路径与作用域](/guide/paths-and-scope)。

## 设计 schema 的建议

- 先按业务对象建值树，不要为了 UI 布局提前压平字段。
- 对象用 `form-object`，数组用 `field-group`。
- 简单联动放字段短写，复杂流程放 `rulesV2`。
- 远程数据统一放 `optionsFrom` 或资源规则，不要混在组件生命周期。
- schema 中只放可序列化配置；函数、组件实例、请求实现放注册表或运行时桥接。
