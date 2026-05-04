import { watch } from 'vue'
import type { ComputedRef } from 'vue'
import type { FormView, FieldGroupView } from '@formxjs/ui-core'
import { buildGroupCommandMap } from '../utils/formViewMaps'

export function createFieldGroupApiSync(
  formView: ComputedRef<FormView>,
  fieldGroupAPIs: Record<string, any>
) {
  const syncFieldGroupAPIs = (map: Map<string, FieldGroupView['commands']>) => {
    Object.keys(fieldGroupAPIs).forEach((k) => { delete (fieldGroupAPIs as any)[k] })
    map.forEach((cmds, key) => { (fieldGroupAPIs as any)[key] = cmds })
  }

  watch(
    formView,
    (view) => {
      try {
        const map = buildGroupCommandMap(view.containers || [])
        syncFieldGroupAPIs(map)
      } catch {
        // ignore
      }
    },
    { immediate: true }
  )

  return { syncFieldGroupAPIs }
}
