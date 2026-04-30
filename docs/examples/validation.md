<script setup>
import ValidationDemo from '../.vitepress/theme/components/formx/ValidationDemo.vue'
</script>

# Validation / 校验

## 中文

校验支持 required、长度、范围、正则、表达式、内联函数、命名 pattern 和命名 validator。命名能力适合开源包和业务项目之间解耦。

## English

Validation supports required checks, length, ranges, regex, expressions, inline functions, named patterns, and named validators. Named validators keep reusable packages decoupled from business code.

<ClientOnly>
  <ValidationDemo />
</ClientOnly>

```ts
FormXEngine.registerPattern('docs.slug', {
  source: '^[a-z][a-z0-9-]{2,31}$',
  message: 'Use 3-32 lowercase letters, numbers, or hyphens.'
})

FormXEngine.registerValidator('docs.availableSlug', {
  async: true,
  validate: async ({ value }) => {
    return value === 'admin' ? 'This slug is reserved.' : true
  }
})
```
