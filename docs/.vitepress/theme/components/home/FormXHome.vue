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
          <div class="fx-stage-glass"></div>
          <div class="fx-stage-ring fx-stage-ring--outer"></div>
          <div class="fx-stage-ring fx-stage-ring--inner"></div>

          <svg class="fx-streams" viewBox="0 0 560 560" aria-hidden="true">
            <defs>
              <linearGradient id="fx-stream-blue" x1="88" y1="132" x2="454" y2="398">
                <stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.1" />
                <stop offset="42%" stop-color="#60a5fa" stop-opacity="0.86" />
                <stop offset="100%" stop-color="#a78bfa" stop-opacity="0.18" />
              </linearGradient>
              <linearGradient id="fx-stream-green" x1="124" y1="416" x2="470" y2="134">
                <stop offset="0%" stop-color="#34d399" stop-opacity="0.14" />
                <stop offset="52%" stop-color="#67e8f9" stop-opacity="0.72" />
                <stop offset="100%" stop-color="#c084fc" stop-opacity="0.12" />
              </linearGradient>
            </defs>
            <path class="fx-stream fx-stream--primary" d="M90 172 C168 94 274 138 294 242 C318 366 442 304 474 410" />
            <path class="fx-stream fx-stream--secondary" d="M110 398 C208 458 298 404 316 284 C336 154 430 150 482 118" />
          </svg>

          <div class="fx-runtime-core">
            <span>FormX</span>
            <strong>FX</strong>
            <em>runtime kernel</em>
          </div>

          <div class="fx-product-card fx-product-card--schema">
            <div class="fx-card-topline">
              <span>schema.json</span>
              <i>DSL</i>
            </div>
            <div class="fx-code-row is-long"></div>
            <div class="fx-code-row"></div>
            <div class="fx-code-row is-short"></div>
            <div class="fx-chip-row">
              <b>fields</b>
              <b>layout</b>
              <b>resources</b>
            </div>
          </div>

          <div class="fx-product-card fx-product-card--rules">
            <div class="fx-card-topline">
              <span>rulesV2</span>
              <i>graph</i>
            </div>
            <div class="fx-rule-chain">
              <span>showWhen</span>
              <span>compute</span>
              <span>validate</span>
            </div>
          </div>

          <div class="fx-product-card fx-product-card--form">
            <div class="fx-card-topline">
              <span>FormView</span>
              <i>Vue + EP</i>
            </div>
            <div class="fx-form-row">
              <span></span>
              <strong></strong>
            </div>
            <div class="fx-form-row">
              <span></span>
              <strong></strong>
            </div>
            <div class="fx-form-actions">
              <i></i>
              <i></i>
            </div>
          </div>

          <div class="fx-signal fx-signal--a"></div>
          <div class="fx-signal fx-signal--b"></div>
          <div class="fx-signal fx-signal--c"></div>

          <div class="fx-metric fx-metric--headless">
            <span>0 UI lock-in</span>
            <strong>headless core</strong>
          </div>
          <div class="fx-metric fx-metric--live">
            <span>live state</span>
            <strong>rules synced</strong>
          </div>

          <svg class="fx-runtime-mark" viewBox="0 0 160 160" aria-hidden="true">
            <path d="M36 88 L74 32 H122 L92 70 H126 L58 132 L82 88 Z" />
          </svg>
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
    linear-gradient(135deg, rgba(56, 189, 248, 0.09), transparent 38%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.16), rgba(15, 23, 42, 0.02));
}

.fx-hero__visual::before {
  position: absolute;
  content: '';
  inset: 0;
  background:
    linear-gradient(rgba(148, 163, 184, 0.045) 1px, transparent 1px);
  background-size: 100% 72px;
  mask-image: linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent);
  opacity: 0.72;
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
  inset: 74px 52px;
  border: 1px solid rgba(125, 211, 252, 0.16);
  border-radius: 54px;
  background:
    linear-gradient(135deg, rgba(125, 211, 252, 0.1), rgba(167, 139, 250, 0.08)),
    rgba(15, 23, 42, 0.18);
  filter: blur(1px);
  transform: rotate(-8deg);
}

