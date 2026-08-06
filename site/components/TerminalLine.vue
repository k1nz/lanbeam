<template>
  <div :class="[cls, typeClass]">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type?: 'cmd' | 'muted' | 'dim' | 'ok' | 'key'
}>()

const typeClass = computed(() => {
  switch (props.type) {
    case 'cmd':
      return ''
    case 'muted':
      return 'text-mist'
    case 'dim':
      return 'text-faint'
    case 'ok':
      return 'text-accent'
    case 'key':
      return 'text-accent'
    default:
      return 'text-neutral-200'
  }
})

const cls = 'whitespace-pre'
</script>
