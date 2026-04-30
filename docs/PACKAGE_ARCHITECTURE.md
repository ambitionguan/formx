# Package Architecture / 包架构

## 中文

FormX 采用小包拆分，保证核心逻辑、UI 协议、框架适配和组件库皮肤之间的依赖方向清晰。

```text
@formx/core
  -> @formx/ui-core
    -> @formx/vue-core
      -> @formx/vue-ep
        -> @formx/vue
```

## `@formx/core`

纯 Headless 引擎。它拥有 schema 类型、规则编译与执行、表达式求值、校验、资源请求、路径工具和诊断能力。

约束：不能依赖 Vue、React、Element Plus 或业务项目 i18n。它应该可以在 Node、浏览器、设计器和测试环境中独立运行。

## `@formx/ui-core`

框架无关的 UI 协议层。它把 engine state + schema 转换为 `FormView`、`FieldView`、容器视图、布局元数据和字段组命令。

约束：不能导入 Vue 或 Element Plus。未来的 React、Svelte、Web Components 适配层都应该复用这里的视图模型。

## `@formx/vue-core`

Vue runtime 桥接层。它处理 Vue 响应式、engine 生命周期、`FormView` 订阅、字段组状态和 composables。

约束：不能导入 Element Plus。它只负责 Vue 运行时，不负责具体组件库渲染。

## `@formx/vue-ep`

Vue + Element Plus 皮肤层。它把 `FieldView` 和 `ContainerView` 映射为 Element Plus 组件，并维护皮肤 CSS 和默认文案。

## `@formx/vue`

Vue 用户的默认便捷入口。它重导出核心引擎、UI 协议类型、Vue runtime helpers 和 Element Plus 皮肤，让常规使用者只需要记一个入口包。

---

## English

FormX is split into small packages so the dependency direction between engine logic, UI protocol, framework adapters, and component-library skins stays explicit.

```text
@formx/core
  -> @formx/ui-core
    -> @formx/vue-core
      -> @formx/vue-ep
        -> @formx/vue
```

## `@formx/core`

Pure headless engine. It owns schema types, rule compilation and execution, expression evaluation, validation, resource loading, path utilities, and diagnostics.

Constraint: it must not depend on Vue, React, Element Plus, or app-level i18n. It should run independently in Node, browsers, designers, and tests.

## `@formx/ui-core`

Framework-neutral UI protocol. It converts engine state and schema into `FormView`, `FieldView`, container views, layout metadata, and field-group commands.

Constraint: it must not import Vue or Element Plus. Future React, Svelte, and Web Components adapters should reuse this view model layer.

## `@formx/vue-core`

Vue runtime bridge. It handles Vue reactivity, engine lifecycle, `FormView` subscriptions, field-group state, and composables.

Constraint: it must not import Element Plus. It is responsible for Vue runtime behavior, not component-library rendering.

## `@formx/vue-ep`

Vue + Element Plus skin. It maps `FieldView` and `ContainerView` to Element Plus components and owns skin CSS and default messages.

## `@formx/vue`

Default convenience entry for Vue users. It re-exports the core engine, UI protocol types, Vue runtime helpers, and the Element Plus skin, so common users only need one primary entry package.
