import type { FieldView } from '@formxjs/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElTimePicker } from 'element-plus'

export function renderTimePickerField(view: FieldView) {
  const { componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  return (
    <ElFormItem {...fi}>
      <ElTimePicker
        class={{ 'is-error': hasErr }}
        modelValue={v}
        disabled={disabled}
        {...componentProps}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
      />
    </ElFormItem>
  )
}
