import type {
  FormSchema,
  EnginePerformanceOptions,
  RuleV2,
  Effect,
  EnginePolicyOptions,
  EngineDiagnostics,
  FormXMessageOptions,
  FormXMessageResolver
} from './Types'
import { ValidatorRegistry } from './validators/ValidatorRegistry'
import type { PatternInput, ValidatorDefinition, ValidatorFn } from './validators/ValidatorRegistry'
import { evaluateExpr, compileExpr } from './Expression'
import { getAt, setAt, deleteAt, tokenize, stringifyTokens } from './Path'
import { compileSchemaToRules } from './Compiler'
import { buildPathRegistry } from './PathRegistry'
import type { PathRegistry } from './PathRegistry'
import { GraphExecutor } from '../executors/GraphExecutor'
import type { IExecutor } from '../executors/IExecutor'
import { LiteExecutor } from '../executors/LiteExecutor'
import { WatchIndex } from './watch/WatchIndex'
import { PatternWatchers } from './watch/PatternWatchers'
import { parsePattern, matchTokens } from './watch/PatternUtils'
import { ResourceManager } from './ResourceManager'
import { registerBuiltinEffects } from './effects/builtins'
import { Scheduler } from './scheduler/Scheduler'
import { normalizeFormXMessageResolver, setFormXMessageResolver } from './MessageResolver'
import * as WatchService from './engine/services/WatchService'
import * as ValidationService from './engine/services/ValidationService'
import * as SchemaPatchService from './engine/services/SchemaPatchService'
import * as DiagnosticsService from './engine/services/DiagnosticsService'
import * as RuleExecService from './engine/services/RuleExecService'
import * as EffectApplierService from './engine/services/EffectApplierService'
import * as EventBusService from './engine/services/EventBusService'
import {
  deriveSelfPath as deriveSelfPathSvc,
  scopeMatchesPrefix as scopeMatchesPrefixSvc,
  pathMayAffectScope as pathMayAffectScopeSvc,
  expandSelfScopeForPattern as expandSelfScopeForPatternSvc,
  resolveScopedPath as resolveScopedPathSvc
} from './engine/services/ScopeResolverService'
import { resolveParams as resolveParamsSvc } from './engine/services/ParamsResolver'
// 确保内置的 effect 只在模块加载时注册一次
registerBuiltinEffects()

type Diff = {
  event: string
  payload?: any
  values?: Array<{ path: string; prev: any; next: any }>
  state?: Array<{ path: string; prev: any; next: any }>
}

type TraceEntry = {
  ts: number
  event: string
  rulesEvaluated: Array<{ id: string; self?: string; when?: boolean; effects?: number }>
  changedPaths: string[]
  hops?: number
  durationMs?: number
}

type ResetOptions = {
  clearErrors?: boolean
  clearTouched?: boolean
  silentValidate?: boolean
}

interface CompiledRule {
  raw: RuleV2
  id: string
  watch: string[]
  triggers: string[]
  when?: any
  whenFn?: (ctx: { form: any; selfPath?: string }) => any
  scope?: string
  scopeTokens?: Array<string | number | symbol>
  patterns?: Array<Array<string | number | symbol>>
}

/**
 * Headless engine entry (skeleton). Logic/UI are decoupled.
 * This file provides minimal API surface so UI package can wire up early.
 */
