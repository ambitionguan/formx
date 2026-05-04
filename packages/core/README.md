# @formxjs/core

## 中文

`@formxjs/core` 是 FormX 的纯逻辑引擎包，不依赖任何 UI 框架或组件库。它负责 schema 类型、规则编译执行、表达式求值、字段校验、远程资源、路径解析、状态管理和诊断能力。

适用场景：

- 在 Node 或浏览器中单独运行表单逻辑。
- 给 Vue、React、设计器或测试环境复用同一套动态表单规则。
- 只需要联动、校验、资源和状态计算，不需要默认 UI。

```ts
import { FormXEngine } from '@formxjs/core'

const engine = new FormXEngine({
  schema,
  messages: (key, params) => t(key, params)
})

engine.dispatch('init')
engine.setValue('name', 'Ada')

const ok = await engine.validate()
const values = engine.getValues()
const errors = engine.getErrors()
```

## English

`@formxjs/core` is the headless engine package for FormX. It has no dependency on UI frameworks or component libraries. It owns schema types, rule compilation and execution, expression evaluation, field validation, remote resources, path resolution, state management, and diagnostics.

Use it when you need:

- Form logic running independently in Node or browsers.
- Shared dynamic form rules across Vue, React, designers, or tests.
- Linkage, validation, resources, and state calculation without default UI.

```ts
import { FormXEngine } from '@formxjs/core'

const engine = new FormXEngine({ schema })
```
