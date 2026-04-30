<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { FormX } from '@formx/vue'
import type { FormSchema } from '@formx/vue'
import DemoPanel from './DemoPanel.vue'
import { useDemoState } from './demoUtils'
import { registerDocsResources } from './registerDocsResources'

registerDocsResources()

const initialModel = {
  team: 'platform',
  service: '',
  region: []
}

const schema: FormSchema = {
  version: '1.0.0',
  formId: 'docs-remote-options',
  ui: {
    labelWidth: '132px',
    labelSuffix: ':'
  },
  model: initialModel,
  fields: [
    {
      id: 'team',
      type: 'select',
      label: 'Team',
      props: {
        clearable: true,
        options: [
          { label: 'Platform', value: 'platform' },
          { label: 'Data', value: 'data' },
          { label: 'Security', value: 'security' }
        ]
      }
    },
    {
      id: 'service',
      type: 'select',
      label: 'Service',
      optionsFrom: 'docs:getServices',
      params: { team: '{{ form.team }}' },
      fetchOnMount: true,
      props: { clearable: true, filterable: true },
      rules: [{ required: true, message: 'Choose a service.' }]
    },
    {
      id: 'region',
      type: 'cascader',
      label: 'Region',
      optionsFrom: 'docs:getRegions',
      fetchOnMount: true,
      props: { clearable: true, filterable: true }
    }
  ],
  rulesV2: [
    {
      id: 'refetch-services-when-team-changes',
      watch: ['team'],
      effects: [
        { type: 'set', target: 'service', value: '' },
        {
          type: 'fetch',
          target: 'service',
          requestKey: 'docs:getServices',
          params: { team: '{{ form.team }}' },
          mode: 'latest'
        }
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
    />
    <template #actions>
      <el-button type="primary" @click="demo.validate">Validate</el-button>
      <el-button @click="demo.reset">Reset</el-button>
      <el-button @click="demo.refresh">Snapshot</el-button>
    </template>
  </DemoPanel>
</template>
