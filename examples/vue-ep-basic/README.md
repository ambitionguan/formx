# FormX Vue + Element Plus Workbench

这个示例用于展示接近真实后台业务的 FormX 演示强度，而不是只展示一个最小表单。它把复杂 schema、远程资源、字段组、联动规则和运行时调试放在同一个 Workbench 中，便于开源后快速检查 FormX 的真实能力边界。

## 运行

```sh
pnpm --filter @formxjs/example-vue-ep-basic dev
```

## 覆盖场景

- 全量能力展示：基础字段、对象容器、数组容器、远程选项、上传、自定义组件、计算字段和运行时 patch。
- 场景模式：配置型弹窗、动态数组配置等接近生产后台的复杂表单。
- 联动模型：深层对象联动、流程分段表单、矩阵型录入。
- 运行时能力：`optionsFrom`、`setOptions`、远程资源 mock、校验策略切换。
- 调试面板：实时展示 values、errors、engine state、diagnostics 和当前 schema。

## English

This example is a FormX workbench for realistic admin-style workflows. It is not a minimal starter form; it brings complex schemas, remote resources, field groups, linkage rules, and runtime inspection into one app so the open-source project can demonstrate realistic FormX behavior.

### Run

```sh
pnpm --filter @formxjs/example-vue-ep-basic dev
```

### Coverage

- Full showcase: base fields, object containers, array containers, remote options, uploads, custom components, computed fields, and runtime patches.
- Business forms: connection configuration and data protection policy forms close to production admin use cases.
- Linkage models: deep order linkage, onboarding linkage, and permission matrix.
- Runtime behavior: `optionsFrom`, `setOptions`, mocked remote resources, and validation policy switches.
- Inspector: live values, errors, engine state, diagnostics, and active schema.
