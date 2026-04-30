import type { FormXMessageParams, FormXMessageResolver } from '@formx/core'

type Locale = 'zh-CN' | 'en-US'

const DEFAULT_MESSAGES: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    'formx.group.copy': '复制',
    'formx.group.moveUp': '上移',
    'formx.group.moveDown': '下移',
    'formx.group.remove': '删除',
    'formx.group.add': '+ 添加',
    'formx.group.account': '账号',
    'formx.group.item': '项',
    'formx.group.empty': '暂无数据',
    'formx.group.actions': '操作',
    'formx.common.expand': '展开',
    'formx.common.collapse': '收起',
    'formx.common.loading': '加载中...',
    'formx.common.remove': '移除',
    'formx.common.add': '添加',
    'formx.common.showingItems': '已显示前 {windowSize} 项，共 {total} 项',
    'formx.validation.required': '必填',
    'formx.validation.requiredWithLabel': '{label}为必填',
    'formx.validation.outOfRange': '不在允许的取值范围内',
    'formx.validation.invalidFormat': '格式不正确',
    'formx.validation.validationFailed': '校验未通过'
  },
  'en-US': {
    'formx.group.copy': 'Copy',
    'formx.group.moveUp': 'Move Up',
    'formx.group.moveDown': 'Move Down',
    'formx.group.remove': 'Remove',
    'formx.group.add': '+ Add',
    'formx.group.account': 'Account',
    'formx.group.item': 'Item',
    'formx.group.empty': 'No Data',
    'formx.group.actions': 'Actions',
    'formx.common.expand': 'Expand',
    'formx.common.collapse': 'Collapse',
    'formx.common.loading': 'Loading...',
    'formx.common.remove': 'Remove',
    'formx.common.add': 'Add',
    'formx.common.showingItems': 'Showing first {windowSize} of {total} items',
    'formx.validation.required': 'Required',
    'formx.validation.requiredWithLabel': '{label} is required',
    'formx.validation.outOfRange': 'Value is out of allowed range',
    'formx.validation.invalidFormat': 'Invalid format',
    'formx.validation.validationFailed': 'Validation failed'
  }
}

const I18N_KEY = 'i18nKey'

let currentLocale: Locale = 'zh-CN'
let messageResolver: FormXMessageResolver | undefined

export function setFormXVueEpLocale(locale: Locale) {
  currentLocale = locale
}

export function setFormXVueEpMessageResolver(resolver?: FormXMessageResolver | null) {
  messageResolver = resolver || undefined
}

export async function addBaseMessages(..._args: unknown[]) {
  // Kept as a small compatibility shim for code migrated from the host monorepo.
}

function interpolate(message: string, params?: FormXMessageParams) {
  if (!params) return message
  return message.replace(/\{([^{}]+)\}/g, (raw, key) => {
    const value = params[key]
    return value == null ? raw : String(value)
  })
}

export function tf(key: string, params?: FormXMessageParams): string {
  try {
    const resolved = messageResolver?.(key, params)
    if (typeof resolved === 'string' && resolved && resolved !== key) {
      return interpolate(resolved, params)
    }
  } catch {
    // Ignore resolver failures and fall back to local defaults.
  }
  return interpolate(DEFAULT_MESSAGES[currentLocale][key] || key, params)
}

function translate(key: string, fallback: string) {
  if (!key) return fallback
  const translated = tf(key)
  return translated === key ? fallback : translated
}

export function processI18nObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    return obj.map((item) => processI18nObject(item)) as T
  }

  const result: Record<string, any> = { ...(obj as Record<string, any>) }
  for (const key in result) {
    if (key === I18N_KEY) {
      const i18nKey = result[key]
      if (i18nKey && typeof i18nKey === 'object') {
        for (const fieldKey in i18nKey) {
          if (result[fieldKey] && typeof result[fieldKey] === 'string') {
            result[fieldKey] = translate(i18nKey[fieldKey], result[fieldKey])
          }
        }
      }
    } else if (result[key] && typeof result[key] === 'object') {
      result[key] = processI18nObject(result[key])
    }
  }
  return result as T
}
