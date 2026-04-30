# Schema Model / Schema 模型

## 中文

FormX schema 是运行时的唯一配置入口。它描述初始模型、字段树、布局信息、字段级规则和全局 `rulesV2`。

```ts
import type { FormSchema } from '@formx/vue'

const schema: FormSchema = {
  version: '1.0.0',
  formId: 'service-release',
  model: {
    profile: { name: '', type: 'api' },
    contacts: []
  },
  ui: {
    labelWidth: '140px',
    labelSuffix: ':'
  },
  fields: [],
  rulesV2: []
}
```

### 顶层字段

| Key | 说明 |
| --- | --- |
| `version` | schema 版本，便于未来迁移和设计器校验。 |
| `formId` | 可选表单标识，用于诊断、设计器或业务埋点。 |
| `model` | 初始值树。组件使用 `v-model:value` 时，外部值会和 engine 同步。 |
| `ui` | 表单级 UI 配置，例如 label 宽度、冒号、尺寸等。 |
| `fields` | 字段和容器树。 |
| `rulesV2` | 全局规则数组，处理复杂联动和 effect。 |

### 字段基础结构

每个字段都至少包含 `id` 和 `type`：

```json
{
  "id": "projectName",
  "type": "input",
  "label": "Project name",
  "props": { "placeholder": "Enter a project name" },
  "rules": [{ "required": true, "message": "Project name is required." }]
}
```

常用字段属性：

| Key | 说明 |
| --- | --- |
| `id` | 当前容器内唯一。会参与路径计算。 |
| `type` | 字段类型，如 `input`、`select`、`field-group`。 |
| `label` | 渲染层展示名称。 |
| `props` | 透传到具体 UI 控件的属性。 |
| `rules` | 字段级校验规则。 |
| `showWhen` / `requiredWhen` | 字段级联动短写。 |
| `optionsFrom` | 远程选项资源名。 |
| `compute` | 计算字段短写。 |

### 字段类型

当前 Vue + Element Plus 皮肤覆盖常见后台字段：

| Type | 用途 |
| --- | --- |
| `input` / `textarea` / `number` | 文本、多行文本、数字。 |
| `select` / `radio` / `checkbox` | 单选、多选和选项型控件。 |
| `date-picker` / `time-picker` / `time-select` | 日期和时间。 |
| `switch` / `slider` | 布尔值和范围值。 |
| `cascader` / `tree-select` | 层级数据选择。 |
| `upload` | 文件上传。 |
| `text` / `divider` / `separator` / `spacer` | 展示和布局辅助。 |
| `form-object` | 对象容器。 |
| `field-group` | 对象数组容器。 |
| `custom` | 自定义渲染组件。 |

### `form-object`

`form-object` 用于对象结构和布局分组。默认情况下，子字段路径会追加父级 `id`：

```json
{
  "id": "profile",
  "type": "form-object",
  "label": "Profile",
  "children": [
    { "id": "name", "type": "input", "label": "Name" },
    { "id": "type", "type": "select", "label": "Type" }
  ]
}
```

对应值路径：

```json
{
  "profile": {
    "name": "",
    "type": ""
  }
}
```

如果 `form-object` 只是布局容器，可以使用 `flatten: true` 让子字段不追加父级路径。

### `field-group`

`field-group` 用于对象数组，例如联系人、规则列表、数据源参数、审批节点。

```json
{
  "id": "contacts",
  "type": "field-group",
  "label": "Contacts",
  "defaultItem": { "role": "owner", "name": "", "email": "" },
  "min": 1,
  "max": 5,
  "operations": {
    "add": { "text": "Add contact" },
    "copy": { "text": "Copy" },
    "remove": { "text": "Remove" }
  },
  "template": [
    { "id": "role", "type": "select", "label": "Role" },
    { "id": "name", "type": "input", "label": "Name" },
    { "id": "email", "type": "input", "label": "Email" }
  ]
}
```

对应路径模式为 `contacts[].role`、`contacts[].name`、`contacts[].email`。在 scoped rule 中通常使用 `$self.role` 引用当前数组项。

### 路径和作用域

FormX 使用路径定位值和状态：

| Path | 含义 |
| --- | --- |
| `profile.name` | 对象字段。 |
| `contacts[0].email` | 第一个联系人邮箱。 |
| `contacts[].email` | 联系人邮箱的路径模式。 |
| `$root.profile.name` | 从根值树解析。 |
| `$self.email` | 当前 `scope` 实例内解析。 |
| `$parent.contacts[]` | 当前 scope 的父容器下解析。 |

路径统一后，规则、校验、远程资源、诊断和 UI 渲染都可以使用同一套寻址方式。

## English

The FormX schema is the single runtime configuration entry. It describes the initial model, field tree, UI hints, field-level rules, and global `rulesV2`.

### Top-level Keys

| Key | Meaning |
| --- | --- |
| `version` | Schema version for migration and designer validation. |
| `formId` | Optional form identifier for diagnostics or product analytics. |
| `model` | Initial value tree. External `v-model:value` stays in sync with the engine. |
| `ui` | Form-level UI hints such as label width and suffix. |
| `fields` | Field and container tree. |
| `rulesV2` | Global rules for advanced linkage and effects. |

### Fields and Containers

Every field has an `id` and `type`. Simple fields represent controls; `form-object` represents an object container; `field-group` represents an array of objects.

FormX paths are shared by values, state, rules, validation, remote resources, diagnostics, and renderers. This is what allows the engine to stay headless while still driving complex UI behavior.
