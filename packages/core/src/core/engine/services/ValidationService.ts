import { getAt } from '../../Path'
import { prepareFieldValidation, shouldRunRulesOnTrigger } from '../../validation/FieldValidation'
import type { FormXMessageResolver, ValidationDetails } from '../../Types'
import { resolveFormXI18nMessage, resolveFormXMessage } from '../../MessageResolver'

type Diff = {
  event: string
  payload?: any
  values?: Array<{ path: string; prev: any; next: any }>
  state?: Array<{ path: string; prev: any; next: any }>
}

type ValidationTrigger = 'change' | 'blur' | 'submit'

const VALIDATION_RULE_KEYS = [
  'minLength',
  'maxLength',
  'min',
  'max',
  'enum',
  'pattern',
  'expression',
  'use',
  'validator'
]

function getEngineMessageResolver(engine: any): FormXMessageResolver | undefined {
  if (typeof engine?.getMessageResolver === 'function') {
    return engine.getMessageResolver()
  }
  return engine?.messageResolver
}

function resolveConfiguredMessage(
  source: any,
  resolver?: FormXMessageResolver
): string | undefined {
  if (!source || typeof source !== 'object') return undefined
  const translated = resolveFormXI18nMessage(
    source.i18nKey,
    'message',
    undefined,
    undefined,
    resolver
  )
  if (translated) return translated

  return typeof source.message === 'string' && source.message ? source.message : undefined
}

function isDynamicRequiredMessageRule(rule: any, resolver?: FormXMessageResolver): boolean {
  if (!rule || typeof rule !== 'object') return false
  if (rule.required !== false) return false
  if (!resolveConfiguredMessage(rule, resolver)) return false
  return !VALIDATION_RULE_KEYS.some((key) => Object.prototype.hasOwnProperty.call(rule, key))
}

function resolveDynamicRequiredMessage(
  schema: any,
  rules: any[],
  resolver?: FormXMessageResolver
): string {
  const requiredWhenMessage = resolveConfiguredMessage(schema?.requiredWhen, resolver)
  if (requiredWhenMessage) return requiredWhenMessage

  const messageRule = rules.find((rule) => isDynamicRequiredMessageRule(rule, resolver))
  const ruleMessage = resolveConfiguredMessage(messageRule, resolver)
  if (ruleMessage) return ruleMessage

  return schema?.label
    ? resolveFormXMessage(
        'formx.validation.requiredWithLabel',
        { label: schema.label },
        undefined,
        resolver
      )
    : resolveFormXMessage('formx.validation.required', undefined, undefined, resolver)
}

function ensureValidationRuntime(engine: any) {
  if (!engine.validationRunIds) engine.validationRunIds = new Map<string, number>()
  if (!engine.validationTimers)
    engine.validationTimers = new Map<string, ReturnType<typeof setTimeout>>()
  if (!engine.validationResolvers)
    engine.validationResolvers = new Map<string, (value: boolean) => void>()
  return {
    runIds: engine.validationRunIds as Map<string, number>,
    timers: engine.validationTimers as Map<string, ReturnType<typeof setTimeout>>,
    resolvers: engine.validationResolvers as Map<string, (value: boolean) => void>
  }
}

function beginValidationRun(engine: any, path: string) {
  const runtime = ensureValidationRuntime(engine)
  const timer = runtime.timers.get(path)
  if (timer) {
    clearTimeout(timer)
    runtime.timers.delete(path)
  }
  const resolve = runtime.resolvers.get(path)
  if (resolve) {
    runtime.resolvers.delete(path)
    try {
      resolve(false)
    } catch {}
  }
  const nextId = (runtime.runIds.get(path) || 0) + 1
  runtime.runIds.set(path, nextId)
  return nextId
}

function isLatestRun(engine: any, path: string, runId: number) {
  return (ensureValidationRuntime(engine).runIds.get(path) || 0) === runId
}

function invalidateValidationRun(engine: any, path: string) {
  beginValidationRun(engine, path)
}

function emitStateChange(
  engine: any,
  path: string,
  prev: any,
  next: any,
  event = `validate:${path}`
) {
  engine.stateObj[path] = next
  engine.emitIfAny({ event, state: [{ path, prev, next }] } as Diff)
}

function upsertValidationState(
  engine: any,
  path: string,
  updater: (prev: any) => any,
  event = `validate:${path}`
) {
  const prev = engine.stateObj[path] || {}
  const next = updater(prev)
  emitStateChange(engine, path, prev, next, event)
}

function shouldWriteErrors(
  mode: string,
  trigger: ValidationTrigger | undefined,
  isTouched: boolean,
  shouldWriteOnChange: boolean
) {
  if (mode === 'submitOnly') return trigger === 'submit'
  return (
    trigger === 'submit' ||
    trigger === 'blur' ||
    mode === 'immediate' ||
    (mode === 'touched' && isTouched) ||
    shouldWriteOnChange
  )
}

function createValidationDetails(
  trigger: ValidationTrigger | undefined,
  syncErrors: string[],
  asyncErrors: string[],
  pendingAsyncCount = 0
): ValidationDetails {
  const now = Date.now()
  return {
    trigger,
    syncErrors: syncErrors.slice(),
    asyncErrors: asyncErrors.slice(),
    pendingAsyncCount,
    updatedAt: now,
    finishedAt: pendingAsyncCount > 0 ? undefined : now
  }
}

