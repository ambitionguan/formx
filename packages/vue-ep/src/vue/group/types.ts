import type { FieldGroupView } from '@formxjs/ui-core'

export type FieldRenderContext = {
  groupCommands?: Map<string, FieldGroupView['commands']>
  groupContext?: {
    group: FieldGroupView
    index: number
  }
}
