import type { RuleV2 } from '../core/Types'

/**
 * GraphExecutor (skeleton)
 * Intended to build a dependency DAG: value paths -> rule nodes -> value/state paths
 * Current Engine already supports incremental propagation; GraphExecutor will be
 * used when rules >= threshold or wildcard/aggregation is present, to shrink
 * recomputation to affected subgraph.
 */
export class GraphExecutor {
  private rules: RuleV2[] = []
  private ruleIds: string[] = []
  // keep original compiled view for potential incremental APIs
  private compiled: Array<{ id: string; watch: string[]; raw: RuleV2 }> = []
  // rule -> targets (value/state paths or scoped placeholders)
  private targets: Map<number, string[]> = new Map()
  // compiled watchers support
  private compiledSources: Map<string, number[]> = new Map()
  // wildcard pattern watchers (expanded) – tokens matcher
  private patternWatchers: Array<{ ruleIdx: number; tokens: Array<string | number | symbol> }> = []
  // buckets for wildcard watchers by first literal segment
  private patternBuckets: Map<string, Array<{ ruleIdx: number; tokens: Array<string | number | symbol> }>> = new Map()
  // var deps in when expressions: path -> rule indices
  private whenSources: Map<string, number[]> = new Map()
  // target prefixes index: prefix path -> publisher rule indices
  private targetPrefixes: Map<string, number[]> = new Map()
  // watch prefixes index: prefix path -> watcher rule indices (compiledSources + whenSources)
  private watchPrefixes: Map<string, number[]> = new Map()
  // rule-level dependency: rule A -> rules that should be evaluated after A because A's targets may affect their watch/when
  private ruleDeps: Map<number, Set<number>> = new Map()
  private cycles: number[][] = []
  // ruleIdx -> global topological rank (smaller rank executes earlier)
  private globalOrderIndex: Int32Array = new Int32Array(0)
  // perf counters
  private lastAddMs = 0
  private lastRemoveMs = 0
  private lastAdded = 0
  private lastRemoved = 0
  private lastAddHitsOut = 0
  private lastAddHitsIn = 0
  private lastRemoveWatchBuckets = 0
  private lastRemoveTargetPrefixes = 0

  constructor() {}

  build(_rules: RuleV2[]) { /* legacy noop */ }

