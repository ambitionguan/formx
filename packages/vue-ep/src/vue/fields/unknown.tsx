import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem } from 'element-plus'

export function renderUnknownField(view: FieldView) {
  const { fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null
  return (
    <ElFormItem {...fi}>
      <div>{`Unsupported: ${view.type}`}</div>
    </ElFormItem>
  )
}
