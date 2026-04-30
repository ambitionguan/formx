import type { RuleV2 } from '../Types'
import { parseWhenExpr, condToExpr, collectVarDepsFromExpr, parseWhenLike } from './WhenUtils'

type Any = any

export interface ShortcutHelpers {
  selfify: (p: string) => string
  targetSelf: (fieldPath: string) => string
}

/**
 * Compile shorthand configurations on a field into RuleV2s.
 * Includes: patchWhen/change/compute/requiredWhen/valueWhen
 */
export function compileShorthandsForField(
  f: Any,
  fieldPath: string,
  scopeBase: string | undefined,
  out: RuleV2[],
  helpers: ShortcutHelpers
) {
  const inScope = !!scopeBase
  const { selfify, targetSelf } = helpers

  // patchWhen: [{ when, patch }]
  if (Array.isArray(f.patchWhen)) {
    f.patchWhen.forEach((pw: any, i: number) => {
      const p = parseWhenLike(pw.when, selfify)
      if (p) {
        out.push({
          id: `patch_${fieldPath}_${i}`,
          scope: scopeBase,
          watch: [p.field],
          when: p.expr,
          effects: [ { type: 'patch', target: targetSelf(fieldPath), value: pw.patch } as any ]
        } as RuleV2)
      }
    })
  }

  // change shorthand
  if (f.change) {
    const changes = Array.isArray(f.change) ? f.change : Object.entries(f.change).map(([target, action]) => ({ target, action }))
    changes.forEach((c: any, i: number) => {
      const effect: any = (() => {
        const tgt = scopeBase ? selfify(c.target) : c.target
        if (c.action === 'clearValue') return { type: 'set', target: tgt, value: undefined }
        if (c.action === 'setValue') return { type: 'set', target: tgt, value: c.value }
        if (c.action === 'patch') return { type: 'patch', target: tgt, value: c.patch }
        if (c.action === 'copyValue') return { type: 'copyValue', target: tgt, from: targetSelf(fieldPath) }
        return { type: 'set', target: tgt, value: c.value }
      })()
      // 用 watch 代替 trigger，保证 $self 能解析
      out.push({ id: `change_${fieldPath}_${i}`, scope: scopeBase, watch: [targetSelf(fieldPath)], effects: [effect] } as RuleV2)
    })
  }

  // compute shorthand: { expr, when?, watch?, target? } | Array<...>
  if (f.compute) {
    const computes = Array.isArray(f.compute) ? f.compute : [f.compute]
    computes.forEach((c: any, i: number) => {
      const target = c.target ? (scopeBase ? selfify(c.target) : c.target) : targetSelf(fieldPath)
      const whenExpr = typeof c.when === 'string' ? condToExpr(parseWhenExpr(c.when)!) : c.when
      const autoWatch = collectVarDepsFromExpr(c.expr)
      const whenDeps = collectVarDepsFromExpr(whenExpr)
      const watch = Array.from(new Set([...(c.watch || [])].map(selfify).concat(autoWatch, whenDeps)))
      const rule: RuleV2 = { id: `compute_${target}_${i}`, scope: scopeBase, watch, when: whenExpr, effects: [ { type: 'set', target, value: c.expr } as any ] }
      out.push(rule)
    })
  }

  // requiredWhen
  if (f.requiredWhen) {
    const p = parseWhenLike(f.requiredWhen, selfify)
    if (p) {
      out.push({
        id: `required_${fieldPath}`,
        scope: scopeBase,
        watch: [p.field],
        when: p.expr,
        effects: [ { type: 'setRequired', target: targetSelf(fieldPath), value: true } ],
        elseEffects: [ { type: 'setRequired', target: targetSelf(fieldPath), value: false } ]
      } as RuleV2)
    }
  }

  // valueWhen
  if (f.valueWhen && typeof f.valueWhen === 'object' && f.valueWhen.when) {
    const p = parseWhenLike(f.valueWhen.when, selfify)
    if (p) {
      out.push({ id: `value_${fieldPath}`, scope: scopeBase, watch: [p.field], when: p.expr, effects: [ { type: 'set', target: targetSelf(fieldPath), value: f.valueWhen.value } ] } as RuleV2)
    }
  }
}
