<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { FormX } from '@formx/vue'
import type { FormSchema } from '@formx/vue'
import DemoPanel from './DemoPanel.vue'
import { useDemoState } from './demoUtils'

const initialModel = {
  deployMode: 'standard',
  environment: 'staging',
  canaryPercent: 20,
  approvalRequired: false,
  approvalReason: '',
  notifyMode: 'owner',
  notifyEmail: '',
  webhookUrl: ''
}

const schema: FormSchema = {
  version: '1.0.0',
  formId: 'docs-linkage',
  ui: {
    labelWidth: '148px',
    labelSuffix: ':'
  },
  model: initialModel,
  fields: [
    {
      id: 'deployMode',
      type: 'select',
      label: 'Deploy mode',
      props: {
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Canary', value: 'canary' },
          { label: 'Manual', value: 'manual' }
        ]
      }
    },
    {
      id: 'environment',
      type: 'select',
      label: 'Environment',
      props: {
        options: [
          { label: 'Staging', value: 'staging' },
          { label: 'Production', value: 'prod' }
        ]
      }
    },
    {
      id: 'canaryPercent',
      type: 'slider',
      label: 'Canary percent',
      showWhen: { field: 'deployMode', eq: 'canary' },
      requiredWhen: { field: 'deployMode', eq: 'canary' },
      props: { min: 5, max: 50, step: 5, showStops: true }
    },
    {
      id: 'approvalRequired',
      type: 'switch',
      label: 'Approval required',
      props: { activeText: 'Yes', inactiveText: 'No' }
    },
    {
      id: 'approvalReason',
      type: 'textarea',
      label: 'Approval reason',
      showWhen: { field: 'approvalRequired', eq: true },
      requiredWhen: {
        field: 'approvalRequired',
        eq: true,
        message: 'Explain why approval is required.'
      },
      props: { rows: 3, placeholder: 'Why does this release need approval?' }
    },
    {
      id: 'notifyMode',
      type: 'radio',
      label: 'Notify',
      props: {
        options: [
          { label: 'Owner', value: 'owner' },
          { label: 'Email', value: 'email' },
          { label: 'Webhook', value: 'webhook' }
        ]
      }
    },
    {
      id: 'notifyEmail',
      type: 'input',
      label: 'Email',
      showWhen: { field: 'notifyMode', eq: 'email' },
      requiredWhen: { field: 'notifyMode', eq: 'email' },
      props: { placeholder: 'release@example.test' },
      rules: [{ pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', message: 'Invalid email.' }]
    },
    {
      id: 'webhookUrl',
      type: 'input',
      label: 'Webhook URL',
      showWhen: { field: 'notifyMode', eq: 'webhook' },
      requiredWhen: { field: 'notifyMode', eq: 'webhook' },
      props: { placeholder: 'https://example.test/hooks/release' }
    }
  ],
  rulesV2: [
    {
      id: 'prod-requires-approval',
      watch: ['environment'],
      when: { '==': [{ var: 'environment' }, 'prod'] },
      effects: [{ type: 'set', target: 'approvalRequired', value: true }],
      elseEffects: [{ type: 'set', target: 'approvalRequired', value: false }]
    },
    {
      id: 'manual-requires-approval',
      watch: ['deployMode'],
      when: { '==': [{ var: 'deployMode' }, 'manual'] },
      effects: [{ type: 'set', target: 'approvalRequired', value: true }]
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
