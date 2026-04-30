import type {
  ContainerView,
  FieldGroupItemLayout,
  FieldGroupTableColumn,
  FieldGroupToolbarButton,
  FieldGroupView,
  FieldView
} from '@formx/ui-core'
import { ElButton, ElCol, ElRow, ElTabPane, ElTabs, ElTooltip } from 'element-plus'
import { processI18nObject, tf } from '../../i18n'
import type { FieldRenderContext } from './types'

type AnyRecord = Record<string, any>

type RenderField = (view: FieldView, ctx?: FieldRenderContext) => any

type RenderContainer = (view: ContainerView, ctx: FieldRenderContext) => any

type RenderSectionTitle = (view: ContainerView | FieldGroupView, collapsed: boolean) => any

type FindFieldById = (container: ContainerView, id: string) => FieldView | null

type GroupItemNode = FieldView | ContainerView

export interface GroupRendererDeps {
  renderField: RenderField
  renderContainer: RenderContainer
  renderSectionTitle: RenderSectionTitle
  isCollapsed: (view: ContainerView | FieldGroupView) => boolean
  getActiveTab: (view: FieldGroupView, total: number) => string
  setActiveTab: (view: FieldGroupView, val: string) => void
  findFieldById: FindFieldById
  skinProps?: AnyRecord
}

function resolveVisibilityStrategy(gv: FieldGroupView) {
  const ui = gv.uiProps as any
  const strategy = (gv.layout as any)?.visibilityStrategy || ui.visibilityStrategy
  return strategy === 'filter' || strategy === 'keep-dom' ? strategy : 'keep'
}

function shouldRenderNode(node: GroupItemNode) {
  if ((node as any).kind === 'field') {
    const fv = node as FieldView
    return fv.visible || fv.renderMode === 'show'
  }
  const cv = node as ContainerView
  return cv.visible !== false
}

function normalizeNode(node: GroupItemNode, visibilityStrategy: 'keep' | 'filter' | 'keep-dom') {
  if (visibilityStrategy !== 'keep-dom') return node
  if ((node as any).kind !== 'field') return node
  const fv = node as FieldView
  if (!fv.visible && fv.renderMode !== 'show') {
    return { ...fv, renderMode: 'show' } as FieldView
  }
  return node
}

function getRenderableNodes(
  nodes: GroupItemNode[],
  visibilityStrategy: 'keep' | 'filter' | 'keep-dom'
) {
  const filtered = visibilityStrategy === 'filter' ? nodes.filter(shouldRenderNode) : nodes
  return filtered.map((node) => normalizeNode(node, visibilityStrategy))
}

function getGroupItems(gv: FieldGroupView) {
  return gv.children.filter(
    (c) => (c as any).kind === 'container' && (c as any).type === 'field-group-item'
  ) as ContainerView[]
}

function getGroupItemFields(item: ContainerView) {
  return (item.children || []).filter((ch: any) => ch.kind === 'field') as FieldView[]
}

function getGroupItemNodes(item: ContainerView) {
  return (item.children || []).filter(
    (ch: any) => ch.kind === 'field' || ch.kind === 'container'
  ) as GroupItemNode[]
}

function getGroupOps(gv: FieldGroupView) {
  return gv.operations || (gv.uiProps as any).operations || {}
}

function getGroupClassAndStyle(gv: FieldGroupView) {
  const ui = gv.uiProps as any
  const className = [ui.class, ui.className, gv.layout?.className].filter(Boolean)
  const layoutStyle =
    gv.layout?.style && typeof gv.layout.style === 'object' ? gv.layout.style : undefined
  const uiStyle = ui.style && typeof ui.style === 'object' ? ui.style : undefined
  const style = layoutStyle || uiStyle ? { ...(layoutStyle || {}), ...(uiStyle || {}) } : undefined
  return { className, style }
}

function canGroupAdd(gv: FieldGroupView, total: number) {
  return typeof gv.max === 'number' ? total < gv.max : true
}

function canGroupRemove(gv: FieldGroupView, total: number) {
  return typeof gv.min === 'number' ? total > gv.min : total > 0
}

function normalizeSize(val: number | string | undefined) {
  if (typeof val === 'number') return `${val}px`
  if (typeof val === 'string' && val.trim()) return val
  return undefined
}

function getNodeSpan(node: GroupItemNode, fallback: number) {
  const span = (node as any).layout?.span
  if (typeof span === 'number' && span > 0) return span
  if ((node as any).kind === 'container') return 24
  return fallback
}

