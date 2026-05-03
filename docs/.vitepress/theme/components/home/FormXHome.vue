<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    locale?: 'zh' | 'en'
  }>(),
  {
    locale: 'zh'
  }
)

const content = {
  zh: {
    eyebrow: 'BY FORMX / HEADLESS FORM ENGINE',
    title: '复杂业务表单的\n声明式运行时',
    lead:
      '用 JSON Schema 描述字段、联动、校验和远程资源。核心引擎独立运行，Vue + Element Plus 只是其中一个可替换的渲染皮肤。',
    start: '开始使用',
    examples: '查看示例',
    installLabel: '安装 FormX',
    stageLabel: 'FormX 运行时分层动画',
    proofHeadline: 'Built for schema-driven product teams',
    proof: ['Admin', 'Low-code', 'Designer', 'Runtime', 'Validation', 'Open Source'],
    introTitle: '重新组织表单开发体验',
    intro:
      'FormX 把表单拆成稳定的协议层：核心引擎只管状态和规则，UI 皮肤只管渲染。复杂联动不再散落在组件 watch 和事件回调里。',
    features: [
      {
        title: 'Headless Core',
        text: '@formx/core 可在浏览器、Node、设计器和测试环境独立运行，不依赖 Vue 或 Element Plus。'
      },
      {
        title: 'JSON DSL',
        text: '字段、容器、校验、联动、远程选项都能序列化，适合存储、审查、生成和回放。'
      },
      {
        title: 'Rule Graph',
        text: 'showWhen、requiredWhen、compute 和 rulesV2 统一进入规则执行链，便于诊断。'
      },
      {
        title: 'Renderer Skins',
        text: '当前提供 Vue + Element Plus 皮肤，包边界为 React、Ant Design Vue 或自研 UI 预留空间。'
      }
    ],
    flowLabel: 'Runtime Flow',
    flowTitle: '一份 schema，跑完整个表单生命周期',
    flow: [
      ['Schema Model', '/guide/schema'],
      ['Rules', '/guide/rules-and-shortcuts'],
      ['Resources', '/guide/resources'],
      ['Validation', '/guide/validation'],
      ['Vue Runtime', '/guide/vue-runtime']
    ]
  },
  en: {
    eyebrow: 'BY FORMX / HEADLESS FORM ENGINE',
    title: 'Declarative runtime\nfor complex business forms',
    lead:
      'Describe fields, linkage, validation, and remote resources with JSON Schema. The core engine runs independently; Vue + Element Plus is only one replaceable rendering skin.',
    start: 'Get started',
    examples: 'View examples',
    installLabel: 'Install FormX',
    stageLabel: 'Animated FormX runtime layers',
    proofHeadline: 'Built for schema-driven product teams',
    proof: ['Admin', 'Low-code', 'Designer', 'Runtime', 'Validation', 'Open Source'],
    introTitle: 'Rebuild the form development model',
    intro:
      'FormX separates forms into stable protocol layers: the core engine owns state and rules, while skins render the view model. Complex linkage no longer has to live in scattered watchers and event callbacks.',
    features: [
      {
        title: 'Headless Core',
        text: '@formx/core runs in browsers, Node.js, designers, and tests without Vue or Element Plus.'
      },
      {
        title: 'JSON DSL',
        text: 'Fields, containers, validation, linkage, and remote options are serializable for storage, review, generation, and replay.'
      },
      {
        title: 'Rule Graph',
        text: 'showWhen, requiredWhen, compute, and rulesV2 share one execution pipeline that is easier to diagnose.'
      },
      {
        title: 'Renderer Skins',
        text: 'The current Vue + Element Plus skin proves the model, while the package boundary leaves room for React, Ant Design Vue, or internal design systems.'
      }
    ],
    flowLabel: 'Runtime Flow',
    flowTitle: 'One schema drives the full form lifecycle',
    flow: [
      ['Schema Model', '/en/guide/schema'],
      ['Rules', '/en/guide/rules-and-shortcuts'],
      ['Resources', '/en/guide/resources'],
      ['Validation', '/en/guide/validation'],
      ['Vue Runtime', '/en/guide/vue-runtime']
    ]
  }
}

