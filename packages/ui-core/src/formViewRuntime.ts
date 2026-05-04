import type { FormSchema } from '@formxjs/core'
import type { EngineLike, FormView } from './formView'
import { buildFormView } from './formView'

export type FormViewChangeListener = (diff: any) => void

export type FormViewEngine = EngineLike & {
  subscribe?: (listener: FormViewChangeListener) => (() => void) | void
}

export type FormViewRuntimeListener = () => void

export type FormViewRuntime = {
  getEngine(): FormViewEngine
  getSchema(): FormSchema
  setEngine(next: FormViewEngine): void
  setSchema(next: FormSchema): void
  getFormView(): FormView
  subscribe(listener: FormViewRuntimeListener): () => void
  dispose(): void
}

export function subscribeFormViewEngine(
  engine: FormViewEngine | undefined,
  listener: FormViewChangeListener
) {
  if (!engine || typeof engine.subscribe !== 'function') return undefined
  const res = engine.subscribe(listener)
  return typeof res === 'function' ? res : undefined
}

export function createFormViewRuntime(
  engine: FormViewEngine,
  schema: FormSchema
): FormViewRuntime {
  let currentEngine = engine
  let currentSchema = schema
  const listeners = new Set<FormViewRuntimeListener>()

  const notify = () => {
    listeners.forEach((listener) => {
      try { listener() } catch { /* ignore */ }
    })
  }

  let unsubscribe = subscribeFormViewEngine(currentEngine, () => notify())

  const setEngine = (next: FormViewEngine) => {
    if (next !== currentEngine) {
      if (unsubscribe) unsubscribe()
      currentEngine = next
      unsubscribe = subscribeFormViewEngine(currentEngine, () => notify())
      notify()
    }
  }

  const setSchema = (next: FormSchema) => {
    if (next !== currentSchema) currentSchema = next
    notify()
  }

  const subscribe = (listener: FormViewRuntimeListener) => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }

  const dispose = () => {
    if (unsubscribe) unsubscribe()
    listeners.clear()
  }

  return {
    getEngine: () => currentEngine,
    getSchema: () => currentSchema,
    setEngine,
    setSchema,
    getFormView: () => buildFormView(currentEngine as any, currentSchema),
    subscribe,
    dispose
  }
}
