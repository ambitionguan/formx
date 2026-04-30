<template>
  <main class="fx-home">
    <section class="fx-shell fx-hero">
      <div class="fx-hero__copy">
        <div class="fx-eyebrow">BY FORMX / HEADLESS FORM ENGINE</div>
        <h1>复杂业务表单的<br />声明式运行时</h1>
        <p class="fx-lead">
          用 JSON Schema 描述字段、联动、校验和远程资源。核心引擎独立运行，Vue + Element
          Plus 只是其中一个可替换的渲染皮肤。
        </p>

        <div class="fx-actions" aria-label="FormX quick links">
          <a class="fx-button fx-button--primary" href="/guide/getting-started">开始使用</a>
          <a class="fx-button" href="/examples/">查看示例</a>
        </div>

        <div class="fx-install" aria-label="Install FormX">
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

      <div class="fx-hero__visual" aria-label="Animated FormX runtime layers">
        <div class="fx-logo-stage">
          <div class="fx-orbit fx-orbit--outer"></div>
          <div class="fx-orbit fx-orbit--inner"></div>

          <svg class="fx-connector" viewBox="0 0 520 520" aria-hidden="true">
            <path d="M260 258 L95 332" />
            <path d="M260 258 L424 326" />
            <path d="M260 258 L130 160" />
            <path d="M260 258 L398 148" />
          </svg>

          <div class="fx-layer fx-layer--schema">
            <span>Schema</span>
          </div>
          <div class="fx-layer fx-layer--engine">
            <span>Core Engine</span>
            <strong>FX</strong>
          </div>
          <div class="fx-layer fx-layer--view">
            <span>FormView</span>
          </div>
          <div class="fx-layer fx-layer--skin">
            <span>Vue Skin</span>
          </div>

          <div class="fx-node fx-node--json">JSON</div>
          <div class="fx-node fx-node--rules">rulesV2</div>
          <div class="fx-node fx-node--res">resources</div>
          <div class="fx-node fx-node--ui">EP</div>

          <div class="fx-logo-pulse"></div>
        </div>
      </div>
    </section>

    <section class="fx-shell fx-proof" aria-label="FormX capability groups">
      <div class="fx-proof__headline">Built for schema-driven product teams</div>
      <div class="fx-proof__grid">
        <span>Admin</span>
        <span>Low-code</span>
        <span>Designer</span>
        <span>Runtime</span>
        <span>Validation</span>
        <span>Open Source</span>
      </div>
    </section>

    <section class="fx-shell fx-intro">
      <h2>重新组织表单开发体验</h2>
      <p>
        FormX 把表单拆成稳定的协议层：核心引擎只管状态和规则，UI
        皮肤只管渲染。复杂联动不再散落在组件 watch 和事件回调里。
      </p>
    </section>

    <section class="fx-shell fx-feature-grid">
      <article>
        <span>01</span>
        <h3>Headless Core</h3>
        <p>
          <code>@formx/core</code>
          可在浏览器、Node、设计器和测试环境独立运行，不依赖 Vue 或 Element Plus。
        </p>
      </article>
      <article>
        <span>02</span>
        <h3>JSON DSL</h3>
        <p>
          字段、容器、校验、联动、远程选项都能序列化，适合存储、审查、生成和回放。
        </p>
      </article>
      <article>
        <span>03</span>
        <h3>Rule Graph</h3>
        <p>
          <code>showWhen</code>、<code>requiredWhen</code>、<code>compute</code>
          和 <code>rulesV2</code> 统一进入规则执行链，便于诊断。
        </p>
      </article>
      <article>
        <span>04</span>
        <h3>Renderer Skins</h3>
        <p>
          当前提供 Vue + Element Plus 皮肤，包边界为 React、Ant Design Vue 或自研 UI 预留空间。
        </p>
      </article>
    </section>

    <section class="fx-shell fx-flow">
      <div>
        <p class="fx-section-label">Runtime Flow</p>
        <h2>一份 schema，跑完整个表单生命周期</h2>
      </div>
      <div class="fx-flow__steps">
        <a href="/guide/schema">Schema Model</a>
        <a href="/guide/rules-and-shortcuts">Rules</a>
        <a href="/guide/resources">Resources</a>
        <a href="/guide/validation">Validation</a>
        <a href="/guide/vue-runtime">Vue Runtime</a>
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
    linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
  background-size: 56px 56px;
}

.fx-logo-stage {
  position: relative;
  width: min(560px, 92vw);
  aspect-ratio: 1;
  transform-style: preserve-3d;
}

.fx-logo-stage::before,
.fx-logo-stage::after {
  position: absolute;
  border-radius: 999px;
  content: '';
  inset: 19%;
  filter: blur(28px);
}

.fx-logo-stage::before {
  background: radial-gradient(circle, rgba(56, 189, 248, 0.28), transparent 64%);
  animation: fxGlow 5.6s ease-in-out infinite;
}

.fx-logo-stage::after {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.24), transparent 62%);
  animation: fxGlow 6.4s ease-in-out infinite reverse;
}

