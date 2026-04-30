import { evaluateExpr } from '../Expression'
import type { FormXMessageResolver, ValidationResultObject, ValidationRule } from '../Types'
import { resolveFormXI18nMessage, resolveFormXMessage } from '../MessageResolver'
import { ValidatorRegistry } from '../validators/ValidatorRegistry'

export type Trigger = 'change' | 'blur' | 'submit'

export interface FieldValidationContext {
  form: any
  path: string
  selfPath: string
  trigger?: Trigger
  fieldType?: string
  messageResolver?: FormXMessageResolver
}

export interface AsyncValidationTask {
  rule: ValidationRule
  debounceMs: number
  run: () => Promise<string | null>
}

export interface PreparedFieldValidation {
  syncErrors: string[]
  asyncTasks: AsyncValidationTask[]
}

const CHANGE_ONLY_TYPES = new Set([
  'select',
  'radio',
  'checkbox',
  'switch',
  'slider',
  'cascader',
  'tree-select',
  'date-picker',
  'time-picker',
  'time-select',
  'upload'
])

function getDefaultTriggers(fieldType?: string): Trigger[] {
  const type = String(fieldType || '').trim()
  if (CHANGE_ONLY_TYPES.has(type)) return ['change']
  return ['change', 'blur']
}

function normalizeRuleTriggers(ruleTrigger: any, fieldType?: string): Trigger[] {
  let list: Trigger[] = []
  if (Array.isArray(ruleTrigger)) list = ruleTrigger.filter(Boolean) as Trigger[]
  else if (ruleTrigger) list = [ruleTrigger as Trigger]
  const defaults = list.length ? list : getDefaultTriggers(fieldType)
  const type = String(fieldType || '').trim()
  if (!CHANGE_ONLY_TYPES.has(type) && defaults.includes('blur') && !defaults.includes('change')) {
    return [...defaults, 'change']
  }
  return defaults
}

function message(
  resolver: FormXMessageResolver | undefined,
  key: string,
  params?: Record<string, unknown>,
  fallback?: string
) {
  return resolveFormXMessage(key, params, fallback, resolver)
}

function translateRuleMessage(rule: any, resolver?: FormXMessageResolver): any {
  if (!rule || typeof rule !== 'object') return rule
  const translated = resolveFormXI18nMessage(
    rule.i18nKey,
    'message',
    undefined,
    undefined,
    resolver
  )
  if (translated) {
    return { ...rule, message: translated }
  }
  return rule
}

function isPromiseLike<T = any>(value: any): value is Promise<T> {
  return (
    !!value &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof value.then === 'function'
  )
}

export function shouldRunRulesOnTrigger(
  rules: any[],
  fieldType: string | undefined,
  trigger: Trigger
): boolean {
  if (!Array.isArray(rules) || rules.length === 0) return false
  for (const r of rules) {
    if (!r || typeof r !== 'object') continue
    const eff = normalizeRuleTriggers((r as any).trigger, fieldType)
    if (eff.includes(trigger)) return true
  }
  return false
}

function resolvePatternMatcher(
  pattern: ValidationRule['pattern'],
  fallbackMessage?: string
): { regex: RegExp; message?: string } | null {
  if (!pattern) return null
  if (pattern instanceof RegExp) {
    return { regex: pattern, message: fallbackMessage }
  }
  if (typeof pattern === 'string') {
    try {
      return { regex: new RegExp(pattern), message: fallbackMessage }
    } catch {
      return null
    }
  }
  if (typeof pattern === 'object') {
    if ('name' in pattern && pattern.name) {
      const registered = ValidatorRegistry.getPattern(String(pattern.name))
      if (!registered) return null
      try {
        return {
          regex: new RegExp(registered.source, pattern.flags || registered.flags),
          message: fallbackMessage || registered.message
        }
      } catch {
        return null
      }
    }
    if ('source' in pattern && typeof (pattern as any).source === 'string') {
      try {
        return {
          regex: new RegExp((pattern as any).source, (pattern as any).flags),
          message: fallbackMessage || (pattern as any).message
        }
      } catch {
        return null
      }
    }
  }
  return null
}

