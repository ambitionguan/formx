# formx UI Core & Skin 架构说明

本文约定了 formx 在「表单逻辑 → 视图模型 → UI 皮肤」三层上的设计思路、协议和扩展方式，作为后续开发与重构的参考文档。

---

## 1. 总体设计思路

- **目标**：彻底解耦「表单逻辑」与「UI 皮肤」。
  - 表单规则、联动、远程数据、校验等全部在 formx 核心里完成。
  - UI 只是不同的“皮肤”（Element Plus / Web Components / React 等），复用同一套逻辑。
- **路径**：三层架构 + 明确协议：
  1. Core 层（`@formxjs/core`）：只管 schema / values/state / 规则执行。
  2. UI Core 层（`@formxjs/ui-core`）：把 Core 的输出转成视图模型树 + 命令。
  3. Skin 层（例如 `@formxjs/vue-ep`）：把视图模型渲染为具体 UI 组件，对外暴露框架组件。

---

## 2. 分层架构与职责

### 2.1 Core：`@formxjs/core`

- 职责：
  - 定义 DSL：`FormSchema` / `RuleV2` / `FormXEngine`。
  - 规则编译与执行：when/effects、optionsFrom、compute、rulesV2 等。
  - 状态管理：`values` + `state`（visible/disabled/required/options/errors/loading/patch）。
- 暴露 API（简要）：

  ```ts
  new FormXEngine({ schema, performance?, policy? })
  engine.getValues()
  engine.getState()
  engine.getSubmitValues()
  engine.setValue(path, value)
  engine.dispatch('init' | 'submit' | 'event:xxx' | 'change:path')
  engine.subscribe(diff => void)
  engine.on(event, handler)
  engine.subscribePaths(patterns, handler)
  ```

- 不做：不产生任何 UI 相关类型（节点、布局），不依赖 Vue/React/ElementPlus。

### 2.2 UI Core：`@formxjs/ui-core`

UI Core 分两层视图模型。

#### 2.2.1 UiNode：Engine + Schema → UiNode[]

一层非常接近 Schema 的 UI 中立模型：

```ts
interface UiLayout {
  type?: 'grid' | 'flex' | 'horizontal' | 'vertical' | 'inline' | 'table'
  span?: number
  cols?: number
  flex?: { direction?: 'row' | 'column'; gap?: number; align?; justify? }
}

interface UiFieldNode {
  kind: 'field'
  id: string
  path: string       // a.b[0].c
  type: string       // input/select/...
  label?: string
  value: any
  state: { visible; disabled; readOnly; required; loading; errors: string[] }
  ui: Record<string, any>  // schema.props + state.options + patch.props 合并
  layout?: UiLayout
}

interface UiContainerNode {
  kind: 'container'
  type: 'form-object' | 'field-group' | 'field-group-item' | string
  id?: string
  path?: string
  label?: string
  children: UiNode[]
  ui?: Record<string, any>
  layout?: UiLayout
}

type UiNode = UiFieldNode | UiContainerNode | UiCustomNode
```

构建函数：

```ts
function buildUiTree(engine: FormXEngine, schema: FormSchema): UiNode[]
```

负责：

- 路径统一：`form-object` 子字段、`field-group` 数组 → `rules[0].xxx` 等。
- 数组展开：`field-group` → `field-group` + `field-group-item`。
- 动态 options 合并到 `ui.options`。
- 布局收敛到 `UiLayout`。

#### 2.2.2 FormView：UiNode → 视图树 + 命令

为皮肤层提供更“友好”的视图模型，并附带命令，避免皮肤接触 Engine 细节：

```ts
interface FieldView {
  id: string
  path: string
  type: string            // canonical type: input/select/...
  label: string
  value: any
  visible: boolean
  disabled: boolean
  readOnly: boolean
  required: boolean
  errors: string[]
  uiProps: Record<string, any>     // 已合并好的 UI props
  setValue: (val: any) => void     // 封装 engine.setValue(path, val)
}

interface ContainerView {
  kind: 'form-object' | 'field-group' | 'field-group-item' | string
  id?: string
  path?: string
  label?: string
  layout?: UiLayout
  uiProps: Record<string, any>
  children: Array<ContainerView | FieldView>
}

interface FieldGroupView extends ContainerView {
  kind: 'field-group'
  commands: {
    add(value?: any): void
    remove(index: number): void
    copy(index: number): void
    move(from: number, to: number): void
  }
}

interface FormView {
  containers: ContainerView[]
}

function buildFormView(engine: FormXEngine, schema: FormSchema): FormView
```

