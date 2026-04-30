import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElDatePicker } from 'element-plus'

export function renderDatePickerField(view: FieldView) {
  const { componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null

  const dpProps: any = { ...componentProps }
  // 规范 shortcuts：支持静态数组形式
  if (Array.isArray(dpProps.shortcuts)) {
    dpProps.shortcuts = dpProps.shortcuts.map((s: any) => ({
      text: s.text,
      value: typeof s.value === 'function' ? s.value : () => s.value
    }))
  }

  return (
    <ElFormItem {...fi}>
      <ElDatePicker
        class={{ 'is-error': hasErr }}
        modelValue={v}
        disabled={disabled}
        {...dpProps}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
      />
    </ElFormItem>
  )
}
