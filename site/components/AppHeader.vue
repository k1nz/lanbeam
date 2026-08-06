<template>
  <nav class="sticky top-0 z-50 border-b border-white/5 bg-ink/70 backdrop-blur-md">
    <div class="mx-auto flex h-[62px] max-w-[1080px] items-center justify-between px-6">
      <a href="#top" class="flex items-center gap-2.5 text-[15px] font-semibold no-underline">
        <LanBeamLogo />
        <span>LanBeam</span>
      </a>

      <div class="hidden items-center gap-7 md:flex">
        <a v-for="link in links" :key="link.href" :href="link.href" class="text-[13.5px] text-mist no-underline transition-colors hover:text-white">
          {{ link.label }}
        </a>
      </div>

      <div class="flex items-center gap-3">
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
        <a href="#install" class="btn btn-lime">立即安装</a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const links = [
  { label: '特性', href: '#features' },
  { label: '用法', href: '#usage' },
  { label: '安装', href: '#install' },
  { label: '隐私', href: '#privacy' },
  { label: 'FAQ', href: '#faq' },
]
</script>