function normalizeValidatorResult(
  result: boolean | string | ValidationResultObject | undefined,
  fallbackMessage?: string,
  resolver?: FormXMessageResolver
): string | null {
  if (typeof result === 'boolean')
    return result ? null : fallbackMessage || message(resolver, 'formx.validation.validationFailed')
  if (typeof result === 'string') return result ? result : null
  if (result && typeof result === 'object') {
    if (result.valid === false)
      return (
        result.message || fallbackMessage || message(resolver, 'formx.validation.validationFailed')
      )
    return null
  }
  return null
}

function createAsyncTask(
  resultFactory: () =>
    | boolean
    | string
    | ValidationResultObject
    | Promise<boolean | string | ValidationResultObject>,
  rule: ValidationRule,
  debounceMs: number,
  fallbackMessage?: string,
  resolver?: FormXMessageResolver
): AsyncValidationTask {
  return {
    rule,
    debounceMs,
    async run() {
      try {
        const result = await resultFactory()
        return normalizeValidatorResult(result as any, rule.message || fallbackMessage, resolver)
      } catch {
        return (
          rule.message || fallbackMessage || message(resolver, 'formx.validation.validationFailed')
        )
      }
    }
  }
}

function collectNamedValidator(
  value: any,
  rule: ValidationRule,
  ctx: FieldValidationContext,
  syncErrors: string[],
  asyncTasks: AsyncValidationTask[]
) {
  if (!rule.use || typeof rule.use !== 'string') return
  const definition = ValidatorRegistry.getDefinition(rule.use)
  if (!definition || typeof definition.validate !== 'function') return
  const exec = () =>
    definition.validate({
      value,
      form: ctx.form,
      path: ctx.path,
      selfPath: ctx.selfPath,
      args: rule.args,
      rule
    })
  const debounceMs = Number(rule.debounceMs ?? definition.debounceMs ?? 0) || 0
  const shouldDefer = rule.async === true || definition.async === true
  try {
    if (shouldDefer) {
      asyncTasks.push(
        createAsyncTask(exec, rule, debounceMs, definition.message, ctx.messageResolver)
      )
      return
    }
    const result = exec()
    if (isPromiseLike(result)) {
      asyncTasks.push(
        createAsyncTask(() => result, rule, debounceMs, definition.message, ctx.messageResolver)
      )
      return
    }
    const resultMessage = normalizeValidatorResult(
      result,
      rule.message || definition.message,
      ctx.messageResolver
    )
    if (resultMessage) syncErrors.push(resultMessage)
  } catch {
    syncErrors.push(
      rule.message ||
        definition.message ||
        message(ctx.messageResolver, 'formx.validation.validationFailed')
    )
  }
}

function collectInlineValidator(
  value: any,
  rule: ValidationRule,
  ctx: FieldValidationContext,
  syncErrors: string[],
  asyncTasks: AsyncValidationTask[]
) {
  if (typeof rule.validator !== 'function') return
  const exec = () =>
    rule.validator!(value, {
      value,
      form: ctx.form,
      path: ctx.path,
      selfPath: ctx.selfPath,
      args: rule.args,
      rule
    })
  const debounceMs = Number(rule.debounceMs ?? 0) || 0
  const shouldDefer = rule.async === true
  try {
    if (shouldDefer) {
      asyncTasks.push(createAsyncTask(exec, rule, debounceMs, undefined, ctx.messageResolver))
      return
    }
    const result = exec()
    if (isPromiseLike(result)) {
      asyncTasks.push(
        createAsyncTask(() => result, rule, debounceMs, undefined, ctx.messageResolver)
      )
      return
    }
    const resultMessage = normalizeValidatorResult(result, rule.message, ctx.messageResolver)
    if (resultMessage) syncErrors.push(resultMessage)
  } catch {
    syncErrors.push(
      rule.message || message(ctx.messageResolver, 'formx.validation.validationFailed')
    )
  }
}

