<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { FormXEngine } from '@formxjs/vue'
import type { FormSchema } from '@formxjs/vue'
import { formatJson } from './demoUtils'

const schema: FormSchema = {
  version: '1.0.0',
  formId: 'docs-headless-core',
  model: {
    plan: 'team',
    seats: 12,
    monthlyPrice: 0,
    approvalRequired: false
  },
  fields: [
    {
      id: 'plan',
      type: 'select',
      label: 'Plan',
      props: {
        options: [
          { label: 'Team', value: 'team' },
          { label: 'Enterprise', value: 'enterprise' }
        ]
      }
    },
    {
      id: 'seats',
      type: 'number',
      label: 'Seats',
      rules: [{ min: 1, message: 'At least 1 seat.' }]
    },
    {
      id: 'monthlyPrice',
      type: 'number',
      label: 'Monthly price',
      readonly: true,
      compute: {
        watch: ['plan', 'seats'],
        expr: {
          '*': [
            { var: 'seats' },
            { iif: [{ '==': [{ var: 'plan' }, 'enterprise'] }, 39, 19] }
          ]
        }
      }
    },
    {
      id: 'approvalRequired',
      type: 'switch',
      label: 'Approval'
    }
  ],
  rulesV2: [
    {
      id: 'enterprise-approval',
      watch: ['plan'],
      when: { '==': [{ var: 'plan' }, 'enterprise'] },
      effects: [{ type: 'set', target: 'approvalRequired', value: true }],
      elseEffects: [{ type: 'set', target: 'approvalRequired', value: false }]
    }
  ]
}

const engine = ref<FormXEngine>()
const values = ref<Record<string, any>>({})
const errors = ref<Record<string, string[]>>({})
const diagnostics = ref<Record<string, any>>({})
const status = ref('Engine is not mounted yet.')
let unsubscribe: (() => void) | undefined

const valuesJson = computed(() => formatJson(values.value))
const errorsJson = computed(() => formatJson(errors.value))
const diagnosticsJson = computed(() => formatJson(diagnostics.value))

function refresh() {
  if (!engine.value) return
  values.value = engine.value.getValues()
  errors.value = engine.value.getErrors()
  diagnostics.value = engine.value.getDiagnostics() as any
}

function setEnterprise() {
  engine.value?.setValue('plan', 'enterprise')
  status.value = 'Changed plan to enterprise.'
  refresh()
}

function addSeats() {
  const current = Number(engine.value?.getValue('seats') || 0)
  engine.value?.setValue('seats', current + 5)
  status.value = 'Added 5 seats.'
  refresh()
}

async function validate() {
  const ok = await engine.value?.validate()
  status.value = ok ? 'Validation passed.' : 'Validation failed.'
  refresh()
}

onMounted(() => {
  const instance = new FormXEngine({
    schema,
    policy: { validation: { mode: 'submitOnly' } }
  })
  unsubscribe = instance.subscribe(refresh)
  instance.dispatch('init')
  engine.value = instance
  status.value = 'Engine mounted and initialized.'
  refresh()
})

onBeforeUnmount(() => {
  unsubscribe?.()
})
</script>

<template>
  <div class="formx-live-demo">
    <div class="formx-live-demo__canvas">
      <p>
        This demo creates <code>FormXEngine</code> directly and never mounts a FormX renderer.
      </p>
      <div class="formx-headless-actions">
        <el-button type="primary" @click="setEnterprise">Set enterprise</el-button>
        <el-button @click="addSeats">Add seats</el-button>
        <el-button @click="validate">Validate</el-button>
      </div>
      <p class="formx-live-demo__status">{{ status }}</p>
    </div>
    <aside class="formx-live-demo__inspector">
      <details open>
        <summary>Values</summary>
        <pre>{{ valuesJson }}</pre>
      </details>
      <details open>
        <summary>Errors</summary>
        <pre>{{ errorsJson }}</pre>
      </details>
      <details>
        <summary>Diagnostics</summary>
        <pre>{{ diagnosticsJson }}</pre>
      </details>
    </aside>
  </div>
</template>
