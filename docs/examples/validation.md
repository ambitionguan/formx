<script setup>
import ValidationDemo from '../.vitepress/theme/components/formx/ValidationDemo.vue'
</script>

# 校验

这个示例展示字段级校验、命名 pattern 和异步 validator。

<ClientOnly>
  <ValidationDemo />
</ClientOnly>

字段级校验：

```ts
{
  id: 'email',
  type: 'input',
  label: '邮箱',
  rules: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '邮箱格式不正确' }
  ]
}
```

注册复用校验器：

```ts
FormXEngine.registerValidator('uniqueName', async ({ value }) => {
  const result = await api.checkName(value)
  return result.available || '名称已存在'
})
```
