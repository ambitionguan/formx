<script setup>
import RemoteOptionsDemo from '../../.vitepress/theme/components/formx/RemoteOptionsDemo.vue'
</script>

# Remote Options

This example shows `optionsFrom` with `ResourceManager`.

<ClientOnly>
  <RemoteOptionsDemo />
</ClientOnly>

```ts
ResourceManager.register('getCities', async (params) => api.getCities(params))
```

```ts
{
  id: 'city',
  type: 'select',
  optionsFrom: {
    requestKey: 'getCities',
    params: { province: '${province}' }
  }
}
```
