// Minimal effect registry so Engine can delegate effect handling incrementally
export type EffectHandler = (ctx: any, effect: any, selfPath: string | undefined, diffs: any, queue?: Set<string>) => void

class _EffectRegistry {
  private map = new Map<string, EffectHandler>()
  register(type: string, fn: EffectHandler) { if (type && typeof fn === 'function') this.map.set(type, fn) }
  unregister(type: string) { this.map.delete(type) }
  get(type: string): EffectHandler | undefined { return this.map.get(type) }
}

export const EffectRegistry = new _EffectRegistry()

