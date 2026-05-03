# 皮肤与插件

FormX 的 UI 层不是写死的。当前的 Vue + Element Plus 只是一个皮肤实现，核心协议可以服务更多 UI 框架。

## 三层关系

```txt
@formx/core
  -> 执行表单逻辑

@formx/ui-core
  -> 生成 UI 中立视图

@formx/vue-ep
  -> 渲染到 Vue + Element Plus
```

如果未来要做 React、Ant Design Vue、自研组件库皮肤，应该复用 Core 和 UI Core，而不是复制一套规则引擎。

## 皮肤做什么

皮肤负责：

- 将 `FieldView` 映射成具体控件。
- 将 `FormView` 映射成布局。
- 渲染错误、必填、loading、disabled、readOnly。
- 实现字段组的增删复制、表格、卡片、Tabs、List 等 UI。
- 接入自定义组件。
- 提供 DOM 相关能力，例如滚动到错误。

皮肤不负责：

- 编译规则。
- 维护独立值树。
- 私自执行资源请求。
- 绕过 Core 改字段状态。

## 字段级插件

当内置控件不够时，使用 `custom`：

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

运行时传入组件：

```vue
<FormX :schema="schema" :components="{ UserPicker }" />
```

自定义组件应该接收 FormX 提供的字段状态，并通过标准事件回写值。

## 实现新皮肤的步骤

1. 从 `@formx/core` 创建 engine。
2. 用 `@formx/ui-core` 生成 `FormView`。
3. 为每个字段类型建立渲染映射。
4. 实现通用字段包装，包括 label、required、error、help、loading。
5. 实现容器和 `field-group`。
6. 实现自定义组件桥接。
7. 暴露与官方 Vue 皮肤一致的核心 API。

## 皮肤 API 建议

新皮肤应尽量暴露这些能力：

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

这样不同 UI 皮肤在业务侧的使用体验会保持一致。

## 设计建议

- UI 皮肤只消费视图模型，不解析原始规则。
- 控件状态以 `FieldView` 为准。
- 自定义组件遵守字段协议，不直接改外部 model。
- 包名和导出保持清晰，避免应用侧混用内部路径。
- 皮肤文档应该列出支持的字段类型和限制。