const copy = computed(() => content[props.locale])
const prefix = computed(() => (props.locale === 'en' ? '/en' : ''))
const titleLines = computed(() => copy.value.title.split('\n'))
</script>

<template>
  <main class="fx-home">
    <section class="fx-shell fx-hero">
      <div class="fx-hero__copy">
        <div class="fx-eyebrow">{{ copy.eyebrow }}</div>
        <h1>
          <template v-for="(line, index) in titleLines" :key="line">
            <br v-if="index > 0" />{{ line }}
          </template>
        </h1>
        <p class="fx-lead">{{ copy.lead }}</p>

        <div class="fx-actions" aria-label="FormX quick links">
          <a class="fx-button fx-button--primary" :href="`${prefix}/guide/getting-started`">
            {{ copy.start }}
          </a>
          <a class="fx-button" :href="`${prefix}/examples/`">{{ copy.examples }}</a>
        </div>

        <div class="fx-install" :aria-label="copy.installLabel">
          <div class="fx-install__tabs">
            <span class="is-active">pnpm</span>
            <span>npm</span>
            <span>yarn</span>
            <span>bun</span>
          </div>
          <div class="fx-install__command">
            <span>$</span>
            <code>pnpm add @formx/vue vue element-plus</code>
            <em>bash</em>
          </div>
        </div>
      </div>

      <div class="fx-hero__visual" :aria-label="copy.stageLabel">
        <div class="fx-logo-stage" aria-hidden="true">
          <div class="fx-runtime-plane"></div>
          <div class="fx-data-ring fx-data-ring--outer"></div>
          <div class="fx-data-ring fx-data-ring--inner"></div>
          <div class="fx-data-ring fx-data-ring--tilt"></div>

          <div class="fx-data-path fx-data-path--schema"></div>
          <div class="fx-data-path fx-data-path--rules"></div>
          <div class="fx-data-path fx-data-path--render"></div>

          <div class="fx-runtime-logo"></div>

          <div class="fx-data-card fx-data-card--schema"></div>
          <div class="fx-data-card fx-data-card--rules"></div>
          <div class="fx-data-card fx-data-card--view"></div>

          <div class="fx-packet fx-packet--a"></div>
          <div class="fx-packet fx-packet--b"></div>
          <div class="fx-packet fx-packet--c"></div>
          <div class="fx-packet fx-packet--d"></div>

          <div class="fx-runtime-note fx-runtime-note--core">
            <span>0 UI lock-in</span>
            <strong>headless core</strong>
          </div>
          <div class="fx-runtime-note fx-runtime-note--skin">
            <span>renderer skin</span>
            <strong>Vue + EP</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="fx-shell fx-proof" aria-label="FormX capability groups">
      <div class="fx-proof__headline">{{ copy.proofHeadline }}</div>
      <div class="fx-proof__grid">
        <span v-for="item in copy.proof" :key="item">{{ item }}</span>
      </div>
    </section>

    <section class="fx-shell fx-intro">
      <h2>{{ copy.introTitle }}</h2>
      <p>{{ copy.intro }}</p>
    </section>

    <section class="fx-shell fx-feature-grid">
      <article v-for="(feature, index) in copy.features" :key="feature.title">
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.text }}</p>
      </article>
    </section>

    <section class="fx-shell fx-flow">
      <div>
        <p class="fx-section-label">{{ copy.flowLabel }}</p>
        <h2>{{ copy.flowTitle }}</h2>
      </div>
      <div class="fx-flow__steps">
        <a v-for="[label, link] in copy.flow" :key="link" :href="link">{{ label }}</a>
      </div>
    </section>
  </main>
</template>

