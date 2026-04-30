import { ref } from 'vue'
import type { ContainerView, FieldGroupView } from '@formx/ui-core'

type CollapseView = ContainerView | FieldGroupView

export function createCollapseState() {
  const collapseState = ref<Record<string, boolean>>({})
  const getCollapseKey = (view: CollapseView): string | null =>
    (view.path as string) || (view.id as string) || null

  const isCollapsed = (view: CollapseView): boolean => {
    const key = getCollapseKey(view)
    if (!key) return false
    const m = collapseState.value
    if (m[key] === undefined) {
      m[key] = !!view.collapsed
    }
    return !!m[key]
  }

  const toggleCollapse = (view: CollapseView) => {
    const key = getCollapseKey(view)
    if (!key) return
    const curr = isCollapsed(view)
    collapseState.value = { ...collapseState.value, [key]: !curr }
  }

  return { isCollapsed, toggleCollapse }
}
