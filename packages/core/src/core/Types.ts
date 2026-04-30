// ===================== 基础类型与常量 =====================
export type JSONValue = any

export const FieldType = {
  INPUT: 'input',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  DATE_PICKER: 'date-picker',
  AUTOCOMPLETE: 'autocomplete',
  TREE_SELECT: 'tree-select',
  SWITCH: 'switch',
  SLIDER: 'slider',
  CASCADER: 'cascader',
  TIME_PICKER: 'time-picker',
  TIME_SELECT: 'time-select',
  UPLOAD: 'upload',
  TEXT: 'text',
  SEPARATOR: 'separator',
  DIVIDER: 'divider',
  CUSTOM: 'custom',
  FORM_OBJECT: 'form-object',
  FIELD_GROUP: 'field-group'
} as const
export type FieldTypeLiteral = (typeof FieldType)[keyof typeof FieldType]

export interface LayoutConfig {
  type?: 'grid' | 'flex' | 'horizontal' | 'vertical' | 'inline' | 'table'
  span?: number
  offset?: number
  columns?: number
  gutter?: number
  gap?: number
  direction?: 'row' | 'column'
  wrap?: 'wrap' | 'nowrap'
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  responsive?: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>>
  className?: string
  style?: Record<string, string>
  styleVars?: Record<string, string>
}

export interface StyleConfig {
  [k: string]: string | undefined
}

export type ValidationTrigger = 'change' | 'blur' | 'submit'

export type I18nKeyConfig = string | Record<string, string>

export interface NamedValidationPattern {
  name: string
  flags?: string
}

export type ValidationPattern = string | RegExp | NamedValidationPattern

export interface ValidationResultObject {
  valid: boolean
  message?: string
}

export type FormXMessageParams = Record<string, unknown>

export type FormXMessageResolver = (
  key: string,
  params?: FormXMessageParams
) => string | undefined | null

export interface FormXMessageOptions {
  resolve?: FormXMessageResolver
}

export interface ValidationDetails {
  trigger?: ValidationTrigger
  syncErrors: string[]
  asyncErrors: string[]
  pendingAsyncCount?: number
  updatedAt?: number
  finishedAt?: number
}

export interface ValidationRuntimeContext {
  value: unknown
  form: any
  path: string
  selfPath?: string
  args?: Record<string, unknown>
  rule?: ValidationRule
}

export interface ValidationRule {
  required?: boolean
  message?: string
  i18nKey?: I18nKeyConfig
  trigger?: ValidationTrigger | ValidationTrigger[]
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  enum?: unknown[]
  pattern?: ValidationPattern
  expression?: any
  use?: string
  args?: Record<string, unknown>
  async?: boolean
  debounceMs?: number
  validator?: (
    value: unknown,
    ctx?: ValidationRuntimeContext
  ) =>
    | boolean
    | string
    | ValidationResultObject
    | Promise<boolean | string | ValidationResultObject>
  type?: 'builtin' | 'registered' | 'expression' | 'inline'
  context?: Record<string, unknown>
}

// ===================== 字段 Schema 基类 =====================
export type WhenConfig = string | { field: string; eq?: any; ne?: any; in?: any[] }
export type RequiredWhenConfig =
  | string
  | { field: string; eq?: any; ne?: any; in?: any[]; message?: string; i18nKey?: I18nKeyConfig }

export interface BaseFieldSchema {
  id: string
  type: FieldTypeLiteral
  label?: string
  // 国际化 key
  i18nKey?: I18nKeyConfig
  tooltip?: string
  defaultValue?: unknown
  props?: Record<string, any>
  layout?: LayoutConfig
  style?: StyleConfig
  visible?: boolean
  disabled?: boolean
  readonly?: boolean
  rules?: ValidationRule[]
  labelWidth?: string | number
  renderMode?: 'show' | 'if'
  excludeFromSubmit?: boolean

  // ============ 短写能力（与 dynamic-form 对齐并扩展）============
  showWhen?: WhenConfig
  hideWhen?: WhenConfig
  disableWhen?: WhenConfig
  readOnlyWhen?: WhenConfig
  requiredWhen?: RequiredWhenConfig
  valueWhen?: { when: WhenConfig; value: any }
  patchWhen?: Array<{ when: WhenConfig; patch: Record<string, any> }>

