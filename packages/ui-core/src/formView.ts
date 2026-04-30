import type { FormSchema } from '@formx/core'
import { buildUiTree } from './buildUiTree'
import type { UiNode, UiFieldNode, UiContainerNode, UiLayout, UiI18nKeyConfig } from './types'

// Engine 只要满足这些方法即可参与视图构建（保持对具体实现的宽松约束）
export interface EngineLike {
  getValues(): Record<string, any>
  getState(): Record<string, any>
  setValue(path: string, value: any): void
  getValue?(path: string): any
  validatePath?(path: string, trigger?: 'change' | 'blur' | 'submit'): boolean | Promise<boolean>
}

// 表单级 UI 语义配置（与具体 UI 库无关）
export interface FormUiConfig {
  disabled?: boolean
  readOnly?: boolean
  labelPosition?: 'left' | 'right' | 'top'
  labelWidth?: string | number
  hideRequiredAsterisk?: boolean
  labelSuffix?: string
  renderMode?: 'show' | 'if'
  visibilityStrategy?: 'keep' | 'filter' | 'keep-dom'
  layout?: {
    type?: 'grid' | 'flex' | 'horizontal' | 'vertical' | 'inline' | 'table' | 'absolute'
    columns?: number
    gap?: number
    gutter?: number
    style?: Record<string, any>
  }
}

export interface FieldView {
  kind: 'field'
  id: string
  path: string
  type: string
  label: string
  // 国际化 key
  i18nKey?: UiI18nKeyConfig
  value: any
  visible: boolean
  disabled: boolean
  readOnly: boolean
  required: boolean
  validating?: boolean
  errors: string[]
  validationDetails?: any
  uiProps: Record<string, any>
  layout?: UiLayout
  // 提示气泡等附加信息
  tooltip?: string
  // 字段级标签配置（覆盖表单级配置）
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
  labelSuffix?: string
  // 可见性渲染模式：'show' 使用 v-show / display 控制，'if' 使用 v-if
  renderMode?: 'show' | 'if'
  // 是否参与提交（装饰性/辅助字段可以标记为 true）
  excludeFromSubmit?: boolean
  // 标记是否为“装饰性字段”（如纯文本/分割线等），可用于提交/布局等策略
  isDecorative?: boolean
  setValue: (val: any) => void
  validate?: (trigger?: 'change' | 'blur' | 'submit') => boolean | Promise<boolean>
}

export interface ContainerView {
  kind: 'container'
  type: 'form-object' | 'field-group' | 'field-group-item' | string
  id?: string
  path?: string
  label?: string
  // 国际化 key
  i18nKey?: UiI18nKeyConfig
  visible?: boolean
  collapsible?: boolean
  collapsed?: boolean
  layout?: UiLayout
  uiProps: Record<string, any>
  children: Array<ContainerView | FieldView>
}

export interface FieldGroupView extends ContainerView {
  type: 'field-group'
  operations?: FieldGroupOperations
  itemLayout?: FieldGroupItemLayout
  showIndex?: boolean
  indexWidth?: number | string
  sortable?: boolean
  min?: number
  max?: number
  presentation?: FieldGroupPresentation
  itemMeta?: FieldGroupItemMeta
  commands: {
    add(value?: any): void
    remove(index: number): void
    copy(index: number): void
    move(from: number, to: number): void
  }
}

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
  minWidth?: number | string
  span?: number
  align?: 'left' | 'center' | 'right'
  color?: string
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

// 行/列级布局视图，用于还原 row/col + span 语义
export interface LayoutColView {
  span?: number
  props?: Record<string, any>
  fieldIds: string[]
}

export interface LayoutRowView {
  props?: Record<string, any>
  cols: LayoutColView[]
}

export interface FormView {
  containers: ContainerView[]
  formUi: FormUiConfig
  // 可选：当 schema.layout 使用 row/col/fieldRef 结构时，rows 表达按行列拆分后的布局语义
  rows?: LayoutRowView[]
}