function getNodeKey(node: GroupItemNode, fallback: number) {
  return (node as any).path || (node as any).id || fallback
}

function renderGroupIndex(gv: FieldGroupView, idx: number) {
  if (!gv.showIndex) return null
  const width = normalizeSize(gv.indexWidth)
  const style = width ? { width, minWidth: width } : undefined
  return (
    <span class="formx-group-index" style={style}>
      {idx + 1}
    </span>
  )
}

function getGroupHeaderLabel(field: FieldView) {
  const uiLabel = (field.uiProps as any)?.tableLabel
  if (uiLabel != null) return uiLabel
  if (field.label != null) return field.label
  return field.id
}

function resolveColumnLabel(col: FieldGroupTableColumn, field?: FieldView) {
  if (typeof col.label === 'string') return col.label
  if (field) return getGroupHeaderLabel(field)
  return col.field
}

function getGroupTableColumns(
  gv: FieldGroupView,
  columns: FieldGroupTableColumn[],
  hasActions: boolean
) {
  const cols: string[] = []
  if (gv.showIndex) cols.push(normalizeSize(gv.indexWidth) || '40px')
  columns.forEach((col) => {
    const width = normalizeSize(col.width)
    if (width) {
      cols.push(width)
      return
    }
    const minWidth = normalizeSize(col.minWidth)
    const span = col.span
    if (typeof span === 'number' && span > 0) {
      if (minWidth) cols.push(`minmax(${minWidth}, ${span}fr)`)
      else cols.push(`${span}fr`)
    } else {
      if (minWidth) cols.push(`minmax(${minWidth}, 1fr)`)
      else cols.push('1fr')
    }
  })
  if (hasActions) {
    const actionsWidth = normalizeSize(gv.presentation?.table?.actionsWidth)
    cols.push(actionsWidth || '120px')
  }
  return cols.length ? cols.join(' ') : undefined
}

function wrapWithTooltip(node: any, message?: string, enabled?: boolean) {
  if (!message || !enabled) return node
  return (
    <ElTooltip key={node?.key} content={message} placement="top">
      <span class="formx-op-tooltip-wrap">{node}</span>
    </ElTooltip>
  )
}

function renderGroupItemActions(
  _gv: FieldGroupView,
  idx: number,
  total: number,
  variant: 'inline' | 'block' = 'inline'
) {
  const gv: FieldGroupView = processI18nObject({ ..._gv })
  const ops = getGroupOps(gv)
  const showCopy = ops.copy ? ops.copy.show !== false : true
  const showMove = ops.move ? ops.move.show !== false : gv.sortable !== false
  const showRemove = ops.remove ? ops.remove.show !== false : true
  const canAdd = canGroupAdd(gv, total)
  const canRemove = canGroupRemove(gv, total)
  const buttons: any[] = []

  if (showCopy) {
    const btn = (
      <ElButton
        key={`copy-${idx}`}
        type="primary"
        link
        class={ops.copy?.className}
        style={ops.copy?.style}
        icon={ops.copy?.icon}
        disabled={!canAdd}
        onClick={() => gv.commands.copy(idx)}
      >
        {ops.copy?.text || tf('formx.group.copy')}
      </ElButton>
    )
    buttons.push(wrapWithTooltip(btn, ops.copy?.disabledMessage, !canAdd))
  }

  if (showMove) {
    const moveClass = ops.move?.className
    const moveStyle = ops.move?.style
    const moveUp = (
      <ElButton
        key={`move-up-${idx}`}
        type="primary"
        link
        class={moveClass}
        style={moveStyle}
        icon={ops.move?.icon}
        disabled={idx <= 0}
        onClick={() => gv.commands.move(idx, idx - 1)}
      >
        {tf('formx.group.moveUp')}
      </ElButton>
    )
    buttons.push(wrapWithTooltip(moveUp, ops.move?.disabledMessage, idx <= 0))
    const moveDown = (
      <ElButton
        key={`move-down-${idx}`}
        type="primary"
        link
        class={moveClass}
        style={moveStyle}
        icon={ops.move?.icon}
        disabled={idx >= total - 1}
        onClick={() => gv.commands.move(idx, idx + 1)}
      >
        {tf('formx.group.moveDown')}
      </ElButton>
    )
    buttons.push(wrapWithTooltip(moveDown, ops.move?.disabledMessage, idx >= total - 1))
  }

  if (showRemove) {
    const btn = (
      <ElButton
        key={`remove-${idx}`}
        type="danger"
        link
        class={ops.remove?.className}
        style={ops.remove?.style}
        icon={ops.remove?.icon}
        disabled={!canRemove}
        onClick={() => gv.commands.remove(idx)}
      >
        {ops.remove?.text || tf('formx.group.remove')}
      </ElButton>
    )
    buttons.push(wrapWithTooltip(btn, ops.remove?.disabledMessage, !canRemove))
  }

  if (!buttons.length) return null
  const className =
    variant === 'block'
      ? ['formx-group-row-actions', 'formx-group-row-actions-block']
      : 'formx-group-row-actions'
  return <div class={className}>{buttons}</div>
}