  // 远程选项
  optionsFrom?: string
  params?: Record<string, any>
  fetchOnMount?: boolean
  ttl?: number
  cacheKey?: string
  debounce?: number
  retries?: number
  retryDelayMs?: number
  map?: { label?: string; value?: string; children?: string }
  fallbackOptions?: Array<{ label: string; value: any; disabled?: boolean }>

  // 值变化简写
  change?:
    | Array<{
        target: string
        action: 'setValue' | 'clearValue' | 'copyValue' | 'patch'
        value?: any
        patch?: any
      }>
    | Record<string, 'copyValue' | 'clearValue' | any>

  // 计算字段
  compute?:
    | { expr: any; when?: any; watch?: string[]; target?: string }
    | Array<{ expr: any; when?: any; watch?: string[]; target?: string }>
}

// ===================== 具体字段类型 =====================
// ---- 选项/树节点 ----
export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  children?: SelectOption[]
}
export interface TreeNode {
  label: string
  value: any
  disabled?: boolean
  children?: TreeNode[]
}

// ---- 各字段 props 类型 ----
export interface ComponentProps {
  [key: string]: any
}

export interface InputProps extends ComponentProps {
  placeholder?: string
  maxlength?: number
  showWordLimit?: boolean
  clearable?: boolean
}

export interface TextareaProps extends InputProps {
  rows?: number
  autosize?: boolean | { minRows?: number; maxRows?: number }
}

export interface NumberProps extends ComponentProps {
  min?: number
  max?: number
  step?: number
  precision?: number
  controlsPosition?: 'right'
}

export interface SelectProps extends ComponentProps {
  options?: SelectOption[]
  multiple?: boolean
  filterable?: boolean
  clearable?: boolean
  remote?: boolean
  remoteMethod?: (query: string) => Promise<SelectOption[]>
}

export interface RadioProps extends ComponentProps {
  options?: SelectOption[]
  border?: boolean
  size?: 'large' | 'default' | 'small'
}
export interface CheckboxProps extends ComponentProps {
  options?: SelectOption[]
  border?: boolean
  size?: 'large' | 'default' | 'small'
}

export interface DatePickerProps extends ComponentProps {
  type?:
    | 'year'
    | 'month'
    | 'date'
    | 'dates'
    | 'datetime'
    | 'week'
    | 'datetimerange'
    | 'daterange'
    | 'monthrange'
  placeholder?: string
  startPlaceholder?: string
  endPlaceholder?: string
  format?: string
  valueFormat?: string
  clearable?: boolean
  disabledDate?: (date: Date) => boolean
  shortcuts?: Array<{ text: string; value: () => [Date, Date] | Date }>
}

export interface AutocompleteProps extends ComponentProps {
  fetchSuggestions?: (queryString: string, cb: (list: any[]) => void) => void
  valueKey?: string
  debounce?: number
  clearable?: boolean
  triggerOnFocus?: boolean
}

export interface TreeSelectProps extends ComponentProps {
  data?: TreeNode[]
  multiple?: boolean
  clearable?: boolean
  filterable?: boolean
  checkStrictly?: boolean
  showCheckbox?: boolean
  nodeKey?: string
  defaultExpandAll?: boolean
  props?: { label?: string; value?: string; children?: string }
}

export interface SwitchProps extends ComponentProps {
  activeText?: string
  inactiveText?: string
  activeValue?: any
  inactiveValue?: any
  inlinePrompt?: boolean
  disabled?: boolean
}

export interface SliderProps extends ComponentProps {
  min?: number
  max?: number
  step?: number
  range?: boolean
  showStops?: boolean
  showInput?: boolean
}

export interface CascaderProps extends ComponentProps {
  options?: SelectOption[]
  props?: Record<string, any>
  clearable?: boolean
  filterable?: boolean
}

export interface TimePickerProps extends ComponentProps {
  isRange?: boolean
  format?: string
  valueFormat?: string
  startPlaceholder?: string
  endPlaceholder?: string
  placeholder?: string
  disabled?: boolean
}

export interface TimeSelectProps extends ComponentProps {
  start?: string
  end?: string
  step?: string
  minTime?: string
  maxTime?: string
  placeholder?: string
}

export interface UploadProps extends ComponentProps {
  action?: string
  headers?: Record<string, any>
  multiple?: boolean
  limit?: number
  listType?: 'text' | 'picture' | 'picture-card'
  drag?: boolean
  accept?: string
  withCredentials?: boolean
  valueType?: 'fileList' | 'raw'
  httpRequest?: Function
}

