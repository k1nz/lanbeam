<template>
  <section id="usage" class="px-6 pb-4 pt-28">
    <div class="mx-auto max-w-[1080px]">
      <SectionHeading :eyebrow="t('steps.eyebrow')" :title="t('steps.title')">
        <template #desc>{{ t('steps.desc') }}</template>
      </SectionHeading>

      <div class="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <div v-for="(step, i) in steps" :key="i" class="step-card">
          <span class="step-num" aria-hidden="true">{{ i + 1 }}</span>
          <h3 class="mb-2.5 flex items-center gap-2.5 text-[16.5px] font-semibold">
            {{ step.title }}
            <span class="rounded-full border border-accent/25 bg-accent/8 px-2.5 py-0.5 text-[11px] font-medium text-accent">{{ step.tag }}</span>
          </h3>
          <p class="mb-4 text-[13.5px] leading-[1.75] text-mist">{{ step.desc }}</p>

          <template v-for="(cmd, j) in commands[i]" :key="j">
            <div v-if="cmd.label" class="mt-1 text-xs text-faint">{{ cmd.label }}</div>
            <CopyCommand :command="cmd.code" class="mt-2" />
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'StepsSection' })

const { t, tm } = useI18n()

// 命令（含代码）与语言无关，保持原样；文案来自语言文件
const commands = [
  [
    { code: 'curl -fsSL https://lanbeam.k1nz.top/install.sh | bash' },
    { code: 'winget install k1nz.LanBeam', label: 'Windows' },
  ],
  [{ code: 'lanbeam' }],
  [{ code: 'http://192.168.1.24:3001' }],
]

const steps = computed<Array<{ title: string; tag: string; desc: string }>>(() => {
  const count = (tm('steps.items') as unknown[]).length
  return Array.from({ length: count }, (_, i) => ({
    title: t(`steps.items.${i}.title`),
    tag: t(`steps.items.${i}.tag`),
    desc: t(`steps.items.${i}.desc`),
  }))
})
</script>
