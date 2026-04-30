import { computed, ref } from 'vue'

export type AnyRecord = Record<string, any>

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null))
}

export function formatJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

export function useDemoState(initialModel: AnyRecord) {
  const formRef = ref<any>()
  const formModel = ref<AnyRecord>(clone(initialModel))
  const errors = ref<Record<string, string[]>>({})
  const state = ref<AnyRecord>({})
  const status = ref('Ready')
  const renderKey = ref(0)

  const valuesJson = computed(() => formatJson(formModel.value))
  const errorsJson = computed(() => formatJson(errors.value))
  const stateJson = computed(() => formatJson(state.value))

  function refresh() {
    const engine = formRef.value?.engine
    errors.value = engine?.getErrors?.() ?? {}
    state.value = engine?.getState?.() ?? {}
  }

  async function validate() {
    const ok = await formRef.value?.validate?.()
    refresh()
    status.value = ok ? 'Validation passed' : 'Validation failed'
  }

  function reset() {
    formModel.value = clone(initialModel)
    formRef.value?.resetFields?.()
    errors.value = {}
    state.value = {}
    status.value = 'Reset'
    renderKey.value += 1
  }

  return {
    formRef,
    formModel,
    errors,
    state,
    status,
    renderKey,
    valuesJson,
    errorsJson,
    stateJson,
    refresh,
    validate,
    reset
  }
}
