// 路径工具：解析 a.b[2].c，并提供深度读写能力

// 针对 tokenize() 的简单 LRU 缓存，避免在热点路径上反复做正则解析。
const TOKENIZE_CACHE_LIMIT = 2000
const TOKENIZE_CACHE = new Map<string, Array<string | number>>()

export function tokenize(path: string): Array<string | number> {
  if (!path) return []
  const cached = TOKENIZE_CACHE.get(path)
  if (cached) return cached.slice() // return a clone; callers may mutate tokens
  const out: Array<string | number> = []
  const parts = path.split('.')
  for (const part of parts) {
    const re = /(\w+)(\[(\d+)\])?/g
    let m: RegExpExecArray | null
    let matched = false
    while ((m = re.exec(part))) {
      matched = true
      out.push(m[1])
      if (m[3] !== undefined) out.push(Number(m[3]))
    }
    if (!matched) out.push(part)
  }
  TOKENIZE_CACHE.set(path, out)
  if (TOKENIZE_CACHE.size > TOKENIZE_CACHE_LIMIT) {
    const first = TOKENIZE_CACHE.keys().next().value
    if (first !== undefined) TOKENIZE_CACHE.delete(first)
  }
  return out.slice()
}

export function getAt(obj: any, path: string): any {
  if (!path) return obj
  const keys = tokenize(path)
  let cur = obj
  for (const k of keys) {
    if (cur == null) return undefined
    cur = cur[k as any]
  }
  return cur
}

export function setAt(obj: any, path: string, value: any): void {
  const keys = tokenize(path)
  if (keys.length === 0) return
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    const nk = keys[i + 1]
    if (cur[k as any] == null) {
      cur[k as any] = typeof nk === 'number' ? [] : {}
    }
    cur = cur[k as any]
  }
  cur[keys[keys.length - 1] as any] = value
}

export function deleteAt(obj: any, path: string): void {
  const keys = tokenize(path)
  if (keys.length === 0) return
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (cur == null) return
    cur = cur[k as any]
  }
  const last = keys[keys.length - 1]
  if (Array.isArray(cur) && typeof last === 'number') {
    // 数组使用“标记为 undefined”而不是删除，避免重排导致结构不稳定
    cur[last] = undefined
  } else if (cur && typeof cur === 'object') {
    delete (cur as any)[last as any]
  }
}

export function parentPath(path: string): string {
  const keys = tokenize(path)
  if (keys.length <= 1) return ''
  keys.pop()
  return stringifyTokens(keys)
}

export function joinPath(base: string, sub: string): string {
  if (!base) return sub
  if (!sub) return base
  return `${base}.${sub}`
}

export function stringifyTokens(tokens: Array<string | number>): string {
  const parts: string[] = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (typeof t === 'number') {
      const prev = parts.pop() || ''
      parts.push(`${prev}[${t}]`)
    } else {
      parts.push(parts.length ? `.${t}` : `${t}`)
    }
  }
  return parts.join('').replace(/^\./, '')
}
