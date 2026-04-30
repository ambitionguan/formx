import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FormXVueEp',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs')
    },
    rollupOptions: {
      external: ['vue', 'element-plus', '@formx/core', '@formx/ui-core', '@formx/vue-core'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name || '[name][extname]'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@formx/core': resolve(__dirname, '../core/src'),
      '@formx/ui-core': resolve(__dirname, '../ui-core/src'),
      '@formx/vue-core': resolve(__dirname, '../vue-core/src')
    }
  }
})
