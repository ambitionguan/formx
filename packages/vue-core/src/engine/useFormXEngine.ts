import { ref, shallowRef, toRaw, watch } from 'vue'
import type {
  FormXEngine as Engine,
  EnginePolicyOptions,
  FormSchema,
  FormXMessageOptions,
  FormXMessageResolver
} from '@formx/core'
import { FormXEngine, normalizeFormXMessageResolver } from '@formx/core'

type AnyRecord = Record<string, any>

export type FormXEmit = (
  event: 'update:value' | 'change' | 'submit' | 'validateFail',
  ...args: any[]
) => void

export function useFormXEngine(
  props: {
    schema: FormSchema
    value?: AnyRecord
    defaultValue?: AnyRecord
    engine?: Engine
    policy?: EnginePolicyOptions
    messages?: FormXMessageOptions | FormXMessageResolver
  },
  emit: FormXEmit,
  defaults?: {
    messages?: FormXMessageOptions | FormXMessageResolver
  }
) {
  const getBaseModel = () => props.value || props.defaultValue || props.schema.model || {}
  const initialModel = ref<AnyRecord>(toRaw(getBaseModel()))
  const getMessages = () => props.messages || defaults?.messages
  const applyMessages = (target: Engine) => {
    const resolver = normalizeFormXMessageResolver(getMessages())
    if (resolver && typeof (target as any).setMessageResolver === 'function') {
      const targetEngine = target as any
      targetEngine.setMessageResolver(resolver)
    }
  }

  const createEngine = () => {
    if (props.engine) {
      applyMessages(props.engine)
      return props.engine
    }
    return new FormXEngine({
      schema: { ...props.schema, model: initialModel.value },
      policy: props.policy || { validation: { mode: 'touched' } },
      messages: props.messages || defaults?.messages
    } as any)
  }

  const engine = shallowRef<Engine>(createEngine())

  // Guard against recursive updates.
  let isInternalUpdate = false

  // Watch external engine changes.
  watch(
    () => props.engine,
    (newEngine) => {
      if (newEngine && newEngine !== engine.value) {
        applyMessages(newEngine)
        engine.value = newEngine
      }
    }
  )

  watch(
    () => props.messages,
    () => {
      applyMessages(engine.value)
    }
  )

  // Sync external value changes into the engine.
  watch(
    () => props.value,
    (val) => {
      if (!val || isInternalUpdate) return
      const e = engine.value
      try {
        const v = val as AnyRecord
        Object.keys(v).forEach((k) => {
          try {
            e.setValue(k, v[k])
          } catch {
            /* ignore */
          }
        })
      } catch {
        // ignore
      }
    },
    { deep: true }
  )

  // Emit engine value changes for v-model:value.
  engine.value.subscribe?.((diff: any) => {
    try {
      isInternalUpdate = true
      const vals = engine.value.getValues()
      emit('update:value', vals)
      emit('change', vals, diff)
    } catch {
      // ignore
    } finally {
      // Reset in microtask to avoid same-tick watch loops.
      Promise.resolve().then(() => {
        isInternalUpdate = false
      })
    }
  })

  // Trigger init to load optionsFrom data.
  engine.value.dispatch('init')

  return { engine, initialModel }
}
