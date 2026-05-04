import type { FieldView } from '@formxjs/ui-core'
import { processI18nObject } from '../../i18n'

export function useFormItemProps(view: FieldView) {
  const processedView = processI18nObject({ ...view })

  const ui = processedView.uiProps || {}
  const label = processedView.label
  const v = view.value
  const disabled = !!view.disabled || !!view.readOnly
  const validating = !!view.validating
  const hasErr = Array.isArray(view.errors) && view.errors.length > 0
  const errMsg = hasErr ? String(view.errors[0] || '') : ''
  const renderMode = processedView.renderMode || 'if'
  const shouldRender = processedView.visible || renderMode === 'show'
  const visibilityStyle = !processedView.visible && renderMode === 'show' ? { display: 'none' } : undefined
  const layoutStyle =
    processedView.layout?.style && typeof processedView.layout.style === 'object' ? processedView.layout.style : undefined
  const baseStyle = ui.style && typeof ui.style === 'object' ? ui.style : undefined
  const fxPos = (ui as any).__fxPosition || (ui as any).__fx_position
  const isAbsoluteContext = !!fxPos
  const mergedStyle =
    layoutStyle || baseStyle ? { ...(layoutStyle || {}), ...(baseStyle || {}) } : undefined
  const style = visibilityStyle ? { ...(mergedStyle || {}), ...visibilityStyle } : mergedStyle
  const className = [ui.class, ui.className, processedView.layout?.className].filter(Boolean)
  let labelWidth = processedView.labelWidth === 0 ? '0px' : processedView.labelWidth
  const hasLabelText = typeof label === 'string' ? label.trim().length > 0 : !!label
  if ((labelWidth == null || labelWidth === '') && isAbsoluteContext && !hasLabelText) {
    labelWidth = '0px'
  }

  const fi = {
    label,
    labelWidth,
    error: errMsg,
    validateStatus: hasErr ? 'error' : (validating ? 'validating' : ''),
    required: !!view.required,
    class: className.length ? className : undefined,
    style,
    'data-formx-path': processedView.path
  } as any

  const stripAbsoluteStyle = (src: Record<string, any> | undefined) => {
    if (!src || typeof src !== 'object') return src
    const hasAbsolute =
      src.position === 'absolute' ||
      'top' in src ||
      'left' in src ||
      'right' in src ||
      'bottom' in src
    if (!hasAbsolute) return src
    const next = { ...src }
    ;[
      'position',
      'top',
      'left',
      'right',
      'bottom',
      'zIndex',
      'width',
      'height',
      'minWidth',
      'minHeight',
      'maxWidth',
      'maxHeight'
    ].forEach((key) => {
      if (key in next) delete (next as any)[key]
    })
    return next
  }

  const contentStyle = stripAbsoluteStyle(baseStyle)
  let componentProps = processI18nObject(ui)

  if (baseStyle && typeof baseStyle === 'object') {
    const cleanedStyle = contentStyle
    if (cleanedStyle !== baseStyle) {
      componentProps = { ...componentProps }
      if (cleanedStyle && Object.keys(cleanedStyle).length) {
        ;(componentProps as any).style = cleanedStyle
      } else {
        delete (componentProps as any).style
      }
    }
  }

  if (typeof view.validate === 'function') {
    const nextBlur = () => {
      try {
        view.validate?.('blur')
      } catch {}
    }
    const prevBlur = (componentProps as any)?.onBlur
    const mergedBlur = prevBlur
      ? (...args: any[]) => {
          try {
            prevBlur(...args)
          } finally {
            nextBlur()
          }
        }
      : nextBlur
    componentProps = { ...(componentProps as any), onBlur: mergedBlur }
  }

  if (ui.options && Array.isArray(ui.options)) {
    ui.options = componentProps.options
  }

  return {
    ui,
    componentProps,
    contentStyle,
    v,
    disabled,
    hasErr,
    errMsg,
    fi,
    shouldRender,
    visibilityStyle
  }
}