<style scoped>
.fx-home {
  --fx-bg: #111218;
  --fx-panel: #151720;
  --fx-panel-2: #101119;
  --fx-line: rgba(148, 163, 184, 0.2);
  --fx-line-strong: rgba(148, 163, 184, 0.34);
  --fx-text: #f8fafc;
  --fx-muted: #a8b0bf;
  --fx-dim: #727b8e;
  --fx-blue: #38bdf8;
  --fx-green: #34d399;
  --fx-violet: #8b5cf6;
  --fx-pink: #f472b6;
  --fx-glow: rgba(56, 189, 248, 0.32);
  min-height: calc(100vh - var(--vp-nav-height));
  padding: 0 24px 72px;
  background:
    radial-gradient(circle at 72% 18%, rgba(56, 189, 248, 0.13), transparent 28%),
    radial-gradient(circle at 58% 64%, rgba(139, 92, 246, 0.12), transparent 28%),
    linear-gradient(180deg, #111218 0%, #0f1117 100%);
  color: var(--fx-text);
}

.fx-shell {
  width: min(1320px, 100%);
  margin: 0 auto;
  border-right: 1px solid var(--fx-line);
  border-left: 1px solid var(--fx-line);
}

.fx-hero {
  display: grid;
  min-height: 680px;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 0.98fr);
  border-bottom: 1px solid var(--fx-line);
}

.fx-hero__copy,
.fx-hero__visual {
  min-width: 0;
  padding: 68px 56px;
}

.fx-hero__copy {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid var(--fx-line);
}

.fx-eyebrow,
.fx-section-label {
  color: var(--fx-dim);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.fx-eyebrow::after {
  display: inline-block;
  width: 42px;
  height: 1px;
  margin-left: 12px;
  background: linear-gradient(90deg, var(--fx-blue), transparent);
  content: '';
  vertical-align: middle;
}

.fx-hero h1 {
  max-width: 620px;
  margin: 28px 0 22px;
  font-size: clamp(48px, 6vw, 82px);
  line-height: 1.04;
  letter-spacing: 0;
}

.fx-lead {
  max-width: 560px;
  margin: 0;
  color: var(--fx-muted);
  font-size: 19px;
  line-height: 1.8;
}

.fx-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.fx-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid var(--fx-line-strong);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--fx-text);
  font-weight: 700;
  text-decoration: none !important;
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}

.fx-button:hover {
  border-color: rgba(56, 189, 248, 0.7);
  background: rgba(56, 189, 248, 0.08);
  transform: translateY(-1px);
}

.fx-button--primary {
  border-color: rgba(56, 189, 248, 0.84);
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(139, 92, 246, 0.24));
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.18), 0 0 34px rgba(56, 189, 248, 0.16);
}

.fx-install {
  overflow: hidden;
  width: min(560px, 100%);
  margin-top: 72px;
  border: 1px solid rgba(15, 23, 42, 0.85);
  border-radius: 10px;
  background: rgba(10, 10, 16, 0.74);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.fx-install__tabs {
  display: flex;
  gap: 28px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  padding: 16px 22px 0;
  color: var(--fx-dim);
  font-weight: 700;
}

.fx-install__tabs span {
  padding-bottom: 14px;
}

.fx-install__tabs .is-active {
  border-bottom: 2px solid var(--fx-blue);
  color: var(--fx-text);
}

.fx-install__command {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 21px 22px 24px;
  color: #bde7ff;
  font-size: 15px;
}

.fx-install__command span {
  color: var(--fx-violet);
  font-weight: 800;
}

.fx-install__command code {
  color: #dbeafe;
  font-family: var(--vp-font-family-mono);
}

.fx-install__command em {
  margin-left: auto;
  color: var(--fx-dim);
  font-style: normal;
  font-size: 12px;
}

.fx-hero__visual {
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 48%, rgba(56, 189, 248, 0.16), transparent 31%),
    linear-gradient(135deg, rgba(56, 189, 248, 0.08), transparent 40%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.26), rgba(15, 23, 42, 0.04));
}

