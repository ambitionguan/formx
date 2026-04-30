# Resources / 远程资源

## 中文

FormX 把远程数据请求抽象成资源。schema 中只引用资源名和参数，真正的请求函数在应用启动或模块加载时注册。

```ts
import { ResourceManager } from '@formx/vue'

ResourceManager.register('docs:getServices', async (params) => {
  const team = String(params?.team || 'platform')
  return [
    { label: `${team} service A`, value: `${team}-a` },
    { label: `${team} service B`, value: `${team}-b` }
  ]
})
```

### `optionsFrom`

最常见的资源场景是远程下拉：

```json
{
  "id": "service",
  "type": "select",
  "label": "Service",
  "optionsFrom": "docs:getServices",
  "params": { "team": { "var": "team" } },
  "fetchOnMount": true,
  "props": { "clearable": true, "filterable": true }
}
```

运行时会调用 `ResourceManager.fetch('docs:getServices', params)`，并把返回数组写入 `state.service.options`。皮肤层只消费 `options`，不关心数据来自本地、HTTP、缓存还是 mock。

### 依赖变化后重新拉取

如果一个远程选项依赖另一个字段，可以用 `rulesV2` 显式刷新：

```json
{
  "id": "refetch-services-when-team-changes",
  "watch": ["team"],
  "effects": [
    { "type": "set", "target": "service", "value": "" },
    {
      "type": "fetch",
      "target": "service",
      "requestKey": "docs:getServices",
      "params": { "team": { "var": "team" } },
      "mode": "latest"
    }
  ]
}
```

`mode: "latest"` 适合搜索、级联和快速切换场景：后发请求优先，旧结果不会覆盖新结果。

### 参数解析

`params` 可以使用模板或 JSON 表达式：

```json
{
  "params": {
    "team": { "var": "team" },
    "currentRole": { "var": "$self.role" }
  }
}
```

常用来源：

| 写法 | 含义 |
| --- | --- |
| `&#123;&#123; form.team &#125;&#125;` | 从根值树读取 `team`。 |
| `&#123;&#123; $root.team &#125;&#125;` | 显式从根值树读取。 |
| `&#123;&#123; $self.role &#125;&#125;` | 在当前作用域读取。 |
| `&#123;&#123; $parent.groupId &#125;&#125;` | 在父作用域读取。 |
| `{ "var": "team" }` | JSON 表达式读取。 |

### 失败兜底和映射

资源可以在 schema 上声明 `fallbackOptions` 和 `map`：

```json
{
  "id": "owner",
  "type": "select",
  "optionsFrom": "docs:getOwners",
  "fetchOnMount": true,
  "map": { "label": "displayName", "value": "id" },
  "fallbackOptions": [{ "label": "Default owner", "value": "default" }]
}
```

### 资源设计建议

- 资源 key 使用命名空间，例如 `release:getServices`，避免冲突。
- schema 不直接携带请求函数，保持 JSON 可序列化。
- HTTP、鉴权、错误提示、埋点放在资源函数中处理。
- 业务页面可以注册真实请求，文档和测试可以注册 mock 请求。
- 频繁变化的资源使用 `mode: "latest"`，稳定字典可以配合缓存策略。

## English

FormX models remote data as resources. The schema references resource keys and params; the application registers actual request handlers.

The most common case is `optionsFrom`, which loads options into `state[path].options`. Renderers consume the options but do not care whether they came from HTTP, cache, local mock data, or a test fixture.

Use `rulesV2` with the `fetch` effect when a request depends on another field and must be refreshed after changes. Keep request functions outside schema so the schema remains serializable.