function clearValidationStateForPath(engine: any, path: string) {
  invalidateValidationRun(engine, path)
  const prev = engine.stateObj[path] || {}
  const hasErrors = Array.isArray(prev?.errors) && prev.errors.length > 0
  const hasValidating = !!prev?.validating
  const hasDetails = !!prev?.validationDetails
  if (!hasErrors && !hasValidating && !hasDetails) return
  const next = { ...prev, errors: [] as string[], validating: false }
  if ('validationDetails' in next) delete next.validationDetails
  emitStateChange(engine, path, prev, next)
}

async function runAsyncValidationTasks(
  engine: any,
  path: string,
  runId: number,
  syncErrors: string[],
  asyncTasks: Array<{ debounceMs: number; run: () => Promise<string | null> }>,
  trigger: ValidationTrigger | undefined,
  shouldWrite: boolean
) {
  const debounceMs =
    trigger === 'submit'
      ? 0
      : asyncTasks.reduce((max, task) => Math.max(max, Number(task.debounceMs || 0)), 0)

  const execute = async () => {
    const asyncErrors: string[] = []
    for (const task of asyncTasks) {
      if (!isLatestRun(engine, path, runId)) return false
      const message = await task.run()
      if (message) asyncErrors.push(message)
    }
    if (!isLatestRun(engine, path, runId)) return false
    upsertValidationState(engine, path, (prev: any) => {
      const next = {
        ...prev,
        validating: false,
        validationDetails: createValidationDetails(trigger, syncErrors, asyncErrors, 0)
      }
      if (shouldWrite) next.errors = syncErrors.concat(asyncErrors)
      return next
    })
    return syncErrors.length === 0 && asyncErrors.length === 0
  }

  if (debounceMs <= 0) return execute()

  return new Promise<boolean>((resolve) => {
    const runtime = ensureValidationRuntime(engine)
    const timer = setTimeout(async () => {
      runtime.timers.delete(path)
      runtime.resolvers.delete(path)
      resolve(await execute())
    }, debounceMs)
    runtime.timers.set(path, timer)
    runtime.resolvers.set(path, resolve)
  })
}

export async function validate(engine: any): Promise<boolean> {
  const paths: string[] = []
  ;(engine.pathRegistry?.nodes || []).forEach((n: any) => {
    if (n.type && n.type !== 'form-object' && n.type !== 'field-group') paths.push(n.path)
  })
  let ok = true
  for (const pat of paths) {
    const instances = engine.expandPatternToConcretePaths(pat)
    for (const p of instances) {
      const res = await validatePath(engine, p, 'submit')
      if (!res) ok = false
    }
  }
  return ok
}

export async function validatePath(
  engine: any,
  path: string,
  trigger?: ValidationTrigger
): Promise<boolean> {
  const runId = beginValidationRun(engine, path)
  const pattern = path.replace(/\[(\d+)\]/g, '[]')
  const meta =
    engine.pathRegistry?.pathToMeta?.get(pattern) || engine.pathRegistry?.pathToMeta?.get(path)
  const schema = meta?.schema || engine.findSchemaByPattern?.(pattern)
  if (!schema) return true

  const rules = Array.isArray(schema.rules) ? schema.rules : []
  const fieldType = typeof schema.type === 'string' ? schema.type : undefined
  const value = getAt(engine.valuesObj, path)
  const policy = engine.policy?.validation || {}
  const mode = policy.mode || 'touched'
  const st = engine.stateObj[path] || {}
  const skipHidden = policy.skipHidden !== false
  const skipDisabled = policy.skipDisabled !== false
  const skipReadOnly = policy.skipReadOnly !== false
  const messageResolver = getEngineMessageResolver(engine)

  const dynamicRequired = st?.required === true
  const hasStaticRequired = rules.some(
    (r: any) => r && typeof r === 'object' && (r as any).required
  )
  const mergedRules =
    dynamicRequired && !hasStaticRequired
      ? rules.concat([
          {
            required: true,
            message: resolveDynamicRequiredMessage(schema, rules, messageResolver)
          }
        ])
      : rules

  if (skipHidden && st?.visible === false) {
    clearValidationStateForPath(engine, path)
    return true
  }
  if (skipDisabled && st?.disabled === true) {
    clearValidationStateForPath(engine, path)
    return true
  }
  if (skipReadOnly && st?.readOnly === true) {
    clearValidationStateForPath(engine, path)
    return true
  }

  const shouldWriteOnChange =
    trigger === 'change' && shouldRunRulesOnTrigger(rules, fieldType, 'change')
  if (trigger === 'blur' || trigger === 'submit') {
    upsertValidationState(
      engine,
      path,
      (prev: any) => ({ ...prev, touched: true }),
      `touched:${path}`
    )
  }

  const prepared = prepareFieldValidation(value, mergedRules, {
    form: engine.valuesObj,
    path,
    selfPath: path,
    trigger,
    fieldType,
    messageResolver
  })
  const errors = prepared.syncErrors
  const isTouched = !!engine.stateObj[path]?.touched
  const shouldWrite = shouldWriteErrors(mode, trigger, isTouched, shouldWriteOnChange)
  const hasAsync = prepared.asyncTasks.length > 0

  if (
    shouldWrite ||
    hasAsync ||
    (engine.stateObj[path]?.validating ?? false) ||
    engine.stateObj[path]?.validationDetails
  ) {
    upsertValidationState(engine, path, (prev: any) => {
      const next = {
        ...prev,
        validating: hasAsync,
        validationDetails: createValidationDetails(trigger, errors, [], prepared.asyncTasks.length)
      }
      if (shouldWrite) next.errors = errors
      else if (!hasAsync && prev.validating) next.validating = false
      return next
    })
  }

  if (!hasAsync) return errors.length === 0

  return runAsyncValidationTasks(
    engine,
    path,
    runId,
    errors,
    prepared.asyncTasks,
    trigger,
    shouldWrite
  )
}
