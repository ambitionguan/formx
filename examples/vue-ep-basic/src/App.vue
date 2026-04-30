<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormX, FormXEngine } from '@formx/vue'
import type { FormSchema } from '@formx/vue'

const schema: FormSchema = {
  version: '1.0.0',
  model: {
    name: '',
    age: 18,
    status: 'active'
  },
  fields: [
    {
      id: 'name',
      type: 'input',
      label: 'Name',
      props: { placeholder: 'Enter a name' },
      rules: [{ required: true, message: 'Name is required' }]
    },
    {
      id: 'age',
      type: 'number',
      label: 'Age',
      props: { min: 0, max: 120 }
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      props: {
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Paused', value: 'paused' }
        ]
      }
    }
  ]
}

const engine = new FormXEngine({ schema })
const values = ref(engine.getValues())

engine.subscribe(() => {
  values.value = engine.getValues()
})

const output = computed(() => JSON.stringify(values.value, null, 2))
</script>

<template>
  <main class="page">
    <section class="panel">
      <h1>FormX Vue + Element Plus</h1>
      <FormX :schema="schema" :engine="engine" />
    </section>
    <section class="panel">
      <h2>Values</h2>
      <pre>{{ output }}</pre>
    </section>
  </main>
</template>
