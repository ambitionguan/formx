import { parsePattern } from '../../watch/PatternUtils'
import { LiteExecutor } from '../../../executors/LiteExecutor'

export function buildWatchIndex(engine: any) {
  engine.watchIndex.clear()
  engine.patternWatchers.clear()
  engine.eventTriggers?.clear?.()
  ;(engine.rules || []).forEach((r: any, idx: number) => {
    // triggers as watch (change:x.y / event:xxx)
    ;(r.triggers || []).forEach((t: string) => {
      if (t.startsWith('change:')) {
        const p = t.slice('change:'.length)
        engine.watchIndex.add(p, idx)
      } else if (t.startsWith('event:')) {
        const name = t.slice('event:'.length)
        const arr = engine.eventTriggers.get(name) || []
        if (!arr.includes(idx)) arr.push(idx)
        engine.eventTriggers.set(name, arr)
      }
    })
    // normal watch + $self/$parent/$root 展开
    ;(r.watch || []).forEach((p: string) => {
      const expanded = engine.expandSelfScopeForPattern(p, r.scope)
      if (expanded.includes('[*]') || expanded.includes('[]')) {
        const tokens = parsePattern(expanded)
        r.patterns!.push(tokens)
        engine.patternWatchers.add(idx, tokens)
      } else {
        engine.watchIndex.add(expanded, idx)
      }
    })
  })
  selectExecutor(engine)
}

export function addCompiledRuleToIndexes(engine: any, r: any, idx: number) {
  ;(r.triggers || []).forEach((t: string) => {
    if (t.startsWith('change:')) {
      const p = t.slice('change:'.length)
      engine.watchIndex.add(p, idx)
    } else if (t.startsWith('event:')) {
      const name = t.slice('event:'.length)
      const arr = engine.eventTriggers.get(name) || []
      if (!arr.includes(idx)) arr.push(idx)
      engine.eventTriggers.set(name, arr)
    }
  })
  ;(r.watch || []).forEach((p: string) => {
    const expanded = engine.expandSelfScopeForPattern(p, r.scope)
    if (expanded.includes('[*]') || expanded.includes('[]')) {
      const tokens = parsePattern(expanded)
      r.patterns!.push(tokens)
      engine.patternWatchers.add(idx, tokens)
    } else {
      engine.watchIndex.add(expanded, idx)
    }
  })
  // owners
  const owners = engine.computeRuleOwners(r)
  engine.ruleOwners.set(idx, owners)
  owners.forEach((op: string) => {
    const set = engine.ownerIndex.get(op) || new Set<number>()
    set.add(idx)
    engine.ownerIndex.set(op, set)
    const bkey = firstSegment(op)
    const bset = engine.ownerBuckets.get(bkey) || new Set<string>()
    bset.add(op)
    engine.ownerBuckets.set(bkey, bset)
  })
  engine.ruleIdToIndex.set(r.id, idx)
}

export function removeCompiledRuleFromIndexes(engine: any, ruleIdx: number) {
  engine.watchIndex.removeRule(ruleIdx)
  engine.patternWatchers.removeRule(ruleIdx)
  // owners
  const owners = engine.ruleOwners.get(ruleIdx) || []
  owners.forEach((op: string) => {
    const set = engine.ownerIndex.get(op)
    if (!set) return
    set.delete(ruleIdx)
    if (set.size === 0) {
      engine.ownerIndex.delete(op)
      const bkey = firstSegment(op)
      const bset = engine.ownerBuckets.get(bkey)
      if (bset) {
        bset.delete(op)
        if (bset.size === 0) engine.ownerBuckets.delete(bkey)
        else engine.ownerBuckets.set(bkey, bset)
      }
    } else {
      engine.ownerIndex.set(op, set)
    }
  })
  engine.ruleOwners.delete(ruleIdx)
  // event triggers
  const nextTriggers = new Map<string, number[]>()
  engine.eventTriggers.forEach((arr: number[], key: string) => {
    const filtered = arr.filter((i) => i !== ruleIdx)
    if (filtered.length) nextTriggers.set(key, filtered)
  })
  engine.eventTriggers = nextTriggers
  // rule id
  const entries = Array.from(engine.ruleIdToIndex.entries())
  entries.forEach(([id, idx]) => { if (idx === ruleIdx) engine.ruleIdToIndex.delete(id) })
}

export function selectExecutor(engine: any) {
  const liteThreshold = engine.perf?.liteRuleThreshold ?? 30
  const hasRunAfter = (engine.rules || []).some((r: any) => Array.isArray(r?.raw?.options?.runAfter) && r.raw.options.runAfter.length > 0)
  const preferGraph = engine.perf?.useGraph === 'on'
    || (engine.perf?.useGraph !== 'off' && (hasRunAfter || engine.patternWatchers.length > 0 || engine.rules.length > liteThreshold))
  engine.executor = preferGraph ? (engine.graph as any) : new LiteExecutor()
  const compiled = (engine.rules || []).map((r: any) => ({ id: r.id, watch: r.watch.slice(), raw: r.raw }))
  try { engine.executor.buildFromCompiled(compiled) } catch {}
  // cycles event（graph 模式）
  try {
    const dag = engine.executor.exportDAG?.() || {}
    if (dag && Array.isArray(dag.cycles) && dag.cycles.length) {
      ;(engine as any).emitEvent?.('graph:cycles', dag.cycles)
      const ids = Array.isArray(dag.ruleIds) ? dag.ruleIds : []
      const detailed = dag.cycles.map((cy: number[]) => cy.map((i: number) => ids[i] ?? String(i)))
      ;(engine as any).emitEvent?.('graph:cycles:detail', detailed)
    }
  } catch {}
}

function firstSegment(p: string): string {
  if (!p) return ''
  const i = p.indexOf('.')
  return i < 0 ? p : p.slice(0, i)
}
