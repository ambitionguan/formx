<script setup>
import LinkageDemo from '../.vitepress/theme/components/formx/LinkageDemo.vue'
</script>

# Linkage / 联动规则

## 中文

联动可以写在字段短写里，也可以写成 `rulesV2`。字段短写适合局部显隐、动态必填；`rulesV2` 适合跨字段、跨数组、运行时 effect。

## English

Linkage can be expressed as field shortcuts or `rulesV2`. Field shortcuts are good for local visibility and required state; `rulesV2` is better for cross-field, scoped, and effect-driven behavior.

<ClientOnly>
  <LinkageDemo />
</ClientOnly>

```ts
{
  id: 'approvalReason',
  type: 'textarea',
  showWhen: { field: 'approvalRequired', eq: true },
  requiredWhen: { field: 'approvalRequired', eq: true }
}
```

```ts
{
  id: 'prod-requires-approval',
  watch: ['environment'],
  when: { '==': [{ var: 'environment' }, 'prod'] },
  effects: [{ type: 'set', target: 'approvalRequired', value: true }]
}
```
