import type {
  FormXMessageOptions,
  FormXMessageParams,
  FormXMessageResolver,
  I18nKeyConfig
} from './Types'

const DEFAULT_MESSAGES: Record<string, string> = {
  'formx.validation.required': '必填',
  'formx.validation.requiredWithLabel': '{label}为必填',
  'formx.validation.outOfRange': '不在允许的取值范围内',
  'formx.validation.invalidFormat': '格式不正确',
  'formx.validation.validationFailed': '校验未通过',
  'formx.validation.minLength': '最少 {min} 个字符',
  'formx.validation.maxLength': '最多 {max} 个字符',
  'formx.validation.min': '不能小于 {min}',
  'formx.validation.max': '不能大于 {max}'
}

let globalMessageResolver: FormXMessageResolver | undefined

export function normalizeFormXMessageResolver(
  input?: FormXMessageOptions | FormXMessageResolver
): FormXMessageResolver | undefined {
  if (typeof input === 'function') return input
  if (input && typeof input.resolve === 'function') return input.resolve
  return undefined
}

export function setFormXMessageResolver(resolver?: FormXMessageResolver | null) {
  globalMessageResolver = resolver || undefined
}

export function getFormXMessageResolver() {
  return globalMessageResolver
}

function interpolateMessage(message: string, params?: FormXMessageParams) {
  if (!params) return message
  return message.replace(/\{([^{}]+)\}/g, (raw, key) => {
    const value = params[key]
    return value == null ? raw : String(value)
  })
}

export function tryResolveFormXMessage(
  key: string | undefined,
  params?: FormXMessageParams,
  resolver?: FormXMessageResolver
): string | undefined {
  if (!key) return undefined
  const candidates = [resolver, globalMessageResolver].filter(Boolean) as FormXMessageResolver[]
  for (const candidate of candidates) {
    try {
      const resolved = candidate(key, params)
      if (typeof resolved === 'string' && resolved && resolved !== key) {
        return interpolateMessage(resolved, params)
      }
    } catch {
      // Ignore resolver failures and fall back to core defaults.
    }
  }
  const fallback = DEFAULT_MESSAGES[key]
  return fallback ? interpolateMessage(fallback, params) : undefined
}

export function resolveFormXMessage(
  key: string,
  params?: FormXMessageParams,
  fallback?: string,
  resolver?: FormXMessageResolver
) {
  return tryResolveFormXMessage(key, params, resolver) || fallback || key
}

export function getI18nMessageKey(i18nKey: I18nKeyConfig | undefined, field = 'message') {
  if (!i18nKey) return undefined
  if (typeof i18nKey === 'string') return i18nKey
  return i18nKey[field] || i18nKey.message
}

export function resolveFormXI18nMessage(
  i18nKey: I18nKeyConfig | undefined,
  field = 'message',
  params?: FormXMessageParams,
  fallback?: string,
  resolver?: FormXMessageResolver
) {
  const key = getI18nMessageKey(i18nKey, field)
  if (!key) return fallback
  return tryResolveFormXMessage(key, params, resolver) || fallback
}
