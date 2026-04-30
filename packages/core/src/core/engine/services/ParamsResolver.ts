import { compileExpr } from '../../Expression'
import { getAt } from '../../Path'

export function resolveParams(val: any, form: any, selfPath?: string, resolveScopedPath?: (p: string, self?: string) => string): any {
  if (val == null) return val
  if (Array.isArray(val)) return val.map((v) => resolveParams(v, form, selfPath, resolveScopedPath))
  if (typeof val === 'object') {
    // expression object
    if ('var' in val || 'and' in val || 'or' in val || 'not' in val
      || '==' in val || '!=' in val || '>' in val || '>=' in val || '<' in val || '<=' in val
      || 'in' in val || 'nin' in val || 'includes' in val || 'startsWith' in val || 'endsWith' in val || 'match' in val
      || 'iif' in val || 'coalesce' in val || 'some' in val || 'every' in val || 'none' in val || 'len' in val || 'sum' in val || 'avg' in val) {
      return compileExpr(val)({ form, selfPath })
    }
    const out: any = {}
    Object.keys(val).forEach((k) => { out[k] = resolveParams(val[k], form, selfPath, resolveScopedPath) })
    return out
  }
  if (typeof val === 'string') {
    const exactForm = val.match(/^\{\{\s*form\.([^}]+)\s*\}\}$/)
    const exactSelf = val.match(/^\{\{\s*\$self\.([^}]+)\s*\}\}$/)
    const exactRoot = val.match(/^\{\{\s*\$root\.([^}]+)\s*\}\}$/)
    const exactParent = val.match(/^\{\{\s*\$parent\.([^}]+)\s*\}\}$/)
    if (exactForm) return getAt(form, exactForm[1].trim())
    if (exactRoot) return getAt(form, exactRoot[1].trim())
    if (exactSelf && resolveScopedPath) {
      const abs = resolveScopedPath(`$self.${exactSelf[1].trim()}`, selfPath)
      return getAt(form, abs)
    }
    if (exactParent && resolveScopedPath) {
      const abs = resolveScopedPath(`$parent.${exactParent[1].trim()}`, selfPath)
      return getAt(form, abs)
    }
    let s = val
    s = s.replace(/\{\{\s*form\.([^}]+)\s*\}\}/g, (_m, p) => {
      const v = getAt(form, String(p).trim()); return v == null ? '' : String(v)
    })
    s = s.replace(/\{\{\s*\$root\.([^}]+)\s*\}\}/g, (_m, p) => {
      const v = getAt(form, String(p).trim()); return v == null ? '' : String(v)
    })
    if (resolveScopedPath) {
      s = s.replace(/\{\{\s*\$self\.([^}]+)\s*\}\}/g, (_m, p) => {
        const abs = resolveScopedPath(`$self.${String(p).trim()}`, selfPath)
        const v = getAt(form, abs); return v == null ? '' : String(v)
      })
      s = s.replace(/\{\{\s*\$parent\.([^}]+)\s*\}\}/g, (_m, p) => {
        const abs = resolveScopedPath(`$parent.${String(p).trim()}`, selfPath)
        const v = getAt(form, abs); return v == null ? '' : String(v)
      })
    }
    return s
  }
  return val
}

