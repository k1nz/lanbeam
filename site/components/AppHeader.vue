<template>
  <nav class="sticky top-0 z-50 border-b border-white/5 bg-ink/70 backdrop-blur-md">
    <!-- 三列网格：左右 1fr 等宽，中间 auto 放导航 → 导航严格居中 -->
    <div class="mx-auto grid h-[62px] max-w-[1080px] grid-cols-[1fr_auto_1fr] items-center px-6">
      <!-- 左：Logo -->
      <a href="#top" class="flex items-center gap-2.5 text-[15px] font-semibold no-underline">
        <LanBeamLogo />
        <span>LanBeam</span>
      </a>

      <!-- 中：导航 -->
      <div class="hidden items-center gap-7 md:flex">
        <a v-for="link in links" :key="link.href" :href="link.href" class="text-[13.5px] text-mist no-underline transition-colors hover:text-white">
          {{ link.label }}
        </a>
      </div>

      <!-- 右：语言切换 + GitHub + CTA -->
      <div class="flex items-center justify-end gap-3">
        <!-- 语言切换（图标按钮 + 下拉） -->
        <div ref="langWrapRef" class="relative">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/2 text-mist transition-colors hover:border-line2 hover:text-white"
            :aria-label="t('nav.langLabel')"
            aria-haspopup="menu"
            :aria-expanded="open ? 'true' : 'false'"
            @click="open = !open"
          >
            <Icon name="lucide:languages" class="h-[18px] w-[18px]" />
          </button>

          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="translate-y-1 opacity-0"
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="translate-y-1 opacity-0"
          >
            <div v-if="open" role="menu" class="absolute right-0 top-full z-50 mt-2 min-w-[144px] rounded-xl border border-line bg-panel p-1 shadow-2xl shadow-black/40">
              <button
                v-for="loc in locales"
                :key="loc.code"
                type="button"
                role="menuitemradio"
                class="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-[13px] no-underline transition-colors hover:bg-white/5"
                :class="locale === loc.code ? 'text-white' : 'text-mist hover:text-white'"
                :aria-checked="locale === loc.code ? 'true' : 'false'"
                @click="switchTo(loc.code)"
              >
                <span>{{ loc.name }}</span>
                <Icon v-if="locale === loc.code" name="lucide:check" class="h-3.5 w-3.5 text-accent" />
              </button>
            </div>
          </Transition>
        </div>

        <a
          href="https://github.com/k1nz/lanbeam"
          target="_blank"
          rel="noopener"
          class="hidden items-center gap-2 text-[13.5px] text-mist no-underline transition-colors hover:text-white sm:inline-flex"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          GitHub
        </a>
        <a href="#install" class="btn btn-lime">{{ t('nav.installCta') }}</a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const links = computed(() => [
  { label: t('nav.features'), href: '#features' },
  { label: t('nav.usage'), href: '#usage' },
  { label: t('nav.install'), href: '#install' },
  { label: t('nav.privacy'), href: '#privacy' },
  { label: t('nav.faq'), href: '#faq' },
])

// 语言下拉：点击外部 / Esc 关闭
const open = ref(false)
const langWrapRef = ref<HTMLElement | null>(null)

function switchTo(code: string) {
  open.value = false
  navigateTo(switchLocalePath(code as Parameters<typeof switchLocalePath>[0]))
}

function onDocumentClick(e: MouseEvent) {
  if (langWrapRef.value && !langWrapRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>
