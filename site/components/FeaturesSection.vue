<template>
  <section id="features" class="px-6 pb-4 pt-28">
    <div class="mx-auto max-w-[1080px]">
      <SectionHeading eyebrow="Features" title="能做什么">
        <template #desc>一个运行在你的电脑上的轻量服务，覆盖局域网内最常见的共享需求。</template>
      </SectionHeading>

      <div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <div class="feature-ico" v-html="f.icon" />
          <h3 class="mb-2 text-base font-semibold">{{ f.title }}</h3>
          <p class="text-[13.5px] leading-[1.7] text-mist">{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'FeaturesSection' })

const features = [
  {
    title: '拖拽即传',
    desc: '把文件或整个文件夹拖进浏览器即可上传，自动保留目录结构。每台设备都能随时下载或删除。',
    icon: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  },
  {
    title: '实时共享',
    desc: '一条共享笔记，在打开的所有设备间实时同步。粘贴一张图片，立即可见 —— 适合互发截图。',
    icon: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  },
  {
    title: '零门槛使用',
    desc: '对方不需要安装任何东西 —— 把地址发过去，任何浏览器打开即用，手机电脑都行。',
    icon: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  },
  {
    title: '本地优先',
    desc: '文件只存在运行 LanBeam 的那台机器上。无需账号、无需云盘，流量不出局域网。',
    icon: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>',
  },
  {
    title: '大文件无压力',
    desc: '默认支持单文件最大 200MB，可用 --max-size 调整。局域网内传输走满带宽。',
    icon: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  },
  {
    title: '隐私安全',
    desc: '共享的笔记与图片只保存在内存中，服务器停止即清空。不上传任何数据，也无任何遥测。',
    icon: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  },
]
</script>