function renderGroupRow(
  renderField: RenderField,
  renderContainer: RenderContainer,
  gv: FieldGroupView,
  rowIdx: number,
  nodes: GroupItemNode[],
  ctx: FieldRenderContext,
  layoutCfg?: FieldGroupItemLayout
) {
  const wrap = layoutCfg?.wrap || 'nowrap'
  const direction = layoutCfg?.direction || 'row'
  const align = layoutCfg?.align || 'stretch'
  const justify = layoutCfg?.justify || 'start'
  const gap = layoutCfg?.gap ?? 8

  const style: Record<string, any> = {
    display: 'flex',
    flexWrap: wrap,
    flexDirection: direction,
    alignItems: align === 'stretch' ? 'stretch' : align,
    justifyContent: justify,
    gap: `${gap}px`
  }

  const nextCtx: FieldRenderContext = { ...ctx, groupContext: { group: gv, index: rowIdx } }

  return (
    <div key={rowIdx} class="formx-group-row-flex" style={style}>
      {nodes.map((node, idx) => (
        <div key={getNodeKey(node, idx)} class="formx-group-flex-field">
          {(node as any).kind === 'field'
            ? renderField(node as FieldView, nextCtx)
            : renderContainer(node as ContainerView, nextCtx)}
        </div>
      ))}
    </div>
  )
}

function renderGroupToolbar(
  _gv: FieldGroupView,
  skinProps: AnyRecord | undefined,
  placement: 'header' | 'footer'
) {
  const gv = processI18nObject({ ..._gv })
  const toolbar: FieldGroupToolbarButton[] | undefined = gv.presentation?.toolbar
  if (!toolbar || !toolbar.length) return null
  const buttons = toolbar.filter((btn) => (btn.placement || 'header') === placement)
  if (!buttons.length) return null

  const handleClick = (btn: FieldGroupToolbarButton) => {
    if (btn.action === 'add') {
      gv.commands.add()
    } else if (btn.action === 'remove') {
      const items = getGroupItems(gv)
      if (items.length > 0) {
        gv.commands.remove(items.length - 1)
      }
    }
    const hook = skinProps?.onToolbarClick
    if (typeof hook === 'function') {
      try {
        hook({ group: gv, button: btn })
      } catch {
        // ignore
      }
    }
  }

  return (
    <div class={['formx-group-toolbar', `formx-group-toolbar-${placement}`]}>
      {buttons.map((btn, idx) => {
        const key = btn.key || `${placement}-${idx}`
        const text =
          btn.text ||
          (btn.action === 'add'
            ? gv.presentation?.addButtonText || tf('formx.group.add')
            : '')
        const propsFromBtn = btn.props || {}
        const type = propsFromBtn.type || 'primary'
        const link = propsFromBtn.link ?? true
        const plain = propsFromBtn.plain ?? false
        const size = propsFromBtn.size
        const disabled = propsFromBtn.disabled
        return (
          <ElButton
            key={key}
            type={type}
            link={link}
            plain={plain}
            size={size}
            icon={btn.icon}
            disabled={disabled}
            onClick={() => handleClick(btn)}
          >
            {text}
          </ElButton>
        )
      })}
    </div>
  )
}

