import type { Ref } from 'vue'
import type { FormXEngine as Engine } from '@formx/core'

type AnyRecord = Record<string, any>

export function createFormXExpose(
  engine: Ref<Engine>,
  initialModel: Ref<AnyRecord>,
  fieldGroupAPIs: Record<string, any>
) {
  return {
    // Expose engine instance for formRef.value.engine.validate().
    get engine() {
      return engine.value as any
    },
    // Wrap validate to return Engine.validate result.
    async validate(trigger?: string) {
      try {
        const eng = engine.value as any
        return typeof eng?.validate === 'function' ? await eng.validate(trigger as any) : {}
      } catch {
        return {}
      }
    },
    // Read current form values.
    getValues() {
      try {
        return engine.value.getValues()
      } catch {
        return {}
      }
    },
    // dynamic-form compatibility: validate one field.
    async validateField(path: string, trigger?: 'change' | 'blur' | 'submit') {
      try {
        const eng = engine.value as any
        return typeof eng?.validatePath === 'function' ? await eng.validatePath(path, trigger) : false
      } catch {
        return false
      }
    },
    getValidationDetails(path?: string) {
      try {
        const eng = engine.value as any
        return typeof eng?.getValidationDetails === 'function' ? eng.getValidationDetails(path) : null
      } catch {
        return null
      }
    },
    isValidating(path?: string) {
      try {
        const eng = engine.value as any
        return typeof eng?.isValidating === 'function' ? eng.isValidating(path) : false
      } catch {
        return false
      }
    },
    // dynamic-form compatibility: reset to initial model.
    resetFields() {
      try {
        const eng = engine.value as any
        const base = JSON.parse(JSON.stringify(initialModel.value || {}))
        if (typeof eng?.reset === 'function') {
          eng.reset(base, { clearErrors: true, clearTouched: true, silentValidate: true })
          return
        }
        const current = eng.getValues()
        const keys = new Set<string>([
          ...Object.keys(current || {}),
          ...Object.keys(base || {})
        ])
        keys.forEach((k) => {
          try { eng.setValue(k, (base as any)[k]) } catch { /* ignore */ }
        })
      } catch {
        // ignore
      }
    },
    // dynamic-form compatibility: get field-group API.
    getFieldGroupAPI(groupId: string) {
      return (fieldGroupAPIs as any)[groupId] || null
    }
  }
}
