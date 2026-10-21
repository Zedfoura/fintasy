<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Thin canvas renderer for the hero match simulation (heroSim.ts). Fills 100% of its parent,
    honours reduced motion, pauses offscreen / in hidden tabs, and emits `update {round, storm, alive}` on change.
-->

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { SimState, StepResult, StormState, Trader } from './heroSim'
import { HERO_MOTION, REDUCED_MOTION_STEPS, createSim, sectorTiles, stepSim } from './heroSim'

export interface HeroVisualUpdate { round: number, storm: StormState, alive: number }

const props = withDefaults(defineProps<{ seed?: number }>(), { seed: HERO_MOTION.seed })
const emit = defineEmits<{ update: [payload: HeroVisualUpdate] }>()

// Colours mirror tokens.json -> color (direction A).
const C = {
  ink: '#0D0D0C',
  bone: '#ECE9E2',
  violet: '#8B7CFF',
  tiles: ['#121211', '#161615', '#1B1B19'],
  tileStroke: 'rgba(236,233,226,0.09)',
  stormFill: 'rgba(139,124,255,0.22)',
}
const GRAIN_ALPHA = 0.38
const DPR_CAP = 2

const root = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let sim: SimState | null = null
let ctx: CanvasRenderingContext2D | null = null
let noise: HTMLCanvasElement | null = null
let width = 0
let height = 0
let raf = 0
let last: number | null = null
let reduced = false
let onScreen = true
let lastEmit: HeroVisualUpdate | null = null
let resizeObs: ResizeObserver | null = null
let interObs: IntersectionObserver | null = null

function emitIfChanged(u: HeroVisualUpdate) {
  if (lastEmit && lastEmit.round === u.round && lastEmit.storm === u.storm && lastEmit.alive === u.alive)
    return
  lastEmit = { ...u }
  emit('update', lastEmit)
}

