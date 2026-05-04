import type { FieldView } from '@formxjs/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElCascader } from 'element-plus'

export function renderCascaderField(view: FieldView) {
  const { ui, componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  const opts = ui.options || []
  const nodeProps: any = ui.props || { value: 'value', label: 'label', children: 'children' }
  const rest: any = { ...componentProps }
  if (ui.emitPath != null) rest.emitPath = ui.emitPath
  if (ui.checkStrictly != null) rest.checkStrictly = ui.checkStrictly
  if (ui.multiple != null) rest.multiple = ui.multiple
  if (ui.expandTrigger) rest.expandTrigger = ui.expandTrigger
  return (
    <ElFormItem {...fi}>
      {/* @ts-ignore */}
      <ElCascader
        class={{ 'is-error': hasErr }}
        modelValue={v}
        disabled={disabled}
        options={opts}
        props={nodeProps}
        {...rest}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
      />
    </ElFormItem>
  )
}