  buildFromCompiled(compiled: Array<{ id: string; watch: string[]; raw: RuleV2 }>) {
    // 保持与 Engine.rules 的索引一致（跳过 removed 但不压缩索引），以便 candidates() 返回的下标可直接用于 Engine
    this.compiled = compiled.slice()
    this.rules = compiled.map((c) => c.raw)
    this.ruleIds = compiled.map((c: any) => c?.id)
    this.compiledSources.clear()
    this.patternWatchers = []
    this.patternBuckets.clear()
    this.targets.clear()
    this.whenSources.clear()
    this.targetPrefixes.clear()
    this.watchPrefixes.clear()
    this.cycles = []
    compiled.forEach((c: any, idx: number) => {
      if (!c || c.removed) return
      const watches = c.watch || []
      watches.forEach((p: string) => {
        const expanded = expandSelfScope(p, c.raw.scope)
        if (isPattern(expanded)) {
          const tokens = parsePattern(expanded)
          const entry = { ruleIdx: idx, tokens }
          this.patternWatchers.push(entry)
          const firstLit = tokens.find((t) => typeof t === 'string') as string | undefined
          const key = firstLit || '*'
          const arr = this.patternBuckets.get(key) || []
          arr.push(entry)
          this.patternBuckets.set(key, arr)
        } else {
          const arr = this.compiledSources.get(expanded) || []
          arr.push(idx)
          this.compiledSources.set(expanded, arr)
          // watch prefix buckets
          this.addWatchPrefixes(idx, expanded)
        }
      })
      // trigger dependencies (change:)
      const triggers = Array.isArray(c.raw.trigger) ? c.raw.trigger : (c.raw.trigger ? [c.raw.trigger] : [])
      triggers.forEach((t: any) => {
        if (typeof t !== 'string' || !t.startsWith('change:')) return
        const path = t.slice('change:'.length)
        const expanded = expandSelfScope(path, c.raw.scope)
        if (expanded) this.addWatchPrefixes(idx, expanded)
      })

      // when var deps (respect autoWatch flag)
      const allowAutoWatch = c.raw?.options?.autoWatch !== false
      if (allowAutoWatch) {
        const deps = collectVarDeps(c.raw.when)
        deps.forEach((p: string) => {
          const expanded = expandSelfScope(p, c.raw.scope)
          if (!expanded) return
          const arr = this.whenSources.get(expanded) || []
          arr.push(idx)
          this.whenSources.set(expanded, arr)
          this.addWatchPrefixes(idx, expanded)
        })
      }
      const ts: string[] = []
      const normalizeTarget = (target: string) => {
        const expanded = expandSelfScope(target, c.raw.scope)
        return expanded || target
      }
      const pushTargets = (effs: any[]) => {
        ;(effs || []).forEach((e: any) => {
          if (typeof e?.target === 'string') ts.push(normalizeTarget(e.target))
          else if (Array.isArray(e?.target)) {
            e.target.forEach((t: any) => { if (typeof t === 'string') ts.push(normalizeTarget(t)) })
          }
        })
      }
      pushTargets(c.raw.effects || [])
      pushTargets((c.raw as any).elseEffects || [])
      this.targets.set(idx, ts)
      // index target prefixes for fast inbound linking
      ts.forEach((tp) => this.addTargetPrefixes(idx, tp))
    })

    // build ruleDeps by target->watch intersection (prefix match on segments)
    this.ruleDeps.clear()
    // out edges by prefixes: targetPrefixes x watchPrefixes intersection via loop on target prefixes

    // for each rule's targets, link to watchers by prefix
    this.targets.forEach((tpaths, ri) => {
      const deps = this.ruleDeps.get(ri) || new Set<number>()
      tpaths.forEach((tp) => {
        const segs = tp.split('.')
        for (let i = segs.length; i >= 1; i--) {
          const pre = segs.slice(0, i).join('.')
          const arr = this.watchPrefixes.get(pre) || []
          arr.forEach((wj) => { if (wj !== ri) deps.add(wj) })
        }
      })
      if (deps.size) this.ruleDeps.set(ri, deps)
    })

    // honor runAfter ordering
    const idToIndex = new Map<string, number>()
    this.ruleIds.forEach((id, i) => { if (id != null) idToIndex.set(id, i) })
    this.compiled.forEach((c: any, idx: number) => {
      const after = c?.raw?.options?.runAfter
      if (!Array.isArray(after) || after.length === 0) return
      after.forEach((rid: string) => {
        const srcIdx = idToIndex.get(rid)
        if (srcIdx == null) return
        const deps = this.ruleDeps.get(srcIdx) || new Set<number>()
        deps.add(idx)
        this.ruleDeps.set(srcIdx, deps)
      })
    })

    this.computeGlobalTopology()
  }

