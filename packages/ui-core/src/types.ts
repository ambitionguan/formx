// formx UI 渲染核心：与具体 UI 组件库无关的视图模型类型定义
// 这一层只关心「控件类型 / 状态 / 布局」，由上层引擎提供 schema/state，
// 由下层 UI 套件（Element Plus、Web Components 等）负责把这些信息渲染出来。

// 通用布局信息（由 formx 的 layout / innerLayout 归一化而来）
export interface UiLayout {
  type?: 'grid' | 'flex' | 'horizontal' | 'vertical' | 'inline' | 'table' | 'absolute'
  visibilityStrategy?: 'filter' | 'keep' | 'keep-dom'
  // 基本栅格占比：1~24，约等于 Element Plus 的 span，但不强绑定
  span?: number
  // 一行多少列（供 grid 布局参考）
  cols?: number
  // 原始布局 class/style 信息，供皮肤层直接透传
  className?: string
  style?: Record<string, any>
  // flex 布局相关配置
  flex?: {
    direction?: 'row' | 'column'
    gap?: number
    align?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  }
}

export type UiI18nKeyConfig = string | Record<string, string>

// 字段节点：描述一个具体可交互控件
export interface UiFieldNode {
  kind: 'field'
  // schema 中的 id
  id: string
  // 在 values/state 中的完整路径（支持嵌套/数组）
  path: string
  // 规范化后的类型，后续在 UI 套件里根据该 type 做映射
  type:
    | 'input'
    | 'number'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'switch'
    | 'slider'
    | 'date-picker'
    | 'time-picker'
    | 'time-select'
    | 'cascader'
    | 'tree-select'
    | 'upload'
    | 'text'
    | 'divider'
    | 'spacer'
    | 'custom'
    | string // 保留扩展空间
  label?: string
  // 标记 schema 中是否显式声明了 label（即使是空字符串也视为显式），
  // 用于区分「没有 label」与「主动设为无 label」两种情况。
  hasOwnLabel?: boolean
  // 国际化 key
  i18nKey?: UiI18nKeyConfig
  // 当前值（由引擎提供），具体如何展示交给皮肤层决定
  value: any
  // 状态快照：由引擎 state 派生
  state: {
    visible: boolean
    disabled: boolean
    readOnly: boolean
    required: boolean
    loading: boolean
    validating?: boolean
    errors: string[]
    validationDetails?: any
  }
  // 通用 UI 属性（占位、大小、提示文案等），由 schema.props/patch 合并而来
  ui: Record<string, any>
  layout?: UiLayout
}

// 容器节点：form-object / field-group 等
export interface UiContainerNode {
  kind: 'container'
  type: 'form-object' | 'field-group' | string
  id?: string
  path?: string
  label?: string
  // 国际化 key
  i18nKey?: UiI18nKeyConfig
  collapsible?: boolean
  collapsed?: boolean
  state?: {
    visible?: boolean
  }
  children: UiNode[]
  layout?: UiLayout
  // 容器级 UI 属性（例如卡片样式、边框等）
  ui?: Record<string, any>
}

// 自定义节点：保留给后续扩展（例如纯文案区域、自定义渲染块等）
export interface UiCustomNode {
  kind: 'custom'
  id?: string
  path?: string
  render: {
    component?: any
    html?: string
    text?: string
    props?: Record<string, any>
  }
  layout?: UiLayout
}

export type UiNode = UiFieldNode | UiContainerNode | UiCustomNode
