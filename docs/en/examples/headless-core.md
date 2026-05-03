<script setup>
import HeadlessCoreDemo from '../../.vitepress/theme/components/formx/HeadlessCoreDemo.vue'
</script>

# Headless Core

FormX Core can run without Vue or Element Plus.

<ClientOnly>
  <HeadlessCoreDemo />
</ClientOnly>

```ts
import { FormXEngine } from '@formx/core'

const engine = new FormXEngine({ schema })
engine.dispatch('init')
engine.setValue('enabled', false)
console.log(engine.getDiagnostics())
```
