<template>
  <footer class="mt-28 border-t border-white/5 px-6 pb-14 pt-11">
    <div class="mx-auto max-w-[1080px]">
      <div class="flex flex-wrap items-center justify-between gap-5">
        <div class="flex items-center gap-2.5 text-sm font-semibold">
          <LanBeamLogo />
          <span>LanBeam</span>
        </div>
        <div class="flex gap-6">
          <a v-for="link in links" :key="link.href" :href="link.href" target="_blank" rel="noopener" class="text-[13px] text-mist no-underline transition-colors hover:text-white">
            {{ link.label }}
          </a>
        </div>
      </div>
      <div class="mt-7 flex flex-wrap justify-between gap-3.5 text-xs text-faint">
        <span>{{ t('footer.copyright') }}</span>
        <span>{{ t('footer.tagline') }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()

const links = computed(() => [
  { label: 'GitHub', href: 'https://github.com/k1nz/lanbeam' },
  { label: 'Releases', href: 'https://github.com/k1nz/lanbeam/releases' },
  { label: t('footer.changelog'), href: 'https://github.com/k1nz/lanbeam/blob/main/CHANGELOG.md' },
  { label: 'MIT License', href: 'https://github.com/k1nz/lanbeam/blob/main/LICENSE' },
])
</script>