export class FormXEngine {
  /**
   * Headless FormX engine. Logic/UI decoupled; UI adapters subscribe to diffs
   * and read values/state to render. Use perf/policy to tweak behavior.
   */
  private schema: FormSchema
  private perf: EnginePerformanceOptions
  private policy: EnginePolicyOptions
  private valuesObj: Record<string, any>
  private stateObj: Record<string, any>
  private initialValues: Record<string, any>
  private suppressValidate = false
  private listeners: Set<(diff: any) => void> = new Set()
  private eventListeners: Map<string, Set<(...args: any[]) => void>> = new Map()
  private pathSubscribers: Map<string, Set<(diff: any) => void>> = new Map()
  private patternSubscribers: Array<{
    tokens: Array<string | number | symbol>
    listener: (diff: Diff) => void
  }> = []
  private prefixSubscribers: Array<{ prefix: string; listener: (diff: Diff) => void }> = []
  private rules: CompiledRule[] = []
  private watchIndex: WatchIndex = new WatchIndex()
  private patternWatchers = new PatternWatchers()
  private eventTriggers: Map<string, number[]> = new Map()
  // 规则归属索引：patternPath -> rule 索引；反向映射 ruleIdx -> 所属 pattern 集
  private ownerIndex: Map<string, Set<number>> = new Map()
  private ruleOwners: Map<number, string[]> = new Map()
  private ruleIdToIndex: Map<string, number> = new Map()
  // 为 owner key 做首段分桶，加速删除时的扫描
  private ownerBuckets: Map<string, Set<string>> = new Map()
  private latestRequestId: Map<string, number> = new Map()
  private validationRunIds: Map<string, number> = new Map()
  private validationTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  private validationResolvers: Map<string, (value: boolean) => void> = new Map()
  private scheduler?: Scheduler
  private graph = new GraphExecutor()
  private executor: IExecutor = new LiteExecutor()
  // scoped 规则的 selfPath 缓存，避免每次都全树扫描
  private scopeCache: Map<number, string[]> = new Map()
  // scoped 规则的二级缓存：按父容器路径聚合 self 实例
  private scopeChildrenByParent: Map<number, Map<string, string[]>> = new Map()
  // 追踪记录
  private traces: TraceEntry[] = []
  private currentTrace: TraceEntry | null = null
  // 每次 dispatch 期间的聚合缓存，用于 some/every/none/sum/avg 等数组高阶表达式
  private aggCache?: Map<string, any>
  private pathRegistry: PathRegistry = {
    nodes: [],
    patterns: [],
    pathToMeta: new Map(),
    idIndex: new Map()
  }
  // 诊断信息：记录 scope 级别的重新计算次数与原因（pattern/container 命中）
  private diagScopeRecalcTotal = 0
  private diagScopeRecalcLast: {
    ruleId?: string
    instances?: number
    reason?: 'pattern' | 'container'
    path?: string
  } | null = null
  private messageResolver?: FormXMessageResolver

  constructor(cfg: {
    schema: FormSchema
    performance?: EnginePerformanceOptions
    policy?: EnginePolicyOptions
    messages?: FormXMessageOptions | FormXMessageResolver
  }) {
    this.schema = cfg.schema
    this.perf = cfg.performance || {}
    this.policy = {
      onHide: 'keep',
      omitOnSubmit: false,
      resources: { onVisible: true },
      validation: { mode: 'touched' },
      ...(cfg.policy || {})
    }
    this.messageResolver = normalizeFormXMessageResolver(cfg.messages)
    const baseModel = this.schema.model || {}
    this.valuesObj = { ...(baseModel as any) }
    this.stateObj = {}
    this.initialValues = JSON.parse(JSON.stringify(baseModel))
    try {
      this.scheduler = new Scheduler(this as any)
    } catch {}
    this.compile()
  }

  // register builtin effect handlers once (module-level, after class definition)

  /** 注册自定义校验器；支持直接传函数，或传带 async/debounceMs 的定义对象。 */
  static registerValidator(name: string, input: ValidatorFn | ValidatorDefinition) {
    ValidatorRegistry.register(name, input)
  }
  static unregisterValidator(name: string) {
    ValidatorRegistry.unregister(name)
  }
  static listValidators() {
    return ValidatorRegistry.list()
  }
  static registerPattern(name: string, pattern: PatternInput, message?: string) {
    ValidatorRegistry.registerPattern(name, pattern, message)
  }
  static unregisterPattern(name: string) {
    ValidatorRegistry.unregisterPattern(name)
  }
  static listPatterns() {
    return ValidatorRegistry.listPatterns()
  }
  static setMessageResolver(resolver?: FormXMessageResolver | null) {
    setFormXMessageResolver(resolver)
  }
  static resetMessageResolver() {
    setFormXMessageResolver(undefined)
  }

  getMessageResolver() {
    return this.messageResolver
  }
  setMessageResolver(resolver?: FormXMessageResolver | null) {
    this.messageResolver = resolver || undefined
  }

