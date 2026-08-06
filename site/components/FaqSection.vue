<template>
  <section id="faq" class="px-6 pb-4 pt-28">
    <div class="mx-auto max-w-[1080px]">
      <SectionHeading :eyebrow="t('faq.eyebrow')" :title="t('faq.title')" />

      <div class="mx-auto max-w-[760px]">
        <div v-for="(item, i) in items" :key="i" class="faq-item" :class="{ open: openIndex === i }">
          <button type="button" class="faq-q" :aria-expanded="openIndex === i" @click="toggle(i)">
            {{ item.q }}
            <svg
              class="chev h-[15px] w-[15px] shrink-0 text-mist transition-transform duration-200"
              :class="{ 'rotate-180': openIndex === i }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div
            class="faq-a"
            :style="{ maxHeight: (heights[i] ?? 0) + 'px' }"
          >
            <div class="faq-answer px-5 pb-4.5 text-sm leading-[1.8] text-mist" v-html="item.a" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'FaqSection' })

const { t, tm } = useI18n()

// 答案中含 <code> 等 HTML，tm 会返回编译对象，需用 t() 逐条取字符串
const items = computed<Array<{ q: string; a: string }>>(() => {
  const count = (tm('faq.items') as unknown[]).length
  return Array.from({ length: count }, (_, i) => ({
    q: t(`faq.items.${i}.q`),
    a: t(`faq.items.${i}.a`),
  }))
})

const openIndex = ref<number | null>(null)
const heights = ref<number[]>([])

function getAnswers() {
  return Array.from(document.querySelectorAll<HTMLElement>('.faq-answer'))
}

// 测量每项答案高度（含字体加载完成后的重测）
async function measure() {
  await nextTick()
  heights.value = getAnswers().map((el) => el.scrollHeight)
  try {
    await document.fonts.ready
    heights.value = getAnswers().map((el) => el.scrollHeight)
  } catch {
    /* 字体加载失败不影响折叠功能 */
  }
}

onMounted(measure)

function toggle(i: number) {
  const next = openIndex.value === i ? null : i
  openIndex.value = next
  // 若尚未测量（如字体加载中），点击时惰性补测
  if (next !== null && !heights.value[i]) {
    heights.value[i] = getAnswers()[i]?.scrollHeight ?? 0
  }
}
</script>

<style scoped>
.faq-a {
  overflow: hidden;
  transition: max-height 0.28s ease;
}
</style>
