# 框架与皮肤扩展

FormX 的 UI 层不是写死的。当前开源包提供 Vue + Element Plus 实现，但它只是一个官方皮肤，不是 FormX 的全部架构。

FormX 真正稳定的边界是：

```txt
@formx/core
  -> 规则、状态、值树、资源、校验和诊断

@formx/ui-core
  -> FormView / FieldView 等 UI 中立视图协议

框架适配层
  -> 把 engine 和 view runtime 接入 Vue、React 或其他框架生命周期

皮肤层
  -> 把 FieldView / FormView 渲染成具体组件库
```

这也是为什么后续可以继续扩展 React、Ant Design Vue、Naive UI、Ant Design React、自研设计系统或 Web Components，而不需要复制一套规则引擎。

## 当前官方实现

当前仓库提供的是 Vue 技术栈：

| 包 | 层级 | 职责 |
| --- | --- | --- |
| `@formx/core` | 核心引擎 | 执行 schema、规则、资源、校验、诊断。 |
| `@formx/ui-core` | UI 协议 | 从 engine 生成 `FormView`、`FieldView`、容器视图和字段组视图。 |
| `@formx/vue-core` | Vue 适配 | 提供 `useFormXEngine`、`useFormViewState`、表单暴露方法和 Vue 状态工具。 |
| `@formx/vue-ep` | Vue 皮肤 | 将视图模型渲染成 Element Plus 表单、控件、字段组和布局。 |
| `@formx/vue` | 应用入口 | 聚合 Vue 运行时和默认 Element Plus 皮肤。 |

目前还没有发布官方 React 包。React 扩展应该按同样边界实现，而不是把 React 逻辑塞进 `@formx/core`。

## 两类扩展

FormX 的 UI 扩展分两类，先区分清楚会少走很多弯路。

### 框架适配

框架适配解决“如何让 engine 进入框架的响应式和生命周期”。

它应该负责：

- 创建或接收 `FormXEngine`。
- 把外部 `value/defaultValue/schema/policy/messages` 同步进 engine。
- 订阅 engine 变化，并触发框架视图刷新。
- 使用 `@formx/ui-core` 生成 `FormView`。
- 暴露 `validate()`、`resetFields()`、`getValues()` 等表单方法。
- 在组件卸载时清理订阅、请求或运行时状态。

它不应该负责：

- 渲染具体输入框。
- 写死 Element Plus、Ant Design 或其他组件库。
- 重新编译规则或维护另一棵值树。

Vue 里的 `@formx/vue-core` 就是框架适配层。未来 React 可以有类似的 `@formx/react-core`，提供 `useFormXEngine()`、`useFormViewState()`、`createFormXHandle()` 等能力。

### 皮肤实现

皮肤解决“如何把 `FieldView` 渲染成具体 UI 组件”。

它应该负责：

- 将 `FieldView` 映射成输入、选择、日期、上传、自定义组件等控件。
- 将 `FormView` 和 `ContainerView` 映射成布局。
- 展示 label、required、help、tooltip、error、loading、disabled、readOnly。
- 实现 `field-group` 的新增、删除、复制、排序、Tabs、Table、Cards、List 等交互。
- 桥接自定义组件。
- 提供 DOM 能力，例如 `scrollToField(path)`。

它不应该负责：

- 编译 `rulesV2`。
- 私自执行资源请求。
- 绕过 Core 直接改字段状态。
- 在控件内部维护一份和 engine 冲突的业务值。

Vue + Element Plus 的 `@formx/vue-ep` 就是皮肤层。React + Ant Design 可以做成 `@formx/react-antd`，Vue + 内部组件库可以做成 `@formx/vue-company-ui`。

## React 扩展路线

React 扩展建议拆成三层：

```txt
@formx/react-core
  -> React hooks、订阅、ref handle、view state

@formx/react-antd
  -> React + Ant Design 皮肤

@formx/react
  -> React 默认入口，聚合 react-core 和默认皮肤
```

这三个包是建议命名，当前仓库尚未发布。真正重要的是边界：

- `@formx/react-core` 只依赖 React、`@formx/core`、`@formx/ui-core`。
- `@formx/react-antd` 依赖 React、Ant Design 和 `@formx/react-core`。
- `@formx/react` 面向应用侧导出推荐组件和类型。

一个 React 适配层的最小形态可以是：

```tsx
import { useEffect, useMemo, useState } from 'react'
import { FormXEngine } from '@formx/core'
import { createFormViewRuntime } from '@formx/ui-core'

export function useFormXEngine(props) {
  const engine = useMemo(() => {
    return props.engine ?? new FormXEngine({
      schema: { ...props.schema, model: props.value ?? props.defaultValue ?? props.schema.model }
    })
  }, [props.engine, props.schema])

  useEffect(() => {
    engine.dispatch('init')
  }, [engine])

  return engine
}

export function useFormViewState(engine, schema) {
  const runtime = useMemo(() => createFormViewRuntime(engine, schema), [engine, schema])
  const [version, setVersion] = useState(0)

  useEffect(() => runtime.subscribe(() => setVersion((v) => v + 1)), [runtime])

  useEffect(() => () => runtime.dispose(), [runtime])

  return useMemo(() => runtime.getFormView(), [runtime, version])
}
```