function makeFieldView(node: UiFieldNode, engine: EngineLike): FieldView {
  // 如果 schema 中显式声明了 label（即使是空字符串），则严格使用该值；
  // 否则才回退到使用 id 作为标签。
  const hasOwnLabel = (node as any).hasOwnLabel
  const label = hasOwnLabel ? (node.label ?? '') : (node.label || node.id)
  const uiProps = { ...(node.ui || {}) }
  const st = node.state || ({} as any)
  const errors = Array.isArray(st.errors) ? st.errors.slice() : []
  const setValue = (val: any) => {
    try {
      engine.setValue(node.path, val)
    } catch {
      // ignore
    }
  }
  const validate = (trigger?: 'change' | 'blur' | 'submit') => {
    try {
      const eng = engine as any
      return typeof eng.validatePath === 'function' ? eng.validatePath(node.path, trigger) : false
    } catch {
      return false
    }
  }
  const type = String(node.type || '')
  const decoTypes = ['text', 'divider', 'separator']
  const excludeFromSubmit = !!(node as any).ui?.excludeFromSubmit
  return {
    kind: 'field',
    id: node.id,
    path: node.path,
    type,
    label,
    i18nKey: node.i18nKey,
    value: node.value,
    visible: st.visible !== false,
    disabled: !!st.disabled,
    readOnly: !!st.readOnly,
    required: !!st.required,
    validating: !!st.validating,
    errors,
    validationDetails: st.validationDetails,
    uiProps,
    layout: node.layout,
    tooltip: uiProps.tooltip,
    labelWidth: uiProps.labelWidth,
    labelPosition: uiProps.labelPosition,
    labelSuffix: uiProps.labelSuffix,
    renderMode: uiProps.renderMode,
    excludeFromSubmit,
    isDecorative: decoTypes.includes(type),
    setValue,
    validate,
  }
}

function cloneValue<T = any>(val: T): T {
  if (val == null || typeof val !== 'object') return val
  try {
    return JSON.parse(JSON.stringify(val))
  } catch {
    return val
  }
}

function normalizeOperationEntry(entry: any): FieldGroupOperationConfig | undefined {
  if (entry == null) return undefined
  if (typeof entry === 'boolean') {
    return { show: entry }
  }
  if (typeof entry === 'object') {
    const cfg: FieldGroupOperationConfig = { ...entry }
    if ('show' in entry) cfg.show = !!entry.show
    if (typeof entry.text === 'string') cfg.text = entry.text
    if ('icon' in entry) cfg.icon = entry.icon
    if (entry.className) cfg.className = entry.className
    if (entry.style && typeof entry.style === 'object') cfg.style = { ...entry.style }
    if (typeof entry.disabledMessage === 'string') cfg.disabledMessage = entry.disabledMessage
    if ('defaultItem' in entry) cfg.defaultItem = entry.defaultItem
    return cfg
  }
  return undefined
}

function normalizeFieldGroupOperations(raw: any): FieldGroupOperations | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const ops: FieldGroupOperations = { ...raw }
  const add = normalizeOperationEntry(raw.add)
  if (add) ops.add = add
  const copy = normalizeOperationEntry(raw.copy)
  if (copy) ops.copy = copy
  const move = normalizeOperationEntry(raw.move)
  if (move) ops.move = move
  const remove = normalizeOperationEntry(raw.remove)
  if (remove) ops.remove = remove
  const pos = raw.position
  if (typeof pos === 'string') {
    const normalized = ['left', 'right', 'top', 'bottom'].includes(pos) ? pos : undefined
    if (normalized) ops.position = normalized as FieldGroupOperations['position']
  }
  return Object.keys(ops).length ? ops : undefined
}

function normalizeFieldGroupItemLayout(raw: any): FieldGroupItemLayout | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const layout: FieldGroupItemLayout = { ...raw }
  if (raw.type === 'flex' || raw.type === 'grid') layout.type = raw.type
  const dir = raw.direction
  if (dir === 'column' || dir === 'row') layout.direction = dir
  if (typeof raw.gap === 'number') layout.gap = raw.gap
  const wrap = raw.wrap === 'wrap' ? 'wrap' : raw.wrap === 'nowrap' ? 'nowrap' : undefined
  if (wrap) layout.wrap = wrap
  const alignMap: Record<string, FieldGroupItemLayout['align']> = {
    center: 'center',
    end: 'end',
    'flex-end': 'end',
    start: 'start',
    stretch: 'stretch'
  }
  const justifyMap: Record<string, FieldGroupItemLayout['justify']> = {
    center: 'center',
    end: 'end',
    'flex-end': 'end',
    'space-between': 'space-between',
    'space-around': 'space-around',
    start: 'start'
  }
  if (raw.align || raw.alignItems) {
    const key = String(raw.align || raw.alignItems)
    if (alignMap[key]) layout.align = alignMap[key]
  }
  if (raw.justify || raw.justifyContent) {
    const key = String(raw.justify || raw.justifyContent)
    if (justifyMap[key]) layout.justify = justifyMap[key]
  }
  return Object.keys(layout).length ? layout : undefined
}

