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
| [场景模式](/examples/business-scenarios) | 控件覆盖、配置型弹窗、动态数组、远程资源、深层联动、矩阵录入。 |

## 示例工程

完整业务 workbench 在：

```txt
examples/vue-ep-basic
```

它包含更接近真实项目的通用场景模式：

- 全量能力展示：覆盖字段、容器、数组、远程资源、上传和自定义组件。
- 配置型弹窗：多区块、多字段组、异步回填和提交校验。
- 控件能力矩阵：验证当前皮肤支持的输入、选择、日期、上传等控件。
- 动态数组配置：数组项作用域、行内联动、增删复制。
- 远程资源绑定：`optionsFrom`、参数依赖、级联刷新。
- 运行时选项改写：使用 `rulesV2` 动态更新字段选项。
- 深层对象联动：对象、数组、跨层字段和派生值。
- 流程分段表单：按步骤、角色或状态组织字段区块。
- 矩阵型录入：多行多列配置、动态必填和提交前校验。

这些示例的目标不是展示“能渲染控件”，而是展示 FormX 如何承载复杂业务表单的结构、规则、资源和运行时。
