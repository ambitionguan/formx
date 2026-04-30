// 面向 LiteExecutor 的轻量 JSON 表达式求值器
// 支持的操作符：var, and, or, not, ==, !=, >, >=, <, <=, in, nin, includes, +, -, *, /

import { getAt, parentPath, joinPath, tokenize } from './Path'
type Ctx = { form: Record<string, any>; selfPath?: string; item?: any; state?: Record<string, any>; aggCache?: Map<string, any> }

const isObject = (v: any) => v && typeof v === 'object' && !Array.isArray(v)

export function evaluateExpr(expr: any, ctx: Ctx): any {
  if (!isObject(expr)) return expr

  if ('var' in expr) {
    const p = (expr as any)['var'] as string
    return resolveVar(p, ctx)
  }

  if ('and' in expr) {
    const arr = (expr as any).and as any[]
    for (const e of arr) { if (!evaluateExpr(e, ctx)) return false }
    return true
  }

  if ('or' in expr) {
    const arr = (expr as any).or as any[]
    for (const e of arr) { if (evaluateExpr(e, ctx)) return true }
    return false
  }

  if ('not' in expr) return !evaluateExpr((expr as any).not, ctx)

  if ('==' in expr) return eq((expr as any)['=='][0], (expr as any)['=='][1], ctx)
  if ('!=' in expr) return ne((expr as any)['!='][0], (expr as any)['!='][1], ctx)
  if ('>' in expr) return gt((expr as any)['>'][0], (expr as any)['>'][1], ctx)
  if ('>=' in expr) return gte((expr as any)['>='][0], (expr as any)['>='][1], ctx)
  if ('<' in expr) return lt((expr as any)['<'][0], (expr as any)['<'][1], ctx)
  if ('<=' in expr) return lte((expr as any)['<='][0], (expr as any)['<='][1], ctx)
  if ('in' in expr) return inOp((expr as any)['in'][0], (expr as any)['in'][1], ctx)
  if ('nin' in expr) return !inOp((expr as any)['nin'][0], (expr as any)['nin'][1], ctx)
  if ('includes' in expr) return includesOp((expr as any)['includes'][0], (expr as any)['includes'][1], ctx)
  if ('startsWith' in expr) return startsWithOp((expr as any)['startsWith'][0], (expr as any)['startsWith'][1], ctx)
  if ('endsWith' in expr) return endsWithOp((expr as any)['endsWith'][0], (expr as any)['endsWith'][1], ctx)
  if ('match' in expr) return matchOp((expr as any)['match'][0], (expr as any)['match'][1], ctx)
  if ('iif' in expr) return iifOp((expr as any)['iif'][0], (expr as any)['iif'][1], (expr as any)['iif'][2], ctx)
  if ('coalesce' in expr) return coalesceOp((expr as any)['coalesce'], ctx)

  // 数组高阶运算
  if ('some' in expr) return someOp((expr as any)['some'][0], (expr as any)['some'][1], ctx)
  if ('every' in expr) return everyOp((expr as any)['every'][0], (expr as any)['every'][1], ctx)
  if ('none' in expr) return !someOp((expr as any)['none'][0], (expr as any)['none'][1], ctx)
  if ('len' in expr) return lengthOp((expr as any)['len'], ctx)
  if ('sum' in expr) return sumOp((expr as any)['sum'][0], (expr as any)['sum'][1], ctx)
  if ('avg' in expr) return avgOp((expr as any)['avg'][0], (expr as any)['avg'][1], ctx)

  if ('+' in expr) return num(evaluateExpr(expr['+'][0], ctx)) + num(evaluateExpr(expr['+'][1], ctx))
  if ('-' in expr) return num(evaluateExpr(expr['-'][0], ctx)) - num(evaluateExpr(expr['-'][1], ctx))
  if ('*' in expr) return num(evaluateExpr(expr['*'][0], ctx)) * num(evaluateExpr(expr['*'][1], ctx))
  if ('/' in expr) return num(evaluateExpr(expr['/'][0], ctx)) / num(evaluateExpr(expr['/'][1], ctx))

  return undefined
}