  /**
   * Incrementally append compiled rules and update watchers/targets/edges.
   */
  addCompiledRules(list: Array<{ id: string; watch: string[]; raw: RuleV2 }>) {
    if (!Array.isArray(list) || list.length === 0) return
    const t0 = Date.now()
    const start = this.compiled.length
    const pushUnique = (arr: number[], v: number) => { if (!arr.includes(v)) arr.push(v) }
    let hitsOut = 0
    let hitsIn = 0
    list.forEach((c, i) => {
      const idx = start + i
      this.compiled.push({ ...c })
      this.rules[idx] = c.raw
      this.ruleIds[idx] = c.id
      // watchers
      const watches = c.watch || []
      watches.forEach((p) => {
        const expanded = expandSelfScope(p, c.raw.scope)
        if (isPattern(expanded)) {
          const tokens = parsePattern(expanded)
          const entry = { ruleIdx: idx, tokens }
          this.patternWatchers.push(entry)
          const firstLit = tokens.find((t) => typeof t === 'string') as string | undefined
          const key = firstLit || '*'
          const arr = this.patternBuckets.get(key) || []
          arr.push(entry)
          this.patternBuckets.set(key, arr)
        } else {
          const arr = this.compiledSources.get(expanded) || []
          pushUnique(arr, idx)
          this.compiledSources.set(expanded, arr)
          this.addWatchPrefixes(idx, expanded)
        }
      })
      // trigger dependencies (change:)
      const triggerDeps: string[] = []
      const triggers = Array.isArray(c.raw.trigger) ? c.raw.trigger : (c.raw.trigger ? [c.raw.trigger] : [])
      triggers.forEach((t: any) => {
        if (typeof t !== 'string' || !t.startsWith('change:')) return
        const path = t.slice('change:'.length)
        const expanded = expandSelfScope(path, c.raw.scope)
        if (!expanded) return
        triggerDeps.push(expanded)
        this.addWatchPrefixes(idx, expanded)
      })

      // when deps (respect autoWatch flag)
      const whenDeps: string[] = []
      const allowAutoWatch = c.raw?.options?.autoWatch !== false
      if (allowAutoWatch) {
        const deps = collectVarDeps(c.raw.when)
        deps.forEach((p: string) => {
          const expanded = expandSelfScope(p, c.raw.scope)
          if (!expanded) return
          whenDeps.push(expanded)
          const arr = this.whenSources.get(expanded) || []
          pushUnique(arr, idx)
          this.whenSources.set(expanded, arr)
          this.addWatchPrefixes(idx, expanded)
        })
      }
      // targets
      const ts: string[] = []
      const normalizeTarget = (target: string) => {
        const expanded = expandSelfScope(target, c.raw.scope)
        return expanded || target
      }
      const pushTargets = (effs: any[]) => {
        ;(effs || []).forEach((e: any) => {
          if (typeof e?.target === 'string') ts.push(normalizeTarget(e.target))
          else if (Array.isArray(e?.target)) {
            e.target.forEach((t: any) => { if (typeof t === 'string') ts.push(normalizeTarget(t)) })
          }
        })
      }
      pushTargets(c.raw.effects || [])
      pushTargets((c.raw as any).elseEffects || [])
      this.targets.set(idx, ts)
      ts.forEach((tp) => this.addTargetPrefixes(idx, tp))
      // deps: outbound from this rule's targets（新→旧），用 watchPrefixes 加速
      const depsSet = this.ruleDeps.get(idx) || new Set<number>()
      ts.forEach((tp) => {
        const segs = tp.split('.')
        for (let k = segs.length; k >= 1; k--) {
          const pre = segs.slice(0, k).join('.')
          const arr = this.watchPrefixes.get(pre) || []
          hitsOut += arr.length
          arr.forEach((wj) => { if (wj !== idx) depsSet.add(wj) })
        }
      })
      if (depsSet.size) this.ruleDeps.set(idx, depsSet)
      // deps: inbound to this rule（旧→新），用 targetPrefixes 加速
      const inSet = new Set<number>()
      const allInboundPaths: string[] = []
      watches.forEach((p) => {
        const expanded = expandSelfScope(p, c.raw.scope)
        if (expanded) allInboundPaths.push(expanded)
      })
      allInboundPaths.push(...whenDeps, ...triggerDeps)
      allInboundPaths.forEach((expanded) => {
        if (!expanded || isPattern(expanded)) return // 不处理通配
        const pubs = this.targetPrefixes.get(expanded) || []
        hitsIn += pubs.length
        pubs.forEach((ri) => { if (ri !== idx) inSet.add(ri) })
      })
      inSet.forEach((ri) => {
        const outs = this.ruleDeps.get(ri) || new Set<number>()
        outs.add(idx)
        this.ruleDeps.set(ri, outs)
      })
    })
    this.computeGlobalTopology()
    this.lastAddMs = Date.now() - t0
    this.lastAdded = list.length
    this.lastAddHitsOut = hitsOut
    this.lastAddHitsIn = hitsIn
  }
  /**
   * Incrementally remove rules by id and update watchers/targets/edges.
   */
  removeRulesById(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) return
    const t0 = Date.now()
    const idToIndex = new Map<string, number>()
    this.ruleIds.forEach((id, i) => { if (id != null) idToIndex.set(id, i) })
    const idxs: number[] = []
    ids.forEach((id) => { const i = idToIndex.get(id); if (i != null) idxs.push(i) })
    const removeFromMapArray = (map: Map<string, number[]>, idx: number) => {
      let removed = 0
      map.forEach((arr, key) => {
        const pos = arr.indexOf(idx)
        if (pos >= 0) { arr.splice(pos, 1); removed += 1; if (arr.length === 0) map.delete(key); else map.set(key, arr) }
      })
      return removed
    }
    let totalWatchBucketRemovals = 0
    let totalTargetPrefixRemovals = 0
    idxs.forEach((idx) => {
      const c: any = this.compiled[idx]
      if (!c || c.removed) return
      c.removed = true
      // remove watchers
      removeFromMapArray(this.compiledSources, idx)
      removeFromMapArray(this.whenSources, idx)
      totalWatchBucketRemovals += removeFromMapArray(this.watchPrefixes, idx)
      // pattern watchers
      this.patternWatchers = this.patternWatchers.filter((pw) => pw.ruleIdx !== idx)
      const newBuckets: Map<string, Array<{ ruleIdx: number; tokens: Array<string | number | symbol> }>> = new Map()
      this.patternWatchers.forEach((pw) => {
        const firstLit = pw.tokens.find((t) => typeof t === 'string') as string | undefined
        const key = firstLit || '*'
        const arr = newBuckets.get(key) || []
        arr.push(pw)
        newBuckets.set(key, arr)
      })
      this.patternBuckets = newBuckets
      // remove targets and targetPrefixes
      const ts = this.targets.get(idx) || []
      ts.forEach((tp) => { totalTargetPrefixRemovals += this.removeTargetPrefixes(idx, tp) })
      this.targets.delete(idx)
      // remove ruleDeps
      this.ruleDeps.delete(idx)
      this.ruleDeps.forEach((set) => set.delete(idx))
    })
    this.computeGlobalTopology()
    this.lastRemoveMs = Date.now() - t0
    this.lastRemoved = ids.length
    this.lastRemoveWatchBuckets = totalWatchBucketRemovals
    this.lastRemoveTargetPrefixes = totalTargetPrefixRemovals
  }

  /**
   * Return candidate rules when a value path changed.
   * (Wildcard and scoped resolution are delegated to Engine for now.)
   */
  candidates(path: string): number[] {
    const res = new Set<number>()
    const segs = path.split('.')
    for (let i = segs.length; i >= 1; i--) {
      const p = segs.slice(0, i).join('.')
      const carr = this.compiledSources.get(p)
      if (carr) carr.forEach((j) => res.add(j))
      const warr = this.whenSources.get(p)
      if (warr) warr.forEach((j) => res.add(j))
      // also try container-level path by stripping index brackets (e.g., a.b[2] -> a.b)
      const p2 = p.replace(/\[\d+\]/g, '')
      if (p2 !== p) {
        const carr2 = this.compiledSources.get(p2)
        if (carr2) carr2.forEach((j) => res.add(j))
        const warr2 = this.whenSources.get(p2)
        if (warr2) warr2.forEach((j) => res.add(j))
      }
    }
    // wildcard patterns
    const pathTokens = tokenize(path)
    const first = pathTokens[0]
    const list: Array<{ ruleIdx: number; tokens: Array<string | number | symbol> }> = []
    if (typeof first === 'string') {
      const hit = this.patternBuckets.get(first)
      if (hit) list.push(...hit)
    }
    const generic = this.patternBuckets.get('*')
    if (generic) list.push(...generic)
    for (const pw of list) {
      if (matchTokens(pw.tokens, pathTokens)) res.add(pw.ruleIdx)
    }
    return Array.from(res)
  }

  getTargets(ruleIdx: number): string[] {
    return this.targets.get(ruleIdx) || []
  }

  stats() {
    return {
      type: 'graph',
      rules: this.rules.length,
      compiledSources: this.compiledSources.size,
      whenSources: this.whenSources.size,
      watchPrefixes: this.watchPrefixes.size,
      targetPrefixes: this.targetPrefixes.size,
      patternWatchers: this.patternWatchers.length,
      ruleDeps: this.ruleDeps.size,
      cycles: this.cycles.length,
      lastAddMs: this.lastAddMs,
      lastAddHitsOut: this.lastAddHitsOut,
      lastAddHitsIn: this.lastAddHitsIn,
      lastRemoveMs: this.lastRemoveMs,
      lastAdded: this.lastAdded,
      lastRemoved: this.lastRemoved,
      lastRemoveWatchBuckets: this.lastRemoveWatchBuckets,
      lastRemoveTargetPrefixes: this.lastRemoveTargetPrefixes
    }
  }

  exportDAG() {
    const edges: Array<{ source: string; rules: number[] }> = []
    const add = (map: Map<string, number[]>) => {
      map.forEach((rs, src) => edges.push({ source: src, rules: Array.from(new Set(rs)) }))
    }
    add(this.compiledSources)
    add(this.whenSources)
    const targets: Record<number, string[]> = {}
    this.targets.forEach((ts, idx) => { targets[idx] = ts.slice() })
    const ruleDeps: Record<number, number[]> = {}
    this.ruleDeps.forEach((ds, idx) => { ruleDeps[idx] = Array.from(ds) })
    return { edges, targets, ruleDeps, cycles: this.cycles, ruleIds: this.ruleIds }
  }

  /**
   * Given a set of changed target paths, compute next rules likely impacted.
   */
  nextRulesFromTargets(paths: string[]): number[] {
    const res = new Set<number>()
    paths.forEach((p) => this.candidates(p).forEach((ri) => res.add(ri)))
    return Array.from(res)
  }

  /**
   * Compute a topological order for a subset of rules by precomputed global rank.
   */
  topoOrderFor(candidates: number[]): number[] {
    if (!candidates || candidates.length <= 1) return candidates
    const limit = this.globalOrderIndex.length
    return candidates.slice().sort((a, b) => {
      const ra = (a >= 0 && a < limit) ? this.globalOrderIndex[a] : 0x7fffffff
      const rb = (b >= 0 && b < limit) ? this.globalOrderIndex[b] : 0x7fffffff
      if (ra !== rb) return ra - rb
      return a - b
    })
  }

  /**
   * Compute global topological ranks for active rules.
   * Rules in cycles (or blocked by cycles) are deterministically ranked at the end.
   */
  private computeGlobalTopology() {
    const n = this.rules.length
    if (this.globalOrderIndex.length !== n) this.globalOrderIndex = new Int32Array(n)
    this.globalOrderIndex.fill(0x7fffffff)
    if (n === 0) {
      this.cycles = []
      return
    }

    const inDegree = new Int32Array(n)
    const active = new Uint8Array(n)
    let activeCount = 0

    for (let i = 0; i < n; i++) {
      if (this.compiled[i] && !(this.compiled[i] as any).removed) {
        active[i] = 1
        activeCount += 1
      }
    }

    this.ruleDeps.forEach((deps, src) => {
      if (!active[src]) return
      deps.forEach((target) => {
        if (target >= 0 && target < n && active[target]) inDegree[target] += 1
      })
    })

    const queue: number[] = []
    for (let i = 0; i < n; i++) {
      if (active[i] && inDegree[i] === 0) queue.push(i)
    }

    let rank = 0
    let processedCount = 0
    let qHead = 0
    while (qHead < queue.length) {
      const u = queue[qHead++]
      this.globalOrderIndex[u] = rank++
      processedCount += 1
      const deps = this.ruleDeps.get(u)
      if (!deps) continue
      deps.forEach((v) => {
        if (!active[v]) return
        inDegree[v] -= 1
        if (inDegree[v] === 0) queue.push(v)
      })
    }

    if (processedCount < activeCount) {
      for (let i = 0; i < n; i++) {
        if (active[i] && inDegree[i] > 0) this.globalOrderIndex[i] = rank++
      }
      this.cycles = this.detectCycles()
      return
    }

    this.cycles = []
  }

  private detectCycles(): number[][] {
    const res: number[][] = []
    const color = new Map<number, number>() // 0=unvisited,1=visiting,2=done
    const stack: number[] = []
    const adj = this.ruleDeps
    const visit = (u: number) => {
      color.set(u, 1)
      stack.push(u)
      const outs = adj.get(u)
      if (outs) {
        outs.forEach((v) => {
          const c = color.get(v) || 0
          if (c === 0) visit(v)
          else if (c === 1) {
            // found cycle, collect from stack last occurrence of v
            const idx = stack.lastIndexOf(v)
            if (idx >= 0) res.push(stack.slice(idx).concat([v]))
          }
        })
      }
      stack.pop()
      color.set(u, 2)
    }
    // run on all nodes that have deps
    const nodes = new Set<number>()
    this.ruleDeps.forEach((_outs, u) => nodes.add(u))
    this.ruleDeps.forEach((outs) => outs.forEach((v) => nodes.add(v)))
    nodes.forEach((n) => { if ((color.get(n) || 0) === 0) visit(n) })
    return res
  }

  /**
   * Export restricted subgraph for given candidates: nodes/edges/topo order with rule ids.
   */
  exportSubgraphFor(candidates: number[]) {
    const candSet = new Set(candidates)
    const nodes = Array.from(candSet).map((i) => ({ idx: i, id: this.ruleIds[i] }))
    const edges: Array<{ from: number; to: number }> = []
    candidates.forEach((ri) => {
      const deps = this.ruleDeps.get(ri)
      if (!deps) return
      deps.forEach((dj) => { if (candSet.has(dj)) edges.push({ from: ri, to: dj }) })
    })
    const ordered = this.topoOrderFor(candidates)
    const orderedIds = ordered.map((i) => this.ruleIds[i])
    return { nodes, edges, ordered, orderedIds }
  }

  // ----- helpers -----
  private addWatchPrefixes(idx: number, path: string) {
    const segs = path.split('.')
    for (let i = segs.length; i >= 1; i--) {
      const pre = segs.slice(0, i).join('.')
      const arr = this.watchPrefixes.get(pre) || []
      if (!arr.includes(idx)) arr.push(idx)
      this.watchPrefixes.set(pre, arr)
    }
  }
  private addTargetPrefixes(idx: number, path: string) {
    const segs = path.split('.')
    for (let i = segs.length; i >= 1; i--) {
      const pre = segs.slice(0, i).join('.')
      const arr = this.targetPrefixes.get(pre) || []
      if (!arr.includes(idx)) arr.push(idx)
      this.targetPrefixes.set(pre, arr)
    }
  }
  private removeTargetPrefixes(idx: number, path: string) {
    const segs = path.split('.')
    let removed = 0
    for (let i = segs.length; i >= 1; i--) {
      const pre = segs.slice(0, i).join('.')
      const arr = this.targetPrefixes.get(pre)
      if (!arr) continue
      const pos = arr.indexOf(idx)
      if (pos >= 0) { arr.splice(pos, 1); removed += 1 }
      if (arr.length === 0) this.targetPrefixes.delete(pre)
      else this.targetPrefixes.set(pre, arr)
    }
    return removed
  }
}

