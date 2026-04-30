import { tokenize } from '../../Path'

// Service: rule execution helpers extracted from Engine
// We keep it stateless; all data comes from the passed engine instance (typed as any to avoid circular deps)

type Diff = {
  event: string
  payload?: any
  values?: Array<{ path: string; prev: any; next: any }>
  state?: Array<{ path: string; prev: any; next: any }>
}

export function runAllRules(engine: any, diffs: Diff, queue?: Set<string>) {
  const rules = engine.rules as any[]
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i]
    if (!r || (r as any).removed) continue
    if (r.scopeTokens && r.scopeTokens.length) {
      const selfPaths = engine.getOrComputeSelfPaths(i, r)
      if (selfPaths.length === 0) continue
      for (const sp of selfPaths) evalAndApplyWithContext(engine, r, sp, diffs, queue)
    } else {
      evalAndApply(engine, r, diffs, queue)
    }
  }
}

export function runRulesForEvent(engine: any, name: string, diffs: Diff, queue?: Set<string>) {
  const list = (engine.eventTriggers?.get?.(name) || []).slice()
  for (const idx of list) {
    const rule = engine.rules[idx]
    if (!rule || (rule as any).removed) continue
    if (rule.scopeTokens && rule.scopeTokens.length) {
      const selfPaths = engine.getOrComputeSelfPaths(idx, rule)
      for (const sp of selfPaths) evalAndApplyWithContext(engine, rule, sp, diffs, queue)
    } else {
      evalAndApply(engine, rule, diffs, queue)
    }
  }
}

export function runRulesForPath(engine: any, path: string, diffs: Diff, queue?: Set<string>) {
  const set = new Set<number>()
  engine.watchIndex.candidatesForPath(path).forEach((i: number) => set.add(i))
  // executor candidates (graph or lite)
  ;(engine.executor?.candidates?.(path) || []).forEach((idx: number) => set.add(idx))
  // wildcard patterns - check bucket by first literal segment
  const pathTokens = tokenize(path)
  engine.patternWatchers.candidatesForPathTokens(pathTokens).forEach((ri: number) => set.add(ri))
  // Evaluate in topological order if possible (restricted to selected candidates)
  const ordered = engine.executor?.topoOrderFor?.(Array.from(set)) || Array.from(set)
  const changedTokens = tokenize(path)
  for (const idx of ordered) {
    const rule = engine.rules[idx]
    if (!rule || (rule as any).removed) continue
    if (rule.scopeTokens && rule.scopeTokens.length) {
      const self = engine.deriveSelfPath(rule.scopeTokens, changedTokens)
      // 命中通配：可能需要对父容器下的所有实例重算
      let hitPattern = false
      if (rule.patterns && rule.patterns.length) {
        hitPattern = rule.patterns.some((tks: any) => engine.matchTokens(tks as any, changedTokens))
      }
      if (self && !hitPattern) {
        evalAndApplyWithContext(engine, rule, path, diffs, queue)
      } else if (self && hitPattern) {
        let selfPaths = engine.getOrComputeSelfPaths(idx, rule)
        // siblings-only 优化：仅重算同一父容器（利用 Engine 的按父容器分组缓存）
        if ((engine.perf?.recalcScope || 'all') === 'siblings') {
          selfPaths = engine.getSiblingSelfPaths(idx, self)
        }
        // 统计收集
        try {
          engine.diagScopeRecalcTotal += selfPaths.length
          engine.diagScopeRecalcLast = { ruleId: rule.id, instances: selfPaths.length, reason: 'pattern', path }
        } catch {}
        for (const sp of selfPaths) evalAndApplyWithContext(engine, rule, sp, diffs, queue)
      } else if (engine.pathMayAffectScope(changedTokens, rule.scopeTokens)) {
        const selfPaths = engine.getOrComputeSelfPaths(idx, rule)
        try {
          engine.diagScopeRecalcTotal += selfPaths.length
          engine.diagScopeRecalcLast = { ruleId: rule.id, instances: selfPaths.length, reason: 'container', path }
        } catch {}
        for (const sp of selfPaths) evalAndApplyWithContext(engine, rule, sp, diffs, queue)
      }
    } else {
      evalAndApplyWithContext(engine, rule, path, diffs, queue)
    }
  }
}

function evalAndApply(engine: any, rule: any, diffs: Diff, queue?: Set<string>) {
  const cond = rule.when
  const whenTrue = cond ? !!(rule.whenFn ? rule.whenFn({ form: engine.valuesObj }) : engine.evaluateExpr(cond, { form: engine.valuesObj })) : true
  const exec = whenTrue ? rule.raw.effects : (rule.raw.elseEffects || [])
  if (!exec || exec.length === 0) return
  exec.forEach((eff: any) => engine.applyEffect(eff, diffs, undefined, queue))
  engine.noteRule(rule.id, undefined, whenTrue, exec.length)
}

function evalAndApplyWithContext(engine: any, rule: any, changedPath: string, diffs: Diff, queue?: Set<string>) {
  let selfPath: string | undefined
  if (rule.scopeTokens) {
    const changedTokens = tokenize(changedPath)
    selfPath = engine.deriveSelfPath(rule.scopeTokens, changedTokens)
  }
  const cond = rule.when
  const whenTrue = cond ? !!(rule.whenFn ? rule.whenFn({ form: engine.valuesObj, selfPath }) : engine.evaluateExpr(cond, { form: engine.valuesObj, selfPath })) : true
  const exec = whenTrue ? rule.raw.effects : (rule.raw.elseEffects || [])
  if (!exec || exec.length === 0) return
  exec.forEach((eff: any) => engine.applyEffect(eff, diffs, selfPath, queue))
  engine.noteRule(rule.id, selfPath, whenTrue, exec.length)
}
