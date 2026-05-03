import { defineConfig } from 'vitepress'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath, URL } from 'node:url'

const resolveLocal = (path: string) => fileURLToPath(new URL(path, import.meta.url))

const zhThemeConfig = {
  nav: [
    { text: '指南', link: '/guide/introduction' },
    { text: '示例', link: '/examples/' },
    { text: 'API', link: '/api/' },
    { text: 'GitHub', link: 'https://github.com/formxjs/formx' }
  ],
  sidebar: {
    '/guide/': [
      {
        text: '开始',
        items: [
          { text: '介绍', link: '/guide/introduction' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '包边界', link: '/guide/packages' },
          { text: '架构与设计', link: '/guide/architecture' },
          { text: '构建复杂表单', link: '/guide/building-forms' }
        ]
      },
      {
        text: '核心模型',
        items: [
          { text: 'Schema 模型', link: '/guide/schema' },
          { text: '规则与短写', link: '/guide/rules-and-shortcuts' },
          { text: '路径与作用域', link: '/guide/paths-and-scope' },
          { text: '表达式 DSL', link: '/guide/expressions' },
          { text: '远程资源', link: '/guide/resources' },
          { text: '校验', link: '/guide/validation' }
        ]
      },
      {
        text: '运行时与扩展',
        items: [
          { text: 'Vue 接入', link: '/guide/vue-runtime' },
          { text: '异步运行时', link: '/guide/async-runtime' },
          { text: '皮肤与插件', link: '/guide/skin-plugins' },
          { text: '性能与诊断', link: '/guide/performance' }
        ]
      }
    ],
    '/examples/': [
      {
        text: '示例',
        items: [
          { text: '总览', link: '/examples/' },
          { text: '基础表单', link: '/examples/basic' },
          { text: '联动规则', link: '/examples/linkage' },
          { text: '远程选项', link: '/examples/remote-options' },
          { text: '字段组', link: '/examples/field-group' },
          { text: '校验', link: '/examples/validation' },
          { text: '纯核心引擎', link: '/examples/headless-core' },
          { text: '场景模式', link: '/examples/business-scenarios' }
        ]
      }
    ],
    '/api/': [
      {
        text: 'API',
        items: [{ text: '总览', link: '/api/' }]
      }
    ]
  },
  socialLinks: [{ icon: 'github', link: 'https://github.com/formxjs/formx' }],
  search: {
    provider: 'local' as const
  },
  outline: {
    level: [2, 3],
    label: '页面导航'
  },
  lastUpdated: {
    text: '最后更新于'
  },
  docFooter: {
    prev: '上一页',
    next: '下一页'
  },
  returnToTopLabel: '回到顶部',
  sidebarMenuLabel: '菜单',
  darkModeSwitchLabel: '主题'
}

const enThemeConfig = {
  nav: [
    { text: 'Guide', link: '/en/guide/introduction' },
    { text: 'Examples', link: '/en/examples/' },
    { text: 'API', link: '/en/api/' },
    { text: 'GitHub', link: 'https://github.com/formxjs/formx' }
  ],
  sidebar: {
    '/en/guide/': [
      {
        text: 'Start',
        items: [
          { text: 'Introduction', link: '/en/guide/introduction' },
          { text: 'Getting Started', link: '/en/guide/getting-started' },
          { text: 'Package Boundaries', link: '/en/guide/packages' },
          { text: 'Architecture', link: '/en/guide/architecture' },
          { text: 'Building Forms', link: '/en/guide/building-forms' }
        ]
      },
      {
        text: 'Core Model',
        items: [
          { text: 'Schema Model', link: '/en/guide/schema' },
          { text: 'Rules and Shortcuts', link: '/en/guide/rules-and-shortcuts' },
          { text: 'Paths and Scope', link: '/en/guide/paths-and-scope' },
          { text: 'Expression DSL', link: '/en/guide/expressions' },
          { text: 'Resources', link: '/en/guide/resources' },
          { text: 'Validation', link: '/en/guide/validation' }
        ]
      },
      {
        text: 'Runtime and Extensions',
        items: [
          { text: 'Vue Runtime', link: '/en/guide/vue-runtime' },
          { text: 'Async Runtime', link: '/en/guide/async-runtime' },
          { text: 'Skins and Plugins', link: '/en/guide/skin-plugins' },
          { text: 'Performance', link: '/en/guide/performance' }
        ]
      }
    ],
    '/en/examples/': [
      {
        text: 'Examples',
        items: [
          { text: 'Overview', link: '/en/examples/' },
          { text: 'Basic Form', link: '/en/examples/basic' },
          { text: 'Linkage', link: '/en/examples/linkage' },
          { text: 'Remote Options', link: '/en/examples/remote-options' },
          { text: 'Field Group', link: '/en/examples/field-group' },
          { text: 'Validation', link: '/en/examples/validation' },
          { text: 'Headless Core', link: '/en/examples/headless-core' },
          { text: 'Scenario Patterns', link: '/en/examples/business-scenarios' }
        ]
      }
    ],
    '/en/api/': [
      {
        text: 'API',
        items: [{ text: 'Overview', link: '/en/api/' }]
      }
    ]
  },
  socialLinks: [{ icon: 'github', link: 'https://github.com/formxjs/formx' }],
  search: {
    provider: 'local' as const
  },
  outline: {
    level: [2, 3],
    label: 'On this page'
  },
  lastUpdated: {
    text: 'Last updated'
  },
  docFooter: {
    prev: 'Previous page',
    next: 'Next page'
  },
  returnToTopLabel: 'Return to top',
  sidebarMenuLabel: 'Menu',
  darkModeSwitchLabel: 'Theme'
}

export default defineConfig({
  title: 'FormX',
  description: 'Headless dynamic form engine for complex business applications.',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: [
    'AIDSL.md',
    'ARCHITECTURE.md',
    'DSL.md',
    'FORMX_CONTEXT_PACK.md',
    'FORMX_EXAMPLES.md',
    'PACKAGE_ARCHITECTURE.md',
    'SHORTCUTS.md',
    'UI_ARCHITECTURE.md',
    'async-runtime.md',
    'usage-notes.md'
  ],
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'FormX',
      description: '面向复杂业务应用的 Headless 动态表单引擎。',
      themeConfig: zhThemeConfig
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'FormX',
      description: 'Headless dynamic form engine for complex business applications.',
      themeConfig: enThemeConfig
    }
  },
  markdown: {
    lineNumbers: true
  },
  vite: {
    plugins: [vueJsx()],
    resolve: {
      alias: [
        {
          find: /^@formx\/vue-ep\/style\.css$/,
          replacement: resolveLocal('../../packages/vue-ep/src/style.css')
        },
        { find: /^@formx\/vue-ep$/, replacement: resolveLocal('../../packages/vue-ep/src') },
        { find: /^@formx\/vue-core$/, replacement: resolveLocal('../../packages/vue-core/src') },
        { find: /^@formx\/ui-core$/, replacement: resolveLocal('../../packages/ui-core/src') },
        { find: /^@formx\/core$/, replacement: resolveLocal('../../packages/core/src') },
        { find: /^@formx\/vue$/, replacement: resolveLocal('../../packages/vue/src') }
      ]
    },
    ssr: {
      noExternal: [
        'element-plus',
        '@formx/vue',
        '@formx/vue-ep',
        '@formx/vue-core',
        '@formx/ui-core',
        '@formx/core'
      ]
    },
    optimizeDeps: {
      include: ['element-plus', 'vue']
    }
  }
})
