<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: Fintasy marketing hero (HERO-3, direction A "Closing Bell"; outbound-only CTAs per HERO-5/D4): top bar, statement band,
  caption strip (aria-live off) and a framed visual slot with a static ring fallback. All tokens are scoped
  to .hero as --hero-* variables; Archivo / JetBrains Mono apply only inside .hero.
-->

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HeroNav from './HeroNav.vue'
import { CASE_STUDY_URL, SOURCE_URL } from './heroLinks'

export type HeroStorm = 'holding' | 'closing' | 'winner'
export interface HeroVisualUpdate {
  round: number
  storm: HeroStorm
  alive: number
}

const props = withDefaults(defineProps<{
  round?: number
  storm?: HeroStorm
  alive?: number
  caseStudyUrl?: string
}>(), {
  round: 1,
  storm: 'holding',
  alive: 60,
  caseStudyUrl: CASE_STUDY_URL,
})

const TOTAL_ROUNDS = 5
const TOTAL_PLAYERS = 60

const round = ref(props.round)
const storm = ref<HeroStorm>(props.storm)
const alive = ref(props.alive)

watch(() => props.round, (v) => {
  round.value = v
})
watch(() => props.storm, (v) => {
  storm.value = v
})
watch(() => props.alive, (v) => {
  alive.value = v
})

/** Strip handler for <HeroVisual @update="onVisualUpdate"> (HERO-4 wiring). */
function onVisualUpdate(e: Partial<HeroVisualUpdate>) {
  if (typeof e.round === 'number')
    round.value = e.round
  if (e.storm)
    storm.value = e.storm
  if (typeof e.alive === 'number')
    alive.value = e.alive
}

defineExpose({ onVisualUpdate })

const stormLabel = computed(() => {
  if (storm.value === 'winner')
    return 'Winner standing'
  return `Storm ${storm.value}`
})
const aliveLabel = computed(() => String(alive.value).padStart(2, '0'))
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <HeroNav />

    <div class="hero-statement">
      <h1 id="hero-title">
        Sixty traders.<br>One market.<br>Last one solvent.
      </h1>
      <div class="hero-side">
        <p>
          Fintasy is a battle-royale trading game. Drop into a market sector, win 30-second trading duels,
          and outrun the liquidity storm as the map closes in.
        </p>
        <div class="hero-ctas">
          <a :href="SOURCE_URL" target="_blank" rel="noopener noreferrer" class="hero-btn" data-test="cta-primary">
            View the source <span aria-hidden="true">→</span>
          </a>
          <a v-if="props.caseStudyUrl" :href="props.caseStudyUrl" class="hero-link" data-test="cta-secondary">
            Read the case study
          </a>
        </div>
      </div>
    </div>

    <figure class="hero-frame">
      <figcaption class="hero-strip" aria-live="off" data-test="hero-strip">
        <span class="dim hero-strip-fig">Fig. 01 — Live match, seeded</span>
        <span><span data-test="strip-round">Round {{ round }} / {{ TOTAL_ROUNDS }}</span> · <span class="dim" data-test="strip-storm">{{ stormLabel }}</span></span>
        <span class="hero-strip-alive"><span class="alive" data-test="strip-alive">{{ aliveLabel }}</span> <span class="dim">/ {{ TOTAL_PLAYERS }} solvent</span></span>
      </figcaption>

      <div class="hero-visual">
        <slot name="visual" :on-update="onVisualUpdate">
          <div class="hero-fallback" aria-hidden="true" data-test="hero-fallback">
            <div class="ring-outer ring">
              <div class="ring-mid ring">
                <div class="ring-inner ring" />
              </div>
            </div>
          </div>
        </slot>
      </div>

      <div class="hero-cap" data-test="hero-cap">
        Duels <span class="dim">30 s</span> · Ticks <span class="dim">10 Hz</span> · Starting pot <span class="dim">$15,000</span>
      </div>
    </figure>
  </section>
</template>

