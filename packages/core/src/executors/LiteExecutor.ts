import type { IExecutor, CompiledEntry } from './IExecutor'

export class LiteExecutor implements IExecutor {
  private compiled: CompiledEntry[] = []
  private lastCandidatesPath: string | null = null
  private lastCandidatesCount = 0
  private candidatesCalls = 0
  private topoCalls = 0
  private totalCandidatesSum = 0
  private totalBatches = 0
  private lastTopoDurationMs = 0
  buildFromCompiled(compiled: CompiledEntry[]): void { this.compiled = compiled.slice() }
  addCompiledRules(list: CompiledEntry[]): void { this.compiled.push(...list) }
  removeRulesById(ids: string[]): void { const set = new Set(ids); this.compiled = this.compiled.filter(c => !set.has(c.id)) }
  candidates(path: string): number[] { this.lastCandidatesPath = path; this.lastCandidatesCount = 0; this.candidatesCalls++; return [] }
  topoOrderFor(candidates: number[]): number[] {
    const t0 = Date.now()
    this.topoCalls++
    this.lastCandidatesCount = candidates.length
    this.totalCandidatesSum += candidates.length
    this.totalBatches++
    const ordered = candidates // lite: 保持输入顺序
    this.lastTopoDurationMs = Date.now() - t0
    return ordered
  }
  stats() {
    const avgCandidates = this.totalBatches ? (this.totalCandidatesSum / this.totalBatches) : 0
    return {
      type: 'lite',
      rules: this.compiled.length,
      lastCandidatesPath: this.lastCandidatesPath,
      lastCandidatesCount: this.lastCandidatesCount,
      candidatesCalls: this.candidatesCalls,
      topoCalls: this.topoCalls,
      avgCandidates,
      lastTopoDurationMs: this.lastTopoDurationMs
    }
  }
  exportDAG() { return { type: 'lite', edges: [], targets: {}, ruleDeps: {} } }
  exportSubgraphFor?(candidates: number[]): any { return { nodes: candidates, edges: [], ordered: candidates, orderedIds: candidates.map(String) } }
}
