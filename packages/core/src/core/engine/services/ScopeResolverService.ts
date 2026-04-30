import { stringifyTokens, joinPath, tokenize } from '../../Path'

export function deriveSelfPath(scopeTokens: Array<string | number | symbol>, changed: Array<string | number>): string | undefined {
  if (scopeTokens.length > changed.length) return undefined
  for (let i = 0; i < scopeTokens.length; i++) {
    const s = scopeTokens[i]
    const c = changed[i]
    if (typeof s === 'symbol') {
      if (typeof c !== 'number') return undefined
      continue
    }
    if (s !== c) return undefined
  }
  return stringifyTokens(changed.slice(0, scopeTokens.length))
}

export function scopeMatchesPrefix(scopeTokens: Array<string | number | symbol>, changed: Array<string | number>): boolean {
  if (scopeTokens.length > changed.length) return false
  for (let i = 0; i < scopeTokens.length; i++) {
    const s = scopeTokens[i]
    const c = changed[i]
    if (typeof s === 'symbol') {
      if (typeof c !== 'number') return false
      continue
    }
    if (s !== c) return false
  }
  return true
}

export function pathMayAffectScope(changed: Array<string | number>, scopeTokens: Array<string | number | symbol>): boolean {
  if (changed.length === 0) return false
  if (changed.length > scopeTokens.length) return false
  for (let i = 0; i < changed.length; i++) {
    const s = scopeTokens[i]
    const c = changed[i]
    if (typeof s === 'symbol') {
      if (typeof c === 'number') continue
      return false
    }
    if (s !== c) return false
  }
  return true
}

export function expandSelfScopeForPattern(p: string, scope?: string): string {
  if (p.startsWith('$root.')) return p.slice(6)
  if (p === '$self') return scope || ''
  if (p.startsWith('$self.')) return (scope ? scope + '.' : '') + p.slice(6)
  if (p.startsWith('$parent.')) {
    if (!scope) return p.slice(8)
    const toks = scope.split('.')
    toks.pop()
    const base = toks.join('.')
    const sub = p.slice(8)
    if (!base) return sub
    if (sub === base || sub.startsWith(base + '.')) return sub
    return base + '.' + sub
  }
  return p
}

// Resolve $root/$self/$parent references to concrete absolute path
export function resolveScopedPath(p: string, selfPath?: string): string {
  if (p.startsWith('$root.')) return p.slice(6)
  if (p.startsWith('$self.')) return joinPath(selfPath || '', p.slice(6))
  if (p.startsWith('$parent.')) {
    const base = selfPath ? tokenize(selfPath) : []
    base.pop()
    const baseStr = stringifyTokens(base)
    const sub = p.slice(8)
    // avoid duplicating base for targets like "$parent.methods" when base already equals 'methods'
    if (baseStr && sub === baseStr) return baseStr
    return joinPath(baseStr, sub)
  }
  return p
}