export function prepareFieldValidation(
  value: any,
  rules: ValidationRule[],
  ctx: FieldValidationContext
): PreparedFieldValidation {
  if (!Array.isArray(rules) || rules.length === 0) return { syncErrors: [], asyncTasks: [] }
  const processedRules = rules.map((rule) => translateRuleMessage(rule, ctx.messageResolver))
  const syncErrors: string[] = []
  const asyncTasks: AsyncValidationTask[] = []
  const trig = ctx.trigger
  const isSubmit = trig === 'submit'
  const fieldType = ctx.fieldType

  for (const r of processedRules) {
    if (!r || typeof r !== 'object') continue
    const t = r.trigger as Trigger | Trigger[] | undefined
    const eff = normalizeRuleTriggers(t, fieldType)
    if (!isSubmit && trig && eff.length && !eff.includes(trig)) continue

    if (r.required) {
      const miss =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      if (miss) {
        syncErrors.push(r.message || message(ctx.messageResolver, 'formx.validation.required'))
        continue
      }
    }
    if (r.minLength != null) {
      const ml = Number(r.minLength)
      const len = typeof value === 'string' ? value.length : Array.isArray(value) ? value.length : 0
      if (len < ml)
        syncErrors.push(
          r.message ||
            message(
              ctx.messageResolver,
              'formx.validation.minLength',
              { min: ml },
              `最少 ${ml} 个字符`
            )
        )
    }
    if (r.maxLength != null) {
      const ml = Number(r.maxLength)
      const len = typeof value === 'string' ? value.length : Array.isArray(value) ? value.length : 0
      if (len > ml)
        syncErrors.push(
          r.message ||
            message(
              ctx.messageResolver,
              'formx.validation.maxLength',
              { max: ml },
              `最多 ${ml} 个字符`
            )
        )
    }
    if (r.min != null && value != null && value !== '') {
      const v = Number(value)
      if (!Number.isNaN(v) && v < Number(r.min))
        syncErrors.push(
          r.message ||
            message(
              ctx.messageResolver,
              'formx.validation.min',
              { min: r.min },
              `不能小于 ${r.min}`
            )
        )
    }
    if (r.max != null && value != null && value !== '') {
      const v = Number(value)
      if (!Number.isNaN(v) && v > Number(r.max))
        syncErrors.push(
          r.message ||
            message(
              ctx.messageResolver,
              'formx.validation.max',
              { max: r.max },
              `不能大于 ${r.max}`
            )
        )
    }
    if (Array.isArray(r.enum) && value != null && value !== '') {
      const ok = r.enum.includes(value)
      if (!ok)
        syncErrors.push(r.message || message(ctx.messageResolver, 'formx.validation.outOfRange'))
    }
    if (r.pattern && value != null && value !== '') {
      const matcher = resolvePatternMatcher(r.pattern, r.message)
      if (matcher && !matcher.regex.test(String(value))) {
        syncErrors.push(
          matcher.message || message(ctx.messageResolver, 'formx.validation.invalidFormat')
        )
      }
    }
    if (r.expression) {
      const ok = !!evaluateExpr(r.expression, { form: ctx.form, selfPath: ctx.selfPath })
      if (!ok)
        syncErrors.push(
          r.message || message(ctx.messageResolver, 'formx.validation.validationFailed')
        )
    }
    collectNamedValidator(value, r, ctx, syncErrors, asyncTasks)
    collectInlineValidator(value, r, ctx, syncErrors, asyncTasks)
  }
  return { syncErrors, asyncTasks }
}

export async function runFieldRulesAsync(
  value: any,
  rules: ValidationRule[],
  ctx: FieldValidationContext
): Promise<string[]> {
  const prepared = prepareFieldValidation(value, rules, ctx)
  if (!prepared.asyncTasks.length) return prepared.syncErrors
  const asyncErrors: string[] = []
  for (const task of prepared.asyncTasks) {
    const message = await task.run()
    if (message) asyncErrors.push(message)
  }
  return prepared.syncErrors.concat(asyncErrors)
}

export function runFieldRules(
  value: any,
  rules: ValidationRule[],
  ctx: FieldValidationContext
): string[] {
  return prepareFieldValidation(value, rules, ctx).syncErrors
}
