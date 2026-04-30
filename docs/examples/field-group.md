<script setup>
import FieldGroupDemo from '../.vitepress/theme/components/formx/FieldGroupDemo.vue'
</script>

# Field Group / 字段组

## 中文

`field-group` 用于数组对象。它可以声明 `template`、`defaultItem`、`min/max`、展示方式和操作按钮，也支持 scoped rule，例如 `scope: 'contacts[]'`。

## English

`field-group` represents arrays of objects. It supports `template`, `defaultItem`, `min/max`, presentation mode, operation buttons, and scoped rules such as `scope: 'contacts[]'`.

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
