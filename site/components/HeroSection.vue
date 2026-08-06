<template>
  <header id="top" class="px-6 pb-10 pt-28 text-center">
    <div class="mx-auto max-w-[1080px]">
      <!-- 徽章 -->
      <span class="inline-flex items-center gap-2 rounded-full border border-line bg-white/2 px-3.5 py-1.5 text-xs text-mist">
        <span class="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-pulse-dot" />
        {{ t('hero.badge') }}
      </span>

      <!-- 主标题 -->
      <h1 class="mx-auto mt-8 max-w-[800px] text-[clamp(38px,6.2vw,64px)] font-bold leading-[1.12] tracking-tight">
        {{ t('hero.titleA') }}
        <br />
        <span class="bg-gradient-to-r from-white via-white/60 to-accent bg-clip-text text-transparent">{{ t('hero.titleB') }}</span>
      </h1>

      <p class="mx-auto mt-5 max-w-[600px] text-[clamp(15px,2.4vw,17.5px)] leading-[1.75] text-mist">
        {{ t('hero.desc') }}
      </p>

      <div class="mt-9 flex flex-wrap justify-center gap-3">
        <a href="#install" class="btn btn-lime">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {{ t('hero.installCta') }}
        </a>
        <a href="https://github.com/k1nz/lanbeam/releases" target="_blank" rel="noopener" class="btn btn-ghost">{{ t('hero.releases') }}</a>
      </div>
      <p class="mt-4 text-[13px] text-faint">{{ t('hero.platformNote') }}</p>

      <!-- 终端演示 -->
      <TerminalWindow
        class="mx-auto mt-14 max-w-[780px]"
        title="— lanbeam — 80×24"
        :aria-label="t('hero.terminalAria')"
      >
        <TerminalLine type="cmd"><span class="text-white">npm i -g lanbeam</span></TerminalLine>
        <TerminalLine type="muted">added 15 packages in 4.2s</TerminalLine>
        <TerminalLine type="cmd"><span class="text-white">lanbeam</span></TerminalLine>
        <TerminalLine type="ok">{{ t('hero.terminal.started') }}</TerminalLine>
        <TerminalLine type="dim">{{ t('hero.terminal.storageDir') }}</TerminalLine>
        <TerminalLine type="dim">{{ t('hero.terminal.sizeLimit') }}</TerminalLine>
        <TerminalLine>&nbsp;</TerminalLine>
        <TerminalLine type="key">{{ t('hero.terminal.access') }}</TerminalLine>
        <TerminalLine class="pl-5">{{ t('hero.terminal.local') }} <a class="text-sky-400 underline underline-offset-2" href="http://localhost:3001">http://localhost:3001</a></TerminalLine>
        <TerminalLine class="pl-5">{{ t('hero.terminal.local') }} <a class="text-sky-400 underline underline-offset-2" href="http://127.0.0.1:3001">http://127.0.0.1:3001</a></TerminalLine>
        <TerminalLine>&nbsp;</TerminalLine>
        <TerminalLine type="key">{{ t('hero.terminal.lan') }}</TerminalLine>
        <TerminalLine class="pl-5"><a class="text-sky-400 underline underline-offset-2" href="http://192.168.1.24:3001">http://192.168.1.24:3001</a></TerminalLine>
        <TerminalLine type="muted">{{ t('hero.terminal.tip') }}</TerminalLine>
        <TerminalLine>&nbsp;</TerminalLine>
        <TerminalLine><span class="text-accent">▸</span> <span class="caret" /></TerminalLine>
      </TerminalWindow>
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: 'HeroSection' })

const { t } = useI18n()
</script>
