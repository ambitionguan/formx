import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElInput } from 'element-plus'

export function renderTextareaField(view: FieldView) {
  const { componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  return (
    <ElFormItem {...fi}>
      <ElInput
        class={{ 'is-error': hasErr }}
        type="textarea"
        modelValue={v}
        disabled={disabled}
        {...componentProps}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
      />
    </ElFormItem>
  )
}
