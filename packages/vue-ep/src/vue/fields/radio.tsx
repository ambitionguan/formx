import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElRadioGroup, ElRadio } from 'element-plus'

export function renderRadioField(view: FieldView) {
  const { ui, componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  const options = ui.options || []
  const radioItemProps: any = {}
  if (ui.border != null) radioItemProps.border = ui.border
  if (ui.size) radioItemProps.size = ui.size
  return (
    <ElFormItem {...fi}>
      <ElRadioGroup
        class={{ 'is-error': hasErr }}
        modelValue={v}
        disabled={disabled}
        {...componentProps}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
      >
        {options.map((o: any) => (
          <ElRadio label={o.value} {...radioItemProps}>
            {o.label}
          </ElRadio>
        ))}
      </ElRadioGroup>
    </ElFormItem>
  )
}
