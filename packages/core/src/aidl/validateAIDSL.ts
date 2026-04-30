type ValidationResult = { ok: boolean; errors: string[] }

const EFFECT_TYPES = new Set([
  'set',
  'patch',
  'setVisible',
  'setDisabled',
  'setRequired',
  'setReadOnly',
  'setOptions',
  'fetch',
  'setSchemaPatch',
  'validate',
  'addItem',
  'removeItem',
  'splice',
  'batch',
  'dispatch',
  'toggle',
  'copyValue',
  'clearErrors'
])

function isObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

function isTargetPath(value: unknown): boolean {
  return typeof value === 'string' || isStringArray(value)
}

function pushError(errors: string[], path: string, message: string) {
  errors.push(`${path}: ${message}`)
}

function validateFields(fields: any[], path: string, errors: string[]) {
  fields.forEach((field, idx) => {
    const cur = `${path}[${idx}]`
    if (!isObject(field)) {
      pushError(errors, cur, 'expected object')
      return
    }
    if (typeof field.id !== 'string' || !field.id.trim()) {
      pushError(errors, `${cur}.id`, 'expected non-empty string')
    }
    if (typeof field.type !== 'string' || !field.type.trim()) {
      pushError(errors, `${cur}.type`, 'expected string')
    }
    if (field.type === 'form-object' && !Array.isArray(field.children)) {
      pushError(errors, `${cur}.children`, 'required for form-object')
    }
    if (field.type === 'field-group' && !Array.isArray(field.template)) {
      pushError(errors, `${cur}.template`, 'required for field-group')
    }
    if (Array.isArray(field.children)) validateFields(field.children, `${cur}.children`, errors)
    if (Array.isArray(field.template)) validateFields(field.template, `${cur}.template`, errors)
  })
}

function validateEffects(effects: any[], path: string, errors: string[]) {
  effects.forEach((eff, idx) => {
    const cur = `${path}[${idx}]`
    if (!isObject(eff)) {
      pushError(errors, cur, 'expected object')
      return
    }
    const type = eff.type
    if (typeof type !== 'string' || !type.trim()) {
      pushError(errors, `${cur}.type`, 'expected string')
      return
    }
    if (!EFFECT_TYPES.has(type)) {
      pushError(errors, `${cur}.type`, `unknown effect type "${type}"`)
      return
    }
    switch (type) {
      case 'set':
      case 'patch': {
        if (!isTargetPath(eff.target)) pushError(errors, `${cur}.target`, 'expected string or string[]')
        if (!('value' in eff)) pushError(errors, `${cur}.value`, 'required')
        break
      }
      case 'setVisible':
      case 'setDisabled':
      case 'setRequired':
      case 'setReadOnly': {
        if (!isTargetPath(eff.target)) pushError(errors, `${cur}.target`, 'expected string or string[]')
        if (typeof eff.value !== 'boolean') pushError(errors, `${cur}.value`, 'expected boolean')
        break
      }
      case 'setOptions': {
        if (typeof eff.target !== 'string') pushError(errors, `${cur}.target`, 'expected string')
        if (!Array.isArray(eff.options)) pushError(errors, `${cur}.options`, 'expected array')
        break
      }
      case 'fetch': {
        if (typeof eff.target !== 'string') pushError(errors, `${cur}.target`, 'expected string')
        if (typeof eff.requestKey !== 'string' || !eff.requestKey.trim()) {
          pushError(errors, `${cur}.requestKey`, 'expected string')
        }
        break
      }
      case 'setSchemaPatch': {
        if (!Array.isArray(eff.patch)) pushError(errors, `${cur}.patch`, 'expected array')
        break
      }
      case 'validate': {
        if (eff.target && !isTargetPath(eff.target)) pushError(errors, `${cur}.target`, 'expected string or string[]')
        break
      }
      case 'addItem': {
        if (typeof eff.target !== 'string') pushError(errors, `${cur}.target`, 'expected string')
        if (eff.index !== undefined && typeof eff.index !== 'number') pushError(errors, `${cur}.index`, 'expected number')
        break
      }
      case 'removeItem': {
        if (typeof eff.target !== 'string') pushError(errors, `${cur}.target`, 'expected string')
        if (typeof eff.index !== 'number') pushError(errors, `${cur}.index`, 'expected number')
        break
      }
      case 'splice': {
        if (typeof eff.target !== 'string') pushError(errors, `${cur}.target`, 'expected string')
        if (typeof eff.start !== 'number') pushError(errors, `${cur}.start`, 'expected number')
        if (eff.deleteCount !== undefined && typeof eff.deleteCount !== 'number') {
          pushError(errors, `${cur}.deleteCount`, 'expected number')
        }
        if (eff.items !== undefined && !Array.isArray(eff.items)) pushError(errors, `${cur}.items`, 'expected array')
        break
      }
      case 'batch': {
        if (!Array.isArray(eff.effects)) {
          pushError(errors, `${cur}.effects`, 'expected array')
        } else {
          validateEffects(eff.effects, `${cur}.effects`, errors)
        }
        break
      }
      case 'dispatch': {
        if (typeof eff.event !== 'string' || !eff.event.trim()) {
          pushError(errors, `${cur}.event`, 'expected string')
        }
        break
      }
      case 'toggle': {
        if (typeof eff.target !== 'string') pushError(errors, `${cur}.target`, 'expected string')
        break
      }
      case 'copyValue': {
        if (!isTargetPath(eff.target)) pushError(errors, `${cur}.target`, 'expected string or string[]')
        if (typeof eff.from !== 'string' || !eff.from.trim()) pushError(errors, `${cur}.from`, 'expected string')
        break
      }
      case 'clearErrors': {
        if (!isTargetPath(eff.target)) pushError(errors, `${cur}.target`, 'expected string or string[]')
        break
      }
      default:
        break
    }
  })
}

