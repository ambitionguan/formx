// Simple scheduler to coalesce diffs and notify subscribers; extracted from Engine
import { tokenize } from '../Path'
import { matchTokens } from '../watch/PatternUtils'

type Diff = {
  event: string
  payload?: any
  values?: Array<{ path: string; prev: any; next: any }>
  state?: Array<{ path: string; prev: any; next: any }>
}

export class Scheduler {
  private pendingDiff: Diff | null = null
  private scheduled = false
  constructor(private engine: any) {}

  emitIfAny(diffs: Diff) {
    const has = (diffs.values && diffs.values.length) || (diffs.state && diffs.state.length) || diffs.event
    if (!has) return
    if (!this.pendingDiff) {
      this.pendingDiff = { event: diffs.event, payload: diffs.payload, values: [], state: [] }
    }
    diffs.values?.forEach((v) => this.pendingDiff!.values!.push(v))
    diffs.state?.forEach((s) => this.pendingDiff!.state!.push(s))
    if (!this.scheduled) {
      this.scheduled = true
      const schedule = (this.engine?.perf?.schedule) || 'microtask'
      if (schedule === 'raf' && typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => this.flush())
      } else if (schedule === 'timeout') {
        setTimeout(() => this.flush(), 0)
      } else {
        Promise.resolve().then(() => this.flush())
      }
    }
  }

  private flush() {
    this.scheduled = false
    const diff = this.coalesceDiffs(this.pendingDiff!)
    this.pendingDiff = null
    // global listeners
    this.engine.listeners?.forEach((l: any) => { try { l(diff) } catch {} })
    // path subscribers
    const paths = new Set<string>()
    diff.values?.forEach((v) => paths.add(v.path))
    diff.state?.forEach((s) => paths.add(s.path))
    paths.forEach((p) => {
      const subs = this.engine.pathSubscribers?.get?.(p)
      subs?.forEach((fn: any) => { try { fn(diff) } catch {} })
    })
    // wildcard subscribers
    const tokenizedChanges = Array.from(paths).map((p) => tokenize(p))
    for (const ps of (this.engine.patternSubscribers || [])) {
      if (tokenizedChanges.some((tks) => matchTokens(ps.tokens, tks))) {
        try { ps.listener(diff) } catch {}
      }
    }
    // prefix subscribers
    const changed = Array.from(paths)
    for (const sub of (this.engine.prefixSubscribers || [])) {
      if (changed.some((p) => p.startsWith(sub.prefix))) { try { sub.listener(diff) } catch {} }
    }
  }

  private coalesceDiffs(diff: Diff): Diff {
    const lastValues = new Map<string, { path: string; prev: any; next: any }>()
    const lastState = new Map<string, { path: string; prev: any; next: any }>()
    diff.values?.forEach((v) => lastValues.set(v.path, v))
    diff.state?.forEach((s) => lastState.set(s.path, s))
    return { event: diff.event, payload: diff.payload, values: Array.from(lastValues.values()), state: Array.from(lastState.values()) }
  }
}

