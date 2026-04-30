---
layout: doc
---

<script setup>
import BasicFormDemo from './.vitepress/theme/components/formx/BasicFormDemo.vue'
</script>

# FormX

<div class="formx-doc-hero">
  <div class="formx-doc-hero__copy">
    <p>
      FormX 是一个面向复杂业务系统的 Headless 动态表单引擎。它把 schema、联动、校验、远程资源和运行时状态放在核心引擎里，把 Vue、Element Plus 等渲染层留在外部适配。
    </p>
    <p>
      FormX is a headless dynamic form engine for complex business applications. The core owns schema execution, linkage, validation, remote resources, and runtime state, while UI renderers stay replaceable.
    </p>
    <div class="formx-doc-links">
      <a class="formx-doc-link" href="/guide/getting-started">快速开始 / Getting Started</a>
      <a class="formx-doc-link" href="/examples/">示例 / Examples</a>
      <a class="formx-doc-link" href="/guide/packages">包边界 / Packages</a>
    </div>
  </div>
  <div class="formx-doc-snapshot">
    <strong>开源版重点 / Open-source focus</strong>
    <ul>
      <li>核心包可独立使用，不绑定 Vue 或 Element Plus。</li>
      <li>Vue + Element Plus 皮肤已拆成独立包，可按需安装。</li>
      <li>文档中的示例直接运行当前 monorepo 源码。</li>
      <li>The docs demos run against local package source, so examples stay close to implementation.</li>
    </ul>
  </div>
</div>

## Live Demo / 可运行示例

下面的示例不是截图，它在文档站里直接挂载 `@formx/vue`。

The demo below is mounted inside the docs site and runs through `@formx/vue`.

<ClientOnly>
  <BasicFormDemo />
</ClientOnly>

## Package Map / 包结构

```text
@formx/core
  -> @formx/ui-core
    -> @formx/vue-core
      -> @formx/vue-ep
        -> @formx/vue
```

| Package | Role |
| --- | --- |
| `@formx/core` | 纯逻辑引擎 / Headless engine |
| `@formx/ui-core` | 框架无关 UI 协议 / Framework-neutral UI protocol |
| `@formx/vue-core` | Vue runtime bridge |
| `@formx/vue-ep` | Vue + Element Plus skin |
| `@formx/vue` | 默认 Vue 入口 / Default Vue entry |
