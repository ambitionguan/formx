import type { FieldView, FormUiConfig, LayoutRowView } from '@formxjs/ui-core'
import { ElRow, ElCol } from 'element-plus'
import type { FieldRenderContext } from '../group/types'

type RenderField = (view: FieldView, ctx?: FieldRenderContext) => any

export interface RowsRendererDeps {
  renderField: RenderField
}

export function createRowsRenderer(deps: RowsRendererDeps) {
  const { renderField } = deps

  const normalizeSize = (val: any) => {
    if (typeof val === 'number') return `${val}px`
    if (typeof val === 'string' && val.trim()) return val
    return undefined
  }

  const toNumber = (val: any) => {
    if (typeof val === 'number') return val
    if (typeof val === 'string' && val.trim()) {
      const num = Number(val)
      return Number.isNaN(num) ? undefined : num
    }
    return undefined
  }

  const hasRowFields = (
    rows: LayoutRowView[] | undefined,
    fieldIndex: Record<string, FieldView[]>
  ) => {
    return !!rows &&
      rows.length > 0 &&
      rows.some((row) =>
        row.cols.some((col) =>
          (col.fieldIds || []).some((fid) => {
            const list = fieldIndex[fid]
            return Array.isArray(list) && list.length > 0
          })
        )
      )
  }

  const renderRows = (
    rows: LayoutRowView[] | undefined,
    formUi: FormUiConfig | undefined,
    fieldIndex: Record<string, FieldView[]>,
    ctx: FieldRenderContext
  ) => {
    if (!rows || !rows.length) return null
    const layoutCfg = formUi?.layout || {}
    const gutter = layoutCfg.gutter ?? layoutCfg.gap ?? 16
    const columns = layoutCfg.columns && layoutCfg.columns > 0 ? layoutCfg.columns : undefined
    const defaultSpan = columns ? Math.floor(24 / columns) : 24
    return rows.map((row, rowIdx) => {
      const rowProps: any = row.props || {}
      const rowGutter = toNumber(rowProps.gutter) ?? gutter
      const rowStyle = {
        ...(rowProps.style && typeof rowProps.style === 'object' ? rowProps.style : {}),
        ...(rowProps.rowGap != null ? { rowGap: normalizeSize(rowProps.rowGap) } : {}),
        ...(rowProps.colGap != null ? { columnGap: normalizeSize(rowProps.colGap) } : {}),
        ...(rowProps.wrap ? { flexWrap: rowProps.wrap } : {})
      }
      const { style, rowGap, colGap, wrap, gutter: _gutter, ...restRowProps } = rowProps
      return (
        <ElRow key={rowIdx} gutter={rowGutter} style={rowStyle} {...restRowProps}>
          {row.cols.map((col, colIdx) => {
            const colProps: any = col.props || {}
            const span = col.span ?? toNumber(colProps.span) ?? defaultSpan
            const colStyle = {
              ...(colProps.style && typeof colProps.style === 'object' ? colProps.style : {}),
              ...(colProps.flex != null ? { flex: colProps.flex } : {}),
              ...(colProps.order != null ? { order: colProps.order } : {}),
              ...(colProps.alignSelf ? { alignSelf: colProps.alignSelf } : {}),
              ...(colProps.minWidth ? { minWidth: normalizeSize(colProps.minWidth) } : {}),
              ...(colProps.maxWidth ? { maxWidth: normalizeSize(colProps.maxWidth) } : {}),
            }
            const { style: _style, flex, order, alignSelf, minWidth, maxWidth, span: _span, ...restColProps } = colProps
            return (
              <ElCol key={colIdx} span={span} style={colStyle} {...restColProps}>
                {col.fieldIds.map((fid) => {
                  const list = fieldIndex[fid] || []
                  const fieldView = list[0]
                  return fieldView ? renderField(fieldView, ctx) : null
                })}
              </ElCol>
            )
          })}
        </ElRow>
      )
    })
  }

  return { hasRowFields, renderRows }
}