function normalizeToolbarButton(raw: any): FieldGroupToolbarButton | null {
  if (!raw || typeof raw !== 'object') return null
  const btn: FieldGroupToolbarButton = { ...raw }
  if (raw.key) btn.key = String(raw.key)
  if (raw.action && ['add', 'remove', 'custom'].includes(String(raw.action))) {
    btn.action = raw.action
  }
  if (typeof raw.text === 'string') btn.text = raw.text
  if (typeof raw.icon === 'string') btn.icon = raw.icon
  if (raw.position && (raw.position === 'left' || raw.position === 'right')) btn.position = raw.position
  if (raw.placement && (raw.placement === 'header' || raw.placement === 'footer')) btn.placement = raw.placement
  if (raw.props && typeof raw.props === 'object') btn.props = { ...raw.props }
  return Object.keys(btn).length ? btn : null
}

function normalizeToolbar(raw: any): FieldGroupToolbarButton[] | undefined {
  if (!raw) return undefined
  const list = Array.isArray(raw) ? raw : [raw]
  const buttons: FieldGroupToolbarButton[] = []
  for (const item of list) {
    const btn = normalizeToolbarButton(item)
    if (btn) buttons.push(btn)
  }
  return buttons.length ? buttons : undefined
}

function normalizeTableColumns(raw: any): FieldGroupTableColumn[] | undefined {
  if (!raw) return undefined
  const list = Array.isArray(raw) ? raw : [raw]
  const columns: FieldGroupTableColumn[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const field = (item as any).field ?? (item as any).id
    if (!field) continue
    const col: FieldGroupTableColumn = { field: String(field) }
    if (Object.prototype.hasOwnProperty.call(item, 'label')) {
      col.label = (item as any).label == null ? '' : String((item as any).label)
    }
    const width = (item as any).width
    if (typeof width === 'number' || typeof width === 'string') col.width = width
    const minWidth = (item as any).minWidth
    if (typeof minWidth === 'number' || typeof minWidth === 'string') col.minWidth = minWidth
    const span = (item as any).span
    if (typeof span === 'number') col.span = span
    const align = (item as any).align
    if (align === 'left' || align === 'center' || align === 'right') col.align = align
    const color = (item as any).color
    if (typeof color === 'string') col.color = color
    columns.push(col)
  }
  return columns.length ? columns : undefined
}

function normalizeTableConfig(raw: any): FieldGroupTableConfig | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const cfg: FieldGroupTableConfig = { ...raw}
  const columns = normalizeTableColumns((raw as any).columns)
  if (columns) cfg.columns = columns
  const actionsWidth = (raw as any).actionsWidth
  if (typeof actionsWidth === 'number' || typeof actionsWidth === 'string') {
    cfg.actionsWidth = actionsWidth
  }
  if (typeof (raw as any).emptyText === 'string') cfg.emptyText = (raw as any).emptyText
  return Object.keys(cfg).length ? cfg : undefined
}

function normalizeGroupPresentation(raw: any): FieldGroupPresentation | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const preset: FieldGroupPresentation = { ...raw }
  const type = raw.type
  if (type && ['list', 'cards', 'tabs', 'table', 'custom'].includes(String(type))) {
    preset.type = type
  }
  if (typeof raw.tabLabelField === 'string') preset.tabLabelField = raw.tabLabelField
  if (typeof raw.tabClosable === 'boolean') preset.tabClosable = raw.tabClosable
  if (typeof raw.addButtonText === 'string') preset.addButtonText = raw.addButtonText
  if (typeof raw.addButtonIcon === 'string') preset.addButtonIcon = raw.addButtonIcon
  const toolbar = normalizeToolbar(raw.toolbar)
  if (toolbar) preset.toolbar = toolbar
  const tableCfg = normalizeTableConfig(raw.table)
  if (tableCfg) preset.table = tableCfg
  if (raw.extra && typeof raw.extra === 'object') preset.extra = { ...raw.extra }
  return Object.keys(preset).length ? preset : undefined
}

function normalizeItemMeta(raw: any): FieldGroupItemMeta | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const meta: FieldGroupItemMeta = { ...raw }
  if (typeof raw.titleField === 'string') meta.titleField = raw.titleField
  if (typeof raw.descriptionField === 'string') meta.descriptionField = raw.descriptionField
  if (typeof raw.iconField === 'string') meta.iconField = raw.iconField
  if (raw.extra && typeof raw.extra === 'object') meta.extra = { ...raw.extra }
  return Object.keys(meta).length ? meta : undefined
}

