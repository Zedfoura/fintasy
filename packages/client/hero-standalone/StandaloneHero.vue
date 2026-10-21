<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Standalone hero page (HERO-6): the same HeroSection + HeroVisual composition as the `/` route,
  without the app shell.
-->

<script setup lang="ts">
import { ref } from 'vue'
import HeroSection from '../src/components/hero/HeroSection.vue'
import HeroVisual from '../src/components/hero/HeroVisual.vue'

const hero = ref<InstanceType<typeof HeroSection> | null>(null)
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
