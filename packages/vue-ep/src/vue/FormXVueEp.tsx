import { defineComponent, provide, reactive, toRef } from 'vue'
import { ElForm } from 'element-plus'
import '../style.css'
import type {
  FormXEngine as Engine,
  EnginePolicyOptions,
  FormSchema,
  FormXMessageOptions,
  FormXMessageResolver
} from '@formxjs/core'
import type { ContainerView, FieldGroupView, FieldView, FormView } from '@formxjs/ui-core'
import { renderInputField } from './fields/input'
import { renderNumberField } from './fields/number'
import { renderSelectField } from './fields/select'
import { renderTextField } from './fields/text'
import { renderTextareaField } from './fields/textarea'
import { renderRadioField } from './fields/radio'
import { renderCheckboxField } from './fields/checkbox'
import { renderDatePickerField } from './fields/datePicker'
import { renderSwitchField } from './fields/switch'
import { renderSliderField } from './fields/slider'
import { renderAutocompleteField } from './fields/autocomplete'
import { renderTreeSelectField } from './fields/treeSelect'
import { renderCascaderField } from './fields/cascader'
import { renderDividerField, renderSeparatorField } from './fields/divider'
import { renderSpacerField } from './fields/spacer'
import { renderUploadField } from './fields/upload'
import { renderTimePickerField } from './fields/timePicker'
import { renderTimeSelectField } from './fields/timeSelect'
import { renderCustomField } from './fields/custom'
import { renderUnknownField } from './fields/unknown'
import { createContainerRenderer } from './container/containerRenderer'
import { createRowsRenderer } from './layout/rowsRenderer'
import { createGroupRenderer } from './group/groupRenderer'
import { createSectionTitleRenderer } from './section/sectionTitleRenderer'
import {
  createCollapseState,
  createFieldGroupApiSync,
  createFormXExpose,
  createGroupTabState,
  useFormViewState,
  useFormXEngine
} from '@formxjs/vue-core'
import type { FieldRenderContext } from './group/types'
import { addBaseMessages, tf } from '../i18n'

addBaseMessages(['formx']).catch(() => {})

type AnyRecord = Record<string, any>

export interface FormXVueEpProps {
  schema: FormSchema
  value?: AnyRecord
  defaultValue?: AnyRecord
  engine?: Engine
  policy?: EnginePolicyOptions
  messages?: FormXMessageOptions | FormXMessageResolver
  skinProps?: AnyRecord & {
    // 自定义 Section 折叠按钮渲染函数：
    // view: 当前容器视图
    // collapsed: 当前是否收起
    // toggle: 调用后切换收起/展开
    sectionToggleRender?: (
      view: ContainerView | FieldGroupView,
      collapsed: boolean,
      toggle: () => void
    ) => any
  }
  components?: Record<string, any>
  customComponents?: Record<string, any>
}

type FieldRenderer = (view: FieldView, ctx?: FieldRenderContext) => any

