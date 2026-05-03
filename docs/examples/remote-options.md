<script setup>
import RemoteOptionsDemo from '../.vitepress/theme/components/formx/RemoteOptionsDemo.vue'
</script>

# 远程选项

这个示例展示 `optionsFrom` 和 `ResourceManager`。远程选项通过 `requestKey` 绑定，不把请求函数写进 schema。

<ClientOnly>
  <RemoteOptionsDemo />
</ClientOnly>

注册资源：

```ts
ResourceManager.register('getCities', async (params) => {
  return api.getCities(params)
})
```

schema 引用：

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

当依赖字段变化时，资源层可以重新拉取并更新选项。
