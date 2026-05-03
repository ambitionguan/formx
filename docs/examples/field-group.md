<script setup>
import FieldGroupDemo from '../.vitepress/theme/components/formx/FieldGroupDemo.vue'
</script>

# 字段组

`field-group` 用于数组对象。它可以声明 `template`、`defaultItem`、`min/max`、展示方式和操作按钮，也支持数组作用域规则。

<ClientOnly>
  <FieldGroupDemo />
</ClientOnly>

基础结构：

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

数组项内联动建议使用 `scope` 和 `$self`：

```ts
{
  scope: 'contacts[]',
  watch: ['$self.role'],
  when: '$self.role === "owner"',
  effects: [
    { type: 'required', target: '$self.email', value: true }
  ]
}
```
