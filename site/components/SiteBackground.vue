<template>
  <div class="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
    <!-- 网格 -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_90%_60%_at_50%_0%,#000_30%,transparent_75%)]" />
    <!-- 顶部淡光 -->
    <div class="absolute -top-40 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
    <!-- 右下淡光 -->
    <div class="absolute -bottom-48 -right-36 h-[420px] w-[520px] rounded-full bg-accent/8 blur-[120px]" />
  </div>
</template>
