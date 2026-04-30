import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElCheckboxGroup, ElCheckbox } from 'element-plus'

export function renderCheckboxField(view: FieldView) {
  const { ui, componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  const options = ui.options

  // 多选列表
  if (Array.isArray(options) && options.length) {
    const itemProps: any = {}
    if (ui.border != null) itemProps.border = ui.border
    if (ui.size) itemProps.size = ui.size
    return (
      <ElFormItem {...fi}>
        <ElCheckboxGroup
          class={{ 'is-error': hasErr }}
          modelValue={Array.isArray(v) ? v : []}
          disabled={disabled}
          {...componentProps}
          onUpdate:modelValue={(val: any[]) => view.setValue(val)}
        >
          {options.map((o: any) => (
            <ElCheckbox value={o.value} {...itemProps}>
              {o.label}
            </ElCheckbox>
          ))}
        </ElCheckboxGroup>
      </ElFormItem>
    )
  }

  // 单个布尔开关
  return (
    <ElFormItem {...fi}>
      <ElCheckbox
        class={{ 'is-error': hasErr }}
        modelValue={!!v}
        disabled={disabled}
        {...componentProps}
        onUpdate:modelValue={(val: boolean) => view.setValue(val)}
      />
    </ElFormItem>
  )
}
