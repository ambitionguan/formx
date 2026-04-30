import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@formx/core': resolve(__dirname, '../../packages/core/src'),
      '@formx/ui-core': resolve(__dirname, '../../packages/ui-core/src'),
      '@formx/vue-core': resolve(__dirname, '../../packages/vue-core/src'),
      '@formx/vue-ep': resolve(__dirname, '../../packages/vue-ep/src'),
      '@formx/vue': resolve(__dirname, '../../packages/vue/src')
    }
  }
})
