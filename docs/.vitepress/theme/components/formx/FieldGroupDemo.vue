<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { FormX } from '@formxjs/vue'
import type { FormSchema } from '@formxjs/vue'
import DemoPanel from './DemoPanel.vue'
import { useDemoState } from './demoUtils'

const initialModel = {
  contacts: [
    { role: 'owner', name: 'Ada Lovelace', email: 'ada@example.test' },
    { role: 'backup', name: 'Grace Hopper', email: 'grace@example.test' }
  ]
}

const schema: FormSchema = {
  version: '1.0.0',
  formId: 'docs-field-group',
  ui: {
    labelWidth: '110px',
    labelSuffix: ':'
  },
  model: initialModel,
  fields: [
    {
      id: 'contacts',
      type: 'field-group',
      label: 'Contacts',
      min: 1,
      max: 5,
      showIndex: true,
      defaultItem: { role: 'backup', name: '', email: '' },
      operations: {
        add: { text: 'Add contact' },
        copy: { text: 'Copy' },
        remove: { text: 'Remove' },
        move: { show: true }
      },
      presentation: {
        type: 'cards',
        addButtonText: 'Add contact'
      },
      template: [
        {
          id: 'role',
          type: 'select',
          label: 'Role',
          props: {
            options: [
              { label: 'Owner', value: 'owner' },
              { label: 'Backup', value: 'backup' },
              { label: 'Reviewer', value: 'reviewer' }
            ]
          }
        },
        {
          id: 'name',
          type: 'input',
          label: 'Name',
          props: { placeholder: 'Contact name' },
          rules: [{ required: true, message: 'Name is required.' }]
        },
        {
          id: 'email',
          type: 'input',
          label: 'Email',
          props: { placeholder: 'name@example.test' },
          rules: [
            { required: true, message: 'Email is required.' },
            { pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', message: 'Invalid email.' }
          ]
        }
      ]
    }
  ],
  rulesV2: [
    {
      id: 'owner-email-required',
      scope: 'contacts[]',
      watch: ['$self.role'],
      when: { '==': [{ var: '$self.role' }, 'owner'] },
      effects: [{ type: 'setRequired', target: '$self.email', value: true }],
      elseEffects: [{ type: 'setRequired', target: '$self.email', value: false }]
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
