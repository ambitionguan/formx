import type { RuleV2 } from '../core/Types'

export interface CompiledEntry { id: string; watch: string[]; raw: RuleV2 }

export interface IExecutor {
  buildFromCompiled(compiled: CompiledEntry[]): void
  addCompiledRules(list: CompiledEntry[]): void
  removeRulesById(ids: string[]): void
  candidates(path: string): number[]
  topoOrderFor(candidates: number[]): number[]
  stats(): any
  exportDAG(): any
  exportSubgraphFor?(candidates: number[]): any
}