// local helper
function collectVarDeps(expr: any, out: Set<string> = new Set()): string[] {
  if (!expr) return Array.from(out)
  if (Array.isArray(expr)) { expr.forEach((e) => collectVarDeps(e, out)); return Array.from(out) }
  if (typeof expr === 'object') {
    if (Object.prototype.hasOwnProperty.call(expr, 'var')) {
      const v = (expr as any)['var']
      if (typeof v === 'string') out.add(v)
    }
    Object.keys(expr).forEach((k) => { if (k !== 'var') collectVarDeps((expr as any)[k], out) })
  }
  return Array.from(out)
}

// match helpers (replicated minimal from Engine)
const ANY: unique symbol = Symbol('any')
const ANY_SEG: unique symbol = Symbol('any_seg')
const ANY_DEEP: unique symbol = Symbol('any_deep')

function parsePattern(p: string): Array<string | number | symbol> {
  const tokens: Array<string | number | symbol> = []
  const parts = p.split('.')
  for (const part of parts) {
    if (part === '*') { tokens.push(ANY_SEG); continue }
    if (part === '**') { tokens.push(ANY_DEEP); continue }
    const m = part.match(/^(\w+)(\[(\*|\d+)?\])?$/)
    if (m) {
      tokens.push(m[1])
      if (m[2]) {
        if (!m[3] || m[3] === '*') tokens.push(ANY)
        else tokens.push(Number(m[3]))
      }
    } else {
      tokens.push(part)
    }
  }
  return tokens
}

