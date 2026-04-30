import type { FieldView } from '@formx/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElAutocomplete } from 'element-plus'

export function renderAutocompleteField(view: FieldView) {
  const { ui, componentProps, v, disabled, hasErr, fi, shouldRender } = useFormItemProps(view)
  if (!shouldRender) return null

  const opts = ui.options || []
  const hasCustom = typeof ui.fetchSuggestions === 'function'
  const fetcher =
    hasCustom
      ? ui.fetchSuggestions
      : (query: string, cb: (arr: any[]) => void) => {
          const q = (query || '').toLowerCase()
          const list = (opts as any[]).filter((o) =>
            String(o.label ?? o.value ?? o).toLowerCase().includes(q)
          )
          cb(list.map((o) => ({ value: o.label ?? String(o) })))
        }
  const valueKey = ui.valueKey || 'value'
  const returnObject = !!ui.returnObject

  return (
    <ElFormItem {...fi}>
      <ElAutocomplete
        class={{ 'is-error': hasErr }}
        modelValue={v}
        disabled={disabled}
        fetchSuggestions={fetcher}
        valueKey={valueKey}
        {...componentProps}
        onUpdate:modelValue={(val: any) => view.setValue(val)}
        onSelect={(item: any) => {
          const next = returnObject
            ? item
            : item?.[valueKey] ?? item?.value ?? item?.label ?? item
          view.setValue(next)
        }}
      />
    </ElFormItem>
  )
}