职责：

- 合并 label（schema.label + patch.label）。
- 计算 required（静态规则 + state.required）。
- 格式化错误（配合 messageResolver）。
- 统一 options/uiProps（schema.props + patch.props + state.options）。
- 封装 field-group 的 add/remove/copy/move 命令，内部处理 path/engine.setValue。

> 约束：**皮肤层不再直接读写 Engine 的 state 或手写 path，仅通过 view.setValue / commands 调用。**

#### 2.2.3 FormView Runtime：Engine/Schema 变化 → View 刷新

UI 适配层负责“把 Engine + Schema 转成可订阅的视图快照”，避免皮肤层自行订阅或做刷新判断。  
`FormView Runtime` 是一个框架无关的桥接能力，统一处理：

- Engine diff 订阅与清理
- Schema 变更触发视图重建
- 向 UI 层提供稳定的 `getFormView()` 与 `subscribe()`

接口示意：

```ts
type FormViewRuntime = {
  getEngine(): EngineLike
  getSchema(): FormSchema
  setEngine(next: EngineLike): void
  setSchema(next: FormSchema): void
  getFormView(): FormView
  subscribe(listener: () => void): () => void
  dispose(): void
}

function createFormViewRuntime(engine: EngineLike, schema: FormSchema): FormViewRuntime
```

> 约定：皮肤层不直接订阅 Engine，也不维护视图刷新逻辑；只消费 `FormView` 快照与命令。

示例：Adapter 接入（React / Svelte）

```ts
// React
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { createFormViewRuntime } from '@formxjs/ui-core'

export function useFormViewRuntime(engine: FormXEngine, schema: FormSchema) {
  const runtime = useMemo(() => createFormViewRuntime(engine, schema), [engine])
  useEffect(() => { runtime.setSchema(schema) }, [runtime, schema])
  useEffect(() => () => runtime.dispose(), [runtime])
  return useSyncExternalStore(runtime.subscribe, runtime.getFormView, runtime.getFormView)
}
```

```ts
// Svelte
import { readable } from 'svelte/store'
import { createFormViewRuntime } from '@formxjs/ui-core'

export function createFormViewStore(engine: FormXEngine, schema: FormSchema) {
  const runtime = createFormViewRuntime(engine, schema)
  const store = readable(runtime.getFormView(), (set) => {
    const off = runtime.subscribe(() => set(runtime.getFormView()))
    return () => { off(); runtime.dispose() }
  })
  return { store, runtime }
}
```

#### 2.2.4 FieldGroup 的 UI 语义（list/tabs/cards）

实际业务中，像「代理账号」「自定义参数列表」这类字段组，往往需要更丰富的 UI 表现：

- 普通列表（list）：每行一个子表单，右侧有删除按钮，底部有“+ 添加”。
- 标签页（tabs）：顶部 Tab 切换，下方是当前账号的表单内容，Tab 上可显示名称和关闭按钮。
- 卡片（cards）：每个实例渲染为一个卡片，可在卡片头部放操作按钮。

UI Core 不直接决定具体外观，而是通过 `FieldGroupView` 暴露中立的 UI 语义，供皮肤层消费：