.fx-hero__visual::before {
  position: absolute;
  content: '';
  inset: 0;
  background:
    linear-gradient(rgba(148, 163, 184, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent);
  opacity: 0.5;
}

.fx-logo-stage {
  isolation: isolate;
  position: relative;
  width: min(560px, 92vw);
  aspect-ratio: 1;
  perspective: 1100px;
}

.fx-logo-stage::before {
  position: absolute;
  content: '';
  inset: 52px 36px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 50%, rgba(125, 211, 252, 0.2), transparent 52%),
    radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.16), transparent 64%);
  filter: blur(24px);
  animation: fxAura 6s ease-in-out infinite;
}

.fx-runtime-plane,
.fx-data-ring,
.fx-data-path,
.fx-runtime-logo,
.fx-data-card,
.fx-packet,
.fx-runtime-note {
  position: absolute;
}

.fx-runtime-plane {
  inset: 106px 82px 92px;
  z-index: 1;
  border: 1px solid rgba(226, 232, 240, 0.12);
  border-radius: 54px;
  background:
    linear-gradient(135deg, rgba(248, 250, 252, 0.08), rgba(56, 189, 248, 0.07)),
    rgba(8, 13, 24, 0.38);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 30px 90px rgba(2, 8, 23, 0.34);
  transform: rotateX(58deg) rotateZ(-36deg);
  animation: fxPlaneFloat 7s ease-in-out infinite;
}

.fx-data-ring {
  z-index: 2;
  border: 1px solid rgba(125, 211, 252, 0.24);
  border-radius: 999px;
}

.fx-data-ring--outer {
  inset: 74px;
  animation: fxSpin 30s linear infinite;
}

.fx-data-ring--inner {
  inset: 142px;
  border-color: rgba(167, 139, 250, 0.3);
  animation: fxSpin 18s linear infinite reverse;
}

.fx-data-ring--tilt {
  inset: 112px 58px;
  border-color: rgba(52, 211, 153, 0.22);
  transform: rotateX(64deg) rotateZ(-24deg);
  animation: fxTiltRing 8s ease-in-out infinite;
}

.fx-data-path {
  z-index: 3;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.8), transparent);
  transform-origin: center;
  animation: fxPathGlow 3.6s ease-in-out infinite;
}

.fx-data-path--schema {
  top: 206px;
  left: 92px;
  width: 390px;
  transform: rotate(18deg);
}

.fx-data-path--rules {
  top: 278px;
  left: 112px;
  width: 342px;
  background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.8), transparent);
  transform: rotate(-24deg);
  animation-delay: 0.4s;
}

.fx-data-path--render {
  top: 348px;
  left: 124px;
  width: 322px;
  background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.76), transparent);
  transform: rotate(10deg);
  animation-delay: 0.8s;
}

.fx-runtime-logo {
  top: 50%;
  left: 50%;
  z-index: 8;
  width: 164px;
  height: 164px;
  border: 1px solid rgba(125, 211, 252, 0.5);
  border-radius: 38px;
  background:
    linear-gradient(145deg, rgba(14, 165, 233, 0.24), rgba(124, 58, 237, 0.26)),
    rgba(8, 13, 24, 0.84);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 22px 80px rgba(56, 189, 248, 0.25),
    0 0 0 10px rgba(56, 189, 248, 0.04);
  transform: translate(-50%, -50%) rotate(-7deg);
  animation: fxLogoPulse 4.8s ease-in-out infinite;
}

.fx-runtime-logo::before,
.fx-runtime-logo::after,
.fx-data-card::before,
.fx-data-card::after {
  position: absolute;
  content: '';
}

.fx-runtime-logo::before {
  top: 40px;
  left: 0;
  right: 0;
  color: #f8fafc;
  content: 'FX';
  font-size: 54px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  text-shadow: 0 0 30px rgba(125, 211, 252, 0.9);
}

.fx-runtime-logo::after {
  right: 22px;
  bottom: 30px;
  left: 22px;
  color: rgba(226, 232, 240, 0.7);
  content: 'RUNTIME CORE';
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 900;
  text-align: center;
}

