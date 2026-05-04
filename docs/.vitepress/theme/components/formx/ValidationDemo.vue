<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { FormX } from '@formxjs/vue'
import type { FormSchema } from '@formxjs/vue'
import DemoPanel from './DemoPanel.vue'
import { useDemoState } from './demoUtils'
import { registerDocsResources } from './registerDocsResources'

registerDocsResources()

const initialModel = {
  slug: 'formx-docs',
  ownerEmail: 'docs@example.test',
  seats: 20
}

const schema: FormSchema = {
  version: '1.0.0',
  formId: 'docs-validation',
  ui: {
    labelWidth: '128px',
    labelSuffix: ':'
  },
  model: initialModel,
  fields: [
    {
      id: 'slug',
      type: 'input',
      label: 'Slug',
      props: { clearable: true, placeholder: 'formx-docs' },
      rules: [
        { required: true, message: 'Slug is required.' },
        { pattern: { name: 'docs.slug' } },
        { use: 'docs.availableSlug', async: true }
      ]
    },
    {
      id: 'ownerEmail',
      type: 'input',
      label: 'Owner email',
      props: { placeholder: 'name@example.test' },
      rules: [
        { required: true, message: 'Owner email is required.' },
        { pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', message: 'Invalid email.' }
      ]
    },
    {
      id: 'seats',
      type: 'number',
      label: 'Seats',
      props: { min: 1, max: 500, controlsPosition: 'right' },
      rules: [
        { min: 1, message: 'At least 1 seat.' },
        { max: 500, message: 'No more than 500 seats.' }
      ]
    }
  ]
}

const mounted = ref(false)
const demo = useDemoState(initialModel)

onMounted(() => {
  mounted.value = true
})

watch(demo.formModel, demo.refresh, { deep: true })
</script>

<template>
  <DemoPanel
    :values="demo.formModel.value"
    :errors="demo.errors.value"
    :state="demo.state.value"
    :status="demo.status.value"
  >
    <FormX
      v-if="mounted"
      :key="demo.renderKey.value"
      :ref="(instance) => { demo.formRef.value = instance }"
      v-model:value="demo.formModel.value"
      :schema="schema"
      :policy="{ validation: { mode: 'submitOnly' } }"
    />
    <template #actions>
      <el-button type="primary" @click="demo.validate">Validate</el-button>
      <el-button @click="demo.reset">Reset</el-button>
      <el-button @click="demo.refresh">Snapshot</el-button>
    </template>
  </DemoPanel>
</template>