  /** 深拷贝当前表单值 */
  getValues() {
    return JSON.parse(JSON.stringify(this.valuesObj))
  }
  /** 深拷贝当前状态（visible/disabled/required/readOnly/options/errors/validating/loading/patch） */
  getState() {
    return JSON.parse(JSON.stringify(this.stateObj))
  }
  /** 重置值并清理校验状态（默认静默，不写入错误）。 */
  reset(values?: Record<string, any>, opts?: ResetOptions) {
    const base =
      values != null
        ? JSON.parse(JSON.stringify(values))
        : JSON.parse(JSON.stringify(this.initialValues || {}))
    const keys = new Set<string>([...Object.keys(this.valuesObj || {}), ...Object.keys(base || {})])
    const prevSuppress = this.suppressValidate
    this.suppressValidate = opts?.silentValidate === false ? prevSuppress : true
    keys.forEach((k) => {
      try {
        this.setValue(k, (base as any)[k])
      } catch {
        /* ignore */
      }
    })
    this.suppressValidate = prevSuppress
    this.clearValidationState({
      clearErrors: opts?.clearErrors !== false,
      clearTouched: opts?.clearTouched !== false
    })
  }
  /** 清理校验状态（errors/touched/validating/details），用于重置或手动清空提示。 */
  clearValidationState(opts?: { clearErrors?: boolean; clearTouched?: boolean }) {
    const clearErrors = opts?.clearErrors !== false
    const clearTouched = opts?.clearTouched !== false
    if (!clearErrors && !clearTouched) return
    this.validationTimers.forEach((timer) => clearTimeout(timer))
    this.validationTimers.clear()
    this.validationResolvers.forEach((resolve) => {
      try {
        resolve(false)
      } catch {}
    })
    this.validationResolvers.clear()
    this.validationRunIds.clear()
    const diffs: Diff = { event: 'reset', state: [] }
    Object.keys(this.stateObj).forEach((path) => {
      const prev = this.stateObj[path] || {}
      const next: any = { ...prev }
      let changed = false
      if (clearErrors && 'errors' in next) {
        if (Array.isArray(next.errors) && next.errors.length > 0) {
          next.errors = []
          changed = true
        } else if (!Array.isArray(next.errors)) {
          delete next.errors
          changed = true
        }
      }
      if (clearErrors && next.validating) {
        next.validating = false
        changed = true
      }
      if (clearErrors && 'validationDetails' in next) {
        delete next.validationDetails
        changed = true
      }
      if (clearTouched && 'touched' in next) {
        delete next.touched
        changed = true
      }
      if (!changed) return
      this.stateObj[path] = next
      diffs.state!.push({ path, prev, next })
    })
    if (diffs.state && diffs.state.length > 0) this.emitIfAny(diffs)
  }
  getDiagnostics(): EngineDiagnostics {
    return DiagnosticsService.getDiagnostics(this as any)
  }
  getSubmitValues() {
    // 若策略未设置“提交时省略隐藏字段”，则直接返回 values 的深拷贝
    if (!this.policy.omitOnSubmit) return JSON.parse(JSON.stringify(this.valuesObj))

    // 构建一份工作副本，然后删除所有 hidden 路径
    const copy = JSON.parse(JSON.stringify(this.valuesObj))
    const hiddenPaths: string[] = []
    // 收集所有 visible=false 的路径
    Object.keys(this.stateObj).forEach((p) => {
      const st = this.stateObj[p]
      if (st && st.visible === false) hiddenPaths.push(p)
    })
    hiddenPaths.forEach((p) => deleteAt(copy, p))
    return copy
  }

  /**
   * 设置某个具体路径的值，内部会派发 change:<path> 事件并触发相关规则。
   * 注意：数组结构性修改更推荐通过 effect 完成，或者手动调用 invalidateScopeCacheForPath。
   */
  setValue(path: string, value: any) {
    const prev = getAt(this.valuesObj, path)
    if (prev === value) return
    setAt(this.valuesObj, path, value)
    this.dispatch('change:' + path, value)
    // basic auto-validate on change
    if (!this.suppressValidate) {
      try {
        this.validatePath(path, 'change')
      } catch {
        /* ignore */
      }
    }
  }