```ts
export interface FieldGroupOperationConfig {
  show?: boolean
  text?: string
  icon?: any
  className?: string
  style?: Record<string, any>
  disabledMessage?: string
  defaultItem?: any
}

export interface FieldGroupOperations {
  add?: FieldGroupOperationConfig
  copy?: FieldGroupOperationConfig
  move?: FieldGroupOperationConfig
  remove?: FieldGroupOperationConfig
  position?: 'left' | 'right' | 'top' | 'bottom'
}

export interface FieldGroupItemLayout {
  type?: 'flex' | 'grid'
  direction?: 'row' | 'column'
  gap?: number
  wrap?: 'nowrap' | 'wrap'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
}

export interface FieldGroupToolbarButton {
  key?: string
  action?: 'add' | 'remove' | 'custom'
  text?: string
  icon?: any
  position?: 'left' | 'right'
  placement?: 'header' | 'footer'
  props?: Record<string, any>
}

export interface FieldGroupTableColumn {
  field: string
  label?: string
  width?: number | string
  span?: number
  align?: 'left' | 'center' | 'right'
}

export interface FieldGroupTableConfig {
  columns?: FieldGroupTableColumn[]
  actionsWidth?: number | string
  emptyText?: string
}

export interface FieldGroupPresentation {
  type?: 'list' | 'cards' | 'tabs' | 'table' | 'custom'
  tabLabelField?: string
  tabClosable?: boolean
  addButtonText?: string
  addButtonIcon?: string
  toolbar?: FieldGroupToolbarButton[]
  table?: FieldGroupTableConfig
  extra?: Record<string, any>
}

export interface FieldGroupItemMeta {
  titleField?: string
  descriptionField?: string
  iconField?: string
  extra?: Record<string, any>
}

export interface FieldGroupView extends ContainerView {
  type: 'field-group'
  operations?: FieldGroupOperations
  itemLayout?: FieldGroupItemLayout
  presentation?: FieldGroupPresentation
  itemMeta?: FieldGroupItemMeta
  showIndex?: boolean
  indexWidth?: number | string
  sortable?: boolean
  min?: number
  max?: number
  commands: {
    add(value?: any): void
    remove(index: number): void
    copy(index: number): void
    move(from: number, to: number): void
  }
}
```

- Core schema 中的字段（`operations` / `layout.itemLayout` / `presentation` / `itemMeta` / `min` / `max` 等）在 `buildUiTree` 阶段被收敛到 `UiContainerNode.ui`，再由 `buildFormView` 解析为上面的强类型字段。
- 皮肤可以根据 `presentation.type` 决定采用 list / tabs / cards / 自定义渲染；`itemMeta.titleField` 等用来从子字段中推导卡片/标签标题。
- `operations` 提供“是否显示以及文案/图标”，真正的行为（增加/删除/复制/排序）仍然通过 `FieldGroupView.commands` 与 Engine 交互。

> 重点：**所有这些 UI 配置都停留在 UI Core 层，皮肤只是消费这些语义并映射到具体组件。** 这样未来换成 Web Components 皮肤时，只需要重写一个渲染器，而不需要复制 field-group 的行为逻辑。

### 2.3 Skin：`@formxjs/vue-ep` 等具体皮肤包

每个 UI 库对应一个皮肤包，例如：

- `@formxjs/vue-ep`（Vue + Element Plus）
- 未来可以有：`@formxjs/lit`（Web Components）、`@formxjs/react-antd`（React + AntD）等。

皮肤包内部由两部分组成：

1. **Skin 渲染器（纯函数）**

   ```ts
   interface SkinContext {
     engine: FormXEngine
     form: FormView
   }

   type FieldRenderer = (view: FieldView, ctx: SkinContext) => any   // VNode / ReactElement / Template
   type ContainerRenderer = (view: ContainerView, ctx: SkinContext) => any
   ```

   - 每种字段类型一个小文件：`InputField.tsx` / `SelectField.tsx` / `CascaderField.tsx` ……
   - 按 type 映射：

     ```ts
     const fieldRenderers: Record<string, FieldRenderer> = {
       input: renderInputField,
       select: renderSelectField,
       cascader: renderCascaderField,
       // ...
     }
     ```

2. **框架组件出口（对业务使用者）**

   以 Vue + Element Plus 为例：

   ```ts
   // @formxjs/vue-ep
   export const FormXVueEp = defineComponent({
     props: { schema, value, defaultValue, engine, skinProps, components, ... },
     setup(props, { emit }) {
       const engine = useOrCreateEngine(props)
       const { formView } = useFormViewState(engine, toRef(props, 'schema'))

       return () => renderWithEpSkin(formView.value, { engine, form: formView.value })
     }
   })
   ```

   这就是业务 import 的最终组件。

---

## 3. 协议一览

可以理解为五层协议：

1. **Engine 协议（Core 对外）**
   - `getValues/getState/setValue/dispatch/subscribe/...`
   - 事件名：`'init' | 'change:path' | 'event:xxx' | 'submit'`
   - diff 结构：`{ event, values: [{path,prev,next}], state: [...] }`

2. **视图模型协议（Core ↔ UI Core）**
   - 输入：`FormSchema + Engine`
   - 输出：`UiNode[]`，再派生 `FormView/FieldView/ContainerView/FieldGroupView`。

3. **视图运行时协议（UI Core ↔ UI Adapter）**
   - 输入：`Engine + Schema`
   - 输出：可订阅的 `FormView` 快照（`createFormViewRuntime` / `useFormViewState`）

