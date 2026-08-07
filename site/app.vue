<template>
  <div class="relative">
    <SiteBackground />
    <AppHeader />
    <main>
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// SEO head 随语言切换：html lang、title、description 与 OG 标签
const { locale, t, baseUrl } = useI18n()

// canonical：中文首页无前缀，英文走 /en/，避免重复内容
const canonical = locale.value === 'zh-CN' ? `${baseUrl.value}/` : `${baseUrl.value}/en/`

useHead(() => ({
  htmlAttrs: { lang: locale.value === 'zh-CN' ? 'zh-CN' : 'en' },
  title: t('seo.title'),
  meta: [
    { name: 'description', content: t('seo.description') },
    { property: 'og:title', content: t('seo.title') },
    { property: 'og:description', content: t('seo.description') },
    { property: 'og:locale', content: locale.value === 'zh-CN' ? 'zh_CN' : 'en_US' },
  ],
  link: [{ rel: 'canonical', href: canonical }],
}))
</script>