.fx-data-card {
  z-index: 5;
  width: 200px;
  height: 118px;
  border: 1px solid rgba(226, 232, 240, 0.14);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.065), rgba(255, 255, 255, 0.02)),
    rgba(8, 13, 24, 0.78);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 20px 60px rgba(2, 8, 23, 0.3);
  backdrop-filter: blur(18px);
  animation: fxCardFloat 6.8s ease-in-out infinite;
}

.fx-data-card::before {
  top: 17px;
  left: 18px;
  color: #f8fafc;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 900;
}

.fx-data-card::after {
  right: 18px;
  bottom: 18px;
  left: 18px;
  height: 42px;
  border-radius: 12px;
}

.fx-data-card--schema {
  top: 72px;
  left: 34px;
}

.fx-data-card--schema::before {
  content: 'schema.json';
}

.fx-data-card--schema::after {
  background:
    linear-gradient(90deg, rgba(125, 211, 252, 0.78) 0 74%, transparent 74%),
    linear-gradient(90deg, rgba(125, 211, 252, 0.36) 0 52%, transparent 52%),
    linear-gradient(90deg, rgba(125, 211, 252, 0.22) 0 34%, transparent 34%);
  background-position: 0 0, 0 17px, 0 34px;
  background-size: 100% 8px;
  background-repeat: no-repeat;
}

.fx-data-card--rules {
  top: 126px;
  right: 26px;
  width: 190px;
  border-color: rgba(167, 139, 250, 0.26);
  animation-delay: 0.7s;
}

.fx-data-card--rules::before {
  content: 'rulesV2';
}

.fx-data-card--rules::after {
  background:
    linear-gradient(90deg, rgba(167, 139, 250, 0.68) 0 42%, transparent 42%),
    linear-gradient(90deg, rgba(167, 139, 250, 0.28) 0 70%, transparent 70%);
  background-position: 0 5px, 0 29px;
  background-size: 100% 10px;
  background-repeat: no-repeat;
}

.fx-data-card--view {
  right: 58px;
  bottom: 66px;
  width: 228px;
  height: 138px;
  border-color: rgba(52, 211, 153, 0.24);
  animation-delay: 1.2s;
}

.fx-data-card--view::before {
  content: 'FormView';
}

.fx-data-card--view::after {
  background:
    linear-gradient(90deg, rgba(148, 163, 184, 0.32) 0 28%, transparent 28%),
    linear-gradient(90deg, rgba(52, 211, 153, 0.2) 0 100%, transparent 100%),
    linear-gradient(90deg, rgba(148, 163, 184, 0.28) 0 28%, transparent 28%),
    linear-gradient(90deg, rgba(52, 211, 153, 0.14) 0 100%, transparent 100%);
  background-position: 0 0, 68px 0, 0 25px, 68px 25px;
  background-size: 60px 12px, 120px 18px, 60px 12px, 120px 18px;
  background-repeat: no-repeat;
}

.fx-packet {
  z-index: 7;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #7dd3fc;
  box-shadow: 0 0 0 8px rgba(125, 211, 252, 0.08), 0 0 28px rgba(125, 211, 252, 0.8);
}

.fx-packet--a {
  top: 190px;
  left: 128px;
  animation: fxPacketA 4.2s ease-in-out infinite;
}

.fx-packet--b {
  top: 322px;
  right: 142px;
  background: #34d399;
  box-shadow: 0 0 0 8px rgba(52, 211, 153, 0.08), 0 0 28px rgba(52, 211, 153, 0.72);
  animation: fxPacketB 5s ease-in-out infinite;
}

.fx-packet--c {
  right: 214px;
  bottom: 210px;
  background: #a78bfa;
  box-shadow: 0 0 0 8px rgba(167, 139, 250, 0.08), 0 0 28px rgba(167, 139, 250, 0.72);
  animation: fxPacketC 4.6s ease-in-out infinite;
}

