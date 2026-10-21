<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Final CTA (CLOSE-2, locked direction C1 "Closing bell"): "That's the match." over three static,
  aria-hidden storm rings, with the hero's two outbound links in the hero's own styles (D4: no live game, so the only
  links are the source and the case study). Tokens are scoped to .close-cta as --close-* variables.
-->

<script setup lang="ts">
import { CASE_STUDY_URL, SOURCE_URL } from '../hero/heroLinks'
import { CTA_ANCHOR, CTA_BODY, CTA_KICKER, CTA_TITLE } from './closeCopy'
</script>

<template>
  <section :id="CTA_ANCHOR" class="close-cta" aria-labelledby="cta-title">
    <div class="close-rings" aria-hidden="true">
      <span class="close-ring close-ring-outer" />
      <span class="close-ring close-ring-storm" />
      <span class="close-ring close-ring-inner" />
    </div>
    <div class="close-cta-body">
      <p class="close-kicker">
        <span class="close-bracket" aria-hidden="true">[</span> {{ CTA_KICKER }} <span class="close-bracket" aria-hidden="true">]</span>
      </p>
      <h2 id="cta-title">
        {{ CTA_TITLE }}
      </h2>
      <p class="close-cta-text">
        {{ CTA_BODY }}
      </p>
      <div class="close-ctas">
        <a :href="SOURCE_URL" target="_blank" rel="noopener noreferrer" class="close-btn" data-test="close-cta-primary">
          View the source <span aria-hidden="true">→</span>
        </a>
        <a :href="CASE_STUDY_URL" class="close-link" data-test="close-cta-secondary">Read the case study</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.close-cta {
  --close-ink: #0d0d0c;
  --close-bone: #ece9e2;
  --close-body: #b9b5ac;
  --close-mute: #8e8b84;
  --close-violet: #8b7cff;
  --close-line: rgba(236, 233, 226, 0.12);
  --close-font-display: 'Archivo', ui-sans-serif, system-ui, sans-serif;
  --close-font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --close-gutter: clamp(16px, 5.4vw, 108px);

  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: clamp(96px, 16vh, 200px) var(--close-gutter);
  border-top: 1px solid var(--close-line);
  background: var(--close-ink);
  color: var(--close-bone);
  font-family: var(--close-font-display);
  text-align: center;
  -webkit-font-smoothing: antialiased;
}
.close-cta *,
.close-cta *::before,
.close-cta *::after {
  box-sizing: border-box;
}
.close-cta h2,
.close-cta p {
  margin: 0;
}

/* Static rings, echoing the sector map */
.close-rings {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.close-ring {
  position: absolute;
  border: 1px solid rgba(236, 233, 226, 0.09);
}
.close-ring-outer {
  width: min(1100px, 92vw);
  height: 78%;
}
.close-ring-storm {
  width: min(760px, 70vw);
  height: 56%;
  border: 1px dashed rgba(139, 124, 255, 0.5);
  background: rgba(139, 124, 255, 0.06);
}
.close-ring-inner {
  width: min(420px, 46vw);
  height: 34%;
}

.close-cta-body {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 22px;
}
.close-kicker {
  font: 400 12px/1 var(--close-font-mono);
  letter-spacing: 0.04em;
  color: var(--close-mute);
}
.close-bracket {
  color: var(--close-violet);
}
.close-cta h2 {
  font-weight: 450;
  font-size: clamp(48px, 8vw, 132px);
  line-height: 0.98;
  letter-spacing: -0.035em;
  color: var(--close-bone);
}
.close-cta-text {
  font: 400 14px/1.65 var(--close-font-mono);
  color: var(--close-body);
}

/* Same treatment as the hero's .hero-ctas / .hero-btn / .hero-link */
.close-ctas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 22px;
  align-items: center;
  margin-top: 8px;
  font: 500 14px/1 var(--close-font-mono);
}
.close-btn {
  display: inline-flex;
  gap: 10px;
  padding: 14px 18px;
  background: var(--close-bone);
  color: var(--close-ink);
  text-decoration: none;
  transition: background 0.2s;
}
.close-btn:focus-visible {
  background: var(--close-violet);
  outline: none;
}
.close-link {
  padding-bottom: 4px;
  border-bottom: 1px solid var(--close-line);
  color: var(--close-bone);
  text-decoration: none;
}
.close-link:focus-visible {
  border-color: var(--close-bone);
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .close-btn {
    transition: none;
  }
}
</style>
