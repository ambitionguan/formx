import { ResourceManager } from '@formxjs/vue'

type Option = {
  label: string
  value: string | number
  children?: Option[]
}

const delay = <T>(data: T, timeout = 180) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), timeout))

const ownerOptions = [
  { label: '张三 / 订单域负责人', value: 1001 },
  { label: '李四 / 发布经理', value: 1002 },
  { label: '王五 / 测试负责人', value: 1003 },
  { label: '赵六 / 运维负责人', value: 1004 },
  { label: '钱七 / 安全负责人', value: 1005 }
]

const serviceOptionsMap: Record<string, Option[]> = {
  api: [
    { label: '订单开放接口', value: 'order-openapi' },
    { label: '支付聚合接口', value: 'payment-gateway' },
    { label: '售后统一接口', value: 'refund-openapi' }
  ],
  data: [
    { label: '订单归档作业', value: 'order-archive' },
    { label: '离线数仓任务', value: 'dw-job' }
  ],
  internal: [
    { label: '运维后台', value: 'ops-console' },
    { label: '审批后台', value: 'audit-console' }
  ],
  portal: [
    { label: '商家工作台', value: 'merchant-portal' },
    { label: '运营门户', value: 'operation-portal' }
  ],
  mobile: [
    { label: '用户 App', value: 'user-mobile' },
    { label: '骑手 App', value: 'courier-mobile' }
  ]
}

const deptTree: Option[] = [
  {
    label: '平台研发中心',
    value: 10,
    children: [
      { label: '交易研发部', value: 11 },
      { label: '中台研发部', value: 12 }
    ]
  },
  {
    label: '质量与运维中心',
    value: 20,
    children: [
      { label: '质量保障部', value: 21 },
      { label: '运维保障部', value: 22 }
    ]
  }
]

const businessDomains: Option[] = [
  {
    label: '零售业务',
    value: 'retail',
    children: [
      { label: '订单域', value: 'order' },
      { label: '支付域', value: 'payment' },
      { label: '履约域', value: 'fulfillment' }
    ]
  },
  {
    label: '企业服务',
    value: 'enterprise',
    children: [
      { label: '审批域', value: 'approval' },
      { label: '账号域', value: 'identity' }
    ]
  }
]

const regionTree: Option[] = [
  {
    label: '华东',
    value: 'east',
    children: [
      { label: '上海', value: 'shanghai' },
      { label: '杭州', value: 'hangzhou' }
    ]
  },
  {
    label: '华南',
    value: 'south',
    children: [
      { label: '深圳', value: 'shenzhen' },
      { label: '广州', value: 'guangzhou' }
    ]
  }
]

const dataSourceOptions = [
  { label: '模拟数据源 mock-source-a', value: 'mock-source-a' },
  { label: '模拟数据源 mock-source-b', value: 'mock-source-b' },
  { label: '模拟数仓 mock-warehouse', value: 'mock-warehouse' }
]

let registered = false
let unstableHit = 0

export function registerDemoResources() {
  if (registered) return
  registered = true

  ResourceManager.register('formxShowcase:getOwners', async (params) => {
    const keyword = String(params?.keyword || '').trim().toLowerCase()
    const list = keyword
      ? ownerOptions.filter((item) => item.label.toLowerCase().includes(keyword))
      : ownerOptions
    return delay(list)
  })

  ResourceManager.register('formxShowcase:getServices', async (params) => {
    const appType = String(params?.appType || 'api')
    return delay(serviceOptionsMap[appType] || serviceOptionsMap.api)
  })

  ResourceManager.register('formxShowcase:getDeptTree', async () => delay(deptTree))
  ResourceManager.register('formxShowcase:getBusinessDomains', async () => delay(businessDomains))

  ResourceManager.register('formxShowcase:uploadPackage', async (params) => {
    const file = params?.file as File | undefined
    return delay({
      code: 200,
      message: '模拟升级包上传成功',
      url: `mock://package/${file?.name || 'release-package.tar.gz'}`,
      name: file?.name || 'release-package.tar.gz'
    }, 260)
  })

  ResourceManager.register('formxShowcase:uploadImage', async (params) => {
    const file = params?.file as File | undefined
    return delay({
      code: 200,
      message: '模拟截图上传成功',
      url: `mock://image/${file?.name || 'cover.png'}`,
      name: file?.name || 'cover.png'
    }, 220)
  })

  ResourceManager.register('getUserRoleOrganByType', async (params) => {
    const type = params?.type || 'username'
    if (type === 'organization') {
      return delay([
        { label: 'Alice（研发）', value: 'user-001' },
        { label: 'Bob（安全）', value: 'user-002' }
      ])
    }
    if (type === 'role') {
      return delay([
        { label: 'Admin', value: 'user-003' },
        { label: 'Auditor', value: 'user-004' }
      ])
    }
    return delay([
      { label: 'Alice', value: 'user-001' },
      { label: 'Bob', value: 'user-002' },
      { label: 'Chris', value: 'user-003' }
    ])
  })

  ResourceManager.register('fetchDataCatalogueTree', async () =>
    delay([
      {
        label: 'default',
        value: 'schema-default',
        children: [
          { label: 'public', value: 'schema-public' },
          { label: 'analytics', value: 'schema-analytics' }
        ]
      }
    ])
  )

  ResourceManager.register('fetchClassificationPlans', async () =>
    delay([
      { label: 'PII 识别', value: 'plan-001' },
      { label: '财务字段识别', value: 'plan-002' }
    ])
  )

  ResourceManager.register('getRegions', async () => delay(regionTree))
  ResourceManager.register('getRegionChildren', async (params) => {
    const value = params?.value || params?.node?.value || 'root'
    return delay([
      { label: `${value}-A`, value: `${value}-a` },
      { label: `${value}-B`, value: `${value}-b` }
    ])
  })
  ResourceManager.register('uploadFile', async (params) => {
    const file = params?.file as File | undefined
    return delay({
      code: 200,
      url: `mock://file/${file?.name || 'demo.txt'}`,
      name: file?.name || 'demo.txt'
    })
  })
  ResourceManager.register('unstableOptions', async () => {
    unstableHit += 1
    return delay([
      { label: `重试结果 A (${unstableHit})`, value: 'retry-a' },
      { label: `重试结果 B (${unstableHit})`, value: 'retry-b' }
    ])
  })
  ResourceManager.register('getApplicableScopeOptions', async () => delay(dataSourceOptions))
  ResourceManager.register('getAllDataSourcesOptions', async () => delay(dataSourceOptions))
}
