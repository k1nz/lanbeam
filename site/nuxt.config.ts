import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',

  // 静态生成（GitHub Pages 部署 dist/ 目录）
  ssr: true,

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'LanBeam — 局域网文件传输与实时共享',
      meta: [
        {
          name: 'description',
          content:
            'LanBeam 是一个本地优先的局域网文件传输与实时共享工具。无需账号、无需云服务，同一网络下的任何设备通过浏览器即可上传、下载文件并实时共享文字与图片。',
        },
        { name: 'theme-color', content: '#0a0a0a' },
        { property: 'og:title', content: 'LanBeam — 局域网文件传输与实时共享' },
        {
          property: 'og:description',
          content: '本地优先的局域网文件传输工具。零账号、零云端，一条命令，同网络设备直接用浏览器互传文件。',
        },
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