  getValue(path: string) {
    return getAt(this.valuesObj, path)
  }

  /** 底层事件派发：'init' | 'change:<path>' | 'event:<name>' */
  dispatch(event: string, payload?: any) {
    const diffs: Diff = { event, payload, values: [], state: [] }

    // 本次事件中发生变更的 value 路径队列（由 effects 推动）
    const queue = new Set<string>()
    this.currentTrace = { ts: Date.now(), event, rulesEvaluated: [], changedPaths: [] }
    // 为当前 dispatch 重置聚合缓存（perf.aggregateCache 开启时生效）
    this.aggCache = this.perf.aggregateCache ? new Map() : undefined

    if (event === 'init') {
      RuleExecService.runAllRules(this as any, diffs, queue)
      this.propagate(queue, diffs)
      this.emitIfAny(diffs)
      this.finishTrace(diffs)
      this.aggCache = undefined
      return
    }

    if (event.startsWith('change:')) {
      const path = event.slice('change:'.length)
      // 数组/容器的变化可能影响 scope 实例，需先失效相关缓存
      this.invalidateScopeCacheForPath(path)
      RuleExecService.runRulesForPath(this as any, path, diffs, queue)
      this.propagate(queue, diffs)
      this.emitIfAny(diffs)
      this.finishTrace(diffs)
      this.aggCache = undefined
      return
    }

    if (event.startsWith('event:')) {
      const name = event.slice('event:'.length)
      RuleExecService.runRulesForEvent(this as any, name, diffs, queue)
      this.propagate(queue, diffs)
      this.emitIfAny(diffs)
      this.finishTrace(diffs)
      this.aggCache = undefined
      return
    }

    // fallback（非 init/change/event）
    this.emitIfAny(diffs)
    this.finishTrace(diffs)
    this.aggCache = undefined
  }

  /** Subscribe to coalesced diffs (values/state changes). Returns unsubscribe. */
  subscribe(listener: (diff: any) => void) {
    return EventBusService.subscribe(this as any, listener)
  }
  /** Listen to custom engine events like 'fetch:success' | 'fetch:error' | 'cycle:detected' */
  on(event: string, listener: (...args: any[]) => void) {
    return EventBusService.on(this as any, event, listener)
  }

  /**
   * Subscribe to certain paths/patterns: e.g. 'a.b', 'list[]', 'user.*'.
   * Pattern semantics follow parsePattern in PatternUtils. Returns unsubscribe.
   */
  subscribePaths(paths: string | string[], listener: (diff: Diff) => void) {
    return EventBusService.subscribePaths(this as any, paths, listener)
  }

  applySchemaPatch(patch: Array<{ op: 'add' | 'replace' | 'remove'; path: string; value?: any }>) {
    try {
      SchemaPatchService.applySchemaPatch(this as any, patch)
    } catch {
      /* noop */
    }
  }

  getErrors() {
    const out: Record<string, string[]> = {}
    Object.keys(this.stateObj).forEach((p) => {
      const st: any = this.stateObj[p]
      if (st && Array.isArray(st.errors) && st.errors.length) out[p] = st.errors.slice()
    })
    return out
  }
  getValidationDetails(path?: string) {
    if (path) return JSON.parse(JSON.stringify(this.stateObj[path]?.validationDetails || null))
    const out: Record<string, any> = {}
    Object.keys(this.stateObj).forEach((p) => {
      if (this.stateObj[p]?.validationDetails) out[p] = this.stateObj[p].validationDetails
    })
    return JSON.parse(JSON.stringify(out))
  }
  isValidating(path?: string) {
    if (path) return !!this.stateObj[path]?.validating
    return Object.keys(this.stateObj).some((p) => !!this.stateObj[p]?.validating)
  }
  /** Validate all fields, update state.errors and return overall validity */
  async validate(): Promise<boolean> {
    try {
      return await ValidationService.validate(this as any)
    } catch {
      return (async () => {
        const paths: string[] = []
        this.pathRegistry.nodes.forEach((n) => {
          if (n.type && n.type !== 'form-object' && n.type !== 'field-group') paths.push(n.path)
        })
        let ok = true
        for (const pat of paths) {
          const instances = this.expandPatternToConcretePaths(pat)
          for (const p of instances) {
            const res = await this.validatePath(p, 'submit')
            if (!res) ok = false
          }
        }
        return ok
      })()
    }
  }

