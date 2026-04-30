import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem } from 'element-plus'

export function renderSpacerField(view: FieldView) {
  const { fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  const spacerItem = { ...fi, labelWidth: '0px' } as any
  return (
    <ElFormItem {...spacerItem}>
      <div style={{ width: '100%', height: '100%' }} />
    </ElFormItem>
  )
}
