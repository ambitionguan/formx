import type { ContainerView, FieldGroupView, FieldView } from '@formx/ui-core'
import { ElRow, ElCol } from 'element-plus'
import type { FieldRenderContext } from '../group/types'
import { processI18nObject } from '../../i18n'

type RenderField = (view: FieldView, ctx?: FieldRenderContext) => any

type RenderContainer = (view: ContainerView, ctx: FieldRenderContext) => any

type RenderSectionTitle = (view: ContainerView | FieldGroupView, collapsed: boolean) => any

export interface ContainerRendererDeps {
  renderField: RenderField
  renderContainer: RenderContainer
  renderSectionTitle: RenderSectionTitle
  isCollapsed: (view: ContainerView | FieldGroupView) => boolean
}

export function createContainerRenderer(deps: ContainerRendererDeps) {
  const { renderField, renderContainer, renderSectionTitle, isCollapsed } = deps

  const resolveVisibilityStrategy = (_view: ContainerView, innerLayout?: any) => {
    const view = processI18nObject({ ..._view })
    const ui = view.uiProps as any
    const strategy =
      innerLayout?.visibilityStrategy ||
      (view.layout as any)?.visibilityStrategy ||
      ui.visibilityStrategy
    return strategy === 'filter' || strategy === 'keep-dom' ? strategy : 'keep'
  }

  const shouldRenderChild = (child: FieldView | ContainerView) => {
    if ((child as any).kind === 'field') {
      const fv = child as FieldView
      return fv.visible || fv.renderMode === 'show'
    }
    const cv = child as ContainerView
    return cv.visible !== false
  }

  const normalizeChild = (
    child: FieldView | ContainerView,
    visibilityStrategy: 'keep' | 'filter' | 'keep-dom'
  ) => {
    if (visibilityStrategy !== 'keep-dom') return child
    if ((child as any).kind !== 'field') return child
    const fv = child as FieldView
    if (!fv.visible && fv.renderMode !== 'show') {
      return { ...fv, renderMode: 'show' } as FieldView
    }
    return child
  }

  const ABS_KEYS = [
    'top', 'left', 'right', 'bottom',
    'width', 'height',
    'minWidth', 'minHeight',
    'maxWidth', 'maxHeight',
    'zIndex', 'position'
  ]

  const pickAbsoluteStyle = (style?: Record<string, any>) => {
    if (!style || typeof style !== 'object') return undefined
    const out: Record<string, any> = {}
    ABS_KEYS.forEach((key) => {
      const val = (style as any)[key]
      if (val !== undefined && val !== null && val !== '') {
        out[key] = val
      }
    })
    return Object.keys(out).length ? out : undefined
  }

  const stripAbsoluteStyle = (style?: Record<string, any>) => {
    if (!style || typeof style !== 'object') return style
    let changed = false
    const next: Record<string, any> = { ...(style as any) }
    ABS_KEYS.forEach((key) => {
      if (key in next) {
        delete (next as any)[key]
        changed = true
      }
    })
    if (!changed) return style
    return Object.keys(next).length ? next : undefined
  }

  const normalizeAbsoluteChild = (child: FieldView | ContainerView) => {
    const ui = (child as any).uiProps || {}
    const layoutStyle = (child as any).layout?.style && typeof (child as any).layout.style === 'object'
      ? (child as any).layout.style
      : undefined
    const uiStyle = (ui.style && typeof ui.style === 'object') ? (ui.style as any) : undefined
    const merged = (layoutStyle || uiStyle)
      ? { ...(layoutStyle || {}), ...(uiStyle || {}) }
      : undefined
    const picked = pickAbsoluteStyle(merged)
    const wrapperStyle: Record<string, any> = {
      ...(picked || {}),
      position: 'absolute',
      boxSizing: 'border-box'
    }
    let nextUiStyle = stripAbsoluteStyle(uiStyle)
    const nextLayoutStyle = stripAbsoluteStyle(layoutStyle)
    if (wrapperStyle.width != null || wrapperStyle.height != null) {
      const base = (nextUiStyle && typeof nextUiStyle === 'object') ? { ...nextUiStyle } : {}
      let updated = false
      if (wrapperStyle.width != null && !('width' in base)) {
        base.width = '100%'
        updated = true
      }
      if (wrapperStyle.height != null && !('height' in base)) {
        base.height = '100%'
        updated = true
      }
      if (updated) nextUiStyle = base
    }
    if (nextUiStyle && typeof nextUiStyle === 'object') {
      const hasMargin = ['margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'].some((key) => key in nextUiStyle)
      if (!hasMargin) nextUiStyle = { ...nextUiStyle, margin: 0 }
    }
    let nextChild = child as any
    const nextUi = (nextUiStyle !== uiStyle)
      ? { ...ui, style: nextUiStyle }
      : ui
    const nextLayout = (nextLayoutStyle !== layoutStyle && (child as any).layout)
      ? { ...(child as any).layout, style: nextLayoutStyle }
      : (child as any).layout
    if (nextUi !== ui || nextLayout !== (child as any).layout) {
      nextChild = { ...(child as any), uiProps: nextUi, layout: nextLayout }
    }
    return { wrapperStyle, child: nextChild as FieldView | ContainerView }
  }

  const getChildKey = (child: FieldView | ContainerView, idx: number) => {
    if ((child as any).kind === 'field') {
      const fv = child as FieldView
      return fv.path || fv.id || idx
    }
    const cv = child as ContainerView
    return cv.path || cv.id || idx
  }

  const toFlexStyle = (cfg: any) => {
    if (!cfg || typeof cfg !== 'object') return undefined
    const rawDir = cfg.direction || cfg.flexDirection
    const direction = rawDir === 'column' ? 'column' : 'row'
    const rawGap = cfg.gap
    const gap = typeof rawGap === 'number'
      ? `${rawGap}px`
      : (typeof rawGap === 'string' && rawGap.trim()
        ? (Number.isFinite(Number(rawGap)) ? `${Number(rawGap)}px` : rawGap.trim())
        : undefined)
    const alignRaw = cfg.alignItems ?? cfg.align
    const justifyRaw = cfg.justifyContent ?? cfg.justify
    const normalize = (v: any) => {
      if (!v) return undefined
      if (v === 'start') return 'flex-start'
      if (v === 'end') return 'flex-end'
      return v
    }
    const alignItems = normalize(alignRaw)
    const justifyContent = normalize(justifyRaw)
    const flexWrap = cfg.wrap || cfg.flexWrap || 'nowrap'
    return {
      display: 'flex',
      flexDirection: direction,
      gap,
      alignItems,
      justifyContent,
      flexWrap
    }
  }

  const isStyleFlexDisplay = (style?: Record<string, any>) => {
    const display = style?.display
    return display === 'flex' || display === 'inline-flex'
  }

  const pickFlexStyleConfig = (style?: Record<string, any>) => {
    if (!isStyleFlexDisplay(style)) return null
    return {
      direction: style?.flexDirection,
      gap: style?.gap,
      alignItems: style?.alignItems,
      justifyContent: style?.justifyContent,
      flexWrap: style?.flexWrap
    }
  }

  const stripFlexContainerStyle = (style?: Record<string, any>) => {
    if (!style || typeof style !== 'object') return style
    const next = { ...style }
    ;['display', 'flexDirection', 'gap', 'alignItems', 'justifyContent', 'flexWrap'].forEach((key) => {
      if (key in next) delete (next as any)[key]
    })
    return Object.keys(next).length ? next : undefined
  }

  const pickChildStyle = (child: FieldView | ContainerView) => {
    const layoutStyle = (child.layout?.style && typeof child.layout.style === 'object')
      ? child.layout.style
      : undefined
    const uiStyle = ((child as any).uiProps?.style && typeof (child as any).uiProps?.style === 'object')
      ? (child as any).uiProps.style
      : undefined
    const merged = (layoutStyle || uiStyle)
      ? { ...(layoutStyle || {}), ...(uiStyle || {}) }
      : undefined
    if (!merged) return undefined
    const out: Record<string, any> = {}
    if ('flex' in merged) out.flex = merged.flex
    if ('flexGrow' in merged) out.flexGrow = (merged as any).flexGrow
    if ('flexShrink' in merged) out.flexShrink = (merged as any).flexShrink
    if ('flexBasis' in merged) out.flexBasis = (merged as any).flexBasis
    if ('width' in merged) out.width = merged.width
    if ('minWidth' in merged) out.minWidth = merged.minWidth
    if ('maxWidth' in merged) out.maxWidth = merged.maxWidth
    if ('alignSelf' in merged) out.alignSelf = merged.alignSelf
    return Object.keys(out).length ? out : undefined
  }

  const applyFlexSpan = (child: FieldView | ContainerView, style?: Record<string, any>) => {
    const span = (child as any).layout?.span
    if (typeof span !== 'number' || span <= 0) return style
    const out = style ? { ...style } : {}
    if ('flex' in out || 'flexBasis' in out || 'width' in out) return out
    const percent = `${(span / 24) * 100}%`
    out.flex = `0 0 ${percent}`
    out.maxWidth = percent
    return out
  }

  const renderContainerNode = (_view: ContainerView, ctx: FieldRenderContext): any => {
    if (_view.visible === false) return null
    const view = processI18nObject({ ..._view })
    // Apply ui-core styles for form-object or other containers.
    const ui = view.uiProps as any
    const className = [ui.class, ui.className, view.layout?.className].filter(Boolean)
    const layoutStyle = (view.layout?.style && typeof view.layout.style === 'object')
      ? view.layout.style
      : undefined
    const uiStyle = (ui.style && typeof ui.style === 'object') ? ui.style : undefined
    const style = (layoutStyle || uiStyle)
      ? { ...(layoutStyle || {}), ...(uiStyle || {}) }
      : undefined
    // Detect inline layout containers (e.g., inline composite rows).
    const innerLayout = (view.uiProps as any).innerLayout
    const visibilityStrategy = resolveVisibilityStrategy(view, innerLayout)
    const isExplicitFlexLayout = (view.layout as any)?.type === 'flex' ||
      innerLayout?.type === 'flex' ||
      innerLayout?.layout === 'flex'
    const isStyleFlexLayout = !isExplicitFlexLayout && isStyleFlexDisplay(style as any)
    const isFlexLayout = isExplicitFlexLayout || isStyleFlexLayout
    const isAbsoluteLayout = innerLayout?.type === 'absolute' || (view.layout as any)?.type === 'absolute'
    const isLayoutOnly = !!ui.containerOnly || ui.role === 'layout' || ui.flatten === true || isAbsoluteLayout
    const containerClass = isLayoutOnly ? 'formx-container' : 'formx-section'
    const containerStyle = isStyleFlexLayout ? stripFlexContainerStyle(style as any) : style
    const flexCfg = isFlexLayout
      ? (isExplicitFlexLayout ? ((view.layout as any)?.flex || innerLayout) : pickFlexStyleConfig(style as any))
      : null

    if (isAbsoluteLayout && Array.isArray(view.children) && view.children.length) {
      const children = visibilityStrategy === 'filter'
        ? view.children.filter((c) => shouldRenderChild(c as any))
        : view.children
      const absStyle = { ...(style || {}), position: (style as any)?.position || 'relative' }
      const collapsed = isCollapsed(view)
      return (
        <div class={[containerClass, ...className]} style={absStyle}>
          {view.label ? renderSectionTitle(view, collapsed) : null}
          {!collapsed
            ? children.map((c, idx) => {
              const child = normalizeChild(c as any, visibilityStrategy)
              const key = getChildKey(child as any, idx)
              const normalized = normalizeAbsoluteChild(child as any)
              return (
                <div key={key} class="formx-absolute-item" style={normalized.wrapperStyle}>
                  {(normalized.child as any).kind === 'field'
                    ? renderField(normalized.child as FieldView, ctx)
                    : renderContainer(normalized.child as ContainerView, ctx)}
                </div>
              )
            })
            : null}
        </div>
      )
    }

    // Render direct child fields with flex layout only when explicitly configured.
    if (flexCfg && Array.isArray(view.children) && view.children.length) {
      const children = visibilityStrategy === 'filter'
        ? view.children.filter((c) => shouldRenderChild(c as any))
        : view.children
      const flexStyle = toFlexStyle(flexCfg)
      const collapsed = isCollapsed(view)
      return (
        <div class={[containerClass, ...className]} style={containerStyle}>
          {view.label ? renderSectionTitle(view, collapsed) : null}
          {!collapsed ? (
            <div style={flexStyle}>
              {children.map((c, idx) => {
                const child = normalizeChild(c as any, visibilityStrategy)
                const key = getChildKey(child as any, idx)
                const baseStyle = pickChildStyle(child as FieldView)
                const childStyle = applyFlexSpan(child as any, baseStyle)
                return (child as any).kind === 'field'
                  ? (
                    <div key={key} style={childStyle}>
                      {renderField(child as FieldView, ctx)}
                    </div>
                  )
                  : (
                    <div key={key} style={childStyle}>
                      {renderContainer(child as ContainerView, ctx)}
                    </div>
                  )
              })}
            </div>
          ) : null}
        </div>
      )
    }

    // Render direct child fields with grid layout when flex config is not explicit.
    if (!flexCfg && innerLayout && Array.isArray(view.children) && view.children.length) {
      const fields = (view.children as any[])
        .filter((c) => (c as any).kind === 'field')
        .filter((c) => visibilityStrategy !== 'filter' || shouldRenderChild(c as any))
        .map((c) => normalizeChild(c as any, visibilityStrategy)) as FieldView[]
      const cols = fields.length || 1
      const gap = typeof innerLayout?.gap === 'number' ? innerLayout.gap : 8
      const defaultSpan = Math.floor(24 / cols)

      const collapsed = isCollapsed(view)
      return (
        <div class={[containerClass, ...className]} style={style}>
          {view.label ? renderSectionTitle(view, collapsed) : null}
          {!collapsed ? (
            <ElRow gutter={gap}>
              {fields.map((fv, idx) => {
                const span = fv.layout?.span ?? defaultSpan
                return (
                  <ElCol key={fv.path || fv.id || idx} span={span}>
                    {renderField(fv, ctx)}
                  </ElCol>
                )
              })}
            </ElRow>
          ) : null}
        </div>
      )
    }

    const collapsed = isCollapsed(view)
    const children = visibilityStrategy === 'filter'
      ? view.children.filter((c) => shouldRenderChild(c as any))
      : view.children
    return (
      <div class={[containerClass, ...className]} style={style}>
        {view.label ? renderSectionTitle(view, collapsed) : null}
        {!collapsed &&
          children.map((c) => {
            const child = normalizeChild(c as any, visibilityStrategy)
            return (child as any).kind === 'field'
              ? renderField(child as FieldView, ctx)
              : renderContainer(child as ContainerView, ctx)
          })}
      </div>
    )
  }

  return { renderContainerNode }
}
