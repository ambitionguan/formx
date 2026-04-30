import { FormXEngine, ResourceManager } from '@formx/vue'

type Option = {
  label: string
  value: string | number
  children?: Option[]
}

const delay = <T>(data: T, timeout = 160) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), timeout))

const serviceOptions: Record<string, Option[]> = {
  platform: [
    { label: 'API Gateway', value: 'api-gateway' },
    { label: 'Job Scheduler', value: 'job-scheduler' },
    { label: 'Access Console', value: 'access-console' }
  ],
  data: [
    { label: 'Metrics Pipeline', value: 'metrics-pipeline' },
    { label: 'Profile Warehouse', value: 'profile-warehouse' }
  ],
  security: [
    { label: 'Audit Log', value: 'audit-log' },
    { label: 'Risk Scanner', value: 'risk-scanner' }
  ]
}

const regionTree: Option[] = [
  {
    label: 'Asia',
    value: 'asia',
    children: [
      { label: 'Singapore', value: 'sg' },
      { label: 'Tokyo', value: 'tokyo' }
    ]
  },
  {
    label: 'Europe',
    value: 'europe',
    children: [
      { label: 'Frankfurt', value: 'fra' },
      { label: 'Dublin', value: 'dub' }
    ]
  }
]

let registered = false

export function registerDocsResources() {
  if (registered) return
  registered = true

  ResourceManager.register('docs:getServices', async (params) => {
    const team = String(params?.team || 'platform')
    return delay(serviceOptions[team] || serviceOptions.platform)
  })

  ResourceManager.register('docs:getRegions', async () => delay(regionTree))

  ResourceManager.register('docs:getApprovers', async () =>
    delay([
      { label: 'Ada Lovelace', value: 'ada' },
      { label: 'Grace Hopper', value: 'grace' },
      { label: 'Katherine Johnson', value: 'katherine' }
    ])
  )

  FormXEngine.registerPattern('docs.slug', {
    source: '^[a-z][a-z0-9-]{2,31}$',
    message: 'Use 3-32 lowercase letters, numbers, or hyphens.'
  })

  FormXEngine.registerValidator('docs.availableSlug', {
    async: true,
    debounceMs: 180,
    validate: async ({ value }) => {
      await delay(null, 180)
      const reserved = new Set(['admin', 'root', 'system'])
      return reserved.has(String(value || '').trim()) ? 'This slug is reserved.' : true
    }
  })
}
