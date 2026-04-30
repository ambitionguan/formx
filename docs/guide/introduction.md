# Introduction / 介绍

## 中文

FormX 是一套面向复杂业务系统的 Headless 动态表单引擎。它的目标不是再封装一个组件库表单，而是把表单中最难治理的部分抽出来：字段结构、路径、默认值、联动规则、校验规则、远程选项、运行时状态和诊断能力。

普通的后台表单在字段少的时候很好维护。一旦出现对象嵌套、数组项、跨字段联动、动态必填、异步校验、远程选项、编辑回填、设计器生成配置等场景，代码很容易变成很多 `watch`、`computed`、`v-if`、`rules` 和接口调用散落在组件里。FormX 选择把这些行为收敛到 JSON schema 和 headless engine 中，让 UI 只负责渲染当前视图状态。

### FormX 解决什么问题

| 传统写法 | FormX 写法 |
| --- | --- |
| 每个页面手写 `el-form-item`、`el-input`、`el-select` | 用 `fields` 描述字段树，由皮肤层渲染 |
| 联动写在组件 `watch` 和事件回调里 | 用 `showWhen`、`requiredWhen`、`rulesV2` 集中描述 |
| 远程选项请求和 UI 组件强绑定 | 用 `ResourceManager` 注册资源，schema 只引用资源名 |
| 校验规则重复散落在业务文件里 | 内置规则、命名 pattern、命名 validator 可复用 |
| 动态数组和嵌套对象容易丢路径上下文 | `form-object`、`field-group` 和 `$self/$parent/$root` 统一处理 |
| 设计器输出难以落地为运行时 | JSON DSL 可以被存储、审查、生成、回放和测试 |

### 核心设计

FormX 的核心设计可以概括为四点：

1. **Headless first**：`@formx/core` 不依赖 Vue、React、Element Plus 或浏览器 DOM。它只处理值、状态、规则和校验。
2. **JSON driven**：字段、容器、联动、远程选项和大部分校验都能用 JSON 表达，适合设计器和后端配置生成。
3. **State as protocol**：UI 皮肤不直接理解业务规则，只消费 `state[path]` 中的 `visible`、`disabled`、`required`、`options`、`errors`、`loading` 等状态。
4. **Renderer replaceable**：当前仓库优先维护 Vue + Element Plus 皮肤，但核心边界允许后续接 React、Ant Design Vue 或自研组件库。

### 三层运行模型

```text
FormSchema
  -> @formx/core: compile rules, hold values/state, validate, fetch resources
  -> @formx/ui-core: build FormView / FieldView / FieldGroupView
  -> renderer skin: Vue + Element Plus, future React or other UI libraries
```

这意味着同一份 schema 可以用于不同场景：

- 在前端页面中渲染真实表单。
- 在设计器中渲染预览。
- 在 Node 或测试环境中只跑校验和联动。
- 在后端或 AI 生成流程中做 schema 静态检查。

### 适用场景

FormX 更适合以下场景：

- 后台管理系统中大量 CRUD 弹窗和抽屉表单。
- 数据源配置、权限策略、发布流程、审批配置等复杂业务表单。
- 低代码/设计器中通过 JSON 生成运行时表单。
- 需要动态数组、对象数组、字段组、跨字段计算和远程选项的页面。
- 需要复用同一套规则到预览、运行、测试或迁移工具中的项目。

FormX 不一定适合以下场景：

- 只有两三个字段的一次性静态表单。
- 强视觉创意页，字段布局完全由定制组件控制。
- 表单逻辑已经很简单，且没有配置化、生成、复用需求。

### 与直接使用 Element Plus 的关系

FormX 不是替代 Element Plus。Element Plus 仍然负责输入框、选择器、日期、弹窗等 UI 组件。FormX 负责把复杂表单的行为变成稳定协议，然后由 `@formx/vue-ep` 把这些协议映射到 Element Plus。

你可以把它理解成：

```text
Element Plus solves controls.
FormX solves dynamic form behavior.
```

## English

FormX is a headless dynamic form engine for complex business applications. It is not just another wrapper around a UI form component. It extracts the parts that become hard to govern over time: field structure, paths, default values, linkage, validation, remote options, runtime state, and diagnostics.

Hand-written forms are easy when they have only a few fields. They become difficult when nested objects, object arrays, cross-field linkage, dynamic required state, async validation, remote options, edit-backfill flows, and designer-generated configuration appear together. FormX moves that behavior into JSON schema and a headless engine, while renderers focus on drawing the current view state.

### What FormX Solves

| Traditional approach | FormX approach |
| --- | --- |
| Hand-write every UI field | Describe the field tree with `fields` |
| Put linkage in watchers and event handlers | Describe linkage with shortcuts and `rulesV2` |
| Couple remote option requests to UI components | Register resources once and reference them from schema |
| Duplicate validation rules across pages | Reuse built-ins, named patterns, and named validators |
| Lose path context in nested arrays | Use `form-object`, `field-group`, `$self`, `$parent`, and `$root` |
| Make designer output hard to run | Store, review, generate, replay, and test JSON DSL |

### Design Principles

1. **Headless first**: `@formx/core` does not depend on Vue, React, Element Plus, or the DOM.
2. **JSON driven**: fields, containers, linkage, remote options, and most validation rules can be represented as JSON.
3. **State as protocol**: renderers consume `state[path]` such as `visible`, `disabled`, `required`, `options`, `errors`, and `loading`.
4. **Renderer replaceable**: the current maintained skin is Vue + Element Plus, but the engine boundary leaves room for React and other renderers.

### Runtime Model

```text
FormSchema
  -> @formx/core: compile rules, hold values/state, validate, fetch resources
  -> @formx/ui-core: build FormView / FieldView / FieldGroupView
  -> renderer skin: Vue + Element Plus, future React or other UI libraries
```

The same schema can render a real form, power a designer preview, run validation in tests, or drive migration tools.

### When to Use It

FormX is a good fit for admin forms, configuration workflows, policy editors, approval flows, low-code designers, dynamic arrays, cross-field computation, remote options, and projects that need reusable form behavior.

It may be unnecessary for small one-off forms, highly custom visual pages, or forms that have no configuration, generation, or reuse requirements.
