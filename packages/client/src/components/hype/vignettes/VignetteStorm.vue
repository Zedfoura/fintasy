<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Hype beat 03 vignette. The ring map with the hero's violet storm (heroSim stormAt) closing over
    ROUND 1/5 -> 5/5, dashed while moving, and a few seeded traders caught outside (10 s loop). Decorative and
    aria-hidden; fills its parent.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useVignetteLoop } from './useVignetteLoop'
import { VIGNETTE_COLORS as C, VIGNETTE_DEFAULT_SEED, stormFrame } from './vignetteSim'

const props = withDefaults(defineProps<{ seed?: number }>(), { seed: VIGNETTE_DEFAULT_SEED })
const canvas = ref<HTMLCanvasElement | null>(null)

useVignetteLoop(canvas, (c, w, h, t) => {
  const f = stormFrame(w, h, t, props.seed)
  const R = f.rect
  c.fillStyle = C.frameBg
  c.fillRect(0, 0, w, h)
  c.lineWidth = 1
  for (const tile of f.tiles) {
    c.fillStyle = C.tiles[tile.ring]
    c.fillRect(tile.x, tile.y, tile.w, tile.h)
    c.strokeStyle = C.line
    c.strokeRect(tile.x + 0.5, tile.y + 0.5, tile.w - 1, tile.h - 1)
  }
  c.save()
  c.beginPath()
  c.rect(0, 0, w, h)
  c.rect(R.x, R.y, R.w, R.h)
  c.clip('evenodd')
  c.fillStyle = C.stormFill
  c.fillRect(0, 0, w, h)
  c.restore()
  c.strokeStyle = C.violet
  c.lineWidth = 1.5
  c.setLineDash(f.moving ? [6, 5] : [])
  c.strokeRect(R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1)
  c.setLineDash([])
  for (const p of f.traders) {
    c.fillStyle = p.inside ? C.bone : C.trailingLine
    c.beginPath()
    c.arc(p.x, p.y, 2.6, 0, 7)
    c.fill()
  }
  c.fillStyle = C.hud
  c.font = '400 11px "JetBrains Mono", monospace'
  c.textAlign = 'right'
  c.fillText(`ROUND ${f.round} / 5`, w - 12, 20)
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
