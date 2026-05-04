# 包边界

FormX 采用多包结构。核心原则是：逻辑引擎独立，UI 协议独立，框架适配独立，具体 UI 皮肤独立。

## 包列表

| 包 | 职责 | 是否依赖 UI |
| --- | --- | --- |
| `@formx/core` | Schema 类型、规则编译、表达式、值树、状态、校验、资源层、诊断。 | 否 |
| `@formx/ui-core` | 将 Core 的状态转换成 UI 中立的 `FormView`、`FieldView`、容器视图和字段组视图。 | 否 |
| `@formx/vue-core` | Vue 组合式封装，提供 engine 生命周期、响应式视图、组件暴露方法。 | 依赖 Vue |
| `@formx/vue-ep` | Vue + Element Plus 皮肤，负责控件渲染、布局、错误展示、字段组 UI。 | 依赖 Vue 和 Element Plus |
| `@formx/vue` | Vue 默认入口，面向应用侧的聚合包。 | 依赖 Vue 相关包 |

## 为什么要这样拆

如果只发布一个大包，短期上手简单，但长期会带来几个问题：

- Core 被 Vue 或 Element Plus 锁住，无法在设计器、Node、测试环境中独立运行。
- React、Ant Design Vue、自研 UI 皮肤会被当前渲染实现阻塞。
- 业务规则、UI 视图模型、具体控件渲染混在一起，扩展和诊断成本很高。
- 开源用户只想用核心引擎时，也会被迫安装完整 UI 依赖。

多包结构让每层只承担自己的责任：

```txt
@formx/core      业务逻辑协议
@formx/ui-core   UI 中立视图协议
@formx/vue-core  Vue 生命周期与响应式适配
@formx/vue-ep    Element Plus 皮肤
@formx/vue       推荐入口
```

## 应用侧怎么选包

大多数 Vue + Element Plus 项目只需要：

```bash
pnpm add @formx/vue vue element-plus
```

然后从聚合入口使用：

```ts
import { FormX, FormXEngine, ResourceManager } from '@formx/vue'
import '@formx/vue/style.css'
```

如果你只需要引擎，不渲染 UI：

```bash
pnpm add @formx/core
```

```ts
import { FormXEngine } from '@formx/core'
```

如果你要做新的 UI 皮肤，通常会依赖：

```bash
pnpm add @formx/core @formx/ui-core
```

Vue 皮肤还会用到：

```bash
pnpm add @formx/vue-core
```

## 未来扩展包命名

如果后续扩展 React 或其他 UI 皮肤，建议继续沿用同样分层：

| 场景 | 建议包名 | 说明 |
| --- | --- | --- |
| React 框架适配 | `@formx/react-core` | React hooks、订阅、ref handle、视图状态。 |
| React + Ant Design 皮肤 | `@formx/react-antd` | 将 `FieldView` 渲染为 Ant Design 组件。 |
| React 默认入口 | `@formx/react` | 面向应用侧的推荐入口，聚合 React 适配和默认皮肤。 |
| Vue + 其他 UI 库 | `@formx/vue-naive`、`@formx/vue-antd` | 复用 `@formx/vue-core`，只替换皮肤。 |
| 内部设计系统 | `@formx/vue-company-ui` 或 `@formx/react-company-ui` | 复用 Core 和 UI Core，落到企业组件库。 |

这些包不需要重新实现规则、资源和校验。React 或其他框架的重点是实现适配层，皮肤包的重点是消费 `@formx/ui-core` 的视图模型。

## 版本策略

建议所有 FormX 官方包保持同一个版本号发布。原因是这些包共享 schema、view model 和运行时协议，统一版本能降低用户排查兼容问题的成本。

可以接受的兼容边界：

- `@formx/core` 的 schema 和 engine API 需要最稳定。
- `@formx/ui-core` 的视图模型变更要明确标注，因为它影响所有皮肤。
- `@formx/vue-ep` 可以更快迭代控件和交互，但不能破坏公开暴露方法。

## 开源用户应该理解的边界

FormX 的核心价值不在某个 Element Plus 控件封装，而在这套协议：

- JSON Schema 负责描述业务表单。
- Core 负责执行规则、值、状态、资源、校验。
- UI Core 负责把状态变成可渲染视图。
- Skin 负责把视图落到具体 UI 框架。

理解这条边界后，用户就能判断什么时候写 schema、什么时候注册资源、什么时候扩展自定义组件，什么时候需要实现新的皮肤。
