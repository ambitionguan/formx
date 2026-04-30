<script setup>
import RemoteOptionsDemo from '../.vitepress/theme/components/formx/RemoteOptionsDemo.vue'
</script>

# Remote Options / 远程选项

## 中文

远程选项由 `ResourceManager` 统一注册。schema 只需要引用资源名、参数和拉取策略，不需要把请求函数塞到组件里。

## English

Remote options are registered through `ResourceManager`. The schema references the resource name, params, and fetch strategy without embedding request functions in UI components.

<ClientOnly>
  <RemoteOptionsDemo />
</ClientOnly>

```ts
ResourceManager.register('docs:getServices', async (params) => {
  return fetchServicesByTeam(params.team)
})
```

```ts
{
  id: 'service',
  type: 'select',
  optionsFrom: 'docs:getServices',
  params: { team: '{{ form.team }}' },
  fetchOnMount: true
}
```
