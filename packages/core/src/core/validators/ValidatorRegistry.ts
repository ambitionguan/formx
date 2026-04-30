// Pluggable validator / named-pattern registry for FormX.
export type ValidatorResult = boolean | string | { valid: boolean; message?: string }
export type ValidatorMaybePromise<T> = T | Promise<T>
export type ValidatorFn = (ctx: { value: any; form: any; path: string; selfPath?: string; args?: any; rule?: any }) => ValidatorMaybePromise<ValidatorResult>

export interface ValidatorDefinition {
  validate: ValidatorFn
  async?: boolean
  debounceMs?: number
  message?: string
}

export interface NamedPatternDefinition {
  source: string
  flags?: string
  message?: string
}

export type PatternInput =
  | string
  | RegExp
  | {
      source: string
      flags?: string
      message?: string
    }

function normalizePattern(pattern: PatternInput, message?: string): NamedPatternDefinition | null {
  if (pattern instanceof RegExp) {
    return {
      source: pattern.source,
      flags: pattern.flags || undefined,
      message,
    }
  }
  if (typeof pattern === 'string') {
    return {
      source: pattern,
      message,
    }
  }
  if (pattern && typeof pattern === 'object' && typeof pattern.source === 'string' && pattern.source) {
    return {
      source: pattern.source,
      flags: pattern.flags,
      message: pattern.message ?? message,
    }
  }
  return null
}

class Registry {
  private validators = new Map<string, ValidatorDefinition>()
  private patterns = new Map<string, NamedPatternDefinition>()

  register(name: string, input: ValidatorFn | ValidatorDefinition) {
    if (!name) return
    if (typeof input === 'function') {
      this.validators.set(name, { validate: input })
      return
    }
    if (input && typeof input === 'object' && typeof input.validate === 'function') {
      this.validators.set(name, { ...input })
    }
  }

  unregister(name: string) {
    this.validators.delete(name)
  }

  get(name: string): ValidatorFn | undefined {
    return this.validators.get(name)?.validate
  }

  getDefinition(name: string): ValidatorDefinition | undefined {
    return this.validators.get(name)
  }

  list(): string[] {
    return Array.from(this.validators.keys())
  }

  registerPattern(name: string, pattern: PatternInput, message?: string) {
    if (!name) return
    const normalized = normalizePattern(pattern, message)
    if (!normalized) return
    this.patterns.set(name, normalized)
  }

  unregisterPattern(name: string) {
    this.patterns.delete(name)
  }

  getPattern(name: string): NamedPatternDefinition | undefined {
    return this.patterns.get(name)
  }

  listPatterns(): Array<{ name: string; source: string; flags?: string; message?: string }> {
    return Array.from(this.patterns.entries()).map(([name, pattern]) => ({
      name,
      source: pattern.source,
      flags: pattern.flags,
      message: pattern.message,
    }))
  }
}

export const ValidatorRegistry = new Registry()
