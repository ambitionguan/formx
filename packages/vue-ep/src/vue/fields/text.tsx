import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem } from 'element-plus'

export function renderTextField(view: FieldView) {
  const { ui, v, fi, shouldRender, visibilityStyle } = useFormItemProps(view)
  if (!shouldRender) return null
  if (ui.plain) {
    const plainStyle = visibilityStyle ? { ...(ui.style || {}), ...visibilityStyle } : ui.style
    return (
      <span class={['formx-plain-text', ui.class]} style={plainStyle}>
        {ui.text ?? String(v ?? '')}
      </span>
    )
  }
  return (
    <ElFormItem {...fi}>
      <div>{ui.text ?? String(v ?? '')}</div>
    </ElFormItem>
  )
}
