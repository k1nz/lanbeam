<template>
  <header id="top" class="px-6 pb-10 pt-28 text-center">
    <div class="mx-auto max-w-[1080px]">
      <!-- 徽章 -->
      <span class="inline-flex items-center gap-2 rounded-full border border-line bg-white/2 px-3.5 py-1.5 text-xs text-mist">
        <span class="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-pulse-dot" />
        v1.0.3 · 本地优先 · 零账号
      </span>

      <!-- 主标题 -->
      <h1 class="mx-auto mt-8 max-w-[800px] text-[clamp(38px,6.2vw,64px)] font-bold leading-[1.12] tracking-tight">
        一台机器运行，
        <br />
        <span class="bg-gradient-to-r from-white via-white/60 to-accent bg-clip-text text-transparent">全网设备秒互传</span>
      </h1>

      <p class="mx-auto mt-5 max-w-[600px] text-[clamp(15px,2.4vw,17.5px)] leading-[1.75] text-mist">
        LanBeam 是一个本地优先的局域网文件传输与实时共享工具。在同一网络下启动它，任何设备用浏览器就能上传、下载文件，实时共享文字与图片 —— 无需账号，也不经过任何云端。
      </p>

      <div class="mt-9 flex flex-wrap justify-center gap-3">
        <a href="#install" class="btn btn-lime">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          安装 LanBeam
        </a>
        <a href="https://github.com/k1nz/lanbeam/releases" target="_blank" rel="noopener" class="btn btn-ghost">GitHub Releases</a>
      </div>
      <p class="mt-4 text-[13px] text-faint">支持 macOS / Windows / Linux · 单文件可执行 · npm / winget / curl 均可安装</p>

      <!-- 终端演示 -->
      <TerminalWindow
        class="mx-auto mt-14 max-w-[780px]"
        title="— lanbeam — 80×24"
        aria-label="终端示例：安装并启动 LanBeam"
      >
        <TerminalLine type="cmd"><span class="text-white">npm i -g lanbeam</span></TerminalLine>
        <TerminalLine type="muted">added 15 packages in 4.2s</TerminalLine>
        <TerminalLine type="cmd"><span class="text-white">lanbeam</span></TerminalLine>
        <TerminalLine type="ok">🚀 文件传输服务器已启动</TerminalLine>
        <TerminalLine type="dim">📁 文件存储目录: /Users/you/lanbeam-files</TerminalLine>
        <TerminalLine type="dim">📏 文件大小限制: 200MB</TerminalLine>
        <TerminalLine>&nbsp;</TerminalLine>
        <TerminalLine type="key">🌐 访问地址:</TerminalLine>
        <TerminalLine class="pl-5">本地访问: <a class="text-sky-400 underline underline-offset-2" href="http://localhost:3001">http://localhost:3001</a></TerminalLine>
        <TerminalLine class="pl-5">本地访问: <a class="text-sky-400 underline underline-offset-2" href="http://127.0.0.1:3001">http://127.0.0.1:3001</a></TerminalLine>
        <TerminalLine>&nbsp;</TerminalLine>
        <TerminalLine type="key">🔗 局域网访问:</TerminalLine>
        <TerminalLine class="pl-5"><a class="text-sky-400 underline underline-offset-2" href="http://192.168.1.24:3001">http://192.168.1.24:3001</a></TerminalLine>
        <TerminalLine type="muted">💡 其他设备可以通过上述局域网地址访问文件传输服务</TerminalLine>
        <TerminalLine>&nbsp;</TerminalLine>
        <TerminalLine><span class="text-accent">▸</span> <span class="caret" /></TerminalLine>
      </TerminalWindow>
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: 'HeroSection' })
</script>
