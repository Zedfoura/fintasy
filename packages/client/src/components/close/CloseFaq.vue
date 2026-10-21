<!--
  @author: Tinatsei Chingaya (Zedfoura), Claude
  @description: FAQ section (CLOSE-2, locked direction C1 "Closing bell"): header in the hype grid, then six questions
  as a disclosure list. Each question is an h3 wrapping a native button with aria-expanded / aria-controls; its answer
  is a labelled region. Items toggle independently; item 01 starts open. No links (D4). Tokens are scoped to
  .close-faq as --close-* variables.
-->

<script setup lang="ts">
import { reactive } from 'vue'
import { CLOSE_FAQ, FAQ_ANCHOR, FAQ_INITIALLY_OPEN, FAQ_INTRO, FAQ_KICKER, FAQ_TITLE_LINES } from './closeCopy'

const open = reactive(new Set<string>(FAQ_INITIALLY_OPEN))

function toggle(id: string) {
  if (open.has(id))
    open.delete(id)
  else
    open.add(id)
}
</script>

<template>
  <section :id="FAQ_ANCHOR" class="close-faq" aria-labelledby="faq-title">
    <header class="close-head">
      <p class="close-kicker">
        <span class="close-bracket" aria-hidden="true">[</span> {{ FAQ_KICKER }} <span class="close-bracket" aria-hidden="true">]</span>
      </p>
      <h2 id="faq-title">
        {{ FAQ_TITLE_LINES[0] }}<br>{{ FAQ_TITLE_LINES[1] }}
      </h2>
      <p class="close-intro">
        {{ FAQ_INTRO }}
      </p>
    </header>

    <div class="close-list">
      <div v-for="item in CLOSE_FAQ" :key="item.id" class="close-item" :data-faq="item.id">
        <h3>
          <button
            :id="`faq-q-${item.id}`"
            type="button"
            class="close-q"
            :aria-expanded="open.has(item.id) ? 'true' : 'false'"
            :aria-controls="`faq-a-${item.id}`"
            @click="toggle(item.id)"
          >
            <span class="close-ordinal" aria-hidden="true">{{ item.ordinal }}</span>
            <span class="close-q-text">{{ item.question }}</span>
            <span class="close-icon" aria-hidden="true" />
          </button>
        </h3>
        <div
          :id="`faq-a-${item.id}`"
          class="close-a"
          role="region"
          :aria-labelledby="`faq-q-${item.id}`"
          :hidden="!open.has(item.id)"
        >
          <p>{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.close-faq {
  --close-ink: #0d0d0c;
  --close-bone: #ece9e2;
  --close-body: #b9b5ac;
  --close-mute: #8e8b84;
  --close-violet: #8b7cff;
  --close-line: rgba(236, 233, 226, 0.12);
  --close-font-display: 'Archivo', ui-sans-serif, system-ui, sans-serif;
  --close-font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --close-gutter: clamp(16px, 5.4vw, 108px);
  --close-col-gap: 24px;

  box-sizing: border-box;
  width: 100%;
  padding: clamp(72px, 12vh, 160px) var(--close-gutter);
  border-top: 1px solid var(--close-line);
  background: var(--close-ink);
  color: var(--close-bone);
  font-family: var(--close-font-display);
  -webkit-font-smoothing: antialiased;
}
.close-faq *,
.close-faq *::before,
.close-faq *::after {
  box-sizing: border-box;
}
.close-faq h2,
.close-faq h3,
.close-faq p {
  margin: 0;
}
.close-faq p {
  font: 400 14px/1.65 var(--close-font-mono);
  color: var(--close-body);
}

/* Header */
.close-head {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--close-col-gap);
  align-items: end;
  margin-bottom: clamp(40px, 7vh, 88px);
}
.close-faq .close-kicker {
  grid-column: 1 / -1;
  margin-bottom: 28px;
  font: 400 12px/1 var(--close-font-mono);
  letter-spacing: 0.04em;
  color: var(--close-mute);
}
.close-bracket {
  color: var(--close-violet);
}
.close-faq h2 {
  grid-column: 1 / span 8;
  font-weight: 450;
  font-size: clamp(36px, 4.6vw, 80px);
  line-height: 0.98;
  letter-spacing: -0.035em;
  color: var(--close-bone);
}
.close-faq .close-intro {
  grid-column: 9 / span 4;
}

/* Disclosure list */
.close-list {
  border-top: 1px solid var(--close-line);
}
.close-item {
  border-bottom: 1px solid var(--close-line);
}
.close-item h3 {
  font: inherit;
}
.close-q {
  all: unset;
  box-sizing: border-box;
  width: 100%;
  cursor: pointer;
  display: grid;
  grid-template-columns: 64px 1fr 24px;
  gap: 16px;
  align-items: center;
  padding: 26px 0;
  font-family: var(--close-font-display);
  font-weight: 450;
  font-size: clamp(20px, 2vw, 30px);
  letter-spacing: -0.02em;
  color: var(--close-bone);
}
.close-q:focus-visible {
  outline: 2px solid var(--close-violet);
  outline-offset: 4px;
}
.close-ordinal {
  font: 400 13px/1 var(--close-font-mono);
  color: var(--close-violet);
}
.close-icon {
  position: relative;
  justify-self: end;
  width: 14px;
  height: 14px;
}
.close-icon::before,
.close-icon::after {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 14px;
  height: 2px;
  background: var(--close-mute);
  transition: transform 0.2s;
}
.close-icon::after {
  transform: rotate(90deg);
}
.close-q[aria-expanded='true'] .close-icon::after {
  transform: rotate(0deg);
}
.close-a {
  max-width: 880px;
  padding: 0 40px 28px 80px;
}

@media (prefers-reduced-motion: reduce) {
  .close-icon::before,
  .close-icon::after {
    transition: none;
  }
}

@media (max-width: 759.98px) {
  .close-faq .close-kicker,
  .close-faq h2,
  .close-faq .close-intro {
    grid-column: 1 / -1;
  }
  .close-faq .close-intro {
    margin-top: 18px;
  }
  .close-q {
    grid-template-columns: 36px 1fr 20px;
    gap: 10px;
    padding: 22px 0;
  }
  .close-a {
    padding: 0 0 24px 46px;
  }
}
</style>
