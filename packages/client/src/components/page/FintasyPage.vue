<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: The single Fintasy marketing page composition (HYPE-3), shared by the `/` route and the standalone
  build: the hero with its live HeroVisual feeding the caption strip, then the hype section (#match). A direct
  load of /#match scrolls to the section once on mount. No router, store or API imports (the standalone bundle
  depends on this).
-->

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import HeroSection from '../hero/HeroSection.vue'
import HeroVisual from '../hero/HeroVisual.vue'
import HypeSection from '../hype/HypeSection.vue'
import { HYPE_ANCHOR } from '../hype/hypeBeats'

const hero = ref<InstanceType<typeof HeroSection> | null>(null)

onMounted(() => {
  if (typeof window === 'undefined' || window.location.hash !== `#${HYPE_ANCHOR}`)
    return
  const target = document.getElementById(HYPE_ANCHOR)
  if (!target)
    return
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  target.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' })
})
</script>

<template>
  <main class="fintasy-page">
    <HeroSection ref="hero">
      <template #visual>
        <HeroVisual @update="hero?.onVisualUpdate($event)" />
      </template>
    </HeroSection>
    <HypeSection />
  </main>
</template>

<style scoped>
.fintasy-page {
  min-height: 100svh;
  width: 100%;
  margin: 0;
  background: #0d0d0c;
  color-scheme: dark;
  overflow-x: clip;
}
</style>