function makeContainerView(node: UiContainerNode, engine: EngineLike): ContainerView | FieldGroupView {
  const visible = (node as any).state?.visible !== false
  const base: ContainerView = {
    kind: 'container',
    type: node.type,
    id: node.id,
    path: node.path,
    label: node.label,
    i18nKey: node.i18nKey,
    visible,
    collapsible: (node as any).collapsible,
    collapsed: (node as any).collapsed,
    layout: node.layout,
    uiProps: { ...(node.ui || {}) },
    children: [],
  }

  const children: Array<ContainerView | FieldView> = []
  for (const child of node.children || []) {
    if ((child as any).kind === 'field') {
      children.push(makeFieldView(child as UiFieldNode, engine))
    } else if ((child as any).kind === 'container') {
      children.push(makeContainerView(child as UiContainerNode, engine))
    }
  }
  base.children = children

  if (node.type === 'field-group') {
    const groupPath = node.path || ''
    const getArr = (): any[] => {
      try {
        const getter = typeof engine.getValue === 'function'
          ? engine.getValue!.bind(engine)
          : (p: string) => engine.getValues?.()[p]
        const val = getter(groupPath)
        return Array.isArray(val) ? val : []
      } catch {
        return []
      }
    }
    const uiMeta: any = (node as any).ui || {}
    const operations = normalizeFieldGroupOperations(uiMeta.operations)
    const itemLayout = normalizeFieldGroupItemLayout(uiMeta.itemLayout)
    let rawPresentation: any = uiMeta.presentation && typeof uiMeta.presentation === 'object'
      ? { ...uiMeta.presentation }
      : undefined
    if (uiMeta.toolbar && typeof uiMeta.toolbar === 'object') {
      if (!rawPresentation) rawPresentation = {}
      if (!rawPresentation.toolbar) rawPresentation.toolbar = uiMeta.toolbar
    }
    let presentation = normalizeGroupPresentation(rawPresentation)
    if (!presentation?.type && node.layout?.type === 'table') {
      presentation = { ...(presentation || {}), type: 'table' }
    }
    const uiTableColumns = normalizeTableColumns(uiMeta.tableColumns)
    if (uiTableColumns && (presentation?.type === 'table' || node.layout?.type === 'table')) {
      if (!presentation) presentation = { type: 'table' }
      if (!presentation.type) presentation.type = 'table'
      presentation.table = {
        ...(presentation.table || {}),
        columns: presentation.table?.columns || uiTableColumns
      }
    }
    const itemMeta = normalizeItemMeta(uiMeta.itemMeta)
    const showIndexVal = uiMeta.showIndex ?? (node as any).showIndex
    const indexWidthVal = uiMeta.indexWidth ?? (node as any).indexWidth
    const sortableVal = uiMeta.sortable ?? (node as any).sortable
    const minVal = uiMeta.min ?? (node as any).min
    const maxVal = uiMeta.max ?? (node as any).max
    const defaultItemFromUi = Object.prototype.hasOwnProperty.call(uiMeta, 'defaultItem')
      ? uiMeta.defaultItem
      : undefined
    const defaultItemFromOps = operations?.add && Object.prototype.hasOwnProperty.call(operations.add, 'defaultItem')
      ? operations.add.defaultItem
      : undefined
    const commands = {
      add(value?: any) {
        const arr = getArr().slice()
        if (typeof maxVal === 'number' && arr.length >= maxVal) return
        const hasValue = arguments.length > 0
        let item: any
        if (hasValue) {
          item = cloneValue(value)
        } else {
          let candidate = defaultItemFromOps !== undefined ? defaultItemFromOps : defaultItemFromUi
          if (typeof candidate === 'function') {
            try {
              candidate = candidate({ index: arr.length, total: arr.length })
            } catch {
              candidate = undefined
            }
          }
          item = candidate === undefined ? {} : cloneValue(candidate)
        }
        arr.push(item)
        try { engine.setValue(groupPath, arr) } catch { /* ignore */ }
      },
      remove(index: number) {
        if (index < 0) return
        const arr = getArr().slice()
        if (index >= arr.length) return
        if (typeof minVal === 'number' && arr.length <= minVal) return
        arr.splice(index, 1)
        try { engine.setValue(groupPath, arr) } catch { /* ignore */ }
      },
      copy(index: number) {
        if (index < 0) return
        const arr = getArr().slice()
        if (index >= arr.length) return
        if (typeof maxVal === 'number' && arr.length >= maxVal) return
        const src = arr[index]
        const clone = cloneValue(src)
        arr.splice(index + 1, 0, clone)
        try { engine.setValue(groupPath, arr) } catch { /* ignore */ }
      },
      move(from: number, to: number) {
        if (from === to) return
        const arr = getArr().slice()
        if (from < 0 || from >= arr.length) return
        if (to < 0 || to >= arr.length) return
        const [item] = arr.splice(from, 1)
        arr.splice(to, 0, item)
        try { engine.setValue(groupPath, arr) } catch { /* ignore */ }
      },
    }
    return Object.assign(base, {
      commands,
      operations,
      itemLayout,
      presentation,
      itemMeta,
      showIndex: typeof showIndexVal === 'boolean' ? showIndexVal : undefined,
      indexWidth:
        typeof indexWidthVal === 'number' || typeof indexWidthVal === 'string'
          ? indexWidthVal
          : undefined,
      sortable: typeof sortableVal === 'boolean' ? sortableVal : undefined,
      min: typeof minVal === 'number' ? minVal : undefined,
      max: typeof maxVal === 'number' ? maxVal : undefined
    }) as FieldGroupView
  }

  return base
}

