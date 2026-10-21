<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Fintasy hero top bar (HERO-3, links per HERO-5/D4): FINTASY wordmark + S01, the [Source] link, and the author credit. The page's only <nav>; nothing links into the app.
-->

<script setup lang="ts">
import { SOURCE_URL } from './heroLinks'
</script>

<template>
  <header class="hero-top">
    <div class="hero-mark">
      FINTASY<sup>S01</sup>
    </div>
    <nav class="hero-nav" aria-label="Primary">
      <a
        :href="SOURCE_URL"
        target="_blank"
        rel="noopener noreferrer"
        data-test="nav-source"
      >[Source]</a>
    </nav>
    <div class="hero-by">
      A project by<br>Tinatsei Chingaya
    </div>
  </header>
</template>

<style scoped>
.hero-top {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: var(--hero-top-pad-y) var(--hero-gutter);
}
.hero-mark {
  justify-self: start;
  font-family: var(--hero-font-display);
  font-variation-settings: 'wdth' 125;
  font-stretch: 125%;
  font-weight: 600;
  font-size: 22px;
  letter-spacing: 0.04em;
}
.hero-mark sup {
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.1em;
  margin-left: 4px;
  color: var(--hero-mute);
  vertical-align: top;
  position: relative;
  top: 2px;
}
.hero-nav {
  display: flex;
  gap: clamp(20px, 3.4vw, 64px);
  font: 400 13px/1 var(--hero-font-mono);
  letter-spacing: 0.02em;
}
.hero-nav a {
  color: var(--hero-bone);
  text-decoration: none;
}
.hero-nav a:hover,
.hero-nav a:focus-visible {
  color: var(--hero-violet);
}
.hero-by {
  justify-self: end;
  font: 400 12px/1.4 var(--hero-font-mono);
  color: var(--hero-mute);
  text-align: right;
}
a:focus-visible {
  outline: 1px solid var(--hero-violet);
  outline-offset: 4px;
}

@media (max-width: 759.98px) {
  .hero-top {
    grid-template-columns: 1fr auto;
  }
  .hero-nav {
    display: none;
  }
}
</style>