  /** Return first path having errors (simple scan) */
  getFirstErrorPath(): string | null {
    const vpol = (this.policy as any)?.validation || {}
    const skipHidden = vpol.skipHidden !== false
    const skipDisabled = vpol.skipDisabled !== false
    const skipReadOnly = vpol.skipReadOnly !== false
    for (const p of Object.keys(this.stateObj)) {
      const st: any = this.stateObj[p]
      if (!st || !Array.isArray(st.errors) || !st.errors.length) continue
      if (skipHidden && st.visible === false) continue
      if (skipDisabled && st.disabled === true) continue
      if (skipReadOnly && st.readOnly === true) continue
      return p
    }
    return null
  }

  /** Validate a single concrete path and write errors to state[path].errors */
  async validatePath(path: string, trigger?: 'change' | 'blur' | 'submit'): Promise<boolean> {
    try {
      return await ValidationService.validatePath(this as any, path, trigger)
    } catch {
      return false
    }
  }

  private deriveSelfBase(concretePath: string): string | undefined {
    // convert to nearest scope base by stripping last segment
    const tokens = tokenize(concretePath)
    if (tokens.length <= 1) return undefined
    tokens.pop()
    return stringifyTokens(tokens)
  }

  private expandPatternToConcretePaths(pattern: string): string[] {
    const tokens = parsePattern(pattern)
    const out: string[] = []
    const acc: Array<string | number> = []
    const walk = (obj: any, idx: number) => {
      if (idx >= tokens.length) {
        out.push(stringifyTokens(acc as any))
        return
      }
      const t = tokens[idx]
      if (typeof t === 'symbol') {
        // ANY index
        if (!Array.isArray(obj)) return
        for (let i = 0; i < obj.length; i++) {
          acc.push(i)
          walk(obj[i], idx + 1)
          acc.pop()
        }
        return
      }
      // property
      acc.push(t as string)
      const next = obj ? obj[t as any] : undefined
      walk(next, idx + 1)
      acc.pop()
    }
    walk(this.valuesObj, 0)
    return out
  }

  static registerRequest(key: string, handler: (params?: Record<string, any>) => Promise<any>) {
    ResourceManager.register(key, handler)
  }

  // ================= internal =================
  private compile() {
    const rules: CompiledRule[] = []
    // reset auxiliary indexes
    this.ownerIndex.clear()
    this.ruleOwners.clear()
    this.ruleIdToIndex.clear()
    this.ownerBuckets.clear()
    const src = [...(this.schema.rulesV2 || []), ...compileSchemaToRules(this.schema)]
    if (this.perf.debug) {
      console.log('[FormX] compiling rules:', src.length)
    }
    // rebuild path registry on compile (schema may change by setSchemaPatch in future)
    this.pathRegistry = buildPathRegistry(this.schema)
    src.forEach((r) => {
      const autoWatch = r.options?.autoWatch == false ? [] : collectVarDeps(r.when)
      const baseWatch = Array.isArray(r.watch) ? r.watch : []
      const mergedWatch = Array.from(new Set([...(baseWatch as string[]), ...autoWatch]))
      const cr: CompiledRule = {
        raw: r,
        id: r.id,
        watch: mergedWatch,
        triggers: Array.isArray(r.trigger) ? [...r.trigger!] : r.trigger ? [r.trigger!] : [],
        when: r.when,
        whenFn: r.when ? compileExpr(r.when) : undefined,
        scope: r.scope,
        scopeTokens: r.scope ? parsePattern(r.scope) : undefined,
        patterns: []
      }
      const newIdx = rules.push(cr) - 1
      // owners
      const owners = this.computeRuleOwners(cr)
      this.ruleOwners.set(newIdx, owners)
      owners.forEach((op) => {
        const set = this.ownerIndex.get(op) || new Set<number>()
        set.add(newIdx)
        this.ownerIndex.set(op, set)
        const bkey = firstSegment(op)
        const bset = this.ownerBuckets.get(bkey) || new Set<string>()
        bset.add(op)
        this.ownerBuckets.set(bkey, bset)
      })
      this.ruleIdToIndex.set(cr.id, newIdx)
    })
    this.rules = rules
    WatchService.buildWatchIndex(this as any)
    // clear scope cache on recompile
    this.scopeCache.clear()
  }

