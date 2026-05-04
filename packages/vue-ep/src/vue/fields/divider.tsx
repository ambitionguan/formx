import type { FieldView } from '@formxjs/ui-core'
import { useFormItemProps } from './shared'
import { ElDivider } from 'element-plus'

function renderDividerLike(view: FieldView) {
  const { ui, v, shouldRender, visibilityStyle } = useFormItemProps(view)
  if (!shouldRender) return null
  const dividerProps: Record<string, any> = { ...ui }
  const className = dividerProps.class
  const inlineStyle = visibilityStyle
    ? { ...(dividerProps.style || {}), ...visibilityStyle }
    : dividerProps.style
  delete dividerProps.class
  delete dividerProps.style
  delete dividerProps.text

  const content = ui.text ?? view.label ?? String(v ?? '')

  return (
    <ElDivider
      {...dividerProps}
      class={className}
      style={inlineStyle}
      data-formx-path={view.path}
    >
      {content}
    </ElDivider>
  )
}

export function renderDividerField(view: FieldView) {
  return renderDividerLike(view)
}

export function renderSeparatorField(view: FieldView) {
  return renderDividerLike(view)
}
