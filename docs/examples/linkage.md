<script setup>
import LinkageDemo from '../.vitepress/theme/components/formx/LinkageDemo.vue'
</script>

# 联动规则

这个示例展示 FormX 的规则模型：简单联动用字段短写，复杂联动用 `rulesV2`。

<ClientOnly>
  <LinkageDemo />
</ClientOnly>

常见短写：

```ts
{
  id: 'reason',
  type: 'textarea',
  label: '原因',
  showWhen: 'enabled === false',
  requiredWhen: 'enabled === false'
}
```

复杂规则：

```ts
{
  id: 'set-risk-level',
  watch: ['enabled', 'role'],
  when: 'enabled === false && role === "admin"',
  effects: [
    { type: 'setValue', target: 'riskLevel', value: 'high' }
  ]
}
```

FormX 的优势在于这些规则都能被编译、执行和诊断，而不是散落在 Vue `watch` 中。
