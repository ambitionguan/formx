import type { RuleV2 } from '../Types'
import { parseWhenLike, extractParamDeps } from './WhenUtils'
import { compileShorthandsForField } from './ShortcutsCompiler'

type Any = any

export function compileFieldsToRules(fields: Any[], basePath: string, scopeBase?: string): RuleV2[] {
  const out: RuleV2[] = []
  walk(fields || [], basePath || '', out, scopeBase)
  return out
}

function walk(fields: Any[], basePath: string, out: RuleV2[], scopeBase?: string) {
  const inScope = !!scopeBase
  const relFromScope = (full: string) => {
    if (!scopeBase) return full
    const prefix = scopeBase.endsWith('.') ? scopeBase : scopeBase + '.'
    if (full.startsWith(prefix)) return full.slice(prefix.length)
    if (full === scopeBase) return ''
    return full
  }
  const selfify = (p: string) => {
    if (!scopeBase) return p
    if (!p || p.startsWith('$')) return p
    return `$self.${p}`
  }
  const targetSelf = (fieldPath: string) => {
    if (!scopeBase) return fieldPath
    const rel = relFromScope(fieldPath)
    const key = rel || ''
    return key ? `$self.${key}` : `$self`
  }
  for (const f of (fields || [])) {
    const fieldPath = basePath ? `${basePath}.${f.id}` : f.id
    if (f.showWhen) {
      const p = parseWhenLike(f.showWhen, selfify)
      if (p) out.push({ id: `show_${fieldPath}`, scope: scopeBase, watch: [p.field], when: p.expr, effects: [ { type: 'setVisible', target: targetSelf(fieldPath), value: true } ], elseEffects: [ { type: 'setVisible', target: targetSelf(fieldPath), value: false } ] } as RuleV2)
    }
    if (f.optionsFrom) {
      const params = f.params || {}
      const deps = extractParamDeps(params)
      if (f.fetchOnMount || deps.length === 0) out.push({ id: `fetch_init_${fieldPath}`, trigger: ['init'], effects: [ { type: 'fetch', target: targetSelf(fieldPath), requestKey: f.optionsFrom, params, ttl: f.ttl || 0, cacheKey: f.cacheKey, debounceMs: f.debounce, retries: (f as any).retries, retryDelayMs: (f as any).retryDelayMs, map: (f as any).map, fallbackOptions: (f as any).fallbackOptions } as any ] } as RuleV2)
      if (deps.length > 0) out.push({ id: `fetch_deps_${fieldPath}`, scope: scopeBase, watch: deps.map(selfify), effects: [ { type: 'fetch', target: targetSelf(fieldPath), requestKey: f.optionsFrom, params, ttl: f.ttl || 0, cacheKey: f.cacheKey, debounceMs: f.debounce, retries: (f as any).retries, retryDelayMs: (f as any).retryDelayMs, map: (f as any).map, fallbackOptions: (f as any).fallbackOptions } as any ] } as RuleV2)
      if (f.showWhen) {
        const p = parseWhenLike(f.showWhen, selfify)
        if (p) out.push({ id: `fetch_visible_${fieldPath}`, scope: scopeBase, watch: [p.field], when: p.expr, effects: [ { type: 'fetch', target: targetSelf(fieldPath), requestKey: f.optionsFrom, params, ttl: f.ttl || 0, cacheKey: f.cacheKey, map: (f as any).map, fallbackOptions: (f as any).fallbackOptions } as any ] } as RuleV2)
      }
    }
    if (f.hideWhen) {
      const p = parseWhenLike(f.hideWhen, selfify)
      if (p) out.push({ id: `hide_${fieldPath}`, scope: scopeBase, watch: [p.field], when: p.expr, effects: [ { type: 'setVisible', target: targetSelf(fieldPath), value: false } ], elseEffects: [ { type: 'setVisible', target: targetSelf(fieldPath), value: true } ] } as RuleV2)
    }
    if (f.disableWhen) {
      const p = parseWhenLike(f.disableWhen, selfify)
      if (p) out.push({ id: `disable_${fieldPath}`, scope: scopeBase, watch: [p.field], when: p.expr, effects: [ { type: 'setDisabled', target: targetSelf(fieldPath), value: true } ], elseEffects: [ { type: 'setDisabled', target: targetSelf(fieldPath), value: false } ] } as RuleV2)
    }
    if (f.readOnlyWhen) {
      const p = parseWhenLike(f.readOnlyWhen, selfify)
      if (p) out.push({ id: `readOnly_${fieldPath}`, scope: scopeBase, watch: [p.field], when: p.expr, effects: [ { type: 'setReadOnly', target: targetSelf(fieldPath), value: true } ], elseEffects: [ { type: 'setReadOnly', target: targetSelf(fieldPath), value: false } ] } as RuleV2)
    }
    compileShorthandsForField(f, fieldPath, scopeBase, out, { selfify, targetSelf })
    const nextBase = f.type === 'form-object' && f.flatten ? basePath : fieldPath
    if (Array.isArray(f.children)) walk(f.children, nextBase, out, scopeBase)
    if (Array.isArray(f.template)) walk(f.template, `${fieldPath}[]`, out, `${fieldPath}[]`)
  }
}