.fx-packet--d {
  bottom: 152px;
  left: 158px;
  width: 7px;
  height: 7px;
  background: #e0f2fe;
  animation: fxPacketD 6s ease-in-out infinite;
}

.fx-runtime-note {
  z-index: 6;
  display: flex;
  width: 182px;
  height: 76px;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(226, 232, 240, 0.16);
  border-radius: 22px;
  padding: 0 18px;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.86), rgba(15, 23, 42, 0.62)),
    rgba(8, 13, 24, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 18px 50px rgba(2, 8, 23, 0.26);
  backdrop-filter: blur(16px);
  animation: fxNoteFloat 7.4s ease-in-out infinite;
}

.fx-runtime-note span,
.fx-runtime-note strong {
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.fx-runtime-note span {
  color: var(--fx-dim);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fx-runtime-note strong {
  color: #e0f2fe;
  font-size: 18px;
  letter-spacing: 0;
}

.fx-runtime-note--core {
  bottom: 134px;
  left: 38px;
  border-color: rgba(125, 211, 252, 0.2);
}

.fx-runtime-note--skin {
  top: 316px;
  right: 34px;
  border-color: rgba(52, 211, 153, 0.22);
  animation-delay: 1.2s;
}

.fx-proof {
  border-bottom: 1px solid var(--fx-line);
}

.fx-proof__headline {
  padding: 30px 36px;
  border-bottom: 1px solid var(--fx-line);
  color: var(--fx-text);
  font-size: 20px;
  font-weight: 800;
}

.fx-proof__grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
}

.fx-proof__grid span {
  display: grid;
  min-height: 78px;
  place-items: center;
  border-right: 1px solid var(--fx-line);
  color: rgba(226, 232, 240, 0.74);
  font-weight: 800;
}

.fx-proof__grid span:last-child {
  border-right: 0;
}

.fx-intro {
  padding: 108px 36px 118px;
  text-align: center;
  border-bottom: 1px solid var(--fx-line);
}

.fx-intro h2,
.fx-flow h2 {
  margin: 0;
  color: var(--fx-text);
  font-size: clamp(36px, 4vw, 58px);
  line-height: 1.12;
  letter-spacing: 0;
}

.fx-intro p {
  max-width: 720px;
  margin: 18px auto 0;
  color: var(--fx-muted);
  font-size: 18px;
  line-height: 1.8;
}

.fx-feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 1px solid var(--fx-line);
}

.fx-feature-grid article {
  min-height: 260px;
  padding: 36px;
  border-right: 1px solid var(--fx-line);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.018), transparent);
}

.fx-feature-grid article:last-child {
  border-right: 0;
}

.fx-feature-grid span {
  color: var(--fx-blue);
  font-family: var(--vp-font-family-mono);
  font-weight: 900;
}

.fx-feature-grid h3 {
  margin: 44px 0 14px;
  color: var(--fx-text);
  font-size: 24px;
  letter-spacing: 0;
}

.fx-feature-grid p {
  margin: 0;
  color: var(--fx-muted);
  line-height: 1.75;
}

.fx-feature-grid code {
  padding: 2px 6px;
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 6px;
  background: rgba(8, 13, 24, 0.8);
  color: #dbeafe;
  font-size: 0.92em;
}

.fx-flow {
  display: grid;
  grid-template-columns: minmax(0, 0.75fr) minmax(360px, 1fr);
  gap: 56px;
  padding: 64px 36px 72px;
}

.fx-flow__steps {
  display: grid;
  gap: 12px;
}

.fx-flow__steps a {
  display: flex;
  align-items: center;
  min-height: 58px;
  padding: 0 18px;
  border: 1px solid var(--fx-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.026);
  color: var(--fx-text);
  font-weight: 800;
  text-decoration: none !important;
}

.fx-flow__steps a:hover {
  border-color: rgba(56, 189, 248, 0.68);
  background: rgba(56, 189, 248, 0.07);
}

