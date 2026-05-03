<script setup>
import FieldGroupDemo from '../../.vitepress/theme/components/formx/FieldGroupDemo.vue'
</script>

# Field Group

`field-group` represents arrays of objects and supports scoped rules.

<ClientOnly>
  <FieldGroupDemo />
</ClientOnly>

```ts
{
  id: 'contacts',
  type: 'field-group',
  defaultItem: { role: 'backup', name: '', email: '' },
  template: [
    { id: 'role', type: 'select' },
    { id: 'name', type: 'input' },
    { id: 'email', type: 'input' }
  ]
}
```
