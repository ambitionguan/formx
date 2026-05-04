<script setup>
import HeadlessCoreDemo from '../.vitepress/theme/components/formx/HeadlessCoreDemo.vue'
</script>

# 纯核心引擎

FormX Core 可以不依赖 Vue 和 Element Plus 独立运行。这个能力适合测试、设计器、服务端预校验和规则调试。

<ClientOnly>
  <HeadlessCoreDemo />
</ClientOnly>

核心用法：

```ts
import { FormXEngine } from '@formxjs/core'

const engine = new FormXEngine({ schema })
engine.dispatch('init')
engine.setValue('enabled', false)

console.log(engine.getValues())
console.log(engine.getState())
console.log(engine.getDiagnostics())
```

这也是 FormX 与普通 UI 表单组件的关键区别：逻辑运行时可以脱离 UI 单独工作。
