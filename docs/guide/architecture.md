# 架构与设计

FormX 的设计目标是把复杂表单从“组件实现”提升为“运行时协议”。字段、值、规则、资源和校验都由 Core 管理，UI 层只消费视图模型。

## 分层架构

```txt
Application
  -> @formxjs/vue
     推荐应用入口

Skin
  -> @formxjs/vue-ep
     Vue + Element Plus 渲染皮肤

Framework Runtime
  -> @formxjs/vue-core
     Vue 响应式和组件生命周期适配

View Protocol
  -> @formxjs/ui-core
     FormView / FieldView / FieldGroupView

Headless Runtime
  -> @formxjs/core
     Schema, rules, values, state, validation, resources, diagnostics
```

## Core 负责什么

`@formxjs/core` 是 FormX 的核心。它不关心组件库，也不直接渲染 DOM。

它负责：

- 解析 schema。
- 编译字段短写。
- 执行 `rulesV2`。
- 维护值树和字段状态。
- 处理字段显隐、禁用、只读、必填、loading、options。
- 执行校验。
- 管理资源请求。
- 输出诊断信息。

Core 可以独立运行：

```ts
import { FormXEngine } from '@formxjs/core'

const engine = new FormXEngine({ schema })
engine.dispatch('init')
engine.setValue('status', 'disabled')

console.log(engine.getValues())
console.log(engine.getState())
```

## UI Core 负责什么

`@formxjs/ui-core` 把 Core 的底层状态转换成 UI 中立视图模型。

例如一个字段会被转换成：

```ts
type FieldView = {
  id: string
  path: string
  type: string
  label?: string
  value: unknown
  visible: boolean
  disabled: boolean
  readOnly: boolean
  required: boolean
  loading: boolean
  errors: string[]
  props: Record<string, unknown>
}
```

UI Core 的存在让 FormX 可以支持多个皮肤。不同 UI 框架不需要重新理解完整规则引擎，只需要消费一致的视图模型。

## Skin 负责什么

Skin 是具体 UI 实现。当前 `@formxjs/vue-ep` 负责把 `FieldView` 渲染成 Element Plus 控件。

Skin 负责：

- 控件映射，例如 `input` -> `ElInput`。
- 表单布局。
- 错误展示。
- 字段组交互。
- 自定义组件桥接。
- DOM 级能力，例如滚动到错误。

Skin 不应该重新实现规则系统，也不应该私自维护一套与 Core 冲突的值状态。

## 规则执行模型

字段短写会被编译成规则：

```txt
showWhen / requiredWhen / compute / optionsFrom
  -> Compiler
  -> rulesV2
  -> Executor
  -> effects
  -> values/state/resources/validation
```

规则执行器可以根据规模选择轻量执行或图执行。小表单保持简单，大表单可以使用依赖图减少无意义重算。

## 为什么这套架构适合开源

开源用户的 UI 技术栈不完全一致。如果 FormX 只提供一个 Element Plus 组件，它的适用面会很窄。

拆成 Core、UI Core、Framework Runtime、Skin 后：

- 只需要逻辑引擎的用户可以安装 `@formxjs/core`。
- Vue + Element Plus 用户可以直接用 `@formxjs/vue`。
- 想做 React 皮肤的人可以复用 Core 和 UI Core。
- 想做设计器的人可以在 Node 或浏览器中独立运行 Core。
- 企业内部可以实现自己的 skin，而不必 fork 规则引擎。

## 设计原则

- schema 必须尽量可序列化。
- Core 不依赖 UI。
- UI 不重复业务规则。
- 运行时 API 要能支持真实业务生命周期。
- 诊断信息是大型表单的一等能力。
- 简单场景要简单，复杂场景要可治理。
