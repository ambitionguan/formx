import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElTreeSelect } from 'element-plus'

export function renderTreeSelectField(view: FieldView) {
  const { ui, componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  const data = ui.options || ui.data
  const nodeProps = ui.props || { label: 'label', value: 'value', children: 'children' }
  const TreeSelect = ElTreeSelect as any
  return (
    <ElFormItem {...fi}>
      <TreeSelect
        class={{ 'is-error': hasErr }}
        modelValue={v}
        disabled={disabled}
        data={data}
        props={nodeProps}
        {...componentProps}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
      />
    </ElFormItem>
  )
}
