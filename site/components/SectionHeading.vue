<template>
  <div class="mb-14 text-center">
    <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{{ eyebrow }}</p>
    <h2 class="mt-3.5 text-[clamp(26px,4vw,40px)] font-bold tracking-tight">{{ title }}</h2>
    <p v-if="$slots.desc" class="mx-auto mt-3.5 max-w-[560px] text-[15.5px] text-mist">
      <slot name="desc" />
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
}>()
</script>