export interface InputFieldSchema extends BaseFieldSchema {
  type: 'input'
  props?: InputProps
}
export interface TextareaFieldSchema extends BaseFieldSchema {
  type: 'textarea'
  props?: TextareaProps
}
export interface NumberFieldSchema extends BaseFieldSchema {
  type: 'number'
  props?: NumberProps
}
export interface SelectFieldSchema extends BaseFieldSchema {
  type: 'select'
  props?: SelectProps
}
export interface RadioFieldSchema extends BaseFieldSchema {
  type: 'radio'
  props?: RadioProps
}
export interface CheckboxFieldSchema extends BaseFieldSchema {
  type: 'checkbox'
  props?: CheckboxProps
}
export interface DatePickerFieldSchema extends BaseFieldSchema {
  type: 'date-picker'
  props?: DatePickerProps
}
export interface AutocompleteFieldSchema extends BaseFieldSchema {
  type: 'autocomplete'
  props?: AutocompleteProps
}
export interface TreeSelectFieldSchema extends BaseFieldSchema {
  type: 'tree-select'
  props?: TreeSelectProps
}
export interface SwitchFieldSchema extends BaseFieldSchema {
  type: 'switch'
  props?: SwitchProps
}
export interface SliderFieldSchema extends BaseFieldSchema {
  type: 'slider'
  props?: SliderProps
}
export interface CascaderFieldSchema extends BaseFieldSchema {
  type: 'cascader'
  props?: CascaderProps
}
export interface TimePickerFieldSchema extends BaseFieldSchema {
  type: 'time-picker'
  props?: TimePickerProps
}
export interface TimeSelectFieldSchema extends BaseFieldSchema {
  type: 'time-select'
  props?: TimeSelectProps
}
export interface UploadFieldSchema extends BaseFieldSchema {
  type: 'upload'
  props?: UploadProps
}
export interface TextFieldSchema extends BaseFieldSchema {
  type: 'text'
}
export interface SeparatorFieldSchema extends BaseFieldSchema {
  type: 'separator'
}
export interface DividerFieldSchema extends BaseFieldSchema {
  type: 'divider'
}

export interface CustomRenderConfig {
  component?: any
  html?: string
  text?: string
  props?: Record<string, any>
  slots?: Record<string, any>
  events?: Record<string, Function>
  className?: string
  style?: Record<string, any>
}
export interface CustomFieldSchema extends BaseFieldSchema {
  type: 'custom'
  render?: CustomRenderConfig
}

export interface FormObjectSchema extends BaseFieldSchema {
  type: 'form-object'
  children?: FormFieldSchema[]
  flatten?: boolean
  role?: 'layout' | 'data'
  containerOnly?: boolean
  collapse?: boolean
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
  add?: FieldGroupOperationConfig | boolean
  copy?: FieldGroupOperationConfig | boolean
  move?: FieldGroupOperationConfig | boolean
  remove?: FieldGroupOperationConfig | boolean
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
  toolbar?: FieldGroupToolbarButton[] | FieldGroupToolbarButton
  table?: FieldGroupTableConfig
  extra?: Record<string, any>
}

export interface FieldGroupItemMeta {
  titleField?: string
  descriptionField?: string
  iconField?: string
  extra?: Record<string, any>
}

export interface FieldGroupSchema extends BaseFieldSchema {
  type: 'field-group'
  template: FormFieldSchema[]
  showIndex?: boolean
  indexWidth?: number | string
  min?: number
  max?: number
  sortable?: boolean
  operations?: FieldGroupOperations
  presentation?: FieldGroupPresentation
  toolbar?: FieldGroupToolbarButton[] | FieldGroupToolbarButton
  itemMeta?: FieldGroupItemMeta
  defaultItem?: any
  layout?: LayoutConfig & { itemLayout?: FieldGroupItemLayout }
}

export type FormFieldSchema =
  | InputFieldSchema
  | TextareaFieldSchema
  | NumberFieldSchema
  | SelectFieldSchema
  | RadioFieldSchema
  | CheckboxFieldSchema
  | DatePickerFieldSchema
  | AutocompleteFieldSchema
  | TreeSelectFieldSchema
  | SwitchFieldSchema
  | SliderFieldSchema
  | CascaderFieldSchema
  | TimePickerFieldSchema
  | TimeSelectFieldSchema
  | UploadFieldSchema
  | TextFieldSchema
  | SeparatorFieldSchema
  | DividerFieldSchema
  | CustomFieldSchema
  | FormObjectSchema
  | FieldGroupSchema