// -------- 编译器实现（带缓存） --------
type Fn = (ctx: Ctx) => any
const CACHE = new WeakMap<object, Fn>()

export function compileExpr(expr: any): Fn {
  if (!isObject(expr)) return () => expr
  const cached = CACHE.get(expr)
  if (cached) return cached

  const keys = Object.keys(expr)
  const op = keys[0]
  let fn: Fn

  switch (op) {
    case 'var': {
      const p = (expr as any)['var']
      fn = (ctx) => resolveVar(p, ctx)
      break
    }
    case 'and': {
      const arr = (expr as any).and || []
      const fns = arr.map((e: any) => compileExpr(e))
      fn = (ctx) => { for (const f of fns) if (!f(ctx)) return false; return true }
      break
    }
    case 'or': {
      const arr = (expr as any).or || []
      const fns = arr.map((e: any) => compileExpr(e))
      fn = (ctx) => { for (const f of fns) if (f(ctx)) return true; return false }
      break
    }
    case 'not': {
      const f1 = compileExpr((expr as any).not)
      fn = (ctx) => !f1(ctx)
      break
    }
    case '==': case '!=': case '>': case '>=': case '<': case '<=': {
      const [a,b] = (expr as any)[op]
      const fa = compileExpr(a), fb = compileExpr(b)
      fn = (ctx) => {
        const va = fa(ctx), vb = fb(ctx)
        switch (op) {
          case '==': return va === vb
          case '!=': return va !== vb
          case '>': return Number(va) > Number(vb)
          case '>=': return Number(va) >= Number(vb)
          case '<': return Number(va) < Number(vb)
          case '<=': return Number(va) <= Number(vb)
        }
        return false
      }
      break
    }
    case 'in': case 'nin': case 'includes': {
      const [a,b] = (expr as any)[op]
      const fa = compileExpr(a), fb = compileExpr(b)
      fn = (ctx) => {
        const va = fa(ctx), vb = fb(ctx)
        if (op === 'includes') {
          if (Array.isArray(va)) return va.includes(vb)
          if (typeof va === 'string') return va.includes(String(vb))
          return false
        }
        const arr = Array.isArray(vb) ? vb : []
        const hit = arr.includes(va)
        return op === 'in' ? hit : !hit
      }
      break
    }
    case 'startsWith': case 'endsWith': {
      const [a,b] = (expr as any)[op]
      const fa = compileExpr(a), fb = compileExpr(b)
      fn = (ctx) => {
        const va = fa(ctx), vb = fb(ctx)
        if (typeof va !== 'string' || typeof vb !== 'string') return false
        return op === 'startsWith' ? va.startsWith(vb) : va.endsWith(vb)
      }
      break
    }
    case 'match': {
      const [a,b] = (expr as any).match
      const fa = compileExpr(a), fb = compileExpr(b)
      fn = (ctx) => {
        const va = fa(ctx), vb = fb(ctx)
        if (typeof va !== 'string' || typeof vb !== 'string') return false
        try { return new RegExp(vb).test(va) } catch { return false }
      }
      break
    }
    case 'iif': {
      const [c,t,f] = (expr as any).iif
      const fc = compileExpr(c), ft = compileExpr(t), ff = compileExpr(f)
      fn = (ctx) => fc(ctx) ? ft(ctx) : ff(ctx)
      break
    }
    case 'coalesce': {
      const list = (expr as any).coalesce
      const fns = (Array.isArray(list) ? list : [list]).map((e: any) => compileExpr(e))
      fn = (ctx) => {
        for (const f of fns) { const v = f(ctx); if (v !== undefined && v !== null && v !== '') return v }
        return undefined
      }
      break
    }
    case 'some': case 'every': case 'none': case 'len': case 'sum': case 'avg': {
      const arr = (expr as any)[op]
      const a0 = Array.isArray(arr) ? arr[0] : undefined
      const a1 = Array.isArray(arr) ? arr[1] : undefined
      const fArr = (ctx: Ctx) => asArrayInput(a0, ctx)
      if (op === 'len') { fn = (ctx) => fArr(ctx).length; break }
      if (op === 'sum' || op === 'avg') {
        const mapExpr = a1
        const mapFn = compileExpr(mapExpr)
        fn = (ctx) => {
          const items = fArr(ctx)
          if (items.length === 0) return 0
          const key = aggKey(op, a0, ctx, mapExpr)
          if (key && ctx.aggCache?.has(key)) return ctx.aggCache.get(key)
          const total = items.reduce((s, it) => s + Number(mapFn({ ...ctx, item: it }) || 0), 0)
          const res = op === 'sum' ? total : total / items.length
          if (key) ctx.aggCache?.set(key, res)
          return res
        }
        break
      }
      const predExpr = a1
      const pred = compileExpr(predExpr)
      if (op === 'some') {
        fn = (ctx) => {
          const key = aggKey('some', a0, ctx, predExpr)
          if (key && ctx.aggCache?.has(key)) return !!ctx.aggCache.get(key)
          const items = fArr(ctx)
          const res = items.some((it) => !!pred({ ...ctx, item: it }))
          if (key) ctx.aggCache?.set(key, res)
          return res
        }
        break
      }
      if (op === 'every') {
        fn = (ctx) => {
          const key = aggKey('every', a0, ctx, predExpr)
          if (key && ctx.aggCache?.has(key)) return !!ctx.aggCache.get(key)
          const items = fArr(ctx)
          const res = items.every((it) => !!pred({ ...ctx, item: it }))
          if (key) ctx.aggCache?.set(key, res)
          return res
        }
        break
      }
      if (op === 'none') {
        fn = (ctx) => {
          const key = aggKey('none', a0, ctx, predExpr)
          if (key && ctx.aggCache?.has(key)) return !!ctx.aggCache.get(key)
          const items = fArr(ctx)
          const res = !items.some((it) => !!pred({ ...ctx, item: it }))
          if (key) ctx.aggCache?.set(key, res)
          return res
        }
        break
      }
      fn = (ctx) => undefined
      break
    }
    default:
      // fallback to interpreter
      fn = (ctx) => evaluateExpr(expr, ctx)
  }
  CACHE.set(expr, fn)
  return fn
}