这段代码只是说明结构，不是当前包的公开 API。真实实现还需要处理外部 value 同步、schema 更新、message resolver、policy、订阅清理和提交事件。

React 皮肤组件再消费这个适配层：

```tsx
import { forwardRef, useImperativeHandle } from 'react'
import { Form } from 'antd'
import { useFormXEngine, useFormViewState, createFormXHandle } from '@formx/react-core'

export const FormXReactAntd = forwardRef(function FormXReactAntd(props, ref) {
  const engine = useFormXEngine(props)
  const formView = useFormViewState(engine, props.schema)

  useImperativeHandle(ref, () => createFormXHandle(engine), [engine])

  return (
    <Form layout={formView.formUi.labelPosition === 'top' ? 'vertical' : 'horizontal'}>
      {formView.containers.map((container) => (
        <ContainerRenderer key={container.path || container.id} view={container} />
      ))}
    </Form>
  )
})
```

皮肤里的 `ContainerRenderer`、`FieldRenderer`、`FieldGroupRenderer` 只关心视图模型和组件库映射，不关心规则如何执行。

## 字段渲染映射

每个皮肤都需要一张字段映射表：

```ts
const fieldRenderers = {
  input: InputField,
  number: NumberField,
  textarea: TextareaField,
  select: SelectField,
  checkbox: CheckboxField,
  radio: RadioField,
  switch: SwitchField,
  'date-picker': DatePickerField,
  'field-group': FieldGroupRenderer,
  custom: CustomField
}
```

字段渲染器的输入应该尽量接近：

```ts
type FieldRendererProps = {
  view: FieldView
  components?: Record<string, unknown>
}
```

控件需要使用 `view.value` 展示值，通过 `view.setValue(next)` 回写值，并在合适时机调用 `view.validate?.('change')` 或 `view.validate?.('blur')`。

## 自定义组件协议

当内置控件不够时，使用 `custom` 类型。schema 只保存组件标识，不保存组件实例：

```ts
{
  id: 'userPicker',
  type: 'custom',
  label: '用户选择',
  component: 'UserPicker',
  props: {
    multiple: true
  }
}
```

Vue 皮肤中运行时传入组件：

```vue
<FormX :schema="schema" :components="{ UserPicker }" />
```

React 皮肤可以采用类似方式：

```tsx
<FormX schema={schema} components={{ UserPicker }} />
```

自定义组件要遵守字段协议：

- 接收当前值和字段状态。
- 通过标准回调回写值。
- 支持 `disabled`、`readOnly`、`loading`、`required`、`errors`。
- 不直接修改外部 model。
- 不私自发起和 FormX 资源层冲突的请求。

## 实现新皮肤的步骤

1. 确认目标：只是换 UI 库，还是换框架。
2. 如果只换 Vue UI 库，优先复用 `@formx/vue-core`。
3. 如果换到 React，先实现类似 `@formx/react-core` 的框架适配层。
4. 用 `@formx/ui-core` 生成 `FormView`。
5. 为每个字段类型建立渲染映射。
6. 实现通用字段包装，包括 label、required、error、help、loading。
7. 实现容器、布局和 `field-group`。
8. 实现自定义组件桥接。
9. 暴露与官方 Vue 皮肤一致的核心 API。
10. 写控件能力矩阵，明确哪些字段类型已支持，哪些是限制。

## 建议暴露的 API

不同皮肤应该尽量暴露一致的业务 API：

```ts
validate()
validateField(path)
resetFields()
clearValidate()
setValues(values, options)
setFieldValue(path, value)
getValues()
getSubmitValues()
getErrors()
getFirstErrorPath()
scrollToField(path)
getFieldGroupAPI(path)
```

这样应用从 Vue + Element Plus 切到 React + Ant Design，或者从开源 UI 库切到内部设计系统时，业务侧的提交和校验逻辑不需要重写。

## 设计原则

- Core 是唯一的规则和值状态来源。
- UI Core 是皮肤之间共享的视图协议。
- 框架适配只处理生命周期和响应式，不绑定具体组件库。
- 皮肤只消费视图模型，不解析原始规则。
- 自定义组件遵守字段协议，不绕开 engine。
- 包名和导出保持清晰，避免应用侧混用内部路径。
- 皮肤文档必须列出支持的字段类型、布局能力和限制。

如果遵守这些边界，FormX 就不是一个 Element Plus 表单封装，而是一套可以跨框架、跨 UI 库复用的复杂表单运行时。