  /**
   * Inspect graph ordering for a hypothetical change path (when graph is enabled).
   * Returns candidate rule indices and topologically ordered list with rule ids.
   */
  getGraphTopoForPath(path: string) {
    const stats = this.executor?.stats?.() || {}
    const dag = this.executor?.exportDAG?.() || {}
    if (!stats || !dag || !('edges' in dag)) return { candidates: [], ordered: [], ruleIds: [] }
    const cands = this.executor?.candidates?.(path) || []
    const ordered = this.executor?.topoOrderFor?.(cands) || cands
    const ruleIds = (dag as any).ruleIds || []
    return {
      candidates: cands,
      ordered,
      ruleIds: ordered.map((i: number) => ruleIds[i] ?? String(i))
    }
  }

  /** Export restricted graph subgraph for a path (nodes/edges/topo with ids) */
  getGraphSubgraphForPath(path: string) {
    const stats = this.executor?.stats?.() || {}
    const dag = this.executor?.exportDAG?.() || {}
    if (!stats || !dag || !('edges' in dag))
      return { nodes: [], edges: [], ordered: [], orderedIds: [] }
    const cands = this.executor?.candidates?.(path) || []
    return (
      (this.executor as any)?.exportSubgraphFor?.(cands) || {
        nodes: [],
        edges: [],
        ordered: [],
        orderedIds: []
      }
    )
  }

  private buildWatchIndex() {
    WatchService.buildWatchIndex(this as any)
  }

  /** Incrementally add one compiled rule into watchIndex/patternWatchers/patternBuckets */
  private addCompiledRuleToIndexes(r: CompiledRule, idx: number) {
    WatchService.addCompiledRuleToIndexes(this as any, r, idx)
  }

  // addWatch -> delegated to WatchIndex.add()

  /** Remove one compiled rule from all indexes (watchIndex/patternWatchers/patternBuckets/ownerIndex) */
  private removeCompiledRuleFromIndexes(ruleIdx: number) {
    WatchService.removeCompiledRuleFromIndexes(this as any, ruleIdx)
  }

  // ========== instance wrappers (for services to reuse helpers) ==========
  // expose helpers as instance methods for services (avoid circular import)
  public expandSelfScopeForPattern(p: string, scope?: string) {
    return expandSelfScopeForPatternSvc(p, scope)
  }
  public deriveSelfPath(
    scopeTokens: Array<string | number | symbol>,
    changed: Array<string | number>
  ) {
    return deriveSelfPathSvc(scopeTokens, changed as any)
  }
  public pathMayAffectScope(
    changed: Array<string | number>,
    scopeTokens: Array<string | number | symbol>
  ) {
    return pathMayAffectScopeSvc(changed as any, scopeTokens as any)
  }
  public matchTokens(pattern: Array<string | number | symbol>, path: Array<string | number>) {
    return matchTokens(pattern as any, path as any)
  }
  /** Resolve mixed templates/expressions in params with $self/$parent/$root awareness. */
  public resolveParams(val: any, form: any, selfPath?: string) {
    return resolveParamsSvc(val, form, selfPath, resolveScopedPathSvc)
  }
  /** Resolve $root/$self/$parent to concrete absolute path. */
  public resolveScopedPath(p: string, selfPath?: string) {
    return resolveScopedPathSvc(p, selfPath)
  }

