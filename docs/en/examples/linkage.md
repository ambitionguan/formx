<script setup>
import LinkageDemo from '../../.vitepress/theme/components/formx/LinkageDemo.vue'
</script>

# Linkage

This example shows local shortcuts and `rulesV2`.

<ClientOnly>
  <LinkageDemo />
</ClientOnly>

```ts
{
  id: 'reason',
  type: 'textarea',
  showWhen: 'enabled === false',
  requiredWhen: 'enabled === false'
}
```