.fx-stage-glass {
  position: absolute;
  inset: 74px 70px 62px;
  z-index: 0;
  border: 1px solid rgba(226, 232, 240, 0.11);
  border-radius: 42px;
  background:
    linear-gradient(145deg, rgba(248, 250, 252, 0.08), rgba(15, 23, 42, 0.08)),
    linear-gradient(180deg, rgba(15, 23, 42, 0.68), rgba(15, 23, 42, 0.26));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 28px 80px rgba(2, 8, 23, 0.34);
  transform: rotateX(58deg) rotateZ(-38deg);
  animation: fxGlassBreath 8s ease-in-out infinite;
}

.fx-stage-ring {
  position: absolute;
  z-index: 1;
  border: 1px solid rgba(125, 211, 252, 0.22);
  border-radius: 999px;
  pointer-events: none;
}

.fx-stage-ring--outer {
  inset: 76px;
  opacity: 0.5;
  animation: fxSpin 36s linear infinite;
}

.fx-stage-ring--inner {
  inset: 158px;
  border-color: rgba(167, 139, 250, 0.26);
  transform: rotate(-18deg);
  animation: fxSpin 24s linear infinite reverse;
}

.fx-streams {
  position: absolute;
  z-index: 2;
  inset: 0;
  overflow: visible;
}

.fx-stream {
  fill: none;
  stroke-dasharray: 12 18;
  stroke-linecap: round;
  stroke-width: 2.2;
  animation: fxStream 13s linear infinite;
}

.fx-stream--primary {
  stroke: url('#fx-stream-blue');
}

.fx-stream--secondary {
  stroke: url('#fx-stream-green');
  animation-duration: 16s;
  animation-direction: reverse;
}

.fx-runtime-core {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 7;
  display: flex;
  width: 148px;
  height: 148px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(125, 211, 252, 0.36);
  border-radius: 34px;
  background:
    linear-gradient(145deg, rgba(14, 165, 233, 0.2), rgba(124, 58, 237, 0.24)),
    rgba(8, 13, 24, 0.78);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 18px 70px rgba(56, 189, 248, 0.2),
    0 0 0 8px rgba(56, 189, 248, 0.035);
  transform: translate(-50%, -50%) rotate(-6deg);
  animation: fxCoreBreathe 5.8s ease-in-out infinite;
}

.fx-runtime-core span,
.fx-runtime-core em {
  color: rgba(226, 232, 240, 0.62);
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fx-runtime-core strong {
  margin: 5px 0 3px;
  color: #f8fafc;
  font-size: 50px;
  line-height: 1;
  text-shadow: 0 0 30px rgba(125, 211, 252, 0.74);
}

.fx-product-card,
.fx-metric {
  position: absolute;
  z-index: 4;
  border: 1px solid rgba(226, 232, 240, 0.13);
  background: rgba(8, 13, 24, 0.72);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 18px 50px rgba(2, 8, 23, 0.28);
  backdrop-filter: blur(18px);
}

.fx-product-card {
  width: 230px;
  border-radius: 24px;
  padding: 16px;
  animation: fxCardDrift 7s ease-in-out infinite;
}

.fx-product-card--schema {
  top: 52px;
  left: 38px;
  border-color: rgba(125, 211, 252, 0.28);
}

.fx-product-card--rules {
  top: 116px;
  right: 26px;
  width: 196px;
  border-color: rgba(167, 139, 250, 0.28);
  animation-delay: 0.8s;
}

.fx-product-card--form {
  right: 46px;
  bottom: 52px;
  width: 246px;
  border-color: rgba(52, 211, 153, 0.26);
  animation-delay: 1.4s;
}

.fx-card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.fx-card-topline span {
  color: var(--fx-text);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 900;
}

.fx-card-topline i {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  padding: 3px 8px;
  color: var(--fx-dim);
  font-style: normal;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.fx-code-row,
.fx-form-row strong {
  height: 9px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(125, 211, 252, 0.8), rgba(167, 139, 250, 0.12));
}

.fx-code-row {
  width: 68%;
  margin-top: 9px;
  opacity: 0.8;
}

.fx-code-row.is-long {
  width: 94%;
}

.fx-code-row.is-short {
  width: 44%;
}

.fx-chip-row,
.fx-rule-chain {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 16px;
}

.fx-chip-row b,
.fx-rule-chain span {
  border-radius: 999px;
  background: rgba(125, 211, 252, 0.1);
  color: #dbeafe;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
}

.fx-chip-row b {
  padding: 6px 8px;
}

.fx-rule-chain span {
  padding: 8px 9px;
}

.fx-form-row {
  display: grid;
  grid-template-columns: 62px 1fr;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
}

.fx-form-row span {
  height: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.34);
}