  // Find field schema by pattern path like rules[].items[].name
  private findSchemaByPattern(patternPath: string): any | null {
    const segs = patternPath.split('.').filter(Boolean)
    if (!segs.length) return null

    const findInFields = (fields: any[] | undefined, idx: number): any | null => {
      if (!Array.isArray(fields) || idx >= segs.length) return null
      const seg = segs[idx]
      const m = seg.match(/^(\w+)(\[\])?$/)
      if (!m) return null
      const id = m[1]
      const found = fields.find((f: any) => f && f.id === id)
      if (found) {
        if (idx === segs.length - 1) return found
        if (found.type === 'field-group') {
          const hit = findInFields(found.template, idx + 1)
          if (hit) return hit
        }
        if (found.type === 'form-object') {
          const hit = findInFields(found.children, idx + 1)
          if (hit) return hit
        }
      }
      // flatten form-object: allow transparent descent without consuming segment
      for (const f of fields) {
        if (f && f.type === 'form-object' && f.flatten) {
          const hit = findInFields(f.children, idx)
          if (hit) return hit
        }
      }
      return null
    }

    return findInFields((this.schema as any).fields, 0)
  }

  // legacy local rule-run helpers removed; now delegated to RuleExecService

  private applyEffect(effect: Effect, diffs: Diff, selfPath?: string, queue?: Set<string>) {
    EffectApplierService.applyEffect(this as any, effect, diffs, selfPath, queue)
  }

  /** Evaluate a JSON expression on { form, selfPath } with per-dispatch aggregation cache */
  public evaluateExpr(expr: any, ctx: { form: any; selfPath?: string }) {
    return evaluateExpr(expr, { ...ctx, aggCache: this.aggCache })
  }

  private emitIfAny(diffs: Diff) {
    EventBusService.emitIfAny(this as any, diffs)
  }

  // Compute owner pattern paths for a rule based on targets in effects/elseEffects
  private computeRuleOwners(r: CompiledRule): string[] {
    const out = new Set<string>()
    const collect = (effs?: Effect[]) => {
      if (!Array.isArray(effs)) return
      effs.forEach((e: any) => {
        if (!e) return
        const t = e.target
        if (typeof t === 'string') {
          const p = expandSelfScopeForPatternSvc(t, r.scope)
          if (p) out.add(p)
        } else if (Array.isArray(t)) {
          t.forEach((tt) => {
            if (typeof tt === 'string') {
              const p = expandSelfScopeForPatternSvc(tt, r.scope)
              if (p) out.add(p)
            }
          })
        }
        // validate effect has targets array
        if (e.type === 'validate' && Array.isArray((e as any).target)) {
          ;((e as any).target as string[]).forEach((tt: string) => {
            const p = expandSelfScopeForPatternSvc(tt, r.scope)
            if (p) out.add(p)
          })
        }
      })
    }
    collect(r.raw.effects)
    collect(r.raw.elseEffects as any)
    return Array.from(out)
  }

  private propagate(queue: Set<string>, diffs: Diff) {
    if (!queue || queue.size === 0) return
    const maxHops = this.perf.maxHops ?? 12
    let hops = 0
    const pending: string[] = Array.from(queue)
    queue.clear()
    const seen = new Set<string>()
    while (pending.length && hops < maxHops) {
      const path = pending.shift()!
      if (seen.has(path)) continue
      seen.add(path)
      if (this.perf.debug) {
        console.log('[FormX] propagate hop', hops, 'path=', path)
      }
      RuleExecService.runRulesForPath(this as any, path, diffs, queue)
      if (queue.size) {
        queue.forEach((p) => pending.push(p))
        queue.clear()
      }
      hops++
    }
    if (hops >= maxHops) this.emitEvent('cycle:detected', { hops })
    if (this.currentTrace) this.currentTrace.hops = hops
  }

  private emitEvent(event: string, ...args: any[]) {
    EventBusService.emitEvent(this as any, event, ...args)
  }

  private noteRule(id: string, self?: string, when?: boolean, effects?: number) {
    if (!this.currentTrace) return
    this.currentTrace.rulesEvaluated.push({ id, self, when, effects })
  }
  private finishTrace(diffs: Diff) {
    if (!this.currentTrace) return
    const end = Date.now()
    this.currentTrace.durationMs = end - this.currentTrace.ts
    const changed = new Set<string>()
    diffs.values?.forEach((v) => changed.add(v.path))
    diffs.state?.forEach((s) => changed.add(s.path))
    this.currentTrace.changedPaths = Array.from(changed)
    this.traces.push(this.currentTrace)
    if (this.traces.length > 50) this.traces.shift()
    this.currentTrace = null
  }

