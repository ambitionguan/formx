import type { Theme } from 'vitepress'
import { defineComponent, h, onMounted, onUnmounted, watch } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '../../../packages/vue-ep/src/style.css'
import './styles.css'

const APPEARANCE_KEY = 'vitepress-theme-appearance'
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)'

const normalizePath = (path: string) => {
  const pathname = path.split(/[?#]/)[0] || '/'
  const withoutIndex = pathname.replace(/\/index(?:\.html)?$/, '/')
  const withoutHtml = withoutIndex.replace(/\.html$/, '')
  return withoutHtml.endsWith('/') ? withoutHtml : `${withoutHtml}/`
}

const isHomePath = (path: string) => {
  const normalized = normalizePath(path)
  return normalized === '/' || normalized === '/en/'
}

const resolvePreferredDark = () => {
  const preference = localStorage.getItem(APPEARANCE_KEY) || 'auto'
  if (preference === 'dark') {
    return true
  }
  if (preference === 'light') {
    return false
  }
  return window.matchMedia(PREFERS_DARK_QUERY).matches
}

const syncRouteAppearance = (path: string) => {
  const html = document.documentElement
  const isHome = isHomePath(path)

  html.classList.toggle('formx-home-route', isHome)

  if (isHome) {
    html.classList.add('dark')
    return
  }

  html.classList.toggle('dark', resolvePreferredDark())
}

const HomeAppearanceController = defineComponent({
  name: 'HomeAppearanceController',
  setup() {
    const route = useRoute()
    let mediaQuery: MediaQueryList | undefined

    const sync = () => syncRouteAppearance(route.path)

    onMounted(() => {
      sync()
      watch(() => route.path, sync)

      mediaQuery = window.matchMedia(PREFERS_DARK_QUERY)
      mediaQuery.addEventListener('change', sync)
      window.addEventListener('storage', sync)
    })

    onUnmounted(() => {
      mediaQuery?.removeEventListener('change', sync)
      window.removeEventListener('storage', sync)
      document.documentElement.classList.remove('formx-home-route')
    })

    return () => null
  }
})

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(HomeAppearanceController)
    })
  },
  enhanceApp({ app }) {
    app.use(ElementPlus)
  }
} satisfies Theme
