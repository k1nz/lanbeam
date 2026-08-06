<template>
  <section class="px-6 pt-28 text-center">
    <div class="mx-auto max-w-[1080px]">
      <h2 class="text-[clamp(28px,4.6vw,46px)] font-bold leading-[1.2] tracking-tight">
        文件传输，<span class="bg-gradient-to-r from-accent to-sky-400 bg-clip-text text-transparent">本不该这么麻烦</span>
      </h2>
      <p class="mx-auto mt-4 max-w-[520px] text-[15.5px] text-mist">
        安装一次，随时启动。没有账号、没有上传云盘、没有第三方 —— 局域网内最快的传文件方式。
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a href="#install" class="btn btn-lime">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          安装 LanBeam
        </a>
        <a href="https://github.com/k1nz/lanbeam" target="_blank" rel="noopener" class="btn btn-ghost">查看源码</a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'FinalCta' })
</script>
