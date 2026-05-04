import type { FieldView, FieldGroupView } from '@formxjs/ui-core'
import { useFormItemProps } from './shared'
import { ElFormItem, ElButton } from 'element-plus'

// 简单 custom 渲染：优先显示 render.text，其次占位提示
export function renderCustomField(
  view: FieldView,
  components?: Record<string, any>,
  opts?: {
    groupCommands?: Map<string, { add(value?: any): void }>
    groupContext?: { group: FieldGroupView; index: number }
  }
) {
  const { ui, fi, shouldRender, contentStyle } = useFormItemProps(view)
  if (!shouldRender) return null
  const render = ui.render || {}
  const componentName: string | undefined = render.component
  const Comp = componentName && components ? components[componentName] : null
  const labelWidth = fi.labelWidth ?? '0px'
  const builtinGroupButtonNames = ['GroupAddButton', 'FieldGroupAddButton']
  const compatGroupButtonNames = ['ClusterAddButton', 'CustomParamAddButton']
  const shouldUseBuiltinGroupAdd =
    !!componentName &&
    (builtinGroupButtonNames.includes(componentName) ||
      (!Comp && compatGroupButtonNames.includes(componentName)))

  if (shouldUseBuiltinGroupAdd) {
    const props = render.props || {}
    const target =
      props.targetField ||
      props.targetGroup ||
      props.target ||
      props.group ||
      props.field
    const label = props.label ?? '+ 添加'
    const buttonType = props.buttonType || 'primary'
    const size = props.size
    const text = props.text ?? false
    const link = props.link ?? !text
    const plain = props.plain ?? false
    const className = props.class
    const style = props.style
    let commands = target ? opts?.groupCommands?.get(String(target)) : null
    if (!commands && opts?.groupCommands && opts.groupCommands.size === 1) {
      commands = Array.from(opts.groupCommands.values())[0] || null
    }
    const handleClick = () => {
      if (!commands) return
      commands.add?.()
    }
    return (
      <ElFormItem {...fi} label="" labelWidth={labelWidth} class={className} style={style}>
        <ElButton
          type={buttonType}
          link={link}
          text={text}
          plain={plain}
          size={size}
          disabled={!commands}
          onClick={handleClick}
        >
          {label}
        </ElButton>
      </ElFormItem>
    )
  }
  if (Comp) {
    return (
      <ElFormItem {...fi} label="" labelWidth={labelWidth}>
        <Comp
          view={view}
          group={opts?.groupContext?.group}
          groupIndex={opts?.groupContext?.index}
        />
      </ElFormItem>
    )
  }
  if (render.html) {
    return (
      <ElFormItem {...fi} label="" labelWidth={labelWidth}>
        <span style={contentStyle} innerHTML={render.html} />
      </ElFormItem>
    )
  }
  // 文本优先级：render.text > ui.text > label > id
  const text: string | undefined = render.text ?? ui.text ?? view.label ?? view.id
  // 未来可以在 skinProps.components 中根据 render.component 做真正组件映射
  return (
    <ElFormItem {...fi} label="" labelWidth={labelWidth}>
      <span style={contentStyle}>{text ?? `Unsupported custom`}</span>
    </ElFormItem>
  )
}
