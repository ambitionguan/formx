// Utilities for wildcard pattern parsing and matching

export const ANY: unique symbol = Symbol('any')
export const ANY_SEG: unique symbol = Symbol('any_seg')
export const ANY_DEEP: unique symbol = Symbol('any_deep')

export function parsePattern(p: string): Array<string | number | symbol> {
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

export function matchTokens(pattern: Array<string | number | symbol>, path: Array<string | number>): boolean {
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