@keyframes fxAura {
  0%,
  100% {
    opacity: 0.72;
    transform: scale(0.96);
  }
  50% {
    opacity: 1;
    transform: scale(1.04);
  }
}

@keyframes fxPlaneFloat {
  0%,
  100% {
    transform: rotateX(58deg) rotateZ(-36deg) translateY(0);
  }
  50% {
    transform: rotateX(58deg) rotateZ(-36deg) translateY(-14px);
  }
}

@keyframes fxTiltRing {
  0%,
  100% {
    transform: rotateX(64deg) rotateZ(-24deg) scale(1);
  }
  50% {
    transform: rotateX(64deg) rotateZ(-10deg) scale(1.03);
  }
}

@keyframes fxPathGlow {
  0%,
  100% {
    opacity: 0.28;
  }
  50% {
    opacity: 0.9;
  }
}

@keyframes fxLogoPulse {
  0%,
  100% {
    transform: translate(-50%, -50%) rotate(-7deg) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) rotate(-4deg) scale(1.04);
  }
}

@keyframes fxSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fxCardFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -12px, 0);
  }
}

@keyframes fxNoteFloat {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -8px, 0);
  }
}

@keyframes fxPacketA {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(192px, 74px, 0);
  }
}

@keyframes fxPacketB {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-168px, -60px, 0);
  }
}

@keyframes fxPacketC {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-86px, -86px, 0);
  }
}

@keyframes fxPacketD {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 0.45;
  }
  50% {
    transform: translate3d(180px, -108px, 0);
    opacity: 1;
  }
}

@media (max-width: 1100px) {
  .fx-hero {
    grid-template-columns: 1fr;
  }

  .fx-hero__copy {
    border-right: 0;
    border-bottom: 1px solid var(--fx-line);
  }

  .fx-hero__visual {
    min-height: 560px;
  }

  .fx-feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fx-feature-grid article:nth-child(2) {
    border-right: 0;
  }

  .fx-flow {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .fx-home {
    padding: 0 14px 48px;
  }

  .fx-hero__copy,
  .fx-hero__visual,
  .fx-feature-grid article,
  .fx-flow {
    padding-right: 22px;
    padding-left: 22px;
  }

  .fx-proof__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .fx-proof__grid span:nth-child(2n) {
    border-right: 0;
  }

  .fx-feature-grid {
    grid-template-columns: 1fr;
  }

  .fx-feature-grid article {
    border-right: 0;
    border-bottom: 1px solid var(--fx-line);
  }

  .fx-logo-stage {
    width: min(430px, calc(100vw - 52px));
  }

  .fx-runtime-plane {
    inset: 98px 52px 84px;
    border-radius: 42px;
  }

  .fx-data-ring--outer {
    inset: 64px;
  }

  .fx-data-ring--inner {
    inset: 126px;
  }

  .fx-data-ring--tilt {
    inset: 106px 36px;
  }

  .fx-runtime-logo {
    width: 126px;
    height: 126px;
    border-radius: 30px;
  }

  .fx-runtime-logo::before {
    top: 29px;
    font-size: 44px;
  }

  .fx-runtime-logo::after {
    right: 14px;
    bottom: 23px;
    left: 14px;
    font-size: 9px;
  }

  .fx-data-card {
    width: 166px;
    height: 98px;
    border-radius: 20px;
  }

  .fx-data-card::before {
    top: 14px;
    left: 15px;
    font-size: 11px;
  }

  .fx-data-card--schema {
    top: 42px;
    left: 4px;
  }

  .fx-data-card--rules {
    top: 116px;
    right: 0;
  }

  .fx-data-card--view {
    right: 6px;
    bottom: 12px;
    width: 190px;
    height: 112px;
  }

  .fx-runtime-note {
    display: none;
  }

  .fx-data-path--schema {
    left: 72px;
    width: 286px;
  }

  .fx-data-path--rules {
    left: 82px;
    width: 260px;
  }

  .fx-data-path--render {
    left: 96px;
    width: 238px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
</style>
