<template>
  <section id="usage" class="px-6 pb-4 pt-28">
    <div class="mx-auto max-w-[1080px]">
      <SectionHeading eyebrow="Quick Start" title="三步上手">
        <template #desc>从安装到第一台设备连接，全程不超过一分钟。</template>
      </SectionHeading>

      <div class="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <div v-for="(step, i) in steps" :key="i" class="step-card">
          <span class="step-num" aria-hidden="true">{{ i + 1 }}</span>
          <h3 class="mb-2.5 flex items-center gap-2.5 text-[16.5px] font-semibold">
            {{ step.title }}
            <span class="rounded-full border border-accent/25 bg-accent/8 px-2.5 py-0.5 text-[11px] font-medium text-accent">{{ step.tag }}</span>
          </h3>
          <p class="mb-4 text-[13.5px] leading-[1.75] text-mist">{{ step.desc }}</p>

          <template v-for="(cmd, j) in step.commands" :key="j">
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

const steps = [
  {
    title: '安装',
    tag: 'macOS / Linux',
    desc: 'macOS 与 Linux 可用一键脚本安装独立程序，无需 Node.js；Windows 使用 winget 或直接下载可执行文件。',
    commands: [
      { code: 'curl -fsSL https://lanbeam.k1nz.top/install.sh | bash' },
      { code: 'winget install k1nz.LanBeam', label: 'Windows' },
    ],
  },
  {
    title: '启动',
    tag: '任意系统',
    desc: '在终端运行 lanbeam，服务自动从 3001 端口开始，被占用时自动递增寻找可用端口。',
    commands: [{ code: 'lanbeam' }],
  },
  {
    title: '连接',
    tag: '任何设备',
    desc: '把终端打印的局域网地址发给同一网络下的任何设备，用浏览器打开即可上传、下载与共享。对方无需安装任何软件。',
    commands: [{ code: 'http://192.168.1.24:3001' }],
  },
]
</script>
