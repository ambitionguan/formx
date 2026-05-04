import type { FormSchema } from '@formxjs/core'
import { getAt } from '@formxjs/core'
import type { UiNode, UiFieldNode, UiContainerNode, UiLayout } from './types'

// 规范化 type，避免 date/datePicker/date-picker/subForm 等命名差异在 UI 层泛滥
function canonicalType(raw: string): UiFieldNode['type'] {
  const t = String(raw || '').trim()
  switch (t) {
    case 'input':
    case 'textarea':
    case 'number':
    case 'select':
    case 'radio':
    case 'checkbox':
    case 'switch':
    case 'slider':
    case 'cascader':
    case 'tree-select':
    case 'upload':
    case 'text':
    case 'divider':
      return t as UiFieldNode['type']
    case 'date':
    case 'datePicker':
    case 'date-picker':
      return 'date-picker'
    case 'time':
    case 'timeRange':
    case 'time-picker':
      return 'time-picker'
    case 'time-select':
    case 'timeSelect':
      return 'time-select'
    default:
      return t as UiFieldNode['type']
  }
}

// 将 schema.layout / innerLayout 等信息收敛为通用 UiLayout
function toUiLayout(raw: any | undefined): UiLayout | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const out: UiLayout = {}
  if (typeof raw.type === 'string') {
    const t = raw.type
    if (['grid', 'flex', 'horizontal', 'vertical', 'inline', 'table', 'absolute'].includes(t)) {
      out.type = t as UiLayout['type']
    }
  }
  if (typeof raw.visibilityStrategy === 'string') {
    const vs = raw.visibilityStrategy
    if (vs === 'filter' || vs === 'keep' || vs === 'keep-dom') {
      out.visibilityStrategy = vs
    }
  }
  // 直接映射 span/cols
  if (typeof raw.span === 'number') out.span = raw.span
  if (typeof raw.cols === 'number') out.cols = raw.cols
  if (typeof raw.className === 'string') (out as any).className = raw.className
  if (raw.style && typeof raw.style === 'object') (out as any).style = { ...raw.style }

  // flex 场景：schema 中通常是 { type:'flex', direction, gap, alignItems, justifyContent }
  const isFlex = raw.type === 'flex' || raw.layout === 'flex'
  if (isFlex || raw.direction || raw.gap || raw.alignItems || raw.justifyContent) {
    out.flex = {
      direction: raw.direction === 'column' ? 'column' : 'row',
      gap: typeof raw.gap === 'number' ? raw.gap : undefined,
      // ElementPlus 等通常使用 align / justify，内部约定同名
      align: (() => {
        switch (raw.alignItems) {
          case 'center': return 'center'
          case 'end':
          case 'flex-end': return 'end'
          case 'stretch': return 'stretch'
          default: return 'start'
        }
      })(),
      justify: (() => {
        switch (raw.justifyContent) {
          case 'center': return 'center'
          case 'end':
          case 'flex-end': return 'end'
          case 'space-between': return 'space-between'
          case 'space-around': return 'space-around'
          default: return 'start'
        }
      })()
    }
  }

  return Object.keys(out).length ? out : undefined
}

type DefaultUi = {
  renderMode?: 'show' | 'if'
  visibilityStrategy?: 'keep' | 'filter' | 'keep-dom'
}

function applyDefaultUi(ui: Record<string, any>, field: any, defaults?: DefaultUi) {
  if (field && typeof field.renderMode !== 'undefined') {
    ui.renderMode = field.renderMode
  } else if (defaults?.renderMode && typeof ui.renderMode === 'undefined') {
    ui.renderMode = defaults.renderMode
  }
  if (defaults?.visibilityStrategy && typeof ui.visibilityStrategy === 'undefined') {
    ui.visibilityStrategy = defaults.visibilityStrategy
  }
}

function buildTableColumnsFromTemplate(template: any[]): any[] {
  const cols: any[] = []
  for (const item of template || []) {
    if (!item || typeof item !== 'object') continue
    const type = String(item.type || '').trim()
    if (type === 'form-object' || type === 'field-group') continue
    const id = String(item.id || '')
    if (!id) continue
    const hasOwnLabel = Object.prototype.hasOwnProperty.call(item, 'label')
    const label = hasOwnLabel ? (item.label ?? '') : (item.label || id)
    const layout = toUiLayout(item.layout)
    const col: any = { field: id, label }
    if (typeof layout?.span === 'number') col.span = layout.span
    cols.push(col)
  }
  return cols
}