<style scoped>
.hero {
  /* tokens.json (HERO-1, direction A) — scoped to the hero only */
  --hero-ink: #0d0d0c;
  --hero-bone: #ece9e2;
  --hero-body: #b9b5ac;
  --hero-mute: #8e8b84;
  --hero-violet: #8b7cff;
  --hero-line: rgba(236, 233, 226, 0.12);
  --hero-tile-outer: #121211;
  --hero-tile-mid: #161615;
  --hero-tile-inner: #1b1b19;
  --hero-tile-stroke: rgba(236, 233, 226, 0.09);
  --hero-storm-fill: rgba(139, 124, 255, 0.22);
  --hero-font-display: 'Archivo', ui-sans-serif, system-ui, sans-serif;
  --hero-font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --hero-gutter: clamp(16px, 5.4vw, 108px);
  --hero-col-gap: 24px;
  --hero-top-pad-y: 28px;
  --hero-cta-gap: 22px;
  --hero-strip-h: 41px;

  display: flex;
  flex-direction: column;
  min-height: 100svh;
  width: 100%;
  overflow-x: clip;
  background: var(--hero-ink);
  color: var(--hero-bone);
  font-family: var(--hero-font-display);
  -webkit-font-smoothing: antialiased;
}
.hero *,
.hero *::before,
.hero *::after {
  box-sizing: border-box;
}

.hero-statement {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--hero-col-gap);
  align-items: end;
  padding: clamp(40px, 9vh, 120px) var(--hero-gutter) clamp(36px, 7vh, 88px);
}
.hero-statement h1 {
  grid-column: 1 / span 7;
  margin: 0;
  font-family: var(--hero-font-display);
  font-weight: 450;
  font-variation-settings: 'wdth' 100;
  font-size: clamp(40px, 5.6vw, 96px);
  line-height: 0.98;
  letter-spacing: -0.035em;
}
.hero-side {
  grid-column: 9 / span 4;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.hero-side p {
  margin: 0;
  font: 400 14px/1.6 var(--hero-font-mono);
  color: var(--hero-body);
  max-width: 40ch;
}
.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--hero-cta-gap);
  align-items: center;
  font: 500 14px/1 var(--hero-font-mono);
}
.hero-btn {
  background: var(--hero-bone);
  color: var(--hero-ink);
  padding: 14px 18px;
  display: inline-flex;
  gap: 10px;
  text-decoration: none;
  transition: background 0.2s;
}
.hero-btn:hover,
.hero-btn:focus-visible {
  background: var(--hero-violet);
}
.hero-link {
  color: var(--hero-bone);
  text-decoration: none;
  border-bottom: 1px solid var(--hero-line);
  padding-bottom: 4px;
}
.hero-link:hover,
.hero-link:focus-visible {
  border-color: var(--hero-bone);
}
.hero a:focus-visible {
  outline: 1px solid var(--hero-violet);
  outline-offset: 4px;
}

.hero-frame {
  position: relative;
  flex: 1;
  min-height: 46vh;
  margin: 0;
  border-top: 1px solid var(--hero-line);
}
.hero-strip {
  position: absolute;
  inset: 0 0 auto;
  height: var(--hero-strip-h);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 0 var(--hero-gutter);
  border-bottom: 1px solid var(--hero-line);
  font: 400 12px/1 var(--hero-font-mono);
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.hero-strip > :last-child {
  justify-self: end;
}
.hero-strip .alive {
  color: var(--hero-violet);
}
.dim {
  color: var(--hero-mute);
}
.hero-visual {
  position: absolute;
  inset: var(--hero-strip-h) 0 0;
}
.hero-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6% var(--hero-gutter);
}
.ring {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--hero-tile-stroke);
}
.ring-outer {
  width: 100%;
  height: 100%;
  background: var(--hero-tile-outer);
}
.ring-mid {
  width: 66%;
  height: 66%;
  background: var(--hero-tile-mid);
}
.ring-inner {
  width: 50%;
  height: 50%;
  background: var(--hero-tile-inner);
}
.hero-cap {
  position: absolute;
  right: var(--hero-gutter);
  bottom: 28px;
  font: 400 12px/1.5 var(--hero-font-mono);
  color: var(--hero-bone);
  letter-spacing: 0.02em;
  text-align: right;
  pointer-events: none;
  text-shadow: 0 0 12px rgba(13, 13, 12, 0.9);
}

@media (max-width: 759.98px) {
  .hero-statement {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 28px;
  }
  .hero-statement h1,
  .hero-side {
    grid-column: 1 / -1;
  }
  .hero-frame {
    min-height: 52vh;
  }
  .hero-strip {
    grid-template-columns: auto 1fr;
  }
  .hero-strip-fig {
    display: none;
  }
  .hero-cap {
    left: var(--hero-gutter);
  }
}
</style>
