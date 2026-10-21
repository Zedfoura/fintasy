<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Hype section (HYPE-3, locked direction 1 "Match timeline"): header, four match beats and a stats
  strip below the hero. Each beat has a named slot `vignette-<id>` in a 16:9 frame whose fallback is a static,
  aria-hidden three-ring frame. No links (D4). All tokens are scoped to .hype as --hype-* variables.
-->

<script setup lang="ts">
import { HYPE_ANCHOR, HYPE_BEATS, HYPE_INTRO, HYPE_KICKER, HYPE_STATS, HYPE_TITLE_LINES } from './hypeBeats'
</script>

<template>
  <section :id="HYPE_ANCHOR" class="hype" aria-labelledby="hype-title">
    <header class="hype-head">
      <p class="hype-kicker">
        <span class="hype-bracket" aria-hidden="true">[</span> {{ HYPE_KICKER }} <span class="hype-bracket" aria-hidden="true">]</span>
      </p>
      <h2 id="hype-title">
        {{ HYPE_TITLE_LINES[0] }}<br>{{ HYPE_TITLE_LINES[1] }}
      </h2>
      <p class="hype-intro">
        {{ HYPE_INTRO }}
      </p>
    </header>

    <article v-for="beat in HYPE_BEATS" :key="beat.id" class="hype-beat" :data-beat="beat.id">
      <div class="hype-ordinal" aria-hidden="true">
        {{ beat.ordinal }}
      </div>
      <div class="hype-text">
        <h3>{{ beat.title }}</h3>
        <p>{{ beat.body }}</p>
      </div>
      <div class="hype-frame" :data-test="`hype-frame-${beat.id}`">
        <div class="hype-vignette">
          <slot :name="`vignette-${beat.vignette}`">
            <div class="hype-fallback" aria-hidden="true" :data-test="`hype-fallback-${beat.id}`">
              <div class="hype-ring hype-ring-outer">
                <div class="hype-ring hype-ring-mid">
                  <div class="hype-ring hype-ring-inner" />
                </div>
              </div>
            </div>
          </slot>
        </div>
        <span class="hype-cap">{{ beat.caption }}</span>
      </div>
    </article>

    <ul class="hype-stats" data-test="hype-stats">
      <li v-for="stat in HYPE_STATS" :key="stat.label">
        <span class="hype-stat-value">{{ stat.value }}</span> {{ stat.label }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hype {
  --hype-ink: #0d0d0c;
  --hype-bone: #ece9e2;
  --hype-body: #b9b5ac;
  --hype-mute: #8e8b84;
  --hype-violet: #8b7cff;
  --hype-line: rgba(236, 233, 226, 0.12);
  --hype-frame-bg: #10100f;
  --hype-tile-outer: #121211;
  --hype-tile-mid: #161615;
  --hype-tile-inner: #1b1b19;
  --hype-tile-stroke: rgba(236, 233, 226, 0.09);
  --hype-font-display: 'Archivo', ui-sans-serif, system-ui, sans-serif;
  --hype-font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --hype-gutter: clamp(16px, 5.4vw, 108px);
  --hype-col-gap: 24px;

  width: 100%;
  padding: clamp(72px, 12vh, 160px) var(--hype-gutter) clamp(72px, 12vh, 140px);
  border-top: 1px solid var(--hype-line);
  background: var(--hype-ink);
  color: var(--hype-bone);
  font-family: var(--hype-font-display);
  -webkit-font-smoothing: antialiased;
}
.hype *,
.hype *::before,
.hype *::after {
  box-sizing: border-box;
}
.hype h2,
.hype h3,
.hype p {
  margin: 0;
}
.hype p {
  font: 400 14px/1.65 var(--hype-font-mono);
  color: var(--hype-body);
}

/* Header */
.hype-head {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--hype-col-gap);
  align-items: end;
  margin-bottom: clamp(48px, 8vh, 96px);
}
.hype .hype-kicker {
  grid-column: 1 / span 12;
  margin-bottom: 28px;
  font: 400 12px/1 var(--hype-font-mono);
  letter-spacing: 0.04em;
  color: var(--hype-mute);
}
.hype-bracket {
  color: var(--hype-violet);
}
.hype h2 {
  grid-column: 1 / span 8;
  font-family: var(--hype-font-display);
  font-weight: 450;
  font-size: clamp(36px, 4.6vw, 80px);
  line-height: 0.98;
  letter-spacing: -0.035em;
  color: var(--hype-bone);
}
.hype-intro {
  grid-column: 9 / span 4;
}

/* Beats */
.hype-beat {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--hype-col-gap);
  align-items: start;
  padding: clamp(28px, 5vh, 48px) 0;
  border-top: 1px solid var(--hype-line);
}
.hype-beat:last-of-type {
  border-bottom: 1px solid var(--hype-line);
}
.hype-ordinal {
  grid-column: 1 / span 2;
  font-family: var(--hype-font-display);
  font-size: clamp(44px, 5vw, 88px);
  font-weight: 500;
  font-variation-settings: 'wdth' 125;
  line-height: 0.9;
  letter-spacing: -0.03em;
  color: var(--hype-violet);
}
.hype-text {
  grid-column: 3 / span 4;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 6px;
}
.hype h3 {
  font-family: var(--hype-font-display);
  font-weight: 500;
  font-size: clamp(24px, 2.2vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--hype-bone);
}
.hype-frame {
  grid-column: 8 / span 5;
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--hype-line);
  background: var(--hype-frame-bg);
}
.hype-vignette {
  position: absolute;
  inset: 0;
}
.hype-vignette > :slotted(*) {
  display: block;
  width: 100%;
  height: 100%;
}
.hype-cap {
  position: absolute;
  left: 12px;
  bottom: 10px;
  font: 400 11px/1 var(--hype-font-mono);
  letter-spacing: 0.04em;
  color: var(--hype-mute);
  pointer-events: none;
}

/* Static fallback: three nested sector rings in the tile colours. */
.hype-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8% 12%;
}
.hype-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--hype-tile-stroke);
}
.hype-ring-outer {
  width: 100%;
  height: 100%;
  background: var(--hype-tile-outer);
}
.hype-ring-mid {
  width: 66%;
  height: 66%;
  background: var(--hype-tile-mid);
}
.hype-ring-inner {
  width: 50%;
  height: 50%;
  background: var(--hype-tile-inner);
}

/* Stats strip */
.hype-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
  margin: 36px 0 0;
  padding: 0;
  list-style: none;
  font: 400 12px/1 var(--hype-font-mono);
  color: var(--hype-mute);
}
.hype-stat-value {
  color: var(--hype-bone);
}

/* Below 760px every span stacks into one column, the kicker included (HYPE-1 implicit-grid fix). */
@media (max-width: 759.98px) {
  .hype-head,
  .hype-beat {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 18px;
  }
  .hype .hype-kicker,
  .hype h2,
  .hype-intro,
  .hype-ordinal,
  .hype-text,
  .hype-frame {
    grid-column: 1 / -1;
  }
}
</style>
