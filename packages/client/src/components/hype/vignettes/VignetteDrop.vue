<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Hype beat 01 vignette. The 11-sector, three-ring map (heroSim sectorTiles) with a trader dot that drops
    onto an inner-ring sector and a violet landing ripple (4 s loop). Decorative and aria-hidden; fills its parent.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useVignetteLoop } from './useVignetteLoop'
import { VIGNETTE_COLORS as C, VIGNETTE_DEFAULT_SEED, dropFrame } from './vignetteSim'

const props = withDefaults(defineProps<{ seed?: number }>(), { seed: VIGNETTE_DEFAULT_SEED })
const canvas = ref<HTMLCanvasElement | null>(null)

useVignetteLoop(canvas, (c, w, h, t) => {
  const f = dropFrame(w, h, t, props.seed)
  c.fillStyle = C.frameBg
  c.fillRect(0, 0, w, h)
  c.lineWidth = 1
  for (const tile of f.tiles) {
    c.fillStyle = C.tiles[tile.ring]
    c.fillRect(tile.x, tile.y, tile.w, tile.h)
    c.strokeStyle = C.line
    c.strokeRect(tile.x + 0.5, tile.y + 0.5, tile.w - 1, tile.h - 1)
  }
  c.fillStyle = C.bone
  c.beginPath()
  c.arc(f.dot.x, f.dot.y, 3.5, 0, 7)
  c.fill()
  if (f.ripple && f.ripple.alpha > 0) {
    c.strokeStyle = `rgba(139,124,255,${f.ripple.alpha})`
    c.beginPath()
    c.arc(f.dot.x, f.dot.y, f.ripple.r, 0, 7)
    c.stroke()
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
