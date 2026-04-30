# Examples / 示例

这些页面采用“文档即演示”的方式：每个示例都在 VitePress 页面里直接运行，且使用公开包名 `@formx/vue`。

These pages bring the same docs-as-demo workflow into the open-source repo: every example runs inside VitePress and uses the public `@formx/vue` package name.

## 示例列表 / Example List

| Example | What it covers |
| --- | --- |
| [Basic Form / 基础表单](/examples/basic) | `FormX` rendering, `v-model:value`, built-in controls, submit validation. |
| [Linkage / 联动规则](/examples/linkage) | `showWhen`, `requiredWhen`, `rulesV2`, value effects. |
| [Remote Options / 远程选项](/examples/remote-options) | `optionsFrom`, `ResourceManager`, request params, runtime fetch. |
| [Field Group / 字段组](/examples/field-group) | array fields, add/copy/remove operations, scoped rules. |
| [Validation / 校验](/examples/validation) | required rules, pattern registry, async named validators. |
| [Headless Core / 纯核心引擎](/examples/headless-core) | `FormXEngine` without Vue renderer. |

完整业务 workbench 示例在 `examples/vue-ep-basic`，适合验证更大的 schema。

The full workbench remains in `examples/vue-ep-basic` for larger business-style schemas.
