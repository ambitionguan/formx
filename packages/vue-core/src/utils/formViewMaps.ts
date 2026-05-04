import type { ContainerView, FieldGroupView, FieldView } from '@formxjs/ui-core'

export function buildFieldIndex(containers: ContainerView[]): Record<string, FieldView[]> {
  const index: Record<string, FieldView[]> = {}
  const visit = (n: ContainerView | FieldView) => {
    if ((n as any).kind === 'field') {
      const fv = n as FieldView
      const list = index[fv.id] || (index[fv.id] = [])
      list.push(fv)
      return
    }
    ;(n as ContainerView).children.forEach((c) => visit(c as any))
  }
  containers.forEach((c) => visit(c as any))
  return index
}

export function buildGroupCommandMap(
  containers: ContainerView[]
): Map<string, FieldGroupView['commands']> {
  const map = new Map<string, FieldGroupView['commands']>()
  const visit = (node: ContainerView | FieldView) => {
    if ((node as any).kind === 'field') return
    const c = node as ContainerView
    if (c.type === 'field-group') {
      const group = c as FieldGroupView
      if (group.id) map.set(String(group.id), group.commands)
      if (group.path) map.set(String(group.path), group.commands)
    }
    ;(c.children || []).forEach((child) => visit(child as any))
  }
  containers.forEach((c) => visit(c as any))
  return map
}
