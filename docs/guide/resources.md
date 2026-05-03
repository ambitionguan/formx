# 远程资源

远程资源是 FormX 的强项之一。它把下拉选项、级联数据、树数据、异步校验和业务查询从 UI 组件里抽出来，交给统一资源层管理。

这样做的好处是：请求逻辑可复用、参数依赖可声明、缓存和并发可治理，schema 也能保持纯 JSON。

## 注册请求

请求实现放在运行时注册，不放进 schema。

```ts
import { ResourceManager } from '@formx/vue'

ResourceManager.register('getRegions', async () => {
  return [
    { label: '华东', value: 'east' },
    { label: '华南', value: 'south' }
  ]
})
```

带参数：

```ts
ResourceManager.register('getCities', async (params?: Record<string, unknown>) => {
  const province = params?.province
  return fetch(`/api/cities?province=${province}`).then((res) => res.json())
})
```

## 在 schema 中引用

```ts
{
  id: 'province',
  type: 'select',
  label: '省份',
  optionsFrom: {
    requestKey: 'getRegions'
  }
}
```

参数可以来自当前值树：

```ts
{
  id: 'city',
  type: 'select',
  label: '城市',
  optionsFrom: {
    requestKey: 'getCities',
    params: {
      province: '${province}'
    }
  }
}
```

当 `province` 变化时，`city` 的资源可以重新请求。

## 非标准返回结构

如果接口返回不是 `{ label, value }[]`，可以配置映射。

```ts
{
  id: 'owner',
  type: 'select',
  label: '负责人',
  optionsFrom: {
    requestKey: 'searchUsers',
    params: { keyword: '${ownerKeyword}' },
    map: {
      list: 'data.records',
      label: 'name',
      value: 'id'
    }
  }
}
```

## 级联与懒加载

级联场景通常需要上级值作为参数：

```ts
{
  id: 'database',
  type: 'select',
  label: '数据库',
  optionsFrom: {
    requestKey: 'getDatabases',
    params: {
      connectionId: '${connection.id}'
    }
  }
}
```

如果字段隐藏或禁用时不应请求，可以用策略控制：

```ts
{
  policy: {
    resources: {
      onVisible: true
    }
  }
}
```

## 并发和缓存

复杂表单里，用户输入可能频繁触发请求。资源层应该承担这些治理能力：

- `debounce`：搜索型选项去抖。
- `ttl`：静态字典缓存。
- `strategy: 'latest'`：只保留最新请求结果。
- `retry` 和 `backoff`：临时失败自动重试。
- `fallback`：失败时显示兜底选项。
- `invalidate`：依赖数据变化后主动失效缓存。

具体 API 会在后续版本继续细化，但设计方向是明确的：资源请求属于运行时协议，不属于 UI 组件内部细节。

## 与规则联动

资源也可以和 `rulesV2` 组合使用。例如选择连接类型后，刷新认证方式：

```ts
{
  id: 'refresh-auth-methods',
  watch: ['connection.type'],
  effects: [
    {
      type: 'fetchOptions',
      target: 'connection.authMethod',
      requestKey: 'getAuthMethods',
      params: {
        type: '${connection.type}'
      }
    }
  ]
}
```

这种写法适合“一个字段变化影响多个资源或状态”的场景。

## 实战建议

- 字典类资源注册一次，配置较长 TTL。
- 搜索类资源使用 debounce 和 latest 策略。
- 级联类资源要清理下游值，避免提交过期数据。
- 异步校验和远程选项都走注册表，不要把请求函数写进 schema。
- 资源失败时要有 UI 兜底，避免表单完全不可用。
- 在 Dialog 或 Drawer 中使用时，注意打开、回填、请求返回之间的时序，详见 [异步运行时](/guide/async-runtime)。
