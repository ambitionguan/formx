import type { FormSchema, RuleV2 } from './Types'
import { compileFieldsToRules } from './compile/FieldRulesCompiler'

type Any = any

export function compileSchemaToRules(schema: FormSchema): RuleV2[] {
  return compileFieldsToRules((schema.fields || []) as any[], '', undefined)
}

export function compileSubtreeToRules(fields: Any[], basePath: string, scopeBase?: string): RuleV2[] {
  return compileFieldsToRules(fields || [], basePath || '', scopeBase)
}
