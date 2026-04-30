import { parsePattern } from '../../watch/PatternUtils'

type Diff = {
  event: string
  payload?: any
  values?: Array<{ path: string; prev: any; next: any }>
  state?: Array<{ path: string; prev: any; next: any }>
}

export function subscribe(engine: any, listener: (diff: Diff) => void) {
  engine.listeners?.add?.(listener)
  return () => engine.listeners?.delete?.(listener)
}

export function on(engine: any, event: string, listener: (...args: any[]) => void) {
  const set = engine.eventListeners?.get?.(event) || new Set()
  set.add(listener)
  engine.eventListeners?.set?.(event, set)
  return () => {
    const s = engine.eventListeners?.get?.(event)
    if (!s) return
    s.delete(listener)
    if (s.size === 0) engine.eventListeners?.delete?.(event)
  }
}

export function subscribePaths(engine: any, paths: string | string[], listener: (diff: Diff) => void) {
  const arr = Array.isArray(paths) ? paths : [paths]
  arr.forEach((p) => {
    if (p.endsWith('.*')) {
      engine.prefixSubscribers?.push?.({ prefix: p.slice(0, -2), listener })
    } else if (p.includes('[*]') || p.includes('[]')) {
      const tokens = parsePattern(p)
      engine.patternSubscribers?.push?.({ tokens, listener })
    } else {
      const set = engine.pathSubscribers?.get?.(p) || new Set()
      set.add(listener)
      engine.pathSubscribers?.set?.(p, set)
    }
  })
  return () => {
    arr.forEach((p) => {
      if (p.endsWith('.*')) {
        engine.prefixSubscribers = (engine.prefixSubscribers || []).filter((s: any) => s.listener !== listener)
      } else if (p.includes('[*]') || p.includes('[]')) {
        engine.patternSubscribers = (engine.patternSubscribers || []).filter((s: any) => s.listener !== listener)
      } else {
        const set = engine.pathSubscribers?.get?.(p)
        if (set) {
          set.delete(listener)
          if (set.size === 0) engine.pathSubscribers?.delete?.(p)
        }
      }
    })
  }
}

export function emitIfAny(engine: any, diffs: Diff) {
  engine.scheduler?.emitIfAny?.(diffs)
}

export function emitEvent(engine: any, event: string, ...args: any[]) {
  const set = engine.eventListeners?.get?.(event)
  if (set) set.forEach((fn: any) => { try { fn(...args) } catch {} })
}