.fx-form-row strong {
  display: block;
  height: 28px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(90deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.32)),
    rgba(255, 255, 255, 0.03);
}

.fx-form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.fx-form-actions i {
  width: 54px;
  height: 24px;
  border-radius: 999px;
  background: rgba(52, 211, 153, 0.16);
}

.fx-signal {
  position: absolute;
  z-index: 6;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #7dd3fc;
  box-shadow: 0 0 0 8px rgba(125, 211, 252, 0.08), 0 0 26px rgba(125, 211, 252, 0.72);
}

.fx-signal--a {
  top: 178px;
  left: 168px;
  animation: fxSignalA 7s ease-in-out infinite;
}

.fx-signal--b {
  top: 362px;
  right: 128px;
  background: #34d399;
  box-shadow: 0 0 0 8px rgba(52, 211, 153, 0.08), 0 0 26px rgba(52, 211, 153, 0.62);
  animation: fxSignalB 8s ease-in-out infinite;
}

.fx-signal--c {
  right: 206px;
  bottom: 176px;
  background: #a78bfa;
  box-shadow: 0 0 0 8px rgba(167, 139, 250, 0.08), 0 0 26px rgba(167, 139, 250, 0.66);
  animation: fxSignalC 6.6s ease-in-out infinite;
}

.fx-metric {
  min-width: 154px;
  border-radius: 18px;
  padding: 13px 14px;
  animation: fxMetricRise 7.5s ease-in-out infinite;
}

.fx-metric span,
.fx-metric strong {
  display: block;
}

.fx-metric span {
  color: var(--fx-dim);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.fx-metric strong {
  margin-top: 4px;
  color: #e0f2fe;
  font-size: 13px;
}

.fx-metric--headless {
  bottom: 102px;
  left: 52px;
  border-color: rgba(125, 211, 252, 0.24);
}

.fx-metric--live {
  top: 274px;
  right: 10px;
  border-color: rgba(52, 211, 153, 0.24);
  animation-delay: 1.2s;
}

.fx-runtime-mark {
  position: absolute;
  inset: 166px 164px;
  z-index: 1;
  opacity: 0.06;
  transform: rotate(-8deg);
}

.fx-runtime-mark path {
  fill: #e0f2fe;
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

@keyframes fxGlassBreath {
  0%,
  100% {
    transform: rotateX(58deg) rotateZ(-38deg) translateY(0);
    opacity: 0.86;
  }
  50% {
    transform: rotateX(58deg) rotateZ(-38deg) translateY(-12px);
    opacity: 1;
  }
}

@keyframes fxCoreBreathe {
  0%,
  100% {
    transform: translate(-50%, -50%) rotate(-6deg) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) rotate(-4deg) scale(1.035);
  }
}

@keyframes fxCardDrift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -10px, 0);
  }
}

@keyframes fxMetricRise {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -7px, 0);
  }
}

@keyframes fxStream {
  to {
    stroke-dashoffset: -240;
  }
}

@keyframes fxSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fxSignalA {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(126px, 94px, 0);
  }
}

@keyframes fxSignalB {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-126px, -104px, 0);
  }
}

@keyframes fxSignalC {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-84px, -44px, 0);
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

  .fx-stage-glass {
    inset: 72px 48px 58px;
  }

  .fx-stage-ring--outer {
    inset: 64px;
  }

  .fx-stage-ring--inner {
    inset: 126px;
  }

  .fx-runtime-core {
    width: 122px;
    height: 122px;
    border-radius: 28px;
  }

  .fx-runtime-core strong {
    font-size: 42px;
  }

  .fx-product-card {
    width: 190px;
    padding: 13px;
    border-radius: 20px;
  }

  .fx-product-card--schema {
    top: 42px;
    left: 4px;
  }

  .fx-product-card--rules {
    top: 128px;
    right: 0;
    width: 170px;
  }

  .fx-product-card--form {
    right: 6px;
    bottom: 12px;
    width: 210px;
  }

  .fx-product-card--form .fx-card-topline {
    justify-content: flex-end;
  }

  .fx-product-card--form .fx-card-topline span {
    display: none;
  }

  .fx-metric {
    display: none;
  }

  .fx-signal--a {
    left: 104px;
  }

  .fx-signal--b {
    right: 86px;
  }

  .fx-runtime-mark {
    inset: 136px;
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