// ===================== 规则与效果 =====================
export interface RuleV2 {
  id: string
  scope?: string
  watch?: string[]
  trigger?: string[]
  when?: any
  effects: Effect[]
  elseEffects?: Effect[]
  options?: {
    debounce?: number
    oncePerTick?: boolean
    maxHops?: number
    runAfter?: string[]
    autoWatch?: boolean
  }
}

export type Effect =
  | { type: 'set'; target: string | string[]; value: any }
  | { type: 'patch'; target: string | string[]; value: any }
  | {
      type: 'setVisible' | 'setDisabled' | 'setRequired' | 'setReadOnly'
      target: string | string[]
      value: boolean
    }
  | { type: 'setOptions'; target: string; options: SelectOption[] }
  | {
      type: 'fetch'
      target: string
      requestKey: string
      params?: Record<string, any>
      cacheKey?: string
      ttl?: number
      mode?: 'latest' | 'queue' | 'drop'
      debounceMs?: number
      retries?: number
      retryDelayMs?: number
      map?: { label?: string; value?: string; children?: string }
      fallbackOptions?: SelectOption[]
    }
  | { type: 'setSchemaPatch'; patch: any[] }
  | { type: 'validate'; target?: string | string[]; message?: string }
  | { type: 'addItem'; target: string; value?: any; index?: number }
  | { type: 'removeItem'; target: string; index: number }
  | { type: 'splice'; target: string; start: number; deleteCount?: number; items?: any[] }
  | { type: 'batch'; effects: Effect[] }
  | { type: 'dispatch'; event: string; payload?: any }
  | { type: 'toggle'; target: string; truthyValue?: any; falsyValue?: any }
  | { type: 'copyValue'; target: string | string[]; from: string }
  | { type: 'clearErrors'; target: string | string[] }

// ===================== 表单 Schema =====================
export interface FormSchema {
  version: string
  formId?: string
  model?: Record<string, any>
  layout?: LayoutConfig
  style?: Record<string, any>
  presets?: Record<string, any>
  ui?: {
    renderMode?: 'show' | 'if'
    visibilityStrategy?: 'keep' | 'filter' | 'keep-dom'
    [k: string]: any
  }
  formUi?: {
    renderMode?: 'show' | 'if'
    visibilityStrategy?: 'keep' | 'filter' | 'keep-dom'
    [k: string]: any
  }
  fields: FormFieldSchema[]
  rulesV2?: RuleV2[]
  resources?: Record<string, any>
}

// ===================== 性能与策略 =====================
export interface EnginePerformanceOptions {
  liteRuleThreshold?: number
  debounceDefault?: number
  maxHops?: number
  aggregateCache?: boolean
  lazyScope?: boolean
  virtualizationWindow?: number
  schedule?: 'microtask' | 'raf'
  debug?: boolean
  useGraph?: 'auto' | 'on' | 'off'
  // 当命中通配监听（如 $parent.list[].a）时的重算范围：
  // 'all'（默认）：重算该 scope 的所有实例（rules[].items[] 全量）
  // 'siblings'：仅重算与当前实例同父容器下的兄弟实例（如同一 rules[i].items[*]）
  recalcScope?: 'all' | 'siblings'
}

// ============== Engine 策略与诊断（导出给调用方） ==============
export interface EnginePolicyOptions {
  onHide?: 'keep' | 'clear'
  omitOnSubmit?: boolean
  resources?: { onVisible?: boolean }
  validation?: {
    mode?: 'touched' | 'immediate' | 'submitOnly'
    // Skip writing/considering validation errors for fields that are not user-editable.
    skipHidden?: boolean
    skipDisabled?: boolean
    skipReadOnly?: boolean
  }
}

export interface EngineDiagnostics {
  rules: Array<{ id: string; watch?: string[]; scope?: string; hasWhen: boolean }>
  watchIndex: Array<[string, number[]]>
  patternWatchers: number
  graph: any
  executor?: any
  pathRegistry: { count: number; patterns: string[] }
  policy: EnginePolicyOptions
  perf: EnginePerformanceOptions
  traces: Array<{
    ts: number
    event: string
    changedPaths: string[]
    hops?: number
    durationMs?: number
    rulesEvaluated: Array<{ id: string; self?: string; when?: boolean; effects?: number }>
  }>
  perfTrace?: { count: number; p50: number; p95: number; max: number; last: number }
}
