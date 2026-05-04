import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@formxjs/core': resolve(__dirname, '../../packages/core/src'),
      '@formxjs/ui-core': resolve(__dirname, '../../packages/ui-core/src'),
      '@formxjs/vue-core': resolve(__dirname, '../../packages/vue-core/src'),
      '@formxjs/vue-ep': resolve(__dirname, '../../packages/vue-ep/src'),
      '@formxjs/vue': resolve(__dirname, '../../packages/vue/src')
    }
  }
})
