import { EffectRegistry } from './EffectRegistry'
import { compileExpr } from '../Expression'
import { ResourceManager } from '../ResourceManager'
import { getAt, setAt, deleteAt, tokenize, stringifyTokens } from '../Path'

/**
 * Register builtin effects used by the engine.
 */
export function registerBuiltinEffects() {
  // validate: set/clear errors for target paths; supports message as expression object
  EffectRegistry.register('validate', (ctx: any, effect: any, selfPath?: string, diffs?: any) => {
    const targets = effect.target ? (Array.isArray(effect.target) ? effect.target : [effect.target]) : []
    targets.forEach((t: string) => {
      const key = ctx.resolveScopedPath(t, selfPath)
      const prev = ctx.stateObj[key]
      const patch: any = { ...(prev || {}) }
      if (effect.message !== undefined) {
        const msg = (typeof effect.message === 'object')
          ? compileExpr(effect.message)({ form: ctx.valuesObj, selfPath, state: ctx.stateObj })
          : effect.message
        if (msg) {
          const list = Array.isArray(patch.errors) ? patch.errors.slice() : []
          list.push(String(msg))
          patch.errors = list
        } else {
          if (patch.errors) patch.errors = []
        }
      } else {
        if (patch.errors) patch.errors = []
      }
      ctx.stateObj[key] = patch
      diffs?.state?.push({ path: key, prev, next: patch })
    })
  })

  // fetch options or remote data and write to state[target]
  EffectRegistry.register('fetch', (ctx: any, effect: any, selfPath?: string, diffs?: any) => {
    const eff = effect || {}
    const key = ctx.resolveScopedPath(eff.target, selfPath)
    const prev = ctx.stateObj[key]
    const patch: any = { ...(prev || {}), loading: true }
    ctx.stateObj[key] = patch
    diffs?.state?.push({ path: key, prev, next: patch })

    const params = ctx.resolveParams ? ctx.resolveParams(eff.params, ctx.valuesObj, selfPath) : (eff.params || {})
    const reqId = ((ctx.latestRequestId?.get?.(key)) || 0) + 1
    ctx.latestRequestId?.set?.(key, reqId)
    ResourceManager.fetch(eff.requestKey, params, {
      ttl: eff.ttl || 0,
      cacheKey: eff.cacheKey,
      mode: eff.mode,
      debounceMs: eff.debounceMs,
      abortPrevious: eff.mode === 'latest',
      retries: eff.retries,
      retryDelayMs: eff.retryDelayMs
    })
      .then((data) => {
        if ((ctx.latestRequestId?.get?.(key) || 0) !== reqId) return
        const cur = ctx.stateObj[key] || {}
        const mapped = mapOptionsIfNeeded(data, eff.map)
        const next: any = { ...cur, options: Array.isArray(mapped) ? mapped : cur.options, fetchResult: data, loading: false }
        ctx.stateObj[key] = next
        ctx.emit?.({ event: 'fetch:' + key, state: [{ path: key, prev: cur, next }] })
        ctx.emitEvent?.('fetch:success', { key, requestKey: eff.requestKey, params })
      })
      .catch(() => {
        const cur = ctx.stateObj[key] || {}
        const next: any = { ...cur, loading: false, options: eff.fallbackOptions || cur.options }
        ctx.stateObj[key] = next
        ctx.emit?.({ event: 'fetch:' + key, state: [{ path: key, prev: cur, next }] })
        ctx.emitEvent?.('fetch:error', { key, requestKey: eff.requestKey, params })
      })
  })

  // set: write value(s) to form values
  EffectRegistry.register('set', (ctx: any, effect: any, selfPath?: string, diffs?: any, queue?: Set<string>) => {
    const targets = Array.isArray(effect.target) ? effect.target : [effect.target]
    targets.forEach((p: string) => {
      const abs = ctx.resolveScopedPath(p, selfPath)
      const prev = getAt(ctx.valuesObj, abs)
      const next = (typeof effect.value === 'object' && effect.value != null)
        ? compileExpr(effect.value)({ form: ctx.valuesObj, selfPath })
        : effect.value
      if (prev !== next) {
        setAt(ctx.valuesObj, abs, next)
        diffs?.values?.push({ path: abs, prev, next })
        queue?.add(abs)
      }
    })
  })

  // patch / visibility / disabled / required / readonly
  const setStateFlag = (ctx: any, key: string, patch: any, diffs?: any) => {
    const prev = ctx.stateObj[key]
    ctx.stateObj[key] = patch
    diffs?.state?.push({ path: key, prev, next: patch })
  }

  EffectRegistry.register('patch', (ctx: any, effect: any, selfPath?: string, diffs?: any) => {
    const key = ctx.resolveScopedPath(effect.target, selfPath)
    const prev = ctx.stateObj[key]
    const patch: any = { ...(prev || {}) }
    Object.assign(patch.patch ?? (patch.patch = {}), effect.value)
    setStateFlag(ctx, key, patch, diffs)
  })

  const makeSetter = (prop: 'visible' | 'disabled' | 'required' | 'readOnly') =>
    (ctx: any, effect: any, selfPath?: string, diffs?: any, queue?: Set<string>) => {
      const key = ctx.resolveScopedPath(effect.target, selfPath)
      const prev = ctx.stateObj[key]
      const patch: any = { ...(prev || {}) }
      patch[prop] = effect.value
      setStateFlag(ctx, key, patch, diffs)
      if (prop === 'visible' && effect.value === false && ctx.policy?.onHide === 'clear') {
        const prevVal = getAt(ctx.valuesObj, key)
        if (prevVal !== undefined) {
          deleteAt(ctx.valuesObj, key)
          diffs?.values?.push({ path: key, prev: prevVal, next: undefined })
          queue?.add(key)
        }
      }
    }
  EffectRegistry.register('setVisible', makeSetter('visible'))
  EffectRegistry.register('setDisabled', makeSetter('disabled'))
  EffectRegistry.register('setRequired', makeSetter('required'))
  EffectRegistry.register('setReadOnly', makeSetter('readOnly'))

  // setOptions
  EffectRegistry.register('setOptions', (ctx: any, effect: any, selfPath?: string, diffs?: any) => {
    const key = ctx.resolveScopedPath(effect.target, selfPath)
    const prev = ctx.stateObj[key]
    const patch: any = { ...(prev || {}) }
    patch.options = [...(effect.options || [])]
    setStateFlag(ctx, key, patch, diffs)
  })

  // add/remove/splice item in array
  EffectRegistry.register('addItem', (ctx: any, effect: any, selfPath?: string, diffs?: any, queue?: Set<string>) => {
    const key = ctx.resolveScopedPath(effect.target, selfPath)
    const prevArr = getAt(ctx.valuesObj, key)
    const arr = Array.isArray(prevArr) ? prevArr.slice() : []
    const idx = typeof effect.index === 'number' ? effect.index : arr.length
    arr.splice(idx, 0, effect.value)
    setAt(ctx.valuesObj, key, arr)
    diffs?.values?.push({ path: key, prev: prevArr, next: arr })
    queue?.add(key)
  })

  EffectRegistry.register('removeItem', (ctx: any, effect: any, selfPath?: string, diffs?: any, queue?: Set<string>) => {
    const key = ctx.resolveScopedPath(effect.target, selfPath)
    const prevArr = getAt(ctx.valuesObj, key)
    if (Array.isArray(prevArr)) {
      const arr = prevArr.slice()
      arr.splice(effect.index, 1)
      setAt(ctx.valuesObj, key, arr)
      diffs?.values?.push({ path: key, prev: prevArr, next: arr })
      queue?.add(key)
    }
  })

  EffectRegistry.register('splice', (ctx: any, effect: any, selfPath?: string, diffs?: any, queue?: Set<string>) => {
    const key = ctx.resolveScopedPath(effect.target, selfPath)
    const prevArr = getAt(ctx.valuesObj, key)
    const arr = Array.isArray(prevArr) ? prevArr.slice() : []
    const del = typeof effect.deleteCount === 'number' ? effect.deleteCount : 0
    const items = Array.isArray(effect.items) ? effect.items : []
    ;(arr as any[]).splice(effect.start, del, ...items)
    setAt(ctx.valuesObj, key, arr)
    diffs?.values?.push({ path: key, prev: prevArr, next: arr })
    queue?.add(key)
  })

  // schema patch
  EffectRegistry.register('setSchemaPatch', (ctx: any, effect: any) => {
    if (typeof ctx.applySchemaPatch === 'function') ctx.applySchemaPatch(effect.patch || [])
  })

  // batch: run a list of effects sequentially (no special transaction semantics)
  EffectRegistry.register('batch', (_ctx: any, effect: any, selfPath?: string, diffs?: any, queue?: Set<string>) => {
    const list = Array.isArray(effect.effects) ? effect.effects : []
    for (const eff of list) {
      const h = EffectRegistry.get(eff?.type)
      if (h) {
        try { h(_ctx, eff, selfPath, diffs, queue) } catch { /* ignore single failure */ }
      }
    }
  })

  // dispatch: emit a custom event for observers
  EffectRegistry.register('dispatch', (ctx: any, effect: any) => {
    if (!effect || !effect.event) return
    try { ctx.emitEvent?.(String(effect.event), effect.payload) } catch {}
  })

  // toggle: boolean toggle for target path (or set truthy/falsy explicitly)
  EffectRegistry.register('toggle', (ctx: any, effect: any, selfPath?: string, diffs?: any, queue?: Set<string>) => {
    const key = ctx.resolveScopedPath(effect.target, selfPath)
    const prev = getAt(ctx.valuesObj, key)
    const truthy = effect.truthyValue ?? true
    const falsy = effect.falsyValue ?? false
    const next = prev ? falsy : truthy
    if (prev !== next) {
      setAt(ctx.valuesObj, key, next)
      diffs?.values?.push({ path: key, prev, next })
      queue?.add(key)
    }
  })

  // copyValue: set target to value of from path (supports $self/$parent/$root)
  EffectRegistry.register('copyValue', (ctx: any, effect: any, selfPath?: string, diffs?: any, queue?: Set<string>) => {
    const fromExpr = { var: effect.from }
    const val = compileExpr(fromExpr)({ form: ctx.valuesObj, selfPath })
    const targets = Array.isArray(effect.target) ? effect.target : [effect.target]
    targets.forEach((p: string) => {
      const abs = ctx.resolveScopedPath(p, selfPath)
      const prev = getAt(ctx.valuesObj, abs)
      if (prev !== val) {
        setAt(ctx.valuesObj, abs, val)
        diffs?.values?.push({ path: abs, prev, next: val })
        queue?.add(abs)
      }
    })
  })

  // clearErrors: remove validation errors at target path(s)
  EffectRegistry.register('clearErrors', (ctx: any, effect: any, selfPath?: string, diffs?: any) => {
    const targets = Array.isArray(effect.target) ? effect.target : [effect.target]
    targets.forEach((t: string) => {
      const key = ctx.resolveScopedPath(t, selfPath)
      const prev = ctx.stateObj[key]
      const patch: any = { ...(prev || {}) }
      if (patch.errors) patch.errors = []
      setStateFlag(ctx, key, patch, diffs)
    })
  })
}

function mapOptionsIfNeeded(data: any, map?: { label?: string; value?: string; children?: string }) {
  if (!Array.isArray(data)) return data
  const labelKey = map?.label || 'label'
  const valueKey = map?.value || 'value'
  const childrenKey = map?.children || 'children'
  const walk = (arr: any[]): any[] => arr.map((it) => {
    if (it == null) return it
    if (typeof it !== 'object') return { label: String(it), value: it }
    const lab = it[labelKey] != null ? it[labelKey] : String(it[valueKey] ?? it)
    const val = it[valueKey] != null ? it[valueKey] : it[labelKey]
    const out: any = { label: lab, value: val }
    // pass-through commonly used flags like disabled
    if (Object.prototype.hasOwnProperty.call(it, 'disabled')) out.disabled = !!(it as any).disabled
    if (Array.isArray((it as any)[childrenKey])) out.children = walk((it as any)[childrenKey])
    return out
  })
  return walk(data)
}
