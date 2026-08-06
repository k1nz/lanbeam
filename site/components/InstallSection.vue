<template>
  <section id="install" class="px-6 pb-4 pt-28">
    <div class="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <!-- 左侧文案 + 安装渠道 -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{{ t('install.eyebrow') }}</p>
        <h2 class="mt-3.5 text-[clamp(26px,4vw,38px)] font-bold tracking-tight">{{ t('install.title') }}</h2>
        <p class="mt-4 text-[15.5px] leading-[1.8] text-mist" v-html="t('install.desc')" />
        <ul class="mt-6 flex flex-col gap-3">
          <li v-for="item in channels" :key="item.cmd" class="flex items-start gap-3 rounded-xl border border-line bg-panel px-4 py-3.5 text-[13.5px] leading-[1.65] text-mist">
            <span class="ok-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            <span>
              <b class="font-medium text-white">{{ item.title }}</b>
              <span v-if="item.note">{{ t('install.parenOpen') }}{{ item.note }}{{ t('install.parenClose') }}</span>{{ t('install.colon') }}<code class="rounded bg-white/6 px-1.5 py-0.5 font-mono text-xs text-neutral-200">{{ item.cmd }}</code>
            </span>
          </li>
        </ul>
      </div>

      <!-- 右侧 CLI 选项终端 -->
      <TerminalWindow title="— lanbeam --help —">
        <TerminalLine type="cmd"><span class="text-white">lanbeam --help</span></TerminalLine>
        <TerminalLine type="muted">{{ t('install.terminal.usage') }}</TerminalLine>
        <TerminalLine>&nbsp;</TerminalLine>
        <TerminalLine type="muted">{{ t('install.terminal.port') }}</TerminalLine>
        <TerminalLine type="muted">{{ t('install.terminal.maxSize') }}</TerminalLine>
        <TerminalLine type="muted">{{ t('install.terminal.help') }}</TerminalLine>
        <TerminalLine>&nbsp;</TerminalLine>
        <TerminalLine type="muted">{{ t('install.terminal.commentPort') }}</TerminalLine>
        <TerminalLine type="cmd"><span class="text-white">lanbeam --port 8080</span></TerminalLine>
        <TerminalLine type="muted">{{ t('install.terminal.commentMaxSize') }}</TerminalLine>
        <TerminalLine type="cmd"><span class="text-white">lanbeam --max-size 500</span></TerminalLine>
        <TerminalLine type="muted">{{ t('install.terminal.commentIncrement') }}</TerminalLine>
        <TerminalLine type="cmd"><span class="text-white">lanbeam</span> <span class="text-faint">{{ t('install.terminal.commentFallback') }}</span></TerminalLine>
      </TerminalWindow>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'InstallSection' })

const { t, tm } = useI18n()

const channels = computed<Array<{ title: string; note?: string; cmd: string }>>(() => {
  const count = (tm('install.channels') as unknown[]).length
  return Array.from({ length: count }, (_, i) => ({
    title: t(`install.channels.${i}.title`),
    note: t(`install.channels.${i}.note`),
    cmd: t(`install.channels.${i}.cmd`),
  }))
})
</script>
