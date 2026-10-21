<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Hype beat 02 vignette. Two seeded P&L lines race; the leader is violet and the trailer muted, with a
    0:30 -> 0:00 duel clock top-right (5 s visual cycle). Decorative and aria-hidden; fills its parent.
-->

<script setup lang="ts">
import { ref } from 'vue'
import type { DuelSeries } from './vignetteSim'
import { useVignetteLoop } from './useVignetteLoop'
import { VIGNETTE_COLORS as C, DUEL_POINTS, VIGNETTE_DEFAULT_SEED, duelCycle, duelFrame, duelSeries, formatClock } from './vignetteSim'

const props = withDefaults(defineProps<{ seed?: number }>(), { seed: VIGNETTE_DEFAULT_SEED })
const canvas = ref<HTMLCanvasElement | null>(null)

let cached: { key: number, series: DuelSeries } | null = null

useVignetteLoop(canvas, (c, w, h, t) => {
  const key = props.seed + duelCycle(t)
  if (!cached || cached.key !== key)
    cached = { key, series: duelSeries(key) }
  const s = cached.series
  const f = duelFrame(s, t)
  const span = s.max - s.min || 1
  const Y = (v: number) => h * 0.82 - (v - s.min) / span * h * 0.6
  const X = (i: number) => w * 0.06 + w * 0.88 * i / (DUEL_POINTS - 1)
  c.clearRect(0, 0, w, h)
  for (const id of ['a', 'b'] as const) {
    const line = s[id]
    const lead = f.leader === id
    c.strokeStyle = lead ? C.violet : C.trailingLine
    c.lineWidth = lead ? 1.8 : 1.2
    c.beginPath()
    for (let i = 0; i <= f.index; i++) {
      if (i)
        c.lineTo(X(i), Y(line[i]))
      else
        c.moveTo(X(i), Y(line[i]))
    }
    c.stroke()
  }
  c.fillStyle = C.hud
  c.font = '400 11px "JetBrains Mono", monospace'
  c.textAlign = 'right'
  c.fillText(formatClock(f.countdown), w - 12, 20)
  c.textAlign = 'left'
})
</script>

<template>
  <canvas ref="canvas" class="vignette" aria-hidden="true" />
</template>

<style scoped>
.vignette {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
