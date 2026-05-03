# 示例

FormX 的示例采用“文档即演示”的方式：页面里的表单是真正运行的 FormX 组件，不是截图。

建议按这个顺序学习：

| 示例 | 覆盖能力 |
| --- | --- |
| [基础表单](/examples/basic) | `FormX` 渲染、`v-model:value`、内置控件、提交校验。 |
| [联动规则](/examples/linkage) | `showWhen`、`requiredWhen`、`rulesV2`、值 effect。 |
| [远程选项](/examples/remote-options) | `optionsFrom`、`ResourceManager`、参数依赖、运行时请求。 |
| [字段组](/examples/field-group) | 数组字段、增删复制、作用域规则。 |
| [校验](/examples/validation) | 必填、命名 pattern、异步 validator。 |
| [纯核心引擎](/examples/headless-core) | 不依赖 Vue 的 `FormXEngine`。 |
| [业务场景](/examples/business-scenarios) | 控件矩阵、连接配置、数据策略、深层联动、权限矩阵。 |

## 示例工程

完整业务 workbench 在：

```txt
examples/vue-ep-basic
```

它包含更接近真实项目的 schema：

- 全量能力展示。
- 连接配置。
- 控件矩阵。
- 数据保护策略。
- 远程选项策略。
- 运行时 `setOptions`。
- 订单深层联动。
- 用户入职联动。
- 权限矩阵。

这些示例的目标不是展示“能渲染控件”，而是展示 FormX 如何承载复杂业务表单的结构、规则、资源和运行时。
