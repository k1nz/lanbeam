<template>
  <section id="privacy" class="px-6 pb-4 pt-28">
    <div class="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <!-- 左侧文案 -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{{ t('privacy.eyebrow') }}</p>
        <h2 class="mt-3.5 text-[clamp(26px,4vw,38px)] font-bold tracking-tight">{{ t('privacy.title') }}</h2>
        <p class="mt-4 text-[15.5px] leading-[1.8] text-mist" v-html="t('privacy.desc1')" />
        <p class="mt-4 text-[15.5px] leading-[1.8] text-mist">{{ t('privacy.desc2') }}</p>
      </div>

      <!-- 右侧清单 -->
      <ul class="flex flex-col gap-3">
        <li v-for="(item, i) in points" :key="i" class="flex items-start gap-3 rounded-xl border border-line bg-panel px-4 py-3.5 text-[13.5px] leading-[1.65] text-mist">
          <span class="ok-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          <span><b class="font-medium text-white">{{ item.title }}</b>{{ t('privacy.sep') }}{{ item.desc }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'PrivacySection' })

const { t, tm } = useI18n()

const points = computed<Array<{ title: string; desc: string }>>(() => {
  const count = (tm('privacy.points') as unknown[]).length
  return Array.from({ length: count }, (_, i) => ({
    title: t(`privacy.points.${i}.title`),
    desc: t(`privacy.points.${i}.desc`),
  }))
})
</script>