4. **Skin 渲染协议（UI Core ↔ Skin）**
   - Skin 接收：`FormView` + `SkinContext{engine,form}`。
   - 只使用 view 上的命令（`setValue/add/remove`），不直接操作 Engine state。

5. **组件协议（Skin 对业务/框架）**

   概念上的统一 props（不同框架实现方式略有差异）：

   ```ts
   interface FormXComponentProps {
     schema: FormSchema
     value?: Record<string, any>
     defaultValue?: Record<string, any>
     engine?: FormXEngine
     onChange?: (values: any) => void
     onSubmit?: (values: any) => void | Promise<void>
     onValidateFail?: (errors: Record<string, string[]>) => void
     skinProps?: Record<string, any>          // UI 库专有配置
     components?: Record<string, any>         // 自定义渲染组件
   }
   ```

---

## 4. 扩展方式

### 4.1 增加新控件类型

步骤：

1. 在 Core DSL 中支持新 type（如需要规则/资源支持）。
2. 在 `buildUiTree` 中认识该 type（canonicalType）。
3. 在 `buildFormView` 中定义该 type 对应的 `FieldView.type`、`uiProps`。
4. 在各个 skin 包中实现该 type 的 FieldRenderer。

> 逻辑只在 Core + UI Core 改一次，皮肤按需跟进。

### 4.2 增加新皮肤

新建包：

- `@formxjs/vue-ep`（Vue + Element Plus）
- `@formxjs/lit` 等。

统一流程：

1. 依赖 `@formxjs/core` + `@formxjs/ui-core`。
2. 在 UI Adapter 层用 `createFormViewRuntime(engine, schema)`（或 `useFormViewState`）维护视图快照。
3. 实现一套 FieldRenderer/ContainerRenderer 映射 + 一个框架组件出口。

业务层选择皮肤的方式可以是：

```ts
import { FormXVueEp } from '@formxjs/vue-ep'
// 或 import { FormXLit } from '@formxjs/lit'
```

Core 与 UI Core 不需要知道用的是哪套皮肤。

### 4.3 LiteGraph / 规则引擎 / 工作流

- 规则引擎：由 `FormXEngine` 负责。
- LiteGraph / 逻辑编排：用于生成/编辑规则 DSL（Graph → Rules），最终仍喂给 Engine。
- 工作流（审批、多步骤页面）：在业务层用 Engine + 其它服务组合。

> 这三者不进入皮肤协议或 UI Core 协议。Skin 只渲染 Engine 当前状态，并把交互反馈给 Engine。

---

## 5. 近期实施计划

结合现有代码，近期计划分阶段推进：

1. **完善 UI Core 的 FormView 层**
   - 在 `@formxjs/ui-core` 增加：
     - `FieldView/ContainerView/FieldGroupView` 类型定义。
     - `buildFormView(engine, schema)` 实现：
       - 基于现有 `buildUiTree`。
       - 集中处理 label/required/errors/options/uiProps。
       - 封装 field-group 的 add/remove 命令。

2. **新建 EP 皮肤包 `@formxjs/vue-ep`**
   - 只依赖 Core + UI Core。
   - 结构：
     - `core/context.ts`：注入 Engine + FormView。
     - `renderers/fields/*.tsx`：按类型拆分。
     - `renderers/containers/*.tsx`：form-object/field-group 等。
     - `FormXVueEp.tsx`：Vue 组件出口，实现统一 `FormXComponentProps` 协议。

3. **设计器运行预览切换到新皮肤**
   - 在 designer app 中：
     - 用 `@formxjs/vue-ep` 替换旧的临时渲染路径。
     - 保留旧实现作为 legacy，不再扩展。

4. **对齐控件行为与布局**
   - 以若干通用复杂表单模式为基准（配置型弹窗、动态数组、矩阵录入等）：
     - 对比旧渲染与新皮肤的差异。
     - 逐步补齐 upload/autocomplete/slider 等特殊行为。
     - 细化 field-group、form-array/TableForm、flatten 容器的布局与操作体验。

5. **为未来其它皮肤预留接口**
   - 在文档中固化这些协议与类型。
   - 新增皮肤包时，直接对照本说明实现对应 renderer 与组件出口即可。

> 后续所有关于 formx UI 的设计与开发，都应对照本文件的分层和协议，避免逻辑再次“下沉”到皮肤层或框架组件内部。  