// 递归构建某个字段（或容器）的 UiNode 列表
function buildNodesForField(field: any, parentPath: string, values: any, state: any, defaults?: DefaultUi): UiNode[] {
  if (!field || typeof field !== 'object') return []
  const t = String(field.type || '').trim()

  // 容器：form-object
  if (t === 'form-object') {
    const id = String(field.id || '')
    const basePath = parentPath ? `${parentPath}.${id}` : id
    const st = state[basePath] || {}
    const ui: any = { ...(field.props || {}) }
    // 样式/扁平化等 UI 语义同步到 uiProps，供皮肤层透传
    if (field.style && typeof field.style === 'object') ui.style = { ...(field.style as any) }
    if (field.flatten != null) ui.flatten = !!field.flatten
    if (field.layout && typeof field.layout === 'object' && (field.layout as any).innerLayout) {
      ui.innerLayout = (field.layout as any).innerLayout
    }
    applyDefaultUi(ui, field, defaults)
    const container: UiContainerNode = {
      kind: 'container',
      type: t as any,
      id,
      path: basePath,
      label: field.label,
      i18nKey: field.i18nKey,
      collapsible: !!field.collapsible,
      collapsed: !!field.collapsed,
      state: { visible: st.visible !== false },
      children: [],
      ui,
      layout: toUiLayout(field.layout)
    }
    const children: UiNode[] = []
    // 路径语义保持与 Engine 一致：当 form-object 启用 flatten 时，子字段不再追加当前容器 id。
    const nextParent = field.flatten ? parentPath : basePath
    if (Array.isArray(field.children)) {
      for (const c of field.children) {
        children.push(...buildNodesForField(c, nextParent, values, state, defaults))
      }
    }
    if (Array.isArray(field.template)) {
      for (const c of field.template) {
        children.push(...buildNodesForField(c, nextParent, values, state, defaults))
      }
    }
    container.children = children
    return [container]
  }

  // 容器：field-group（数组场景）
  if (t === 'field-group') {
    const id = String(field.id || '')
    const basePath = parentPath ? `${parentPath}.${id}` : id
    const st = state[basePath] || {}
    const ui: any = { ...(field.props || {}) }
    if (field.style && typeof field.style === 'object') ui.style = { ...(field.style as any) }
    if (field.operations && typeof field.operations === 'object') ui.operations = field.operations
    if ('showIndex' in field) ui.showIndex = field.showIndex
    if ('indexWidth' in field) ui.indexWidth = field.indexWidth
    if ('sortable' in field) ui.sortable = field.sortable
    if ('min' in field) ui.min = field.min
    if ('max' in field) ui.max = field.max
    if (field.presentation && typeof field.presentation === 'object') ui.presentation = field.presentation
    if (field.toolbar && typeof field.toolbar === 'object') ui.toolbar = field.toolbar
    if (field.itemMeta && typeof field.itemMeta === 'object') ui.itemMeta = field.itemMeta
    if ('defaultItem' in field) ui.defaultItem = (field as any).defaultItem
    // itemLayout：用于控制每一行（每个组实例）的内部布局（如 IP/端口一行）
    if (field.layout && typeof field.layout === 'object' && (field.layout as any).itemLayout) {
      ui.itemLayout = (field.layout as any).itemLayout
    }
    applyDefaultUi(ui, field, defaults)
    const wantsTable = field.layout?.type === 'table' || field.presentation?.type === 'table'
    const hasTableColumns = !!field.presentation?.table?.columns
    if (wantsTable && !hasTableColumns) {
      const cols = buildTableColumnsFromTemplate(Array.isArray(field.template) ? field.template : [])
      if (cols.length) ui.tableColumns = cols
    }
    const group: UiContainerNode = {
      kind: 'container',
      type: 'field-group',
      id,
      path: basePath,
      label: field.label,
      i18nKey: field.i18nKey,
      collapsible: !!field.collapsible,
      collapsed: !!field.collapsed,
      state: { visible: st.visible !== false },
      children: [],
      ui,
      layout: toUiLayout(field.layout)
    }
    const arr = getAt(values, basePath)
    const list: UiNode[] = []
    const template = Array.isArray(field.template) ? field.template : []
    const length = Array.isArray(arr) ? arr.length : 0
    for (let i = 0; i < length; i++) {
      const rowPath = `${basePath}[${i}]`
      const rowContainer: UiContainerNode = {
        kind: 'container',
        type: 'field-group-item',
        id: `${id}[${i}]`,
        path: rowPath,
        label: undefined,
        collapsible: false,
        collapsed: false,
        state: { visible: (state[rowPath]?.visible ?? true) !== false },
        children: [],
        ui: {},
        layout: undefined
      }
      applyDefaultUi(rowContainer.ui as any, field, defaults)
      const rowChildren: UiNode[] = []
      for (const c of template) {
        rowChildren.push(...buildNodesForField(c, rowPath, values, state, defaults))
      }
      rowContainer.children = rowChildren
      list.push(rowContainer)
    }
    group.children = list
    return [group]
  }

  // 普通字段
  const id = String(field.id || '')
  if (!id) return []
  const path = parentPath ? `${parentPath}.${id}` : id
  const st = state[path] || {}
  const staticRequired = Array.isArray(field.rules) && field.rules.some((r: any) => r && r.required === true)
  const hasStateRequired = Object.prototype.hasOwnProperty.call(st, 'required')
  const errors: string[] = Array.isArray(st.errors) ? st.errors.slice() : []
  const ui: any = { ...(field.props || {}) }
  if (field.style && typeof field.style === 'object') ui.style = { ...(field.style as any) }
  if (field.className) ui.className = field.className
  // 将字段级 UI 语义（tooltip/labelWidth/renderMode 等）同步到 ui，供后续视图层统一消费
  if (field.tooltip) ui.tooltip = field.tooltip
  if (field.labelWidth != null) ui.labelWidth = field.labelWidth
  if (field.labelPosition) ui.labelPosition = field.labelPosition
  if (field.labelSuffix) ui.labelSuffix = field.labelSuffix
  if (field.renderMode) ui.renderMode = field.renderMode
  else if (defaults?.renderMode && typeof ui.renderMode === 'undefined') ui.renderMode = defaults.renderMode
  // 是否排除在提交数据中（用于 UI 层决定是否呈现为“仅展示”字段等）
  if (field.excludeFromSubmit) ui.excludeFromSubmit = true
  // 自定义渲染配置（custom/text 等字段会用到）
  if ((field as any).render) ui.render = (field as any).render
  // 将运行期状态中的 options 合并到 ui，便于 UI 层统一从 ui.options 读取动态选项
  if (Array.isArray((st as any).options)) ui.options = (st as any).options
  // 如果 state 中没有 options，回退到 schema 字段上直接定义的 options
  if (!ui.options && Array.isArray((field as any).options)) ui.options = (field as any).options
  const hasOwnLabel = Object.prototype.hasOwnProperty.call(field, 'label')
  const node: UiFieldNode = {
    kind: 'field',
    id,
    path,
    type: canonicalType(field.type || 'input'),
    label: field.label,
    hasOwnLabel,
    // 国际化 key
    i18nKey: field.i18nKey,
    // 使用 Path 工具读取深层值，确保与 Engine 的路径语义一致
    value: getAt(values, path),
    state: {
      visible: st.visible !== false,
      disabled: !!st.disabled,
      readOnly: !!st.readOnly,
      required: hasStateRequired ? !!st.required : staticRequired,
      loading: !!st.loading,
      validating: !!st.validating,
      errors,
      validationDetails: st.validationDetails
    },
    ui,
    layout: toUiLayout(field.layout)
  }
  return [node]
}

// v1：支持顶层字段 + 简单容器的 UiNode 构建
// engine 在这里按 any 处理，只依赖 getValues()/getState() 这两个方法
export function buildUiTree(engine: any, schema: FormSchema): UiNode[] {
  if (!schema || !Array.isArray(schema.fields)) return []
  const values = typeof engine?.getValues === 'function' ? engine.getValues() : (schema.model || {})
  const state = typeof engine?.getState === 'function' ? engine.getState() : {}
  const rawUi: any = (schema as any).ui || (schema as any).formUi || {}
  const defaults: DefaultUi = {
    renderMode: rawUi.renderMode,
    visibilityStrategy: rawUi.visibilityStrategy
  }

  const nodes: UiNode[] = []
  for (const f of schema.fields as any[]) {
    nodes.push(...buildNodesForField(f, '', values, state, defaults))
  }
  return nodes
}
