<script setup lang="ts">
import { computed } from 'vue'
import { formatJson } from './demoUtils'

const props = withDefaults(
  defineProps<{
    values?: unknown
    errors?: unknown
    state?: unknown
    status?: string
  }>(),
  {
    values: () => ({}),
    errors: () => ({}),
    state: undefined,
    status: ''
  }
)

const valuesJson = computed(() => formatJson(props.values))
const errorsJson = computed(() => formatJson(props.errors))
const stateJson = computed(() => formatJson(props.state))
</script>

<template>
  <div class="formx-live-demo">
    <div class="formx-live-demo__canvas">
      <slot />
    </div>
    <aside class="formx-live-demo__inspector">
      <div v-if="$slots.actions" class="formx-live-demo__actions">
        <slot name="actions" />
      </div>
      <p v-if="status" class="formx-live-demo__status">{{ status }}</p>
      <details open>
        <summary>Values</summary>
        <pre>{{ valuesJson }}</pre>
      </details>
      <details open>
        <summary>Errors</summary>
        <pre>{{ errorsJson }}</pre>
      </details>
      <details v-if="state">
        <summary>State</summary>
        <pre>{{ stateJson }}</pre>
      </details>
    </aside>
  </div>
</template>
