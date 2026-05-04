import { computed, onBeforeUnmount, ref, watch, isRef, toRef } from 'vue'
import type { Ref } from 'vue'
import type { FormSchema, FormXEngine as Engine } from '@formxjs/core'
import type { ContainerView, FormView, FieldGroupView, FieldView } from '@formxjs/ui-core'
import { createFormViewRuntime } from '@formxjs/ui-core'
import { buildFieldIndex, buildGroupCommandMap } from '../utils/formViewMaps'

export type FormViewContext = {
  allContainers: ContainerView[]
  groupContainers: ContainerView[]
  nonGroupContainers: ContainerView[]
  fieldIndex: Record<string, FieldView[]>
  groupCommandMap: Map<string, FieldGroupView['commands']>
}

export function useFormViewState(
  engine: Ref<Engine>,
  schema: FormSchema | Ref<FormSchema>
) {
  const version = ref(0)
  let unsubscribe: (() => void) | undefined
  const schemaRef = isRef(schema) ? schema : toRef({ schema }, 'schema')
  const runtime = createFormViewRuntime(engine.value as any, schemaRef.value)
  unsubscribe = runtime.subscribe(() => { version.value += 1 })

  watch(engine, (eng) => { runtime.setEngine(eng as any) })

  onBeforeUnmount(() => {
    runtime.dispose()
    if (unsubscribe) unsubscribe()
  })

  watch(
    schemaRef,
    () => {
      runtime.setSchema(schemaRef.value)
    },
    { deep: true }
  )

  const formView = computed<FormView>(() => {
    version.value
    return runtime.getFormView()
  })

  const getViewContext = (view: FormView): FormViewContext => {
    const allContainers = view.containers || []
    const groupContainers = allContainers.filter((c) => c.type === 'field-group')
    const nonGroupContainers = allContainers.filter((c) => c.type !== 'field-group')
    const fieldIndex = buildFieldIndex(nonGroupContainers)
    const groupCommandMap = buildGroupCommandMap(allContainers)
    return {
      allContainers,
      groupContainers,
      nonGroupContainers,
      fieldIndex,
      groupCommandMap
    }
  }

  return { formView, getViewContext }
}
