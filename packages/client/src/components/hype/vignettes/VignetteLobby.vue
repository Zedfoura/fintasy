<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Hype beat 04 vignette. A 60-dot lobby grid; traders are eliminated in seeded order until one violet
    survivor remains (9 s loop). Decorative and aria-hidden; fills its parent.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useVignetteLoop } from './useVignetteLoop'
import { VIGNETTE_COLORS as C, LOBBY_COLS, LOBBY_PLAYERS, LOBBY_ROWS, VIGNETTE_DEFAULT_SEED, lobbyFrame, lobbyOrder } from './vignetteSim'

const props = withDefaults(defineProps<{ seed?: number }>(), { seed: VIGNETTE_DEFAULT_SEED })
const canvas = ref<HTMLCanvasElement | null>(null)

let cached: { seed: number, order: number[] } | null = null

useVignetteLoop(canvas, (c, w, h, t) => {
  if (!cached || cached.seed !== props.seed)
    cached = { seed: props.seed, order: lobbyOrder(props.seed) }
  const f = lobbyFrame(props.seed, t, cached.order)
  const dead = new Set(f.dead)
  const gx = w / (LOBBY_COLS + 1)
  const gy = h / (LOBBY_ROWS + 1.6)
  c.clearRect(0, 0, w, h)
  c.lineWidth = 1
  for (let i = 0; i < LOBBY_PLAYERS; i++) {
    const x = gx * (i % LOBBY_COLS + 1)
    const y = gy * (Math.floor(i / LOBBY_COLS) + 1)
    if (dead.has(i)) {
      c.strokeStyle = C.line
      c.beginPath()
      c.moveTo(x - 3, y - 3)
      c.lineTo(x + 3, y + 3)
      c.moveTo(x + 3, y - 3)
      c.lineTo(x - 3, y + 3)
      c.stroke()
    }
    else {
      const last = f.survivor === i
      c.fillStyle = last ? C.violet : C.bone
      c.beginPath()
      c.arc(x, y, last ? 5 : 2.6, 0, 7)
      c.fill()
    }
  }
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
