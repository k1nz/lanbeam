<template>
  <section id="faq" class="px-6 pb-4 pt-28">
    <div class="mx-auto max-w-[1080px]">
      <SectionHeading eyebrow="FAQ" title="常见问题" />

      <div class="mx-auto max-w-[760px]">
        <div v-for="(item, i) in items" :key="i" class="faq-item" :class="{ open: openIndex === i }">
          <button type="button" class="faq-q" :aria-expanded="openIndex === i" @click="toggle(i)">
            {{ item.q }}
            <svg
              class="chev h-[15px] w-[15px] shrink-0 text-mist transition-transform duration-200"
              :class="{ 'rotate-180': openIndex === i }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div
            class="faq-a"
            :style="{ maxHeight: (heights[i] ?? 0) + 'px' }"
          >
            <div class="faq-answer px-5 pb-4.5 text-sm leading-[1.8] text-mist" v-html="item.a" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'FaqSection' })

const items = [
  {
    q: '别人需要安装 LanBeam 才能接收文件吗？',
    a: '不需要。把终端打印的局域网地址发给对方，任何浏览器（手机、平板、电脑）打开即可上传和下载文件。LanBeam 是浏览器即客户端。',
  },
  {
    q: '在外网（不在同一 WiFi）时能用吗？',
    a: '不能，LanBeam 定位就是局域网工具。设备需要连接到同一个网络（同一 WiFi 或有线网络）。这保证了任何数据不出局域网，也不经过云端。',
  },
  {
    q: '单个文件大小有限制吗？',
    a: '默认每个文件最大 200MB。可以用 <code>lanbeam --max-size 500</code> 调整为 500MB，也可以通过环境变量 <code>MAX_FILE_SIZE</code> 设置。',
  },
  {
    q: '端口被占用怎么办？',
    a: '默认从 3001 端口启动；如果被占用，会自动递增尝试（3001 → 3020）直到找到可用端口，并在终端打印实际使用的地址。也可以手动指定 <code>lanbeam --port 8080</code>。',
  },
  {
    q: '上传的文件存放在哪里？',
    a: '存放在运行 LanBeam 的目录下的 <code>lanbeam-files/</code>（源码运行时是 <code>server/uploads/</code>）。文件直接落盘为普通文件，随时可以在系统里访问、备份或删除。',
  },
  {
    q: '共享的文字和图片会保存下来吗？',
    a: '不会。它们只保存在服务器内存中（图片最多保留最近 20 张、每张最大 10MB），服务器停止即全部清空，不会写入磁盘。',
  },
  {
    q: '需要注册账号或付费吗？',
    a: '完全不需要。LanBeam 免费、开源（MIT 协议）、无任何账号体系。安装即用，文件与数据全部留在自己的设备上。',
  },
]

const openIndex = ref<number | null>(null)
const heights = ref<number[]>([])

function getAnswers() {
  return Array.from(document.querySelectorAll<HTMLElement>('.faq-answer'))
}

// 测量每项答案高度（含字体加载完成后的重测）
async function measure() {
  await nextTick()
  heights.value = getAnswers().map((el) => el.scrollHeight)
  try {
    await document.fonts.ready
    heights.value = getAnswers().map((el) => el.scrollHeight)
  } catch {
    /* 字体加载失败不影响折叠功能 */
  }
}

onMounted(measure)

function toggle(i: number) {
  const next = openIndex.value === i ? null : i
  openIndex.value = next
  // 若尚未测量（如字体加载中），点击时惰性补测
  if (next !== null && !heights.value[i]) {
    heights.value[i] = getAnswers()[i]?.scrollHeight ?? 0
  }
}
</script>

<style scoped>
.faq-a {
  overflow: hidden;
  transition: max-height 0.28s ease;
}
</style>
