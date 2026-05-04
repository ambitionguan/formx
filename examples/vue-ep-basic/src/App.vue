<script setup lang="ts">
import { computed, defineComponent, h, nextTick, ref, watch } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { FormX } from '@formxjs/vue'
import type { FormSchema } from '@formxjs/vue'
import { groupLabels, scenarios } from './demoScenarios'
import type { DemoScenario } from './demoScenarios'
import { registerDemoResources } from './demoResources'

type AnyRecord = Record<string, any>
type ValidationMode = 'touched' | 'immediate' | 'submitOnly'

registerDemoResources()

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value || {}))

const activeKey = ref(scenarios[0].key)
const activeScenario = computed<DemoScenario>(
  () => scenarios.find((item) => item.key === activeKey.value) || scenarios[0]
)
const renderSeed = ref(0)
const formRef = ref<any>()
const formModel = ref<AnyRecord>(clone(activeScenario.value.schema.model || {}))
const validationMode = ref<ValidationMode>('touched')
const skipHidden = ref(true)
const skipDisabled = ref(true)
const skipReadOnly = ref(true)
const activeInspector = ref('values')

const validateResult = ref<boolean | null>(null)
const firstErrorPath = ref<string | null>(null)
const errors = ref<Record<string, string[]>>({})
const engineState = ref<AnyRecord>({})
const diagnostics = ref<AnyRecord>({})

const groupedScenarios = computed(() => {
  const groups: Array<{ key: DemoScenario['group']; label: string; items: DemoScenario[] }> = []
  ;(['showcase', 'business', 'linkage', 'runtime'] as DemoScenario['group'][]).forEach((key) => {
    const items = scenarios.filter((item) => item.group === key)
    if (items.length) groups.push({ key, label: groupLabels[key], items })
  })
  return groups
})

const schemaForRender = computed<FormSchema>(() => {
  const source = activeScenario.value.schema as AnyRecord
  return {
    ...source,
    model: formModel.value,
    ui: {
      labelWidth: activeScenario.value.labelWidth || '160px',
      labelSuffix: '：',
      ...(source.ui || {})
    }
  } as FormSchema
})

const policyForRender = computed(() => ({
  validation: {
    mode: validationMode.value,
    skipHidden: skipHidden.value,
    skipDisabled: skipDisabled.value,
    skipReadOnly: skipReadOnly.value
  }
}))

const formKey = computed(() =>
  [
    activeScenario.value.key,
    renderSeed.value,
    validationMode.value,
    skipHidden.value ? 'skip-hidden' : 'check-hidden',
    skipDisabled.value ? 'skip-disabled' : 'check-disabled',
    skipReadOnly.value ? 'skip-readonly' : 'check-readonly'
  ].join(':')
)

const fieldCount = computed(() => countFields(activeScenario.value.schema.fields || []))
const ruleCount = computed(() => (activeScenario.value.schema.rulesV2 || []).length)
const modelKeyCount = computed(() => Object.keys(formModel.value || {}).length)
const scenarioSchemaJson = computed(() => JSON.stringify(activeScenario.value.schema, null, 2))
const valuesJson = computed(() => JSON.stringify(formModel.value, null, 2))
const errorsJson = computed(() => JSON.stringify(errors.value, null, 2))
const stateJson = computed(() => JSON.stringify(engineState.value, null, 2))
const diagnosticsJson = computed(() => JSON.stringify(diagnostics.value, null, 2))

function countFields(fields: any[]): number {
  let total = 0
  fields.forEach((field) => {
    total += 1
    if (Array.isArray(field.children)) total += countFields(field.children)
    if (Array.isArray(field.template)) total += countFields(field.template)
  })
  return total
}

function getEngine() {
  return formRef.value?.engine || null
}

function refreshInspector() {
  const engine = getEngine()
  firstErrorPath.value = engine?.getFirstErrorPath?.() ?? null
  errors.value = engine?.getErrors?.() ?? {}
  engineState.value = engine?.getState?.() ?? {}
  diagnostics.value = engine?.getDiagnostics?.() ?? {}
}

function resetScenario() {
  formModel.value = clone(activeScenario.value.schema.model || {})
  renderSeed.value += 1
  validateResult.value = null
  firstErrorPath.value = null
  errors.value = {}
  engineState.value = {}
  diagnostics.value = {}
}

async function validateForm() {
  validateResult.value = await formRef.value?.validate?.()
  refreshInspector()
  activeInspector.value = validateResult.value ? 'values' : 'errors'
}

function remountForm() {
  renderSeed.value += 1
  nextTick(refreshInspector)
}

watch(activeKey, resetScenario)
watch(formModel, () => refreshInspector(), { deep: true })
watch([validationMode, skipHidden, skipDisabled, skipReadOnly], () => {
  renderSeed.value += 1
  nextTick(refreshInspector)
})

