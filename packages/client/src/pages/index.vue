<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Fintasy marketing landing route (HERO-3/HERO-4). Renders only the hero on a nav-free layout so the
  page has exactly one <nav> (HeroNav), with the live HeroVisual feeding the caption strip. Legacy
  components/landing/* stay on disk but are no longer mounted (D2).
-->

<script setup lang="ts">
import HeroSection from '~/components/hero/HeroSection.vue'
import HeroVisual from '~/components/hero/HeroVisual.vue'

const hero = ref<InstanceType<typeof HeroSection> | null>(null)

useHead({
  title: 'Fintasy — the stock-market battle royale',
  meta: [
    {
      name: 'description',
      content:
        'A 60-player battle-royale trading game: drop into a sector, win 30-second duels, outrun the storm. A project by Tinatsei Chingaya.',
    },
  ],
})
</script>

<template>
  <main class="hero-page">
    <HeroSection ref="hero">
      <template #visual>
        <HeroVisual @update="hero?.onVisualUpdate($event)" />
      </template>
    </HeroSection>
  </main>
</template>

<route lang="yaml">
meta:
  layout: none
</route>

<style scoped>
.hero-page {
  min-height: 100svh;
  width: 100%;
  margin: 0;
  background: #0d0d0c;
  color-scheme: dark;
  overflow-x: clip;
}
</style>
