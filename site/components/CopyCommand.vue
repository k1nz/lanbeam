<template>
  <div class="relative">
    <pre class="block overflow-x-auto whitespace-pre rounded-lg border border-line bg-ink px-3.5 py-2.5 pr-14 font-mono text-[12.5px] leading-[1.7] text-neutral-200">{{ command }}</pre>
    <button
      type="button"
      class="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md border border-line2 bg-white/5 px-2.5 py-1.5 font-sans text-[11.5px] text-mist transition-colors hover:border-neutral-500 hover:text-white"
      :class="{ '!border-accent !bg-accent !text-ink': copied }"
      @click="copy"
    >
      <svg v-if="!copied" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {{ copied ? t('copy.copied') : t('copy.copy') }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  command: string
}>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

async function copy() {
  const text = props.command
  const done = () => {
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 1600)
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      done()
      return
    }
  } catch {
    /* 走降级路径 */
  }

  // 降级：execCommand（非安全上下文 / 旧浏览器）
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
    done()
  } catch {
    /* 复制失败，静默忽略 */
  }
  document.body.removeChild(ta)
}
</script>

<style scoped>
/* 横向滚动条默认隐藏，鼠标悬浮时才显示 */
pre {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.2s ease;
}
pre:hover {
  scrollbar-color: var(--color-line2) transparent;
}
pre::-webkit-scrollbar {
  height: 6px;
}
pre::-webkit-scrollbar-track {
  background: transparent;
}
pre::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 999px;
}
pre:hover::-webkit-scrollbar-thumb {
  background: var(--color-line2);
}
</style>
