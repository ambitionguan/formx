import type { Effect } from '../../Types'
import { EffectRegistry } from '../../effects/EffectRegistry'
import { compileExpr } from '../../Expression'
import { getAt, setAt, deleteAt } from '../../Path'

type Diff = {
  event: string
  payload?: any
  values?: Array<{ path: string; prev: any; next: any }>
  state?: Array<{ path: string; prev: any; next: any }>
}

/**
 * Effect 执行器
 * 预计 engine 会提供：resolveScopedPath、resolveParams、stateObj、valuesObj、latestRequestId、
 * emit/emitEvent/applySchemaPatch、policy
 * @param engine 
 * @param effect 
 * @param diffs 
 * @param selfPath 
 * @param queue 
 * @returns 
 */
export function applyEffect(engine: any, effect: Effect, diffs: Diff, selfPath?: string, queue?: Set<string>) {
  // 首先尝试使用 EffectRegistry 中注册的 Effect 处理器（自定义或内置）
  try {
    const h = EffectRegistry.get((effect as any)?.type)
    if (h) {
      h({
        resolveScopedPath: (p: string, sp?: string) => engine.resolveScopedPath?.(p, sp),
        resolveParams: (val: any, form: any, sp?: string) => engine.resolveParams?.(val, form, sp),
        stateObj: engine.stateObj,
        valuesObj: engine.valuesObj,
        latestRequestId: engine.latestRequestId,
        emit: (d: Diff) => engine.emitIfAny?.(d),
        emitEvent: (ev: string, payload?: any) => engine.emitEvent?.(ev, payload),
        applySchemaPatch: (patch: any) => engine.applySchemaPatch?.(patch),
        policy: engine.policy
      }, effect as any, selfPath, diffs, queue)
      return
    }
  } catch { /* ignore and fallback */ }

  // Fallback: legacy builtins (kept for compatibility)
  switch (effect.type) {
    case 'set': {
      const targets = Array.isArray(effect.target) ? effect.target : [effect.target]
      targets.forEach((p) => {
        const abs = engine.resolveScopedPath(p, selfPath)
        const prev = getAt(engine.valuesObj, abs)
        const next = (typeof (effect as any).value === 'object' && (effect as any).value)
          ? compileExpr((effect as any).value as any)({ form: engine.valuesObj, selfPath })
          : (effect as any).value
        if (prev !== next) {
          setAt(engine.valuesObj, abs, next)
          diffs.values!.push({ path: abs, prev, next })
          if (queue) queue.add(abs)
        }
      })
      break
    }
    case 'patch':
    case 'setVisible':
    case 'setDisabled':
    case 'setRequired':
    case 'setReadOnly': {
      const key = Array.isArray((effect as any).target)
        ? engine.resolveScopedPath((effect as any).target[0], selfPath)
        : engine.resolveScopedPath((effect as any).target, selfPath)
      const prev = engine.stateObj[key]
      const patch: any = { ...(prev || {}) }
      if (effect.type === 'patch') {
        Object.assign(patch.patch ?? (patch.patch = {}), (effect as any).value)
      }
      if (effect.type === 'setVisible') patch.visible = (effect as any).value
      if (effect.type === 'setDisabled') patch.disabled = (effect as any).value
      if (effect.type === 'setRequired') patch.required = (effect as any).value
      if (effect.type === 'setReadOnly') patch.readOnly = (effect as any).value
      engine.stateObj[key] = patch
      diffs.state!.push({ path: key, prev, next: patch })
      // Policy: clear value on hide if configured
      if (effect.type === 'setVisible' && (effect as any).value === false && engine.policy?.onHide === 'clear') {
        const prevVal = getAt(engine.valuesObj, key)
        if (prevVal !== undefined) {
          deleteAt(engine.valuesObj, key)
          diffs.values!.push({ path: key, prev: prevVal, next: undefined })
          if (queue) queue.add(key)
        }
      }
      break
    }
    case 'setOptions': {
      const key = engine.resolveScopedPath((effect as any).target, selfPath)
      const prev = engine.stateObj[key]
      const patch: any = { ...(prev || {}) }
      patch.options = [...((effect as any).options || [])]
      engine.stateObj[key] = patch
      diffs.state!.push({ path: key, prev, next: patch })
      break
    }
    case 'validate': {
      const eff: any = effect
      const targets = eff.target ? (Array.isArray(eff.target) ? eff.target : [eff.target]) : []
      targets.forEach((t: string) => {
        const key = engine.resolveScopedPath(t, selfPath)
        const prev = engine.stateObj[key]
        const patch: any = { ...(prev || {}) }
        if (eff.message !== undefined) {
          const msg = (typeof eff.message === 'object')
            ? compileExpr(eff.message as any)({ form: engine.valuesObj, selfPath, state: engine.stateObj })
            : eff.message
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
        engine.stateObj[key] = patch
        diffs.state!.push({ path: key, prev, next: patch })
      })
      break
    }
    case 'addItem': {
      const eff: any = effect
      const key = engine.resolveScopedPath(eff.target, selfPath)
      const prevArr = getAt(engine.valuesObj, key)
      const arr = Array.isArray(prevArr) ? prevArr.slice() : []
      const idx = typeof eff.index === 'number' ? eff.index : arr.length
      arr.splice(idx, 0, eff.value)
      setAt(engine.valuesObj, key, arr)
      diffs.values!.push({ path: key, prev: prevArr, next: arr })
      queue?.add(key)
      engine.invalidateScopeCacheForPath?.(key)
      break
    }
    case 'removeItem': {
      const eff: any = effect
      const key = engine.resolveScopedPath(eff.target, selfPath)
      const prevArr = getAt(engine.valuesObj, key)
      if (Array.isArray(prevArr)) {
        const arr = prevArr.slice()
        arr.splice(eff.index, 1)
        setAt(engine.valuesObj, key, arr)
        diffs.values!.push({ path: key, prev: prevArr, next: arr })
        queue?.add(key)
        engine.invalidateScopeCacheForPath?.(key)
      }
      break
    }
    case 'splice': {
      const eff: any = effect
      const key = engine.resolveScopedPath(eff.target, selfPath)
      const prevArr = getAt(engine.valuesObj, key)
      const arr = Array.isArray(prevArr) ? prevArr.slice() : []
      const del = typeof eff.deleteCount === 'number' ? eff.deleteCount : 0
      const items = Array.isArray(eff.items) ? eff.items : []
      ;(arr as any[]).splice(eff.start, del, ...items)
      setAt(engine.valuesObj, key, arr)
      diffs.values!.push({ path: key, prev: prevArr, next: arr })
      queue?.add(key)
      engine.invalidateScopeCacheForPath?.(key)
      break
    }
    case 'setSchemaPatch': {
      const eff: any = effect
      engine.applySchemaPatch?.(eff.patch || [])
      break
    }
    default:
      break
  }
}

