<template>
  <section id="privacy" class="px-6 pb-4 pt-28">
    <div class="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <!-- 左侧文案 -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Privacy</p>
        <h2 class="mt-3.5 text-[clamp(26px,4vw,38px)] font-bold tracking-tight">数据完全留在你的局域网里</h2>
        <p class="mt-4 text-[15.5px] leading-[1.8] text-mist">
          LanBeam 没有服务器端，也<b class="font-semibold text-white">不收集任何数据</b>。上传的文件只保存在运行它的那台机器上；共享的文字与图片仅存在于内存中，进程一停就清空。
        </p>
        <p class="mt-4 text-[15.5px] leading-[1.8] text-mist">
          同一网络下的设备才能访问 —— 局域网之外无法触达，无需账号，也没有云端中转。
        </p>
      </div>

      <!-- 右侧清单 -->
      <ul class="flex flex-col gap-3">
        <li v-for="item in points" :key="item.title" class="flex items-start gap-3 rounded-xl border border-line bg-panel px-4 py-3.5 text-[13.5px] leading-[1.65] text-mist">
          <span class="ok-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          <span><b class="font-medium text-white">{{ item.title }}</b> —— {{ item.desc }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'PrivacySection' })

const points = [
  { title: '无账号、无云端', desc: '没有任何服务在中间记录你的活动' },
  { title: '文件只在本机', desc: '上传的内容存在 lanbeam-files/ 目录，删掉即彻底移除' },
  { title: '文字图片仅在内存', desc: '服务器停止即清空，不落盘、不持久化' },
  { title: '局域网边界', desc: '仅绑定局域网地址，外部网络无法访问' },
  { title: '开源 MIT 协议', desc: '全部代码公开，可自行审计' },
]
</script>
