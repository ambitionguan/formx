<script setup>
import HeadlessCoreDemo from '../.vitepress/theme/components/formx/HeadlessCoreDemo.vue'
</script>

# Headless Core / 纯核心引擎

## 中文

`@formx/core` 不依赖 Vue、Element Plus 或浏览器 DOM。你可以在设计器、Node 脚本、测试、React 适配器或任何运行时里直接创建 `FormXEngine`。

## English

`@formx/core` does not depend on Vue, Element Plus, or the browser DOM. You can create `FormXEngine` directly in designers, Node scripts, tests, React adapters, or any other runtime.

<ClientOnly>
  <HeadlessCoreDemo />
</ClientOnly>

```ts
import { FormXEngine } from '@formx/core'

const engine = new FormXEngine({ schema })
engine.dispatch('init')
engine.setValue('plan', 'enterprise')

const ok = await engine.validate()
const values = engine.getValues()
```
