import { buildPathRegistry } from '../../PathRegistry'
import { parsePattern } from '../../watch/PatternUtils'
import { compileSubtreeToRules } from '../../Compiler'
import { compileExpr } from '../../Expression'

/**
 * 应用 Schema Patch 到当前 schema 上
 * 并更新相关索引、规则等
 * @param engine
 * @param patch
 */
export function applySchemaPatch(
  engine: any,
  patch: Array<{ op: 'add' | 'replace' | 'remove'; path: string; value?: any }>
) {
  if (!Array.isArray(patch)) return

  const unescape = (s: string) => s.replace(/~1/g, '/').replace(/~0/g, '~')
  const getContainer = (obj: any, parts: string[]) => {
    let cur = obj
    for (let i = 0; i < parts.length - 1; i++) {
      const key = unescape(parts[i])
      if (key === '-') continue
      cur = cur[key]
    }
    return cur
  }
  try {
    // apply patch ops
    for (const op of patch) {
      const parts = (op.path || '').split('/').slice(1)
      const parent = getContainer(engine.schema as any, parts)
      const last = unescape(parts[parts.length - 1] || '')
      if (op.op === 'add' || op.op === 'replace') {
        if (Array.isArray(parent)) {
          const idx = last === '-' ? parent.length : Number(last)
          if (op.op === 'add') parent.splice(idx, 0, op.value)
          else parent[idx] = op.value
        } else {
          ;(parent as any)[last] = op.value
        }
      } else if (op.op === 'remove') {
        if (Array.isArray(parent)) {
          const idx = Number(last)
          parent.splice(idx, 1)
        } else {
          delete (parent as any)[last]
        }
      }
    }
    // 重建 path registry，找出新增和删除的 patterns
    const oldReg = engine.pathRegistry
    const newReg = buildPathRegistry(engine.schema)
    const oldSet = new Set(oldReg.patterns)
    const newSet = new Set(newReg.patterns)
    const removed: string[] = []
    const added: string[] = []
    oldReg.patterns.forEach((p: string) => {
      if (!newSet.has(p)) removed.push(p)
    })
    newReg.patterns.forEach((p: string) => {
      if (!oldSet.has(p)) added.push(p)
    })

    const removedRuleIds: string[] = []
    if (removed.length) {
      const toRemoveIdx = new Set<number>()
      for (const pat of removed) {
        const bucket = engine.ownerBuckets.get(firstSegment(pat))
        const keys = bucket ? (Array.from(bucket) as string[]) : []
        for (const key of keys) {
          if (key === pat || key.startsWith(`${pat}.`) || pat.startsWith(`${key}.`)) {
            const set = engine.ownerIndex.get(key)
            if (set) set.forEach((i: number) => toRemoveIdx.add(i))
          }
        }
      }
      toRemoveIdx.forEach((idx: number) => {
        const r = engine.rules[idx]
        if (!r) return
        ;(r as any).removed = true
        removedRuleIds.push(r.id)
        engine.removeCompiledRuleFromIndexes(idx)
      })
    }
    // 找出新增的规则
    const parentOf = (pat: string) => {
      const segs = pat.split('.')
      segs.pop()
      return segs.join('.')
    }
    const newlyCompiled: any[] = []
    added.forEach((pat) => {
      const node = engine.findSchemaByPattern(pat)
      if (!node) return
      const parent = parentOf(pat)
      const more = compileSubtreeToRules([node], parent, undefined)
      more.forEach((m: any) => {
        const cr: any = {
          raw: m,
          id: m.id,
          watch: Array.isArray(m.watch) ? m.watch.slice() : [],
          triggers: Array.isArray(m.trigger) ? m.trigger.slice() : [],
          when: m.when,
          whenFn: m.when ? compileExpr(m.when) : undefined,
          scope: m.scope,
          scopeTokens: m.scope ? parsePatternSafe(engine, m.scope) : undefined,
          patterns: []
        }
        newlyCompiled.push(cr)
        engine.rules.push(cr)
      })
    })
    // 更新 path registry
    engine.pathRegistry = newReg
    if (removed.length === 0 && newlyCompiled.length > 0) {
      try {
        const baseIdx = engine.rules.length - newlyCompiled.length
        newlyCompiled.forEach((_r, i) =>
          engine.addCompiledRuleToIndexes(engine.rules[baseIdx + i], baseIdx + i)
        )
      } catch {}
    }
    // 图增量更新
    try {
      const ex = engine.executor || engine.graph
      if (removedRuleIds.length && newlyCompiled.length === 0) {
        ex.removeRulesById?.(removedRuleIds)
      } else if (!removedRuleIds.length && newlyCompiled.length > 0) {
        ex.addCompiledRules?.(newlyCompiled)
      } else if (removedRuleIds.length && newlyCompiled.length > 0) {
        ex.removeRulesById?.(removedRuleIds)
        ex.addCompiledRules?.(newlyCompiled)
      } else {
        ex.buildFromCompiled?.(engine.rules)
      }
    } catch {
      try {
        engine.executor?.buildFromCompiled?.(engine.rules)
      } catch {}
    }
    // invalidate scope cache for affected patterns
    const affected = removed.concat(added)
    if (affected.length) {
      const affectedTokens = affected.map((p) => parsePatternSafe(engine, p))
      engine.rules.forEach((r: any, idx: number) => {
        if (!r.scopeTokens || !r.scopeTokens.length) return
        const hit = affectedTokens.some((tks: any) =>
          engine.scopeMatchesPrefix(r.scopeTokens!, tks as any)
        )
        if (hit) engine.scopeCache.delete(idx)
      })
    }
    engine.emitEvent('schema:patch', patch)
  } catch (e) {
    engine.emitEvent('schema:patch:error', e)
  }
}

// 获取路径的第一个段
function firstSegment(p: string): string {
  if (!p) return ''
  const i = p.indexOf('.')
  return i < 0 ? p : p.slice(0, i)
}

// 安全解析路径模式
function parsePatternSafe(engine: any, p: string) {
  try {
    return (engine.parsePattern || parsePattern)(p)
  } catch {
    return parsePattern(p)
  }
}
