import { matchTokens } from './PatternUtils'

export class PatternWatchers {
  private list: Array<{ ruleIdx: number; tokens: Array<string | number | symbol> }> = []
  private buckets: Map<string, Array<{ ruleIdx: number; tokens: Array<string | number | symbol> }>> = new Map()

  clear() {
    this.list = []
    this.buckets.clear()
  }

  add(ruleIdx: number, tokens: Array<string | number | symbol>) {
    const entry = { ruleIdx, tokens }
    this.list.push(entry)
    const firstLit = tokens.find((t) => typeof t === 'string') as string | undefined
    const key = firstLit || '*'
    const arr = this.buckets.get(key) || []
    arr.push(entry)
    this.buckets.set(key, arr)
  }

  removeRule(ruleIdx: number) {
    this.list = this.list.filter((e) => e.ruleIdx !== ruleIdx)
    // rebuild buckets
    const nb = new Map<string, Array<{ ruleIdx: number; tokens: Array<string | number | symbol> }>>()
    this.list.forEach((e) => {
      const firstLit = e.tokens.find((t) => typeof t === 'string') as string | undefined
      const key = firstLit || '*'
      const arr = nb.get(key) || []
      arr.push(e)
      nb.set(key, arr)
    })
    this.buckets = nb
  }

  candidatesForPathTokens(pathTokens: Array<string | number>): number[] {
    const res = new Set<number>()
    const first = pathTokens[0]
    const list: Array<{ ruleIdx: number; tokens: Array<string | number | symbol> }> = []
    if (typeof first === 'string') {
      const hit = this.buckets.get(first)
      if (hit) list.push(...hit)
    }
    const generic = this.buckets.get('*')
    if (generic) list.push(...generic)
    for (const pw of list) {
      if (matchTokens(pw.tokens, pathTokens)) res.add(pw.ruleIdx)
    }
    return Array.from(res)
  }

  count() { return this.list.length }
}