export function createGroupRenderer(deps: GroupRendererDeps) {
  const {
    renderField,
    renderContainer,
    renderSectionTitle,
    isCollapsed,
    getActiveTab,
    setActiveTab,
    findFieldById,
    skinProps
  } = deps

  const renderGroupList = (_gv: FieldGroupView, ctx: FieldRenderContext) => {
    const gv: FieldGroupView = processI18nObject({ ..._gv })
    const { className, style } = getGroupClassAndStyle(gv)
    const itemLayout = gv.itemLayout || (gv.uiProps as any).itemLayout || {}
    const gap = typeof itemLayout.gap === 'number' ? itemLayout.gap : 8
    const ops = getGroupOps(gv)
    const showAdd = ops.add ? ops.add.show !== false : true
    const addText =
      ops.add?.text || gv.presentation?.addButtonText || tf('formx.group.add')
    const position = ops.position || 'top'
    const collapsed = isCollapsed(gv)
    const items = getGroupItems(gv)
    const visibilityStrategy = resolveVisibilityStrategy(gv)
    const total = items.length
    const canAdd = canGroupAdd(gv, total)
    const hasToolbarAdd =
      Array.isArray(gv.presentation?.toolbar) &&
      gv.presentation!.toolbar!.some((btn) => btn.action === 'add')

    return (
      <div class={['formx-group', ...className]} style={style}>
        {gv.label ? renderSectionTitle(gv, collapsed) : null}
        {!collapsed ? renderGroupToolbar(gv, skinProps, 'header') : null}
        {!collapsed &&
          (() => {
            let itemIndex = -1
            return gv.children.map((c) => {
              if ((c as any).kind === 'container' && (c as any).type === 'field-group-item') {
                itemIndex += 1
                const idx = itemIndex
                const item = c as ContainerView
                const nodes = getRenderableNodes(getGroupItemNodes(item), visibilityStrategy)
                const cols = nodes.length || 1
                const defaultSpan = Math.floor(24 / cols)

                if (position === 'right') {
                  const rowCtx: FieldRenderContext = {
                    ...ctx,
                    groupContext: { group: gv, index: idx }
                  }
                  return (
                    <div key={idx} class="formx-group-row">
                      {renderGroupIndex(gv, idx)}
                      <div class="formx-group-row-fields">
                        {nodes.map((node, ni) => (
                          <div key={getNodeKey(node, ni)} class="formx-group-row-field">
                            {(node as any).kind === 'field'
                              ? renderField(node as FieldView, rowCtx)
                              : renderContainer(node as ContainerView, rowCtx)}
                          </div>
                        ))}
                      </div>
                      {renderGroupItemActions(gv, idx, total)}
                    </div>
                  )
                }

                if (
                  itemLayout &&
                  (itemLayout.type === 'flex' || itemLayout.wrap || itemLayout.direction)
                ) {
                  const row = renderGroupRow(
                    renderField,
                    renderContainer,
                    gv,
                    idx,
                    nodes,
                    ctx,
                    itemLayout
                  )
                  return (
                    <div key={idx} class="formx-group-row-block">
                      {renderGroupIndex(gv, idx)}
                      {row}
                      {renderGroupItemActions(gv, idx, total, 'block')}
                    </div>
                  )
                }

                const rowCtx: FieldRenderContext = {
                  ...ctx,
                  groupContext: { group: gv, index: idx }
                }
                return (
                  <div key={idx} class="formx-group-row-block">
                    {renderGroupIndex(gv, idx)}
                    <ElRow gutter={gap}>
                      {nodes.map((node, ni) => (
                        <ElCol key={getNodeKey(node, ni)} span={getNodeSpan(node, defaultSpan)}>
                          {(node as any).kind === 'field'
                            ? renderField(node as FieldView, rowCtx)
                            : renderContainer(node as ContainerView, rowCtx)}
                        </ElCol>
                      ))}
                    </ElRow>
                    {renderGroupItemActions(gv, idx, total, 'block')}
                  </div>
                )
              }
              if ((c as any).kind === 'field') return renderField(c as FieldView, ctx)
              return renderContainer(c as ContainerView, ctx)
            })
          })()}
        {showAdd && !collapsed && !hasToolbarAdd ? (
          <div class="formx-group-footer">
            {wrapWithTooltip(
              <ElButton
                type="primary"
                link
                class={ops.add?.className}
                style={ops.add?.style}
                icon={ops.add?.icon}
                disabled={!canAdd}
                onClick={() => gv.commands.add()}
              >
                {addText}
              </ElButton>,
              ops.add?.disabledMessage,
              !canAdd
            )}
          </div>
        ) : null}
        {!collapsed ? renderGroupToolbar(gv, skinProps, 'footer') : null}
      </div>
    )
  }

  const renderGroupTabs = (_gv: FieldGroupView, ctx: FieldRenderContext) => {
    const gv: FieldGroupView = processI18nObject({ ..._gv })
    const collapsed = isCollapsed(gv)
    const { className, style } = getGroupClassAndStyle(gv)
    const visibilityStrategy = resolveVisibilityStrategy(gv)
    if (collapsed) {
      return (
        <div class={['formx-group', ...className]} style={style}>
          {gv.label ? renderSectionTitle(gv, true) : null}
        </div>
      )
    }

    const items = getGroupItems(gv)
    const total = items.length
    const active = getActiveTab(gv, items.length)
    const labelField = gv.presentation?.tabLabelField || gv.itemMeta?.titleField
    const closable = gv.presentation?.tabClosable ?? true
    const addText = gv.presentation?.addButtonText || tf('formx.group.add')
    const ops = getGroupOps(gv)
    const showAdd = ops.add ? ops.add.show !== false : true
    const canAdd = canGroupAdd(gv, total)
    const canRemove = canGroupRemove(gv, total)
    const hasToolbarAdd =
      Array.isArray(gv.presentation?.toolbar) &&
      gv.presentation!.toolbar!.some((btn) => btn.action === 'add')

    const renderTabBody = (item: ContainerView, idx: number) => {
      const nodes = getRenderableNodes(getGroupItemNodes(item), visibilityStrategy)
      const layoutCfg = gv.itemLayout
      if (layoutCfg && (layoutCfg.type === 'flex' || layoutCfg.wrap || layoutCfg.direction)) {
        return renderGroupRow(renderField, renderContainer, gv, idx, nodes, ctx, layoutCfg)
      }
      const cols = nodes.length || 1
      const defaultSpan = Math.floor(24 / cols)
      const rowCtx: FieldRenderContext = { ...ctx, groupContext: { group: gv, index: idx } }
      return (
        <ElRow gutter={layoutCfg?.gap ?? 8}>
          {nodes.map((node, ni) => (
            <ElCol key={getNodeKey(node, ni)} span={getNodeSpan(node, defaultSpan)}>
              {(node as any).kind === 'field'
                ? renderField(node as FieldView, rowCtx)
                : renderContainer(node as ContainerView, rowCtx)}
            </ElCol>
          ))}
        </ElRow>
      )
    }

    const getLabel = (item: ContainerView, idx: number) => {
      if (labelField) {
        const field = findFieldById(item, labelField)
        if (field && field.value) return field.value
      }
      const prefix = gv.showIndex ? `${idx + 1}. ` : ''
      return `${prefix}${tf('formx.group.account')} ${idx + 1}`
    }

    return (
      <div class={['formx-group', 'formx-group-tabs', ...className]} style={style}>
        {gv.label ? renderSectionTitle(gv, false) : null}
        {renderGroupToolbar(gv, skinProps, 'header') ||
          (showAdd && !hasToolbarAdd ? (
            <div class="formx-group-toolbar">
              {wrapWithTooltip(
                <ElButton
                  type="primary"
                  link
                  class={ops.add?.className}
                  style={ops.add?.style}
                  icon={ops.add?.icon}
                  disabled={!canAdd}
                  onClick={() => gv.commands.add()}
                >
                  {addText}
                </ElButton>,
                ops.add?.disabledMessage,
                !canAdd
              )}
            </div>
          ) : null)}
        <ElTabs
          type="card"
          modelValue={active}
          onUpdate:modelValue={(val: any) => setActiveTab(gv, String(val))}
          class="formx-group-tabs-inner"
        >
          {items.map((item, idx) => (
            <ElTabPane key={idx} name={String(idx)}>
              {{
                label: () => (
                  <span class="formx-tab-label">
                    {getLabel(item, idx)}
                    {closable && items.length > 1 ? (
                      canRemove ? (
                        <span
                          class="formx-tab-close"
                          onClick={(e) => {
                            e.stopPropagation()
                            gv.commands.remove(idx)
                          }}
                        >
                          ×
                        </span>
                      ) : (
                        wrapWithTooltip(
                          <span class="formx-tab-close formx-tab-close-disabled">×</span>,
                          ops.remove?.disabledMessage,
                          true
                        )
                      )
                    ) : null}
                  </span>
                ),
                default: () => renderTabBody(item, idx)
              }}
            </ElTabPane>
          ))}
        </ElTabs>
      </div>
    )
  }

  const renderGroupCards = (_gv: FieldGroupView, ctx: FieldRenderContext) => {
    const gv: FieldGroupView = processI18nObject({ ..._gv })
    const collapsed = isCollapsed(gv)
    const { className, style } = getGroupClassAndStyle(gv)
    const ops = getGroupOps(gv)
    const visibilityStrategy = resolveVisibilityStrategy(gv)
    const showAdd = ops.add ? ops.add.show !== false : true
    const addText =
      ops.add?.text || gv.presentation?.addButtonText || tf('formx.group.add')
    const titleField = gv.itemMeta?.titleField
    const hasToolbarAdd =
      Array.isArray(gv.presentation?.toolbar) &&
      gv.presentation!.toolbar!.some((btn) => btn.action === 'add')

    if (collapsed) {
      return (
        <div class={['formx-group', 'formx-group-cards', ...className]} style={style}>
          {gv.label ? renderSectionTitle(gv, true) : null}
        </div>
      )
    }

    const items = getGroupItems(gv)
    const total = items.length
    const canAdd = canGroupAdd(gv, total)

    const renderCardBody = (item: ContainerView, idx: number) => {
      const nodes = getRenderableNodes(getGroupItemNodes(item), visibilityStrategy)
      const layoutCfg = gv.itemLayout
      const rowCtx: FieldRenderContext = { ...ctx, groupContext: { group: gv, index: idx } }
      if (layoutCfg && (layoutCfg.type === 'flex' || layoutCfg.wrap || layoutCfg.direction)) {
        return renderGroupRow(renderField, renderContainer, gv, idx, nodes, rowCtx, layoutCfg)
      }
      return nodes.map((node, ni) => (
        <div key={getNodeKey(node, ni)} class="formx-card-field">
          {(node as any).kind === 'field'
            ? renderField(node as FieldView, rowCtx)
            : renderContainer(node as ContainerView, rowCtx)}
        </div>
      ))
    }

    const getTitle = (item: ContainerView, idx: number) => {
      if (titleField) {
        const field = findFieldById(item, titleField)
        if (field && field.value) return field.value
      }
      const prefix = gv.showIndex ? `${idx + 1}. ` : ''
      return `${prefix}${tf('formx.group.item')} ${idx + 1}`
    }

    return (
      <div class={['formx-group', 'formx-group-cards', ...className]} style={style}>
        {gv.label ? renderSectionTitle(gv, false) : null}
        {renderGroupToolbar(gv, skinProps, 'header')}
        <div class="formx-card-list">
          {items.map((item, idx) => (
            <div key={idx} class="formx-card">
              <div class="formx-card-header">
                <span class="formx-card-title">{getTitle(item, idx)}</span>
                <div class="formx-card-actions">
                  {renderGroupItemActions(gv, idx, total, 'inline')}
                </div>
              </div>
              <div class="formx-card-body">{renderCardBody(item, idx)}</div>
            </div>
          ))}
        </div>
        {showAdd && !hasToolbarAdd ? (
          <div class="formx-group-footer">
            {wrapWithTooltip(
              <ElButton
                type="primary"
                link
                class={ops.add?.className}
                style={ops.add?.style}
                icon={ops.add?.icon}
                disabled={!canAdd}
                onClick={() => gv.commands.add()}
              >
                {addText}
              </ElButton>,
              ops.add?.disabledMessage,
              !canAdd
            )}
          </div>
        ) : null}
        {renderGroupToolbar(gv, skinProps, 'footer')}
      </div>
    )
  }

  const renderGroupTable = (_gv: FieldGroupView, ctx: FieldRenderContext) => {
    const gv: FieldGroupView = processI18nObject({ ..._gv })
    const collapsed = isCollapsed(gv)
    const { className, style } = getGroupClassAndStyle(gv)
    const ops = getGroupOps(gv)
    const showAdd = ops.add ? ops.add.show !== false : true
    const addText =
      ops.add?.text || gv.presentation?.addButtonText || tf('formx.group.add')
    const items = getGroupItems(gv)
    const total = items.length
    const canAdd = canGroupAdd(gv, total)
    const hasToolbarAdd =
      Array.isArray(gv.presentation?.toolbar) &&
      gv.presentation!.toolbar!.some((btn) => btn.action === 'add')
    const showCopy = ops.copy ? ops.copy.show !== false : true
    const showMove = ops.move ? ops.move.show !== false : gv.sortable !== false
    const showRemove = ops.remove ? ops.remove.show !== false : true
    const hasActions = showCopy || showMove || showRemove
    const gap = gv.itemLayout?.gap ?? 8
    const headerFields = items.length > 0 ? getGroupItemFields(items[0]) : []
    const derivedColumns = headerFields.map((fv) => ({
      field: fv.id,
      label: getGroupHeaderLabel(fv),
      span: fv.layout?.span
    })) as FieldGroupTableColumn[]
    const columns = gv.presentation?.table?.columns?.length
      ? gv.presentation.table.columns
      : derivedColumns
    const columnTemplate = getGroupTableColumns(gv, columns, hasActions)
    const emptyText = gv.presentation?.table?.emptyText || tf('formx.group.empty')
    const rowStyle = columnTemplate
      ? { gridTemplateColumns: columnTemplate, columnGap: `${gap}px` }
      : { columnGap: `${gap}px` }

    return (
      <div class={['formx-group', 'formx-group-table', ...className]} style={style}>
        {gv.label ? renderSectionTitle(gv, collapsed) : null}
        {!collapsed ? renderGroupToolbar(gv, skinProps, 'header') : null}
        {!collapsed ? (
          <div class="formx-group-table-inner">
            {columns.length ? (
              <div class="formx-group-table-head">
                <div class="formx-group-table-row" style={rowStyle}>
                  {gv.showIndex ? (
                    <div class="formx-group-table-cell formx-group-table-index">#</div>
                  ) : null}
                  {columns.map((col) => (
                    <div
                      key={col.field}
                      class="formx-group-table-cell formx-group-table-head-cell"
                      style={{
                        ...(col.align ? { textAlign: col.align } : {}),
                        ...(col.color ? { color: col.color } : {})
                      }}
                    >
                      {resolveColumnLabel(
                        col,
                        headerFields.find((f) => f.id === col.field)
                      )}
                    </div>
                  ))}
                  {hasActions ? (
                    <div class="formx-group-table-cell formx-group-table-actions">
                      {tf('formx.group.actions')}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div class="formx-group-table-body">
              {items.length ? (
                items.map((item, idx) => {
                  const fields = getGroupItemFields(item)
                  const fieldMap = new Map(fields.map((f) => [f.id, f]))
                  const rowCtx: FieldRenderContext = {
                    ...ctx,
                    groupContext: { group: gv, index: idx }
                  }
                  return (
                    <div key={idx} class="formx-group-table-row" style={rowStyle}>
                      {gv.showIndex ? (
                        <div class="formx-group-table-cell formx-group-table-index">{idx + 1}</div>
                      ) : null}
                      {columns.map((col) => {
                        const fv = fieldMap.get(col.field)
                        return (
                          <div
                            key={col.field}
                            class="formx-group-table-cell"
                            style={{
                              ...(col.align ? { textAlign: col.align } : {}),
                              ...(col.color ? { color: col.color } : {})
                            }}
                          >
                            {fv ? renderField(fv, rowCtx) : null}
                          </div>
                        )
                      })}
                      {hasActions ? (
                        <div class="formx-group-table-cell formx-group-table-actions">
                          {renderGroupItemActions(gv, idx, total, 'inline')}
                        </div>
                      ) : null}
                    </div>
                  )
                })
              ) : (
                <div class="formx-group-table-empty">{emptyText}</div>
              )}
            </div>
          </div>
        ) : null}
        {showAdd && !collapsed && !hasToolbarAdd ? (
          <div class="formx-group-footer">
            {wrapWithTooltip(
              <ElButton
                type="primary"
                link
                class={ops.add?.className}
                style={ops.add?.style}
                icon={ops.add?.icon}
                disabled={!canAdd}
                onClick={() => gv.commands.add()}
              >
                {addText}
              </ElButton>,
              ops.add?.disabledMessage,
              !canAdd
            )}
          </div>
        ) : null}
        {!collapsed ? renderGroupToolbar(gv, skinProps, 'footer') : null}
      </div>
    )
  }

  const renderGroup = (view: FieldGroupView, ctx: FieldRenderContext) => {
    if (view.visible === false) return null
    const mode = view.presentation?.type || view.layout?.type || 'list'
    if (mode === 'tabs') return renderGroupTabs(view, ctx)
    if (mode === 'cards') return renderGroupCards(view, ctx)
    if (mode === 'table') return renderGroupTable(view, ctx)
    return renderGroupList(view, ctx)
  }

  return { renderGroup }
}
