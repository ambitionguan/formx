import type { ContainerView, FieldGroupView } from '@formxjs/ui-core'
import { processI18nObject, tf } from '../../i18n'

type AnyRecord = Record<string, any>

export interface SectionTitleRendererDeps {
  toggleCollapse: (view: ContainerView | FieldGroupView) => void
  skinProps?: AnyRecord
}

export function createSectionTitleRenderer(deps: SectionTitleRendererDeps) {
  const { toggleCollapse, skinProps } = deps

  const renderSectionTitle = (view: ContainerView | FieldGroupView, collapsed: boolean) => {
    const processedView = processI18nObject({ ...view })
    if (!processedView.label) return null
    const customToggle = typeof skinProps?.sectionToggleRender === 'function'
      ? skinProps.sectionToggleRender
      : null
    return (
      <div class="formx-section-title">
        <span>{processedView.label}</span>
        {processedView.collapsible ? (
          customToggle
            ? customToggle(view, collapsed, () => toggleCollapse(view))
            : (
              <span class="formx-section-title-toggle" onClick={() => toggleCollapse(view)}>
                {collapsed
                  ? tf('formx.common.expand')
                  : tf('formx.common.collapse')}
              </span>
            )
        ) : null}
      </div>
    )
  }

  return { renderSectionTitle }
}
