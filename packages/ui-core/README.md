# @formxjs/ui-core

[Documentation](https://ambitionguan.github.io/formx/) | [GitHub](https://github.com/ambitionguan/formx) | [npm](https://www.npmjs.com/package/@formxjs/ui-core)

## 中文

`@formxjs/ui-core` 是 FormX 的框架无关 UI 协议层。它把 `@formxjs/core` 的 engine state 和 schema 转换为稳定的视图模型，例如 `FormView`、`FieldView`、容器视图、布局元数据和字段组命令。

这个包不依赖 Vue、React 或 Element Plus。它的价值是让不同 UI 渲染层复用同一套视图协议，避免每个框架都重新实现 schema 到 UI 树的转换逻辑。

## English

`@formxjs/ui-core` is the framework-neutral UI protocol layer for FormX. It converts `@formxjs/core` engine state and schema into stable view models such as `FormView`, `FieldView`, container views, layout metadata, and field-group commands.

This package does not depend on Vue, React, or Element Plus. Its purpose is to let different renderers share the same UI protocol instead of rebuilding schema-to-view logic for every framework.
