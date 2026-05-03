<script setup>
import ValidationDemo from '../../.vitepress/theme/components/formx/ValidationDemo.vue'
</script>

# Validation

This example covers field rules, named patterns, and async validators.

<ClientOnly>
  <ValidationDemo />
</ClientOnly>

```ts
{
  id: 'email',
  type: 'input',
  rules: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Invalid email' }
  ]
}
```