function resolveVar(path: string, ctx: Ctx) {
  if (path === '$root') return ctx.form
  if (path.startsWith('$root.')) return getAt(ctx.form, path.slice(6))
  if (path === '$self') return ctx.selfPath ? getAt(ctx.form, ctx.selfPath) : undefined
  if (path.startsWith('$self.')) {
    const sub = path.slice(6)
    const abs = ctx.selfPath ? joinPath(ctx.selfPath, sub) : sub
    return getAt(ctx.form, abs)
  }
  if (path === '$parent') return ctx.selfPath ? getAt(ctx.form, parentPath(ctx.selfPath)) : undefined
  if (path.startsWith('$parent.')) {
    const sub = path.slice(8)
    const base = ctx.selfPath ? parentPath(ctx.selfPath) : ''
    const abs = base ? joinPath(base, sub) : sub
    return getAt(ctx.form, abs)
  }
  if (path === '$item') return ctx.item
  if (path.startsWith('$item.')) {
    const sub = path.slice(6)
    const it = ctx.item
    return it ? getAt(it, sub) : undefined
  }
  if (path === '$state') return ctx.state
  if (path.startsWith('$state.')) {
    const sub = path.slice(7)
    return ctx.state ? getAt(ctx.state, sub) : undefined
  }
  return getAt(ctx.form, path)
}