function matchTokens(pattern: Array<string | number | symbol>, path: Array<string | number>): boolean {
  return matchFrom(0, 0)
  function matchFrom(pi: number, si: number): boolean {
    if (pi === pattern.length) return si <= path.length
    const token = pattern[pi]
    if (token === ANY_DEEP) {
      for (let k = si; k <= path.length; k++) { if (matchFrom(pi + 1, k)) return true }
      return false
    }
    if (si >= path.length) return false
    const seg = path[si]
    if (token === ANY_SEG) return matchFrom(pi + 1, si + 1)
    if (token === ANY) { if (typeof seg !== 'number') return false; return matchFrom(pi + 1, si + 1) }
    if (token !== seg) return false
    return matchFrom(pi + 1, si + 1)
  }
}

function tokenize(path: string): Array<string | number> {
  if (!path) return []
  const out: Array<string | number> = []
  const parts = path.split('.')
  for (const part of parts) {
    const re = /(\w+)(\[(\d+)\])?/g
    let m: RegExpExecArray | null
    let matched = false
    while ((m = re.exec(part))) {
      matched = true
      out.push(m[1])
      if (m[3] !== undefined) out.push(Number(m[3]))
    }
    if (!matched) out.push(part)
  }
  return out
}

function expandSelfScope(p: string, scope?: string): string {
  if (p.startsWith('$root.')) return p.slice(6)
  if (p === '$self') return scope || ''
  if (p.startsWith('$self.')) return (scope ? scope + '.' : '') + p.slice(6)
  if (p.startsWith('$parent.')) {
    if (!scope) return p.slice(8)
    const toks = scope.split('.')
    toks.pop() // parent of scope
    const base = toks.join('.')
    const sub = p.slice(8)
    if (!base) return sub
    if (sub === base || sub.startsWith(base + '.')) return sub
    return base + '.' + sub
  }
  return p
}

function isPattern(p: string): boolean { return p.includes('[]') || p.includes('[*]') || p.includes('**') }
