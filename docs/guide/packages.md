# Package Boundaries / 包边界

## 中文

FormX 适合拆包发布。核心原因是“表单逻辑”和“渲染皮肤”生命周期不同：

| Package | 发布定位 |
| --- | --- |
| `@formx/core` | 纯逻辑引擎，可用于 Node、浏览器、设计器、测试、React/Vue/任意框架。 |
| `@formx/ui-core` | 把 engine 状态转换成框架无关的 `FormView` / `FieldView`。 |
| `@formx/vue-core` | Vue 响应式桥接层，不绑定具体组件库。 |
| `@formx/vue-ep` | Vue + Element Plus 皮肤，负责字段渲染和样式。 |
| `@formx/vue` | Vue 用户的默认入口，重导出常用能力。 |

推荐依赖方向保持单向：

```text
core <- ui-core <- vue-core <- vue-ep <- vue
```

这样后续要做 React、Ant Design Vue 或自研组件库皮肤时，不需要改核心引擎。

## English

FormX should be published as several packages because form logic and renderer skins evolve at different speeds:

| Package | Publishing role |
| --- | --- |
| `@formx/core` | Headless engine for Node, browsers, designers, tests, Vue, React, or any other runtime. |
| `@formx/ui-core` | Converts engine state into framework-neutral `FormView` / `FieldView` models. |
| `@formx/vue-core` | Vue reactive bridge without binding to a component library. |
| `@formx/vue-ep` | Vue + Element Plus skin for field rendering and styles. |
| `@formx/vue` | Default Vue entry that re-exports the common APIs. |

Keep dependencies one-way:

```text
core <- ui-core <- vue-core <- vue-ep <- vue
```

That boundary makes future React, Ant Design Vue, or custom renderer packages possible without changing the engine.