function eq(a: any, b: any, ctx: Ctx) {
  return evaluateExpr(a, ctx) === evaluateExpr(b, ctx)
}
function ne(a: any, b: any, ctx: Ctx) { return !eq(a, b, ctx) }
function gt(a: any, b: any, ctx: Ctx) { return num(evaluateExpr(a, ctx)) > num(evaluateExpr(b, ctx)) }
function gte(a: any, b: any, ctx: Ctx) { return num(evaluateExpr(a, ctx)) >= num(evaluateExpr(b, ctx)) }
function lt(a: any, b: any, ctx: Ctx) { return num(evaluateExpr(a, ctx)) < num(evaluateExpr(b, ctx)) }
function lte(a: any, b: any, ctx: Ctx) { return num(evaluateExpr(a, ctx)) <= num(evaluateExpr(b, ctx)) }
function inOp(val: any, arr: any, ctx: Ctx) {
  const vv = evaluateExpr(val, ctx)
  const aa = evaluateExpr(arr, ctx)
  return Array.isArray(aa) ? aa.includes(vv) : false
}
function includesOp(arr: any, val: any, ctx: Ctx) {
  const aa = evaluateExpr(arr, ctx)
  const vv = evaluateExpr(val, ctx)
  return Array.isArray(aa) ? aa.includes(vv) : (typeof aa === 'string' ? aa.includes(String(vv)) : false)
}
function num(v: any) { return typeof v === 'number' ? v : Number(v) }

// ------- array helpers -------
const ANY: unique symbol = Symbol('any')

function parseArrayPattern(p: string): Array<string | number | symbol> {
  const tokens: Array<string | number | symbol> = []
  const parts = p.split('.')
  for (const part of parts) {
    const m = part.match(/^(\w+)(\[(\*|\d+)\])?$/)
    if (m) {
      tokens.push(m[1])
      if (m[3] === '*') tokens.push(ANY)
      else if (m[3] === undefined && part.endsWith('[]')) tokens.push(ANY)
      else if (m[3] !== undefined && m[3] !== '*') tokens.push(Number(m[3]))
    } else if (part.endsWith('[]')) {
      tokens.push(part.slice(0, -2))
      tokens.push(ANY)
    } else {
      tokens.push(part)
    }
  }
  return tokens
}

function collectByPattern(root: any, pattern: Array<string | number | symbol>): any[] {
  const results: any[] = []
  function dfs(obj: any, idx: number) {
    if (idx >= pattern.length) { results.push(obj); return }
    const token = pattern[idx]
    if (typeof token === 'symbol') {
      if (!Array.isArray(obj)) return
      for (let i = 0; i < obj.length; i++) dfs(obj[i], idx + 1)
    } else {
      if (obj == null || typeof obj !== 'object') return
      dfs(obj[token as any], idx + 1)
    }
  }
  dfs(root, 0)
  return results
}

function asArrayInput(input: any, ctx: Ctx): any[] {
  if (typeof input === 'string') {
    // normalize $self/$parent/$root in pattern path like "$self.rules[]" or "rules[0].items[]"
    const normalized = normalizePatternBase(input, ctx)
    const tokens = parseArrayPattern(normalized)
    return collectByPattern(ctx.form, tokens)
  }
  const v = evaluateExpr(input, ctx)
  if (Array.isArray(v)) return v
  return v == null ? [] : [v]
}

function normalizePatternBase(p: string, ctx: Ctx): string {
  // $root.* -> remove prefix
  if (p === '$root') return ''
  if (p.startsWith('$root.')) return p.slice(6)
  // $self.* -> join with selfPath
  if (p === '$self') return ctx.selfPath || ''
  if (p.startsWith('$self.')) {
    const sub = p.slice(6)
    return ctx.selfPath ? joinPath(ctx.selfPath, sub) : sub
  }
  // $parent.* -> join with parent(selfPath)
  if (p === '$parent') return ctx.selfPath ? parentPath(ctx.selfPath) : ''
  if (p.startsWith('$parent.')) {
    const sub = p.slice(8)
    const base = ctx.selfPath ? parentPath(ctx.selfPath) : ''
    if (!base) return sub
    // Avoid duplicating the last segment of base when sub starts with the same segment
    // Example: self='rules[0].protectionMethods[1]' => base='rules[0].protectionMethods'
    // $parent.protectionMethods[] -> 'rules[0].protectionMethods[]' (NOT 'rules[0].protectionMethods.protectionMethods[]')
    const segs = base.split('.')
    const last = segs[segs.length - 1] || ''
    if (last && (sub === last || sub.startsWith(last + '.') || sub.startsWith(last + '[]') || sub.startsWith(last + '['))) {
      const tail = sub.slice(last.length) // may be '', '[]', '[i]', '.xxx'
      return base + tail
    }
    return joinPath(base, sub)
  }
  return p
}

