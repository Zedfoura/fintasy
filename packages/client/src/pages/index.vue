<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Fintasy marketing landing route (HERO-3/HERO-4, HYPE-3). Renders the shared FintasyPage (hero + hype
  section) on a nav-free layout so the page has exactly one <nav> (HeroNav). Legacy components/landing/* stay on
  disk but are no longer mounted (D2).
-->

<script setup lang="ts">
import FintasyPage from '~/components/page/FintasyPage.vue'

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
  <FintasyPage />
</template>

<route lang="yaml">
meta:
  layout: none
</route>
