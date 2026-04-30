// 轻量级的资源注册中心，支持缓存、并发控制与防抖

type Handler = (params?: Record<string, any>) => Promise<any>

export type ResourceMode = 'latest' | 'queue' | 'drop'

interface RegistryItem {
  handler: Handler
  ttl?: number
  mode?: ResourceMode
}

interface CacheItem {
  expiry: number
  data: any
}

export class ResourceManager {
  private static registry: Map<string, RegistryItem> = new Map()
  private static cache: Map<string, CacheItem> = new Map()
  private static inflight: Map<string, Promise<any>> = new Map()
  private static queue: Map<string, Promise<any>> = new Map()
  private static debounceTimers: Map<string, any> = new Map()
  private static aborters: Map<string, AbortController> = new Map()

  static register(key: string, handler: Handler, opts?: { ttl?: number; mode?: ResourceMode }) {
    this.registry.set(key, { handler, ttl: opts?.ttl, mode: opts?.mode })
  }

  static async fetch(
    requestKey: string,
    params?: Record<string, any>,
    opts?: {
      ttl?: number
      cacheKey?: string
      mode?: ResourceMode
      debounceMs?: number
      abortPrevious?: boolean
      retries?: number
      retryDelayMs?: number
      backoff?: 'linear' | 'exp'
      onRetry?: (attempt: number, error: any) => void
    }
  ): Promise<any> {
    const reg = this.registry.get(requestKey)
    if (!reg) throw new Error(`Resource handler not found: ${requestKey}`)
    const handler = reg.handler
    const effTtl = (opts?.ttl ?? 0) || reg.ttl || 0
    const effMode: ResourceMode = opts?.mode || reg.mode || 'latest'

    const key = opts?.cacheKey || `${requestKey}|${JSON.stringify(params || {})}`
    const now = Date.now()
    const cached = this.cache.get(key)
    if (cached && effTtl > 0 && cached.expiry > now) {
      return cached.data
    }

    const exec = () => {
      const inflight = this.inflight.get(key)
      if (inflight) {
        if (effMode === 'drop') return inflight
        if (effMode === 'queue') {
          const q = this.queue.get(key) || Promise.resolve()
          const chained = q
            .then(() => this.invoke(handler, key, params, effTtl, 0, 500, 'linear'))
            .finally(() => {})
          this.queue.set(key, chained)
          return chained
        }
        // latest: return current inflight; optionally abort previous and start new
        if (opts?.abortPrevious) this.abort(key)
        return inflight
      }
      return this.invoke(
        handler,
        key,
        params,
        effTtl,
        opts?.retries || 0,
        opts?.retryDelayMs || 500,
        opts?.backoff || 'linear',
        opts?.onRetry
      )
    }

    if (opts?.debounceMs && opts.debounceMs > 0) {
      return new Promise((resolve, reject) => {
        const t = this.debounceTimers.get(key)
        if (t) clearTimeout(t)
        const timer = setTimeout(() => {
          this.debounceTimers.delete(key)
          exec().then(resolve).catch(reject)
        }, opts.debounceMs)
        this.debounceTimers.set(key, timer)
      })
    }
    return exec()
  }

  private static invoke(
    handler: Handler,
    key: string,
    params: Record<string, any> | undefined,
    ttlSec: number,
    retries: number,
    retryDelayMs: number,
    backoff: 'linear' | 'exp',
    onRetry?: (attempt: number, error: any) => void
  ) {
    const now = Date.now()
    // prepare abort controller and pass signal if handler支持
    const ac = new AbortController()
    this.aborters.set(key, ac)
    const p = handler({ ...(params || {}), signal: ac.signal } as any)
      .then((data) => {
        if (ttlSec > 0) this.cache.set(key, { data, expiry: now + ttlSec * 1000 })
        this.inflight.delete(key)
        this.aborters.delete(key)
        return data
      })
      .catch((e) => {
        this.inflight.delete(key)
        this.aborters.delete(key)
        if (retries > 0) {
          const attempt = (this.optsCounter.get(key) || 0) + 1
          this.optsCounter.set(key, attempt)
          try {
            onRetry && onRetry(attempt, e)
          } catch {}
          const delay =
            backoff === 'exp' ? Math.round(retryDelayMs * 2 ** (attempt - 1)) : retryDelayMs
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              this.invoke(handler, key, params, ttlSec, retries - 1, retryDelayMs, backoff, onRetry)
                .then(resolve)
                .catch(reject)
            }, delay)
          })
        }
        throw e
      })
    this.inflight.set(key, p)
    return p
  }

  // track attempts per key for backoff
  private static optsCounter: Map<string, number> = new Map()

  static abort(key: string) {
    const ac = this.aborters.get(key)
    if (ac) {
      try {
        ac.abort()
      } catch {}
      this.aborters.delete(key)
    }
  }

  static invalidate(cacheKey: string) {
    this.cache.delete(cacheKey)
  }

  static clearCache() {
    this.cache.clear()
  }

  /** 按 requestKey 前缀批量失效缓存条目 */
  static invalidateByRequestKey(requestKey: string) {
    const prefix = `${requestKey}|`
    const keys = Array.from(this.cache.keys())
    keys.forEach((k) => {
      if (k.startsWith(prefix)) this.cache.delete(k)
    })
  }
}