// Build an aggregation cache key, only when array input is a string pattern
function aggKey(op: string, arrInput: any, ctx: Ctx, exprObj?: any): string | null {
  if (typeof arrInput !== 'string') return null
  const base = normalizePatternBase(arrInput, ctx)
  // read-mostly; build a simple stable key from op + base + stable json of expr
  let exprKey = ''
  try { exprKey = exprObj ? stableStringify(exprObj) : '' } catch { exprKey = '' }
  // parent scope affinity: using base already encodes parent index (e.g., rules[3].items[])
  return `${op}|${base}|${exprKey}`
}

function stableStringify(obj: any): string {
  const seen = new WeakSet<any>()
  const sort = (v: any): any => {
    if (!v || typeof v !== 'object') return v
    if (seen.has(v)) return undefined
    seen.add(v)
    if (Array.isArray(v)) return v.map(sort)
    const out: any = {}
    Object.keys(v).sort().forEach((k) => { out[k] = sort(v[k]) })
    return out
  }
  return JSON.stringify(sort(obj))
}

function someOp(arrInput: any, predicate: any, ctx: Ctx): boolean {
  const items = asArrayInput(arrInput, ctx)
  for (const it of items) { if (evaluateExpr(predicate, { ...ctx, item: it })) return true }
  return false
}

function everyOp(arrInput: any, predicate: any, ctx: Ctx): boolean {
  const items = asArrayInput(arrInput, ctx)
  for (const it of items) { if (!evaluateExpr(predicate, { ...ctx, item: it })) return false }
  return true
}

function lengthOp(arrInput: any, ctx: Ctx): number {
  const items = asArrayInput(arrInput, ctx)
  return items.length
}

function sumOp(arrInput: any, mapExpr: any, ctx: Ctx): number {
  const items = asArrayInput(arrInput, ctx)
  let s = 0
  for (const it of items) s += Number(evaluateExpr(mapExpr, { ...ctx, item: it }) || 0)
  return s
}

function avgOp(arrInput: any, mapExpr: any, ctx: Ctx): number {
  const items = asArrayInput(arrInput, ctx)
  if (items.length === 0) return 0
  return sumOp(arrInput, mapExpr, ctx) / items.length
}

// string helpers
function startsWithOp(a: any, b: any, ctx: Ctx): boolean {
  const aa = evaluateExpr(a, ctx)
  const bb = evaluateExpr(b, ctx)
  return typeof aa === 'string' && typeof bb === 'string' ? aa.startsWith(bb) : false
}
function endsWithOp(a: any, b: any, ctx: Ctx): boolean {
  const aa = evaluateExpr(a, ctx)
  const bb = evaluateExpr(b, ctx)
  return typeof aa === 'string' && typeof bb === 'string' ? aa.endsWith(bb) : false
}
function matchOp(a: any, pattern: any, ctx: Ctx): boolean {
  const aa = evaluateExpr(a, ctx)
  const pp = evaluateExpr(pattern, ctx)
  if (typeof aa !== 'string' || typeof pp !== 'string') return false
  try { return new RegExp(pp).test(aa) } catch { return false }
}
function iifOp(cond: any, t: any, f: any, ctx: Ctx): any {
  return evaluateExpr(cond, ctx) ? evaluateExpr(t, ctx) : evaluateExpr(f, ctx)
}
function coalesceOp(list: any, ctx: Ctx): any {
  const arr = Array.isArray(list) ? list : [list]
  for (const e of arr) {
    const v = evaluateExpr(e, ctx)
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}
