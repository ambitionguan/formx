# @formx/vue

## 中文

`@formx/vue` 是 Vue 用户的默认入口包。它聚合并重导出 FormX 常用能力：核心引擎、UI 协议类型、Vue runtime helpers，以及默认的 Element Plus 皮肤。

```ts
import { FormX, FormXEngine } from '@formx/vue'
import '@formx/vue-ep/style.css'
```

如果你只是想在 Vue + Element Plus 项目里快速使用 FormX，优先使用这个包。需要更细粒度控制时，再分别安装 `@formx/core`、`@formx/ui-core`、`@formx/vue-core` 或 `@formx/vue-ep`。

## English

`@formx/vue` is the default entry package for Vue users. It aggregates and re-exports the common FormX stack: the core engine, UI protocol types, Vue runtime helpers, and the default Element Plus skin.

```ts
import { FormX, FormXEngine } from '@formx/vue'
import '@formx/vue-ep/style.css'
```

Use this package first if you want to get started quickly in a Vue + Element Plus project. For finer control, install `@formx/core`, `@formx/ui-core`, `@formx/vue-core`, or `@formx/vue-ep` separately.