/** Grain texture, generated once per mount (prototype grain(.5, 7)). */
function makeGrain(): HTMLCanvasElement | null {
  const n = document.createElement('canvas')
  n.width = n.height = 160
  const x = n.getContext('2d')
  if (!x)
    return null
  const im = x.createImageData(160, 160)
  let seed = 7
  const r = () => {
    seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
  for (let i = 0; i < im.data.length; i += 4) {
    const v = r() * 255
    im.data[i] = im.data[i + 1] = im.data[i + 2] = v
    im.data[i + 3] = r() * 255 * 0.5
  }
  x.putImageData(im, 0, 0)
  return n
}

function fit(): CanvasRenderingContext2D | null {
  const cv = canvas.value
  if (!cv)
    return null
  const d = Math.min(window.devicePixelRatio || 1, DPR_CAP)
  const bw = Math.round(width * d)
  const bh = Math.round(height * d)
  if (cv.width !== bw || cv.height !== bh) {
    cv.width = bw
    cv.height = bh
  }
  if (!ctx)
    ctx = cv.getContext('2d')
  ctx?.setTransform(d, 0, 0, d, 0, 0)
  return ctx
}

function draw(st: StepResult) {
  const c = fit()
  if (!c || !sim)
    return
  const w = width
  const h = height
  c.fillStyle = C.ink
  c.fillRect(0, 0, w, h)
  const R = st.stormRect
  c.font = '400 11px "JetBrains Mono", monospace'
  c.textBaseline = 'top'
  for (const t of sectorTiles(w, h)) {
    const out = t.x + t.w <= R.x + 1 || t.x >= R.x + R.w - 1 || t.y + t.h <= R.y + 1 || t.y >= R.y + R.h - 1
    c.fillStyle = C.tiles[t.ring]
    c.fillRect(t.x, t.y, t.w, t.h)
    c.strokeStyle = C.tileStroke
    c.lineWidth = 1
    c.strokeRect(t.x + 0.5, t.y + 0.5, t.w - 1, t.h - 1)
    c.fillStyle = out ? 'rgba(236,233,226,.32)' : 'rgba(236,233,226,.62)'
    if (t.w > 70 && t.h > 24)
      c.fillText(t.n.toUpperCase(), t.x + 10, t.y + 9)
  }
  c.save()
  c.beginPath()
  c.rect(0, 0, w, h)
  c.rect(R.x, R.y, R.w, R.h)
  c.clip('evenodd')
  c.fillStyle = C.stormFill
  c.fillRect(0, 0, w, h)
  const pattern = noise ? c.createPattern(noise, 'repeat') : null
  if (pattern) {
    c.globalAlpha = GRAIN_ALPHA
    c.fillStyle = pattern
    c.fillRect(0, 0, w, h)
    c.globalAlpha = 1
  }
  c.restore()
  c.strokeStyle = C.violet
  c.lineWidth = 1.5
  c.setLineDash(st.moving ? [6, 5] : [])
  c.strokeRect(R.x, R.y, R.w, R.h)
  c.setLineDash([])
  for (const d of sim.duels) {
    c.strokeStyle = 'rgba(236,233,226,.75)'
    c.lineWidth = 1
    c.beginPath()
    c.moveTo(d.a.x, d.a.y)
    c.lineTo(d.b.x, d.b.y)
    c.stroke()
    const mx = (d.a.x + d.b.x) / 2
    const my = (d.a.y + d.b.y) / 2
    const rr = 6 + d.t * 10
    c.strokeStyle = `rgba(236,233,226,${0.6 * (1 - d.t / HERO_MOTION.duelSeconds)})`
    c.beginPath()
    c.arc(mx, my, rr, 0, 7)
    c.stroke()
  }
  let survivor: Trader | null = null
  let alive = 0
  for (const p of sim.P) {
    if (p.dead) {
      const a = Math.max(0, 0.5 - p.dead * 0.25)
      if (!a)
        continue
      c.strokeStyle = `rgba(236,233,226,${a})`
      c.lineWidth = 1
      c.beginPath()
      c.moveTo(p.x - 3, p.y - 3)
      c.lineTo(p.x + 3, p.y + 3)
      c.moveTo(p.x + 3, p.y - 3)
      c.lineTo(p.x - 3, p.y + 3)
      c.stroke()
    }
    else {
      alive++
      survivor = p
      c.fillStyle = p.hp < 1 ? `rgba(236,233,226,${0.45 + 0.55 * p.hp})` : C.bone
      c.beginPath()
      c.arc(p.x, p.y, 2.6, 0, 7)
      c.fill()
    }
  }
  if (alive === 1 && survivor) {
    c.strokeStyle = C.violet
    c.lineWidth = 1.5
    c.beginPath()
    c.arc(survivor.x, survivor.y, 11, 0, 7)
    c.stroke()
  }
}

function measure(): boolean {
  const el = root.value
  if (!el)
    return false
  const w = el.clientWidth
  const h = el.clientHeight
  const changed = Math.abs(w - width) >= 1 || Math.abs(h - height) >= 1
  width = w
  height = h
  return changed
}

/** Reseed for the current size rather than stretching the canvas. Keeps the current cycle seed. */
function ensureSim(seed: number) {
  if (!sim || sim.w !== width || sim.h !== height)
    sim = createSim({ seed, width, height })
}

function renderStill() {
  if (!width || !height)
    return
  sim = createSim({ seed: props.seed, width, height })
  let st: StepResult | null = null
  for (let i = 0; i < REDUCED_MOTION_STEPS; i++)
    st = stepSim(sim, 1 / 60)
  if (st) {
    draw(st)
    emitIfChanged(st)
  }
}

function frame(ts: number) {
  raf = 0
  if (width && height) {
    ensureSim(sim ? sim.seed : props.seed)
    const dt = last === null ? 0.016 : Math.min(0.05, (ts - last) / 1000 || 0.016)
    last = ts
    const st = stepSim(sim!, dt)
    draw(st)
    emitIfChanged(st)
  }
  schedule()
}

function schedule() {
  if (raf || reduced || !onScreen || document.visibilityState === 'hidden')
    return
  raf = window.requestAnimationFrame(frame)
}

function stop() {
  if (raf)
    window.cancelAnimationFrame(raf)
  raf = 0
  last = null
}

function onVisibility() {
  if (document.visibilityState === 'hidden')
    stop()
  else
    schedule()
}

onMounted(() => {
  reduced = typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  noise = makeGrain()
  measure()

  if (typeof ResizeObserver !== 'undefined' && root.value) {
    resizeObs = new ResizeObserver(() => {
      if (!measure())
        return
      if (reduced)
        renderStill()
      // Animated mode: the next frame sees the new size and reseeds (debounced to one rAF).
    })
    resizeObs.observe(root.value)
  }

  if (reduced) {
    renderStill()
    return
  }

  if (width && height)
    ensureSim(props.seed)
  emitIfChanged({ round: 1, storm: 'holding', alive: HERO_MOTION.players })

  if (typeof IntersectionObserver !== 'undefined' && root.value) {
    interObs = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1]
      if (!entry)
        return
      onScreen = entry.isIntersecting
      if (onScreen)
        schedule()
      else
        stop()
    })
    interObs.observe(root.value)
  }
  document.addEventListener('visibilitychange', onVisibility)
  schedule()
})

onBeforeUnmount(() => {
  stop()
  resizeObs?.disconnect()
  interObs?.disconnect()
  resizeObs = null
  interObs = null
  document.removeEventListener('visibilitychange', onVisibility)
  ctx = null
  noise = null
  sim = null
})
</script>

<template>
  <div ref="root" class="hero-visual">
    <canvas ref="canvas" class="hero-visual__canvas" aria-hidden="true" />
    <p class="hero-visual__alt">
      Animated simulation: 60 traders across 11 market sectors; a storm closes in over 5 rounds while traders duel until one remains.
    </p>
  </div>
</template>

<style scoped>
.hero-visual {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero-visual__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.hero-visual__alt {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
