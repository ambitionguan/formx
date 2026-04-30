import type { FormSchema } from '@formx/vue'
import connectionConfig from './schemas/connection-config.json'
import controlsShowcase from './schemas/controls-showcase.json'
import dataPolicy from './schemas/data-policy.json'
import dataPolicyOptionsFrom from './schemas/data-policy-optionsFrom.json'
import dataPolicySetOptions from './schemas/data-policy-setOptions.json'
import fullShowcase from './schemas/formx-full-showcase.json'
import linkageOrderDeep from './schemas/linkage-order-deep.json'
import linkagePermissionMatrix from './schemas/linkage-permission-matrix.json'
import linkageUserOnboarding from './schemas/linkage-user-onboarding.json'

export type DemoScenario = {
  key: string
  group: 'showcase' | 'business' | 'linkage' | 'runtime'
  title: string
  description: string
  schema: FormSchema & { model?: Record<string, unknown> }
  labelWidth?: string
}

export const scenarios: DemoScenario[] = [
  {
    key: 'full-showcase',
    group: 'showcase',
    title: '全量能力展示',
    description: '字段、容器、数组、远程选项、上传、自定义组件与运行时 patch。',
    schema: fullShowcase as any,
    labelWidth: '150px'
  },
  {
    key: 'connection-config',
    group: 'business',
    title: '连接配置',
    description: '接近生产配置弹窗的复杂业务表单，包含多字段组和自定义操作。',
    schema: connectionConfig as any,
    labelWidth: '230px'
  },
  {
    key: 'controls',
    group: 'showcase',
    title: '控件矩阵',
    description: 'switch、slider、cascader、time、upload 和远程 options。',
    schema: controlsShowcase as any,
    labelWidth: '140px'
  },
  {
    key: 'data-policy',
    group: 'business',
    title: '数据保护策略',
    description: '字段组、保护方法和作用范围联动。',
    schema: dataPolicy as any,
    labelWidth: '150px'
  },
  {
    key: 'data-policy-options',
    group: 'runtime',
    title: '远程选项策略',
    description: 'optionsFrom 与规则联动组合。',
    schema: dataPolicyOptionsFrom as any,
    labelWidth: '150px'
  },
  {
    key: 'data-policy-set-options',
    group: 'runtime',
    title: '运行时 setOptions',
    description: '通过 rulesV2 动态改写字段选项。',
    schema: dataPolicySetOptions as any,
    labelWidth: '150px'
  },
  {
    key: 'order-deep',
    group: 'linkage',
    title: '订单深层联动',
    description: '对象、数组、跨层字段和审批条件。',
    schema: linkageOrderDeep as any,
    labelWidth: '180px'
  },
  {
    key: 'user-onboarding',
    group: 'linkage',
    title: '用户入职联动',
    description: '多区块入职流程和深层对象。',
    schema: linkageUserOnboarding as any,
    labelWidth: '180px'
  },
  {
    key: 'permission-matrix',
    group: 'linkage',
    title: '权限矩阵',
    description: '矩阵型字段组、动态必填和提交校验。',
    schema: linkagePermissionMatrix as any,
    labelWidth: '180px'
  }
]

export const groupLabels: Record<DemoScenario['group'], string> = {
  showcase: '能力展示',
  business: '业务表单',
  linkage: '联动模型',
  runtime: '运行时'
}
