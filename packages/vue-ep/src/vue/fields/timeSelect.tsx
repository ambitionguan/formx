import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElTimeSelect } from 'element-plus'

export function renderTimeSelectField(view: FieldView) {
  const { componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  return (
    <ElFormItem {...fi}>
      <ElTimeSelect
        class={{ 'is-error': hasErr }}
        modelValue={v}
        disabled={disabled}
        {...componentProps}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
      />
    </ElFormItem>
  )
}