export default defineComponent({
  name: 'FormXVueEp',
  props: {
    schema: { type: Object as () => FormSchema, required: true },
    value: { type: Object as () => AnyRecord, required: false, default: undefined },
    defaultValue: { type: Object as () => AnyRecord, required: false, default: undefined },
    engine: { type: Object as () => Engine, required: false, default: undefined },
    policy: { type: Object as () => EnginePolicyOptions, required: false, default: undefined },
    messages: { type: [Object, Function] as any, required: false, default: undefined },
    skinProps: { type: Object as () => AnyRecord, required: false, default: undefined },
    components: { type: Object as () => Record<string, any>, required: false, default: undefined },
    customComponents: {
      type: Object as () => Record<string, any>,
      required: false,
      default: undefined
    }
  },
  emits: ['update:value', 'change', 'submit', 'validateFail'],
  setup(props, { emit, expose }) {
    // Section 折叠状态：按 path/id 记录
    const { isCollapsed, toggleCollapse } = createCollapseState()
    const { getActiveTab, setActiveTab } = createGroupTabState()
    const defaultMessageResolver: FormXMessageResolver = (key) => tf(key)
    const { engine, initialModel } = useFormXEngine(props, emit, {
      messages: defaultMessageResolver
    })
    const fieldGroupAPIs = reactive<Record<string, any>>({})
    provide('fieldGroupAPIs', fieldGroupAPIs)

    const { formView, getViewContext } = useFormViewState(engine, toRef(props, 'schema'))

    // 暴露给外部使用的方法/实例（给业务侧更友好的 API）
    expose(createFormXExpose(engine, initialModel, fieldGroupAPIs))

    const fieldRenderers: Record<string, FieldRenderer> = {
      input: renderInputField,
      number: renderNumberField,
      textarea: renderTextareaField,
      select: renderSelectField,
      radio: renderRadioField,
      checkbox: renderCheckboxField,
      'date-picker': renderDatePickerField,
      switch: renderSwitchField,
      slider: renderSliderField,
      autocomplete: renderAutocompleteField,
      'tree-select': renderTreeSelectField,
      cascader: renderCascaderField,
      'time-picker': renderTimePickerField,
      'time-select': renderTimeSelectField,
      upload: renderUploadField,
      text: renderTextField,
      divider: renderDividerField,
      separator: renderSeparatorField,
      spacer: renderSpacerField,
      custom: (view, ctx) =>
        renderCustomField(view, props.components || props.customComponents, {
          groupCommands: ctx?.groupCommands,
          groupContext: ctx?.groupContext
        })
    }

    const renderField = (view: FieldView, ctx?: FieldRenderContext) => {
      const fn = fieldRenderers[view.type] || renderUnknownField
      return fn(view, ctx)
    }

    let renderSectionTitle: (
      view: ContainerView | FieldGroupView,
      collapsed: boolean
    ) => any = () => null

    const findFieldById = (container: ContainerView, id: string): FieldView | null => {
      for (const child of container.children) {
        if ((child as any).kind === 'field' && (child as FieldView).id === id) {
          return child as FieldView
        }
        if ((child as any).kind === 'container') {
          const found = findFieldById(child as ContainerView, id)
          if (found) return found
        }
      }
      return null
    }

    let renderGroup: (view: FieldGroupView, ctx: FieldRenderContext) => any = () => null
    let renderContainerInner: (view: ContainerView, ctx: FieldRenderContext) => any = () => null
    let hasRowFields: (
      rows: FormView['rows'],
      fieldIndex: Record<string, FieldView[]>
    ) => boolean = () => false
    let renderRows: (
      rows: FormView['rows'],
      formUi: FormView['formUi'],
      fieldIndex: Record<string, FieldView[]>,
      ctx: FieldRenderContext
    ) => any = () => null

    const renderContainer = (
      view: ContainerView | FieldGroupView,
      ctx: FieldRenderContext
    ): any => {
      if (view.type === 'field-group') {
        return renderGroup(view as FieldGroupView, ctx)
      }
      return renderContainerInner(view as ContainerView, ctx)
    }

    const { renderSectionTitle: renderSectionTitleImpl } = createSectionTitleRenderer({
      toggleCollapse,
      skinProps: props.skinProps as AnyRecord
    })
    renderSectionTitle = renderSectionTitleImpl

    const { renderGroup: renderGroupImpl } = createGroupRenderer({
      renderField,
      renderContainer,
      renderSectionTitle,
      isCollapsed,
      getActiveTab,
      setActiveTab,
      findFieldById,
      skinProps: props.skinProps as AnyRecord
    })
    renderGroup = renderGroupImpl

    const { hasRowFields: hasRowFieldsImpl, renderRows: renderRowsImpl } = createRowsRenderer({
      renderField
    })
    hasRowFields = hasRowFieldsImpl
    renderRows = renderRowsImpl

    const { renderContainerNode } = createContainerRenderer({
      renderField,
      renderContainer,
      renderSectionTitle,
      isCollapsed
    })
    renderContainerInner = renderContainerNode

    createFieldGroupApiSync(formView, fieldGroupAPIs)

    return () => {
      const fv = formView.value
      const fu = fv.formUi || {}
      const formSize = (fu as AnyRecord).size ?? 'large'
      // 将 UI Core 提供的表单级语义映射到 Element Plus 的 Form 上，
      // 调用方传入的 skinProps 仍可覆盖这些默认值。
      const baseFormProps: AnyRecord = {
        labelPosition: fu.labelPosition,
        labelWidth: fu.labelWidth ?? '125px',
        labelSuffix: fu.labelSuffix,
        hideRequiredAsterisk: fu.hideRequiredAsterisk,
        disabled: fu.disabled,
        size: formSize,
        ...(props.skinProps || {})
      }

      const rows = fv.rows
      const { allContainers, groupContainers, fieldIndex, groupCommandMap } = getViewContext(fv)
      const renderCtx: FieldRenderContext = { groupCommands: groupCommandMap }

      // 判断 row/col 布局是否真的能命中至少一个字段，避免因为映射失败导致整页空白
      const shouldUseRows = hasRowFields(rows, fieldIndex)

      return (
        <div class="formx-renderer">
          <ElForm {...baseFormProps}>
            {/* 只有在 rows 可用且能命中实际字段时才使用行列布局，否则退回容器渲染 */}
            {shouldUseRows
              ? renderRows(rows, fu, fieldIndex, renderCtx)
              : allContainers.map((c) => renderContainer(c as any, renderCtx))}
            {/* 布局之外的 field-group 容器（如“保护方法”等）仍然按容器方式渲染 */}
            {shouldUseRows
              ? groupContainers.map((c, idx) => (
                  <div key={`grp-${idx}`}>{renderContainer(c as any, renderCtx)}</div>
                ))
              : null}
          </ElForm>
        </div>
      )
    }
  }
})
