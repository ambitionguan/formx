import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElSelect, ElOption } from 'element-plus'

export function renderSelectField(view: FieldView) {
  const { ui, componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  const options = ui.options || []
  return (
    <ElFormItem {...fi}>
      <ElSelect
        class={{ 'is-error': hasErr }}
        modelValue={v}
        disabled={disabled}
        {...componentProps}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
      >
        {options.map((o: any) => (
          <ElOption label={o.label} value={o.value} disabled={!!o.disabled} />
        ))}
      </ElSelect>
    </ElFormItem>
  )
}