export function buildFormView(engine: EngineLike, schema: FormSchema): FormView {
  const uiNodes: UiNode[] = buildUiTree(engine as any, schema)
  const containers: ContainerView[] = []
  for (const node of uiNodes) {
    if ((node as any).kind === 'container') {
      containers.push(makeContainerView(node as UiContainerNode, engine))
    } else if ((node as any).kind === 'field') {
      // 顶层字段：包装成匿名容器，避免在皮肤层处理空容器的特殊情况
      const fv = makeFieldView(node as UiFieldNode, engine)
      containers.push({
        kind: 'container',
        type: 'form-object',
        uiProps: {},
        children: [fv],
      })
    }
  }
  // 从 schema.layout / schema.ui 中提取表单级布局与 UI 语义，方便皮肤层消费。
  const rawLayout: any = (schema as any).layout || {}
  const rawUi: any = (schema as any).ui || (schema as any).formUi || {}
  const formUi: FormUiConfig = {
    disabled: rawUi.disabled,
    readOnly: rawUi.readOnly,
    labelPosition: rawUi.labelPosition,
    labelWidth: rawUi.labelWidth,
    hideRequiredAsterisk: rawUi.hideRequiredAsterisk,
    labelSuffix: rawUi.labelSuffix,
    renderMode: rawUi.renderMode,
    visibilityStrategy: rawUi.visibilityStrategy,
    layout: {
      type: rawLayout.type,
      columns: rawLayout.columns,
      gap: rawLayout.gap,
      gutter: rawLayout.gutter,
      style: rawLayout.style || {},
    },
  }
  const view: FormView = { containers, formUi }

  // 若 layout 是数组（CoreLayoutNode[]），尝试解析为 row/col 布局视图
  if (Array.isArray((schema as any).layout)) {
    const rows: LayoutRowView[] = []
    const layoutArray: any[] = (schema as any).layout || []
    for (const node of layoutArray) {
      if (!node || typeof node !== 'object') continue
      if (String(node.type) !== 'row') continue
      const rowProps = (node as any).props && typeof (node as any).props === 'object'
        ? { ...((node as any).props || {}) }
        : undefined
      const row: LayoutRowView = { cols: [], props: rowProps }
      const children = Array.isArray(node.children) ? node.children : []
      for (const colNode of children) {
        if (!colNode || typeof colNode !== 'object') continue
        if (String(colNode.type) !== 'col') continue
        const props = (colNode.props || {}) as any
        const col: LayoutColView = {
          span: typeof props.span === 'number' ? props.span : undefined,
          fieldIds: [],
          props: { ...props },
        }
        const inner = Array.isArray(colNode.children) ? colNode.children : []
        for (const it of inner) {
          if (!it || typeof it !== 'object') continue
          // 直接 fieldRef
          if ('fieldRef' in it) {
            col.fieldIds.push(String((it as any).fieldRef))
            continue
          }
          // 一般情况下会有一个 type:'field' 的中间节点，children 里才挂 fieldRef
          if (String((it as any).type) === 'field' && Array.isArray((it as any).children)) {
            for (const sub of (it as any).children as any[]) {
              if (sub && typeof sub === 'object' && 'fieldRef' in sub) {
                col.fieldIds.push(String((sub as any).fieldRef))
              }
            }
          }
        }
        row.cols.push(col)
      }
      // 仅在该行至少有一个字段时才保留该行
      if (row.cols.length && row.cols.some((c) => (c.fieldIds || []).length > 0)) rows.push(row)
    }
    if (rows.length) view.rows = rows
  }

  return view
}
