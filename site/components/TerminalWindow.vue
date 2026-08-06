<template>
  <div class="overflow-hidden rounded-2xl border border-line bg-panel text-left shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
    <!-- 标题栏 -->
    <div class="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-3">
      <span class="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
      <span class="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
      <span class="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
      <span v-if="title" class="ml-2 font-mono text-xs text-faint">{{ title }}</span>
    </div>
    <!-- 内容 -->
    <div class="px-[22px] py-5 font-mono text-[13px] leading-[1.85]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'TerminalWindow' })

defineProps<{
  title?: string
}>()
</script>