function validateRules(rules: any[], path: string, errors: string[]) {
  rules.forEach((rule, idx) => {
    const cur = `${path}[${idx}]`
    if (!isObject(rule)) {
      pushError(errors, cur, 'expected object')
      return
    }
    if (typeof rule.id !== 'string' || !rule.id.trim()) {
      pushError(errors, `${cur}.id`, 'expected non-empty string')
    }
    if (!Array.isArray(rule.effects) || rule.effects.length === 0) {
      pushError(errors, `${cur}.effects`, 'expected non-empty array')
    } else {
      validateEffects(rule.effects, `${cur}.effects`, errors)
    }
    if (rule.elseEffects !== undefined) {
      if (!Array.isArray(rule.elseEffects)) {
        pushError(errors, `${cur}.elseEffects`, 'expected array')
      } else {
        validateEffects(rule.elseEffects, `${cur}.elseEffects`, errors)
      }
    }
    if (rule.watch !== undefined && !isStringArray(rule.watch)) {
      pushError(errors, `${cur}.watch`, 'expected string[]')
    }
    if (rule.trigger !== undefined && !(typeof rule.trigger === 'string' || isStringArray(rule.trigger))) {
      pushError(errors, `${cur}.trigger`, 'expected string or string[]')
    }
  })
}

export function validateAIDSL(input: unknown): ValidationResult {
  const errors: string[] = []
  if (!isObject(input)) {
    pushError(errors, 'root', 'expected object')
    return { ok: false, errors }
  }
  if (typeof input.version !== 'string' || !input.version.trim()) {
    pushError(errors, 'version', 'expected non-empty string')
  }
  if (!Array.isArray((input as any).fields)) {
    pushError(errors, 'fields', 'expected array')
  } else {
    validateFields((input as any).fields, 'fields', errors)
  }
  if ((input as any).rulesV2 !== undefined) {
    if (!Array.isArray((input as any).rulesV2)) {
      pushError(errors, 'rulesV2', 'expected array')
    } else {
      validateRules((input as any).rulesV2, 'rulesV2', errors)
    }
  }
  return { ok: errors.length === 0, errors }
}