  private getOrComputeSelfPaths(ruleIdx: number, rule: CompiledRule): string[] {
    const cached = this.scopeCache.get(ruleIdx)
    if (cached) return cached
    const paths = findSelfPathsByScopeTokens(this.valuesObj, rule.scopeTokens!)
    this.scopeCache.set(ruleIdx, paths)
    // reset children grouping cache for this rule
    this.scopeChildrenByParent.delete(ruleIdx)
    return paths
  }

  /** Return siblings (same parent container) of a given selfPath for a rule. */
  public getSiblingSelfPaths(ruleIdx: number, selfPath: string): string[] {
    // build grouping map lazily
    let grp = this.scopeChildrenByParent.get(ruleIdx)
    if (!grp) {
      grp = new Map<string, string[]>()
      const all = this.scopeCache.get(ruleIdx) || []
      for (const sp of all) {
        const toks = tokenize(sp)
        toks.pop() // parent base
        const parent = stringifyTokens(toks)
        const list = grp.get(parent) || []
        list.push(sp)
        grp.set(parent, list)
      }
      this.scopeChildrenByParent.set(ruleIdx, grp)
    }
    const toks = tokenize(selfPath)
    toks.pop()
    const parent = stringifyTokens(toks)
    return grp.get(parent) || []
  }

  /**
   * Manually invalidate scope instance cache for rules whose scope matches
   * or is affected by a container change at 'changedPath'. Use after custom
   * array ops that bypass setValue/effects.
   */
  public invalidateScopeCacheForPath(changedPath: string) {
    const tokens = tokenize(changedPath)
    this.rules.forEach((r, idx) => {
      if (!r.scopeTokens || !r.scopeTokens.length) return
      if (
        scopeMatchesPrefixSvc(r.scopeTokens, tokens) ||
        pathMayAffectScopeSvc(tokens, r.scopeTokens)
      ) {
        this.scopeCache.delete(idx)
        this.scopeChildrenByParent.delete(idx)
      }
    })
  }
}

// ============= helpers for wildcard/scope =============

// resolveScopedPath moved to ScopeResolverService; Engine keeps an instance wrapper

// Expand $self.* to pattern path (using scope as pattern base)

function findSelfPathsByScopeTokens(
  root: any,
  scopeTokens: Array<string | number | symbol>
): string[] {
  const results: string[] = []
  const curTokens: Array<string | number> = []
  function dfs(obj: any, idx: number) {
    if (idx >= scopeTokens.length) {
      // matched full scope path
      results.push(stringifyTokens(curTokens))
      return
    }
    const token = scopeTokens[idx]
    if (typeof token === 'symbol') {
      // ANY index, require obj to be array
      if (!Array.isArray(obj)) return
      for (let i = 0; i < obj.length; i++) {
        curTokens.push(i)
        dfs(obj[i], idx + 1)
        curTokens.pop()
      }
    } else {
      // property name
      if (obj == null || typeof obj !== 'object' || !(token in obj)) return
      curTokens.push(token)
      dfs(obj[token as any], idx + 1)
      curTokens.pop()
    }
  }
  dfs(root, 0)
  return results
}

// first segment of a pattern path 'a.b[].c' -> 'a'
function firstSegment(p: string): string {
  if (!p) return ''
  const i = p.indexOf('.')
  return i < 0 ? p : p.slice(0, i)
}

// changed path is a prefix of scope (e.g., changed 'rules' impacts scope 'rules[]')

// collect 'var' dependencies in a when-expression, to auto-populate watch list
function collectVarDeps(expr: any, out: Set<string> = new Set()): string[] {
  if (!expr) return Array.from(out)
  if (Array.isArray(expr)) {
    expr.forEach((e) => collectVarDeps(e, out))
    return Array.from(out)
  }
  if (typeof expr === 'object') {
    if (Object.prototype.hasOwnProperty.call(expr, 'var')) {
      const v = (expr as any)['var']
      if (typeof v === 'string') out.add(v)
    }
    Object.keys(expr).forEach((k) => {
      if (k === 'var') return
      collectVarDeps((expr as any)[k], out)
    })
  }
  return Array.from(out)
}
