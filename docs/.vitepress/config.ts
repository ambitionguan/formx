import { defineConfig } from 'vitepress'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath, URL } from 'node:url'

const resolveLocal = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  title: 'FormX',
  description: 'Headless dynamic form engine for complex business applications.',
  lang: 'zh-CN',
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
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    nav: [
      { text: 'Guide / 指南', link: '/guide/getting-started' },
      { text: 'Examples / 示例', link: '/examples/' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/formxjs/formx' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide / 指南',
          items: [
            { text: 'Getting Started / 快速开始', link: '/guide/getting-started' },
            { text: 'Package Boundaries / 包边界', link: '/guide/packages' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples / 示例',
          items: [
            { text: 'Overview / 总览', link: '/examples/' },
            { text: 'Basic Form / 基础表单', link: '/examples/basic' },
            { text: 'Linkage / 联动规则', link: '/examples/linkage' },
            { text: 'Remote Options / 远程选项', link: '/examples/remote-options' },
            { text: 'Field Group / 字段组', link: '/examples/field-group' },
            { text: 'Validation / 校验', link: '/examples/validation' },
            { text: 'Headless Core / 纯核心引擎', link: '/examples/headless-core' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API',
          items: [{ text: 'Overview / 总览', link: '/api/' }]
        }
      ]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/formxjs/formx' }],
    search: {
      provider: 'local'
    }
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
