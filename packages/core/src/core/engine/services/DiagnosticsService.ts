import type { EngineDiagnostics } from '../../Types'

export function getDiagnostics(engine: any): EngineDiagnostics {
  const exec = { ...(engine.executor?.stats?.() || {}), dag: (engine.executor?.exportDAG?.() || {}), scopeRecalc: { totalInstances: (engine as any).diagScopeRecalcTotal || 0, last: (engine as any).diagScopeRecalcLast || null } }
  const traces = (engine.traces || []).slice()
  const durations = traces.map((t: any) => Number(t?.durationMs || 0)).filter((n: number) => n > 0).sort((a: number, b: number) => a - b)
  const pick = (p: number) => {
    if (!durations.length) return 0
    const idx = Math.min(durations.length - 1, Math.max(0, Math.floor((p / 100) * durations.length) - 1))
    return durations[idx]
  }
  const perfTrace = {
    count: durations.length,
    p50: pick(50),
    p95: pick(95),
    max: durations[durations.length - 1] || 0,
    last: traces.length ? (traces[traces.length - 1].durationMs || 0) : 0
  }
  return {
    rules: (engine.rules || []).map((r: any) => ({ id: r.id, watch: r.watch, scope: r.scope, hasWhen: !!r.when })),
    watchIndex: engine.watchIndex?.dumpEntries?.() || [],
    patternWatchers: engine.patternWatchers?.count?.() || 0,
    graph: exec,
    executor: exec,
    pathRegistry: { count: engine.pathRegistry?.nodes?.length || 0, patterns: engine.pathRegistry?.patterns || [] },
    policy: engine.policy,
    perf: engine.perf,
    traces,
    perfTrace
  }
}
