import type { FieldView } from '@formxjs/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElInputNumber } from 'element-plus'

export function renderNumberField(view: FieldView) {
  const { componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  return (
    <ElFormItem {...fi}>
      <ElInputNumber
        class={{ 'is-error': hasErr }}
        modelValue={v}
        disabled={disabled}
        {...componentProps}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
      />
    </ElFormItem>
  )
}