.fx-layer {
  position: absolute;
  left: 50%;
  width: 280px;
  height: 126px;
  border: 1px solid rgba(226, 232, 240, 0.34);
  border-radius: 28px;
  display: grid;
  place-items: center;
  color: rgba(226, 232, 240, 0.74);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transform: translateX(-50%) rotateX(58deg) rotateZ(-35deg);
  transform-origin: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.fx-layer span {
  transform: rotateZ(35deg);
}

.fx-layer--schema {
  top: 88px;
  animation: fxLayerFloat 6s ease-in-out infinite;
}

.fx-layer--view {
  top: 182px;
  border-color: rgba(139, 92, 246, 0.72);
  color: rgba(196, 181, 253, 0.9);
  animation: fxLayerFloat 6s ease-in-out 0.6s infinite;
}

.fx-layer--skin {
  top: 292px;
  border-color: rgba(52, 211, 153, 0.58);
  color: rgba(187, 247, 208, 0.9);
  animation: fxLayerFloat 6s ease-in-out 1.1s infinite;
}

.fx-layer--engine {
  top: 236px;
  width: 306px;
  height: 142px;
  border: 1px solid rgba(56, 189, 248, 0.9);
  background:
    linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(139, 92, 246, 0.22)),
    radial-gradient(circle at 50% 50%, rgba(248, 250, 252, 0.1), transparent 46%);
  box-shadow:
    0 22px 60px rgba(56, 189, 248, 0.18),
    0 0 0 1px rgba(139, 92, 246, 0.2);
  animation: fxCoreFloat 5.2s ease-in-out infinite;
}

.fx-layer--engine strong {
  position: absolute;
  color: #f8fafc;
  font-size: 40px;
  letter-spacing: 0;
  text-shadow: 0 0 28px rgba(56, 189, 248, 0.92);
  transform: rotateZ(35deg);
}

.fx-node {
  position: absolute;
  display: grid;
  place-items: center;
  min-width: 74px;
  min-height: 42px;
  border: 1px solid rgba(56, 189, 248, 0.6);
  border-radius: 14px;
  background: rgba(10, 10, 16, 0.86);
  color: #f8fafc;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.18);
  animation: fxNodeFloat 4.8s ease-in-out infinite;
}

.fx-node--json {
  top: 308px;
  left: 32px;
}

.fx-node--rules {
  top: 96px;
  left: 70px;
  border-color: rgba(139, 92, 246, 0.68);
  box-shadow: 0 0 24px rgba(139, 92, 246, 0.18);
  animation-delay: 0.4s;
}

.fx-node--res {
  right: 44px;
  top: 114px;
  border-color: rgba(52, 211, 153, 0.64);
  box-shadow: 0 0 24px rgba(52, 211, 153, 0.16);
  animation-delay: 0.8s;
}

.fx-node--ui {
  right: 38px;
  top: 300px;
  border-color: rgba(244, 114, 182, 0.66);
  box-shadow: 0 0 24px rgba(244, 114, 182, 0.16);
  animation-delay: 1.2s;
}

.fx-connector {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: visible;
}

.fx-connector path {
  fill: none;
  stroke: rgba(56, 189, 248, 0.52);
  stroke-dasharray: 9 13;
  stroke-width: 1.4;
  animation: fxDash 14s linear infinite;
}

.fx-orbit {
  position: absolute;
  inset: 96px;
  border: 1px dashed rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  animation: fxSpin 30s linear infinite;
}

.fx-orbit--inner {
  inset: 154px;
  border-color: rgba(56, 189, 248, 0.22);
  animation-duration: 18s;
  animation-direction: reverse;
}

.fx-logo-pulse {
  position: absolute;
  inset: 244px;
  border-radius: 999px;
  background: var(--fx-blue);
  box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.6);
  animation: fxPulse 2.8s ease-out infinite;
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

@keyframes fxLayerFloat {
  0%,
  100% {
    transform: translateX(-50%) rotateX(58deg) rotateZ(-35deg) translateY(0);
  }
  50% {
    transform: translateX(-50%) rotateX(58deg) rotateZ(-35deg) translateY(-12px);
  }
}

@keyframes fxCoreFloat {
  0%,
  100% {
    transform: translateX(-50%) rotateX(58deg) rotateZ(-35deg) translateY(0) scale(1);
  }
  50% {
    transform: translateX(-50%) rotateX(58deg) rotateZ(-35deg) translateY(-16px) scale(1.018);
  }
}

@keyframes fxNodeFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-11px);
  }
}

@keyframes fxDash {
  to {
    stroke-dashoffset: -220;
  }
}

@keyframes fxSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fxPulse {
  0% {
    transform: scale(0.72);
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.54);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.7);
    box-shadow: 0 0 0 36px rgba(56, 189, 248, 0);
    opacity: 0;
  }
}

@keyframes fxGlow {
  0%,
  100% {
    opacity: 0.48;
    transform: scale(0.96);
  }
  50% {
    opacity: 0.86;
    transform: scale(1.04);
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
    width: min(470px, 96vw);
  }

  .fx-node--json {
    left: 14px;
  }

  .fx-node--ui {
    right: 14px;
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
