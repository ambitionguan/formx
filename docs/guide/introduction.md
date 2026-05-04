# 介绍

FormX 是一套面向复杂业务表单的 Headless 动态表单引擎。它把表单拆成三个稳定部分：用 JSON 描述业务结构，用核心引擎执行状态、联动、校验和资源请求，再由 UI 皮肤把中立的视图模型渲染到具体框架。

它不是一个简单的“根据配置渲染几个输入框”的组件。FormX 更适合那些字段多、层级深、联动复杂、需要设计器或配置中心参与的表单系统。

## FormX 解决什么问题

在后台管理、配置中心、流程表单、权限录入、资源绑定这类系统里，表单通常会遇到这些问题：

| 问题 | 传统写法 | FormX 写法 |
| --- | --- | --- |
| 字段重复 | 每个页面手写 `el-form-item` | 字段用 schema 描述，可复用、可生成 |
| 联动散乱 | `watch`、事件回调、条件渲染混在组件里 | `showWhen`、`compute`、`rulesV2` 集中声明 |
| 远程选项难治理 | 请求逻辑散在组件生命周期里 | `ResourceManager` 统一注册、缓存、并发和参数依赖 |
| 动态数组复杂 | 手写增删、路径、校验和错误定位 | `field-group` 原生表达数组对象和作用域 |
| UI 被锁死 | 表单逻辑绑定某个 UI 组件库 | Core 与 UI 皮肤分离，渲染层可替换 |
| 难以审查和持久化 | 业务逻辑藏在代码里 | JSON DSL 可存储、版本化、审查和回放 |

## 核心亮点

**Headless Core**
`@formxjs/core` 不依赖 Vue、React 或 Element Plus。它维护值树、字段状态、规则执行、资源请求和校验结果，适合在浏览器、Node.js、表单设计器、测试环境中独立运行。

**统一规则模型**
字段短写和 `rulesV2` 最终都会进入同一套规则执行链。简单场景用 `showWhen`、`requiredWhen`、`compute`；复杂场景用 `rulesV2` 组合 `when`、`effects`、`elseEffects`。

**面向复杂结构**
FormX 原生支持 `form-object`、`field-group`、嵌套数组、数组项作用域、`$self`、`$parent`、`$root` 和通配路径。它不是只服务扁平表单。

**资源层内建**
远程选项、级联加载、异步校验和业务查询可以通过 `ResourceManager` 管理。它支持参数模板、依赖跟踪、缓存、并发策略、失败兜底和运行时刷新。

**UI 皮肤可替换**
当前开源版本提供 Vue + Element Plus 皮肤，但引擎和 UI Core 的边界是独立的。以后可以继续实现 Vue + 其他 UI 库、React 皮肤，或接入内部设计系统。

**可诊断、可治理**
引擎能暴露诊断信息，包括规则数量、执行器类型、路径注册、图执行状态和错误详情。对于大型表单，诊断能力和性能策略比“能渲染出来”更关键。

## 三层运行模型

```txt
schema.json
  -> @formxjs/core
     编译字段短写、执行 rulesV2、维护 values/state、处理资源和校验
  -> @formxjs/ui-core
     转换成 FormView / FieldView / FieldGroupView
  -> @formxjs/vue-ep 或其他 skin
     渲染到 Vue、Element Plus 或未来的其他 UI 框架
```

这套分层的意义是：业务规则不被 UI 框架绑死，UI 皮肤也不需要理解完整业务逻辑。你可以先把复杂表单的规则跑通，再决定用哪套 UI 渲染。

## 适用场景

FormX 适合：

- 后台管理系统中的 CRUD 弹窗、Drawer、详情编辑表单。
- 策略型配置、参数配置、矩阵录入、审批流等复杂配置表单。
- 低代码或配置平台，需要将表单 schema 存到服务端。
- 表单设计器，需要预览、校验、导出和回放 schema。
- 需要一套规则引擎服务多个 UI 皮肤的产品线。

FormX 不一定适合：

- 只有两三个字段、没有联动、没有复用诉求的简单页面。
- 强依赖高度定制视觉稿、且表单逻辑很少的营销页。
- 只想用 Element Plus 原始能力，不需要 schema、规则和持久化的场景。

## 如何阅读文档

如果你第一次使用：

1. 先跑通 [快速开始](/guide/getting-started)。
2. 再看 [Schema 模型](/guide/schema)，理解字段、容器和值树。
3. 使用 [规则与短写](/guide/rules-and-shortcuts) 写显隐、必填、禁用和计算。
4. 用 [远程资源](/guide/resources) 接入选项、级联和异步数据。
5. 在真实页面中参考 [Vue 接入](/guide/vue-runtime) 和 [构建复杂表单](/guide/building-forms)。

如果你在评估架构：

- 看 [包边界](/guide/packages) 判断是否适合拆包发布。
- 看 [架构与设计](/guide/architecture) 理解 Core、UI Core、Skin 的职责。
- 看 [性能与诊断](/guide/performance) 判断大型表单是否可治理。
