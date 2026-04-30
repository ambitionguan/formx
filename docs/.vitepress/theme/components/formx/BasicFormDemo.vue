<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { FormX } from '@formx/vue'
import type { FormSchema } from '@formx/vue'
import DemoPanel from './DemoPanel.vue'
import { useDemoState } from './demoUtils'

const initialModel = {
  projectName: 'Checkout Console',
  owner: 'ada',
  priority: 'p1',
  enabled: true,
  launchDate: ''
}

const schema: FormSchema = {
  version: '1.0.0',
  formId: 'docs-basic-form',
  ui: {
    labelWidth: '132px',
    labelSuffix: ':'
  },
  model: initialModel,
  fields: [
    {
      id: 'projectName',
      type: 'input',
      label: 'Project name',
      props: { clearable: true, placeholder: 'Enter a project name' },
      rules: [{ required: true, message: 'Project name is required.' }]
    },
    {
      id: 'owner',
      type: 'select',
      label: 'Owner',
      props: {
        clearable: true,
        filterable: true,
        options: [
          { label: 'Ada Lovelace', value: 'ada' },
          { label: 'Grace Hopper', value: 'grace' },
          { label: 'Katherine Johnson', value: 'katherine' }
        ]
      },
      rules: [{ required: true, message: 'Choose an owner.' }]
    },
    {
      id: 'priority',
      type: 'radio',
      label: 'Priority',
      props: {
        options: [
          { label: 'P0', value: 'p0' },
          { label: 'P1', value: 'p1' },
          { label: 'P2', value: 'p2' }
        ]
      }
    },
    {
      id: 'enabled',
      type: 'switch',
      label: 'Enabled',
      props: { activeText: 'On', inactiveText: 'Off' }
    },
    {
      id: 'launchDate',
      type: 'date-picker',
      label: 'Launch date',
      props: {
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
        placeholder: 'Pick a date'
      }
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
    />
    <template #actions>
      <el-button type="primary" @click="demo.validate">Validate</el-button>
      <el-button @click="demo.reset">Reset</el-button>
      <el-button @click="demo.refresh">Snapshot</el-button>
    </template>
  </DemoPanel>
</template>
