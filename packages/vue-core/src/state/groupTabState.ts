import { ref } from 'vue'
import type { ContainerView, FieldGroupView } from '@formx/ui-core'

type TabView = ContainerView | FieldGroupView

export function createGroupTabState() {
  const groupTabState = ref<Record<string, string>>({})
  const getGroupKey = (view: TabView): string | null =>
    (view.path as string) || (view.id as string) || null

  const getActiveTab = (view: FieldGroupView, total: number): string => {
    const key = getGroupKey(view) || ''
    const map = groupTabState.value
    if (map[key] === undefined) {
      map[key] = '0'
    }
    const idx = parseInt(map[key], 10)
    if (Number.isNaN(idx) || idx >= total) {
      map[key] = total > 0 ? String(total - 1) : '0'
    }
    return map[key]
  }

  const setActiveTab = (view: FieldGroupView, val: string) => {
    const key = getGroupKey(view) || ''
    groupTabState.value = { ...groupTabState.value, [key]: val }
  }

  return { getActiveTab, setActiveTab }
}
