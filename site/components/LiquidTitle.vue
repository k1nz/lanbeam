<template>
  <div ref="wrapRef" class="relative mx-auto mt-8 max-w-[800px]">
    <!-- 真实标题保留在 DOM 中：SEO / 无障碍 / 无 JS 兜底 -->
    <h1
      ref="titleRef"
      class="text-center text-[clamp(38px,6.2vw,64px)] font-bold leading-[1.12] tracking-tight transition-opacity duration-500"
      :class="ready ? 'opacity-0' : 'opacity-100'"
    >
      {{ lineA }}<br /><span class="bg-gradient-to-r from-white via-white/60 to-accent bg-clip-text text-transparent">{{ lineB }}</span>
    </h1>

    <!-- WebGL 液体扭曲叠加层：透明画布，覆盖标题区域 -->
    <canvas
      ref="canvasRef"
      class="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500"
      :class="ready ? 'opacity-100' : 'opacity-0'"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ lineA: string; lineB: string }>()

const wrapRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ready = ref(false)

// 与 main.css --font-sans 保持一致，供画布重绘文字用
const FONT_FAMILY =
  '"Geist", "Noto Sans SC", ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif'

// GL 状态
let gl: WebGLRenderingContext | null = null
let prog: WebGLProgram | null = null
let tex: WebGLTexture | null = null
let aPos = -1
let uni = {
  tex: null as WebGLUniformLocation | null,
  aspect: null as WebGLUniformLocation | null,
  mouse: null as WebGLUniformLocation | null,
  time: null as WebGLUniformLocation | null,
  hover: null as WebGLUniformLocation | null,
}
let off: HTMLCanvasElement | null = null
let offCtx: CanvasRenderingContext2D | null = null
let raf = 0
let observer: ResizeObserver | null = null
let active = false // GL 初始化成功
let fontsReady = false
let hoverTarget = 0
let hover = 0
let mouse = { x: -10, y: -10 } // uv 坐标，初始远离标题
let drawOk = false // 至少成功绘制过一帧

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2 uAspect; // (w/h, 1) 修正纵横比，让波纹各向同性
uniform vec2 uMouse;  // 指针在标题内的 uv
uniform float uTime;
uniform float uHover; // 指针靠近程度，0..1 平滑过渡

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = r * p * 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 st = uv * uAspect;
  float t = uTime * 0.6;

  // 双层域扭曲：产生持续的液态流动
  float n1 = fbm(st * 2.4 + vec2(t * 0.5, -t * 0.35));
  float n2 = fbm(st * 2.4 + vec2(-t * 0.4, t * 0.3) + n1 * 1.4);
  vec2 warp = (vec2(n1, n2) - 0.5) * 2.0;

  float amp = 0.011 * (0.35 + 0.7 * uHover);

  // 交互：指针周围径向涌起，叠加细微波澜
  vec2 d = uv - uMouse;
  float md = length(d);
  float infl = exp(-md * 9.0) * uHover;
  vec2 push = (d / max(md, 1e-4)) * (infl * (0.05 + 0.025 * sin(md * 26.0 - uTime * 6.0)));

  vec2 displaced = clamp(uv + warp * amp + push, 0.001, 0.999);
  gl_FragColor = texture2D(uTex, displaced);
}`

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function compileShader(type: number, src: string): WebGLShader | null {
  if (!gl) return null
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('[LiquidTitle] shader 编译失败:', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

function initGl(): boolean {
  const canvas = canvasRef.value
  if (!canvas) return false
  gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true })
  if (!gl) {
    console.warn('[LiquidTitle] 当前环境不支持 WebGL，回退为静态标题')
    return false
  }

  const vs = compileShader(gl.VERTEX_SHADER, VERT)
  const fs = compileShader(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return false
  prog = gl.createProgram()
  if (!prog) return false
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[LiquidTitle] program 链接失败:', gl.getProgramInfoLog(prog))
    return false
  }
  gl.useProgram(prog)
  aPos = gl.getAttribLocation(prog, 'aPos')
  uni.tex = gl.getUniformLocation(prog, 'uTex')
  uni.aspect = gl.getUniformLocation(prog, 'uAspect')
  uni.mouse = gl.getUniformLocation(prog, 'uMouse')
  uni.time = gl.getUniformLocation(prog, 'uTime')
  uni.hover = gl.getUniformLocation(prog, 'uHover')

  // 全屏三角形
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  // 文字纹理
  tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  // 离屏 2D 画布，承载文字快照
  off = document.createElement('canvas')
  offCtx = off.getContext('2d')

  canvas.addEventListener('webglcontextlost', onContextLost)
  return true
}

function onContextLost(e: Event): void {
  e.preventDefault()
  active = false
  ready.value = false // 回到静态标题
  cancelAnimationFrame(raf)
}

interface Frag {
  text: string
  x: number
  y: number
  lineBoxH: number
  font: string
  isGrad: boolean
  color: string
}

// 测量 DOM 真实行片段 → 精确复刻到纹理，兼容换行与两种语言
function renderTexture(): boolean {
  const wrap = wrapRef.value
  const title = titleRef.value
  const canvas = canvasRef.value
  if (!wrap || !title || !canvas || !gl || !offCtx || !off) return false

  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (!w || !h) return false
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const pw = Math.round(w * dpr)
  const ph = Math.round(h * dpr)

  if (canvas.width !== pw) canvas.width = pw
  if (canvas.height !== ph) canvas.height = ph
  gl.viewport(0, 0, pw, ph)
  gl.uniform2f(uni.aspect, w / h, 1)

  const box = title.getBoundingClientRect()
  const fragments: Frag[] = []
  let gradLeft = Infinity
  let gradRight = -Infinity

  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? ''
    if (!text.trim()) continue
    const parent = node.parentElement
    if (!parent) continue
    const style = getComputedStyle(parent)
    const range = document.createRange()
    range.selectNodeContents(node)
    const rects = range.getClientRects()
    const isGrad = parent.classList.contains('bg-gradient-to-r')
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i]
      if (!r.width || !r.height) continue
      const frag: Frag = {
        text,
        x: r.left - box.left,
        y: r.top - box.top,
        lineBoxH: r.height,
        font: `${style.fontWeight} ${style.fontSize} ${FONT_FAMILY}`,
        isGrad,
        color: style.color,
      }
      fragments.push(frag)
      if (isGrad) {
        gradLeft = Math.min(gradLeft, frag.x)
        gradRight = Math.max(gradRight, frag.x + r.width)
      }
    }
  }

  const ctx = offCtx
  if (off.width !== pw) off.width = pw
  if (off.height !== ph) off.height = ph
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  try {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '-0.025em'
  } catch {
    /* 旧浏览器忽略 */
  }

  const gradFill = gradLeft < gradRight ? ctx.createLinearGradient(gradLeft, 0, gradRight, 0) : null
  if (gradFill) {
    gradFill.addColorStop(0, '#ffffff')
    gradFill.addColorStop(0.5, 'rgba(255,255,255,0.6)')
    gradFill.addColorStop(1, '#a3e635')
  }

  for (const f of fragments) {
    ctx.font = f.font
    const m = ctx.measureText(f.text)
    const ascent = m.actualBoundingBoxAscent || 0
    const descent = m.actualBoundingBoxDescent || 0
    const contentH = ascent + descent
    // 把字形内容区垂直居中于测量到的行盒
    const baseline = f.y + (f.lineBoxH - contentH) / 2 + ascent
    ctx.fillStyle = f.isGrad && gradFill ? gradFill : f.color
    ctx.fillText(f.text, f.x, baseline)
  }

  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off)

  return fragments.length > 0
}

function loop(ts: number): void {
  if (!gl || !prog || !active) return
  hover += (hoverTarget - hover) * 0.08
  if (Math.abs(hover - hoverTarget) < 0.002) hover = hoverTarget

  gl.useProgram(prog)
  gl.uniform1f(uni.time, ts / 1000)
  gl.uniform1f(uni.hover, hover)
  gl.uniform2f(uni.mouse, mouse.x, mouse.y)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.uniform1i(uni.tex, 0)
  gl.drawArrays(gl.TRIANGLES, 0, 3)

  drawOk = true
  if (fontsReady) ready.value = true
  raf = requestAnimationFrame(loop)
}

// 后台标签页首次加载时 rAF 可能被丢弃；切回前台后重启循环并重绘纹理
function onVisibilityChange(): void {
  if (document.hidden) {
    cancelAnimationFrame(raf)
    return
  }
  if (!active) return
  renderTexture()
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(loop)
}

function onPointerMove(e: PointerEvent): void {
  const wrap = wrapRef.value
  if (!wrap) return
  const rect = wrap.getBoundingClientRect()
  mouse.x = (e.clientX - rect.left) / rect.width
  mouse.y = (e.clientY - rect.top) / rect.height
  const margin = 90 // 标题外扩的感应区，便于发现
  const over =
    e.clientX >= rect.left - margin &&
    e.clientX <= rect.right + margin &&
    e.clientY >= rect.top - margin &&
    e.clientY <= rect.bottom + margin
  hoverTarget = over ? 1 : 0
}

function onPointerLeave(): void {
  hoverTarget = 0
}

function cleanup(): void {
  cancelAnimationFrame(raf)
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerleave', onPointerLeave)
  if (gl && tex) gl.deleteTexture(tex)
  if (gl && prog) gl.deleteProgram(prog)
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  gl = null
}

onMounted(async () => {
  await nextTick()
  if (reducedMotion()) return // 尊重系统减弱动效设置
  active = initGl()
  if (!active) return
  renderTexture()
  raf = requestAnimationFrame(loop)

  // 字体加载完成后重绘，保证字形与行盒一致
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      fontsReady = true
      renderTexture()
      if (drawOk) ready.value = true
    })
  } else {
    fontsReady = true
  }

  observer = new ResizeObserver(() => renderTexture())
  observer.observe(wrapRef.value!)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerleave', onPointerLeave)
})

onBeforeUnmount(cleanup)

// 语言切换后文字变化，重绘纹理
watch(
  () => [props.lineA, props.lineB],
  () => nextTick(() => renderTexture()),
)
</script>
