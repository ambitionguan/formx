import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@formxjs/vue-ep/style.css'
import App from './App.vue'
import './style.css'

createApp(App).use(ElementPlus).mount('#app')
