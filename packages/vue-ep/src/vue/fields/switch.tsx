import type { FieldView } from '@formxjs/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElSwitch } from 'element-plus'

export function renderSwitchField(view: FieldView) {
  const { componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  return (
    <ElFormItem {...fi}>
      <ElSwitch
        class={{ 'is-error': hasErr }}
        modelValue={v}
        disabled={disabled}
        {...componentProps}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
      />
    </ElFormItem>
  )
}
