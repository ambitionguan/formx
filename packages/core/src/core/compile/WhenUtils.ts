import type { RuleV2 } from '../Types'

export function normalizeLiteral(raw: string): any {
  const r = String(raw).trim()
  if (r === 'true') return true
  if (r === 'false') return false
  if (r === 'null') return null
  if (r === 'undefined') return undefined
  if (/^\d+(\.\d+)?$/.test(r)) return Number(r)
  const qm = r.match(/^["'](.*)["']$/)
  if (qm) return qm[1]
  return r
}

export function parseWhenExpr(expr: string): { field: string; op: string; val?: any } | null {
  const t = expr.trim()
  let m = t.match(/^(\w+(?:\.\w+)*)\s*(==|=)\s*(.+)$/)
  if (m) return { field: m[1], op: '==', val: normalizeLiteral(m[3]) }
  m = t.match(/^(\w+(?:\.\w+)*)\s*!=\s*(.+)$/)
  if (m) return { field: m[1], op: '!=', val: normalizeLiteral(m[2]) }
  m = t.match(/^(\w+(?:\.\w+)*)\s*>=\s*(.+)$/)
  if (m) return { field: m[1], op: '>=', val: normalizeLiteral(m[2]) }
  m = t.match(/^(\w+(?:\.\w+)*)\s*<=\s*(.+)$/)
  if (m) return { field: m[1], op: '<=', val: normalizeLiteral(m[2]) }
  m = t.match(/^(\w+(?:\.\w+)*)\s*>\s*(.+)$/)
  if (m) return { field: m[1], op: '>', val: normalizeLiteral(m[2]) }
  m = t.match(/^(\w+(?:\.\w+)*)\s*<\s*(.+)$/)
  if (m) return { field: m[1], op: '<', val: normalizeLiteral(m[2]) }
  m = t.match(/^(\w+(?:\.\w+)*)\s+in\s+\[(.*)\]$/)
  if (m) {
    const items = (m[2] || '')
      .split(',')
      .map((s) => normalizeLiteral(s.trim()))
      .filter((v) => v !== undefined)
    return { field: m[1], op: 'in', val: items }
  }
  if (/^\w+(?:\.\w+)*$/.test(t)) return { field: t, op: 'truthy' }
  return null
}

export function parseWhenLike(input: any, mapField?: (field: string) => string): { field: string; expr: any } | null {
  if (!input) return null
  const map = mapField || ((f: string) => f)
  if (typeof input === 'string') {
    const p = parseWhenExpr(input)
    if (!p) return null
    const field = map(p.field)
    return { field, expr: condToExpr({ ...p, field }) }
  }
  if (typeof input === 'object') {
    const raw = String((input as any).field || '').trim()
    if (!raw) return null
    const field = map(raw)
    if (Object.prototype.hasOwnProperty.call(input, 'eq')) {
      return { field, expr: condToExpr({ field, op: '==', val: (input as any).eq }) }
    }
    if (Object.prototype.hasOwnProperty.call(input, 'ne') || Object.prototype.hasOwnProperty.call(input, 'neq')) {
      const val = Object.prototype.hasOwnProperty.call(input, 'ne') ? (input as any).ne : (input as any).neq
      return { field, expr: condToExpr({ field, op: '!=', val }) }
    }
    if (Array.isArray((input as any).in)) {
      return { field, expr: condToExpr({ field, op: 'in', val: (input as any).in }) }
    }
    return null
  }
  return null
}

export function condToExpr(c: { field: string; op: string; val?: any }): any {
  switch (c.op) {
    case '==': return { '==': [ { var: c.field }, c.val ] }
    case '!=': return { '!=': [ { var: c.field }, c.val ] }
    case '>': return { '>': [ { var: c.field }, c.val ] }
    case '>=': return { '>=': [ { var: c.field }, c.val ] }
    case '<': return { '<': [ { var: c.field }, c.val ] }
    case '<=': return { '<=': [ { var: c.field }, c.val ] }
    case 'in': return { in: [ { var: c.field }, c.val ] }
    case 'truthy':
      // 更贴近直觉的“真值”：已定义且不为 false（避免 boolean false 被视作真）
      // 仍允许非布尔类型的值（如非空字符串、非空数组）为真
      return { and: [ { '!=': [ { var: c.field }, undefined ] }, { '!=': [ { var: c.field }, false ] } ] }
    default: return { '==': [ { var: c.field }, c.val ] }
  }
}

export function extractParamDeps(params: any): string[] {
  const deps = new Set<string>()
  const walk = (v: any) => {
    if (v == null) return
    if (typeof v === 'string') {
      // 支持三种占位：{{form.xxx}} / {{$self.xxx}} / {{$root.xxx}} / {{$parent.xxx}}
      const res = [
        /\{\{\s*form\.([\w.\[\]0-9]+)\s*\}\}/g,
        /\{\{\s*\$self\.([\w.\[\]0-9]+)\s*\}\}/g,
        /\{\{\s*\$root\.([\w.\[\]0-9]+)\s*\}\}/g,
        /\{\{\s*\$parent\.([\w.\[\]0-9]+)\s*\}\}/g
      ]
      for (const re of res) {
        let m: RegExpExecArray | null
        while ((m = re.exec(v))) {
          const p = m[1]
          if (!p) continue
          if (re === res[0]) deps.add(p) // form.xxx → 裸路径，编译期在 scope 内会自带 $self
          else if (re === res[1]) deps.add(`$self.${p}`)
          else if (re === res[2]) deps.add(`$root.${p}`)
          else if (re === res[3]) deps.add(`$parent.${p}`)
        }
      }
      return
    }
    if (Array.isArray(v)) { v.forEach(walk); return }
    if (typeof v === 'object') { Object.values(v).forEach(walk); return }
  }
  walk(params)
  return Array.from(deps)
}

export function collectVarDepsFromExpr(expr: any): string[] {
  const out = new Set<string>()
  const walk = (e: any) => {
    if (!e) return
    if (Array.isArray(e)) return e.forEach(walk)
    if (typeof e === 'object') {
      if (Object.prototype.hasOwnProperty.call(e, 'var')) {
        const v = e['var']
        if (typeof v === 'string') out.add(v)
      }
      Object.keys(e).forEach((k) => {
        if (k === 'var') return
        walk(e[k])
      })
    }
  }
  walk(expr)
  return Array.from(out)
}