const ShowcaseSummaryCard = defineComponent({
  name: 'ShowcaseSummaryCard',
  setup() {
    return () => {
      const contacts = Array.isArray(formModel.value.contacts) ? formModel.value.contacts : []
      const envTabs = Array.isArray(formModel.value.envTabs) ? formModel.value.envTabs : []
      const checklist = Array.isArray(formModel.value.reviewChecklist)
        ? formModel.value.reviewChecklist
        : []
      const doneCount = checklist.filter((item: AnyRecord) => item?.done).length

      return h('div', { class: 'summary-card' }, [
        h('div', { class: 'summary-card__title' }, 'ShowcaseSummaryCard'),
        h('div', { class: 'summary-card__grid' }, [
          h('div', [h('span', '应用'), h('strong', formModel.value.profile?.appName || '-')]),
          h('div', [h('span', '服务'), h('strong', formModel.value.profile?.serviceId || '-')]),
          h('div', [h('span', '联系人'), h('strong', String(contacts.length))]),
          h('div', [h('span', '月成本'), h('strong', String(formModel.value.ops?.monthlyEstimate ?? '-'))])
        ]),
        h('div', { class: 'summary-card__tags' }, [
          h(ElTag, { type: 'primary' }, () => `环境 ${envTabs.length}`),
          h(ElTag, { type: doneCount === checklist.length ? 'success' : 'warning' }, () =>
            `检查 ${doneCount}/${checklist.length}`
          ),
          h(ElTag, { type: formModel.value.ops?.enableApproval ? 'danger' : 'info' }, () =>
            formModel.value.ops?.enableApproval ? '需要审批' : '无需审批'
          )
        ])
      ])
    }
  }
})

const GroupClearButton = defineComponent({
  name: 'GroupClearButton',
  props: {
    group: { type: Object, required: false },
    groupIndex: { type: Number, required: false }
  },
  setup(props) {
    const clearFields = (node: any) => {
      if (!node) return
      if (node.kind === 'field' && typeof node.setValue === 'function') {
        node.setValue('')
        return
      }
      if (Array.isArray(node.children)) node.children.forEach(clearFields)
    }
    return () =>
      h(
        ElButton,
        {
          type: 'danger',
          link: true,
          size: 'small',
          onClick: () => {
            const group = props.group as AnyRecord
            const index = typeof props.groupIndex === 'number' ? props.groupIndex : -1
            const row = group?.children?.[index]
            clearFields(row)
          }
        },
        () => '清空本行'
      )
  }
})

const customComponents = {
  ShowcaseSummaryCard,
  GroupClearButton
}
</script>

<template>
  <div class="workbench-shell">
    <aside class="sidebar">
      <div class="brand-block">
        <div class="brand-title">FormX Workbench</div>
        <div class="brand-subtitle">Vue + Element Plus</div>
      </div>

      <el-scrollbar class="scenario-scroll">
        <div v-for="group in groupedScenarios" :key="group.key" class="scenario-group">
          <div class="scenario-group__label">{{ group.label }}</div>
          <button
            v-for="scenario in group.items"
            :key="scenario.key"
            class="scenario-item"
            :class="{ 'is-active': scenario.key === activeKey }"
            @click="activeKey = scenario.key"
          >
            <span>{{ scenario.title }}</span>
            <small>{{ scenario.description }}</small>
          </button>
        </div>
      </el-scrollbar>
    </aside>

    <main class="main-pane">
      <header class="topbar">
        <div>
          <div class="eyebrow">{{ groupLabels[activeScenario.group] }}</div>
          <h1>{{ activeScenario.title }}</h1>
          <p>{{ activeScenario.description }}</p>
        </div>
        <div class="topbar-actions">
          <el-select v-model="validationMode" size="small" style="width: 150px">
            <el-option label="touched" value="touched" />
            <el-option label="immediate" value="immediate" />
            <el-option label="submitOnly" value="submitOnly" />
          </el-select>
          <el-button size="small" @click="refreshInspector">刷新快照</el-button>
          <el-button size="small" @click="remountForm">重新挂载</el-button>
          <el-button size="small" @click="resetScenario">重置</el-button>
          <el-button size="small" type="primary" @click="validateForm">校验</el-button>
        </div>
      </header>

      <section class="stats-row">
        <div class="stat-card">
          <span>字段</span>
          <strong>{{ fieldCount }}</strong>
        </div>
        <div class="stat-card">
          <span>规则</span>
          <strong>{{ ruleCount }}</strong>
        </div>
        <div class="stat-card">
          <span>模型键</span>
          <strong>{{ modelKeyCount }}</strong>
        </div>
        <div class="stat-card">
          <span>校验</span>
          <strong>{{ validateResult === null ? '-' : validateResult ? '通过' : '失败' }}</strong>
        </div>
        <div class="policy-card">
          <el-checkbox v-model="skipHidden">跳过隐藏</el-checkbox>
          <el-checkbox v-model="skipDisabled">跳过禁用</el-checkbox>
          <el-checkbox v-model="skipReadOnly">跳过只读</el-checkbox>
        </div>
      </section>

      <div class="content-grid">
        <section class="form-surface">
          <FormX
            :key="formKey"
            ref="formRef"
            v-model:value="formModel"
            :schema="schemaForRender"
            :policy="policyForRender"
            :components="customComponents"
            :skin-props="{ labelWidth: activeScenario.labelWidth || '160px' }"
          />
        </section>

        <aside class="inspector">
          <div class="inspector-head">
            <span>Inspector</span>
            <code>{{ firstErrorPath || 'no-error-path' }}</code>
          </div>
          <el-tabs v-model="activeInspector" stretch>
            <el-tab-pane label="Values" name="values">
              <pre>{{ valuesJson }}</pre>
            </el-tab-pane>
            <el-tab-pane label="Errors" name="errors">
              <pre>{{ errorsJson }}</pre>
            </el-tab-pane>
            <el-tab-pane label="State" name="state">
              <pre>{{ stateJson }}</pre>
            </el-tab-pane>
            <el-tab-pane label="Diag" name="diagnostics">
              <pre>{{ diagnosticsJson }}</pre>
            </el-tab-pane>
            <el-tab-pane label="Schema" name="schema">
              <pre>{{ scenarioSchemaJson }}</pre>
            </el-tab-pane>
          </el-tabs>
        </aside>
      </div>
    </main>
  </div>
</template>
