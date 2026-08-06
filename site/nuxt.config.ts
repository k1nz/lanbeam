import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',

  // 静态生成（GitHub Pages 部署 dist/ 目录）
  ssr: true,

  modules: ['@nuxtjs/i18n', '@nuxt/icon'],

  // lucide 图标：本地打包 + SVG 渲染，SSG 静态站无需在运行时请求 Iconify CDN
  icon: {
    mode: 'svg',
    serverBundle: {
      collections: ['lucide'],
    },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // 多语言：中文为默认（/），英文走 /en
  i18n: {
    locales: [
      { code: 'zh-CN', name: '中文', file: 'zh-CN.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'zh-CN',
    langDir: 'locales',
    strategy: 'prefix_except_default',
    baseUrl: 'https://lanbeam.k1nz.top',
    // SSG 静态站点：禁用浏览器自动探测，避免 hydration 不一致与重定向
    detectBrowserLanguage: false,
    lazy: false,
    bundle: { optimizeTranslationDirective: false },
    // FAQ / 段落文案中带有 <code>/<b>，需要允许消息内的 HTML（配合 v-html 渲染）
    compilation: { strictMessage: false },
  },

  app: {
    head: {
      // lang 与 title/description 由 app.vue 按当前语言设置
      meta: [
        { name: 'theme-color', content: '#0a0a0a' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        {
          rel: 'icon',
          href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230a0a0a'/%3E%3Cpath d='M8 16h16M16 8v16' stroke='%23a3e635' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E",
        },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },
})
