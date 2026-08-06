<template>
  <section id="install" class="px-6 pb-4 pt-28">
    <div class="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <!-- 左侧文案 + 安装渠道 -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Install</p>
        <h2 class="mt-3.5 text-[clamp(26px,4vw,38px)] font-bold tracking-tight">想怎么装都行</h2>
        <p class="mt-4 text-[15.5px] leading-[1.8] text-mist">
          LanBeam 以 <b class="font-semibold text-white">npm 包</b>发布，同时提供 macOS、Linux、Windows 的<b class="font-semibold text-white">独立可执行文件</b>与 winget 安装渠道。选择你习惯的那一种。
        </p>
        <ul class="mt-6 flex flex-col gap-3">
          <li v-for="item in channels" :key="item.title" class="flex items-start gap-3 rounded-xl border border-line bg-panel px-4 py-3.5 text-[13.5px] leading-[1.65] text-mist">
            <span class="ok-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            <span>
              <b class="font-medium text-white">{{ item.title }}</b>
              <span v-if="item.note">（{{ item.note }}）</span>：<code class="rounded bg-white/6 px-1.5 py-0.5 font-mono text-xs text-neutral-200">{{ item.cmd }}</code>
            </span>
          </li>
        </ul>
      </div>

      <!-- 右侧 CLI 选项终端 -->
      <TerminalWindow title="— lanbeam --help —">
        <TerminalLine type="cmd"><span class="text-white">lanbeam --help</span></TerminalLine>
        <TerminalLine type="muted">用法: lanbeam [options]</TerminalLine>
        <TerminalLine>&nbsp;</TerminalLine>
        <TerminalLine type="muted">  --port &lt;端口&gt;     指定端口 (默认 3001)</TerminalLine>
        <TerminalLine type="muted">  --max-size &lt;MB&gt;   单文件大小限制 (默认 200)</TerminalLine>
        <TerminalLine type="muted">  --help              显示帮助</TerminalLine>
        <TerminalLine>&nbsp;</TerminalLine>
        <TerminalLine type="muted"># 使用指定端口</TerminalLine>
        <TerminalLine type="cmd"><span class="text-white">lanbeam --port 8080</span></TerminalLine>
        <TerminalLine type="muted"># 限制单文件 500MB</TerminalLine>
        <TerminalLine type="cmd"><span class="text-white">lanbeam --max-size 500</span></TerminalLine>
        <TerminalLine type="muted"># 端口被占用时自动递增 (3001 → 3020)</TerminalLine>
        <TerminalLine type="cmd"><span class="text-white">lanbeam</span> <span class="text-faint"># 3001 被占用 → 自动切换到 3002</span></TerminalLine>
      </TerminalWindow>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'InstallSection' })

const channels = [
  { title: 'npm 全局安装', note: '需 Node.js 18+', cmd: 'npm i -g lanbeam' },
  { title: 'curl 一键脚本', note: 'macOS / Linux，无需 Node.js', cmd: 'curl -fsSL https://lanbeam.k1nz.top/install.sh | bash' },
  { title: 'Windows', note: 'winget 或 GitHub Releases', cmd: 'winget install k1nz.LanBeam' },
  { title: '从源码运行', note: '适合二次开发', cmd: 'git clone && pnpm install && pnpm dev' },
]
</script>
