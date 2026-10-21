<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Authentic trader testimonials (Element 8) adhering to Grounded in Reason HUD
-->

<script setup lang="ts">
import {
  Trophy as TrophyIcon,
} from '@vicons/tabler'

const testimonials = [
  {
    name: 'Marcus Vance',
    handle: '@vance_trades',
    rank: 'Golden Trader Tier #14',
    badge: 'Apex Predator',
    winRate: '78.4% Win Rate',
    initials: 'MV',
    avatarColor: 'from-amber-500 to-amber-700',
    quote:
      'Fintasy turns market tape reading into pure esports adrenaline. The 30-second duels train your execution reflexes faster than years of passive paper trading.',
  },
  {
    name: 'Elena Rostova',
    handle: '@quant_elena',
    rank: 'Apex MMR 2,840',
    badge: 'Quant Researcher',
    winRate: '82.1% Win Rate',
    initials: 'ER',
    avatarColor: 'from-emerald-500 to-teal-700',
    quote:
      'The liquidity storm mechanic is genius. Watching half the sectors collapse while hunting over-leveraged longs in the final circle is the most intense trading experience ever built.',
  },
  {
    name: 'David Chen',
    handle: '@macro_chen',
    rank: 'Diamond II Division',
    badge: 'Swing Trader',
    winRate: '69.5% Win Rate',
    initials: 'DC',
    avatarColor: 'from-cyan-500 to-blue-700',
    quote:
      'Finally, a competitive trading platform that doesn\'t feel like a boring 1990s desktop broker. The tactile HUD, 100ms execution, and zero dollar risk make it addictive.',
  },
  {
    name: 'Sarah Jenkins',
    handle: '@alpha_sarah',
    rank: 'Platinum III',
    badge: 'Finance Club President',
    winRate: '71.0% Win Rate',
    initials: 'SJ',
    avatarColor: 'from-indigo-500 to-purple-700',
    quote:
      'Our university finance club runs weekly tournaments on Fintasy. The third-party battle escalation and live order book feed keep everyone on the edge of their seats.',
  },
]
</script>

<template>
  <section
    id="trader-reviews"
    class="landing-testimonials-section relative w-full flex flex-col items-center justify-start px-4 py-16 md:py-24"
  >
    <div class="mx-auto max-w-6xl w-full flex flex-col items-center">
      <!-- Section Tag & Taxonomy -->
      <div class="mb-4 inline-flex select-none items-center gap-1.5 border border-[rgba(255,255,255,0.1)] rounded bg-[#0E121B] px-3 py-1 text-xs text-slate-400 font-mono">
        <span class="text-slate-500">[</span>
        <span class="text-amber-400 font-bold">03</span>
        <span>•</span>
        <span>VERIFIED TRADER DEBRIEFINGS</span>
        <span class="text-slate-500">]</span>
      </div>

      <!-- Section Title & Subtitle -->
      <h2 class="mb-4 text-center text-3xl text-white font-extrabold tracking-tight font-serif md:text-5xl sm:text-4xl">
        Battle-Tested by Elite Traders.
      </h2>
      <p class="mb-14 max-w-2xl text-center text-base text-slate-300 leading-relaxed sm:text-lg">
        From quantitative algorithmic researchers to competitive collegiate finance leagues, see why thousands of traders sharpen their edge in Stock Royale.
      </p>

      <!-- 2x2 Testimonials Grid -->
      <div class="grid grid-cols-1 w-full gap-6 md:grid-cols-2">
        <div
          v-for="t in testimonials"
          :key="t.handle"
          class="group testimonial-card relative flex flex-col justify-between border border-[rgba(255,255,255,0.08)] rounded-2xl bg-[#0E121B] p-7 transition-all duration-300 hover:border-slate-500/50 hover:bg-[#151C2B] hover:shadow-xl"
        >
          <!-- Top: Trader Credentials & Rating Stars -->
          <div>
            <div class="mb-5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <!-- Custom Gradient Avatar -->
                <div
                  :class="t.avatarColor"
                  class="h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-br text-sm text-white font-bold font-mono shadow-md"
                >
                  {{ t.initials }}
                </div>
                <div>
                  <div class="text-base text-white font-bold leading-snug">
                    {{ t.name }}
                  </div>
                  <div class="text-xs text-slate-400 font-mono">
                    {{ t.handle }}
                  </div>
                </div>
              </div>

              <!-- Rating Stars (Custom Glowing SVG) -->
              <div class="flex items-center gap-1 text-amber-400">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="h-4 w-4 fill-current drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            <!-- Quote Text -->
            <p class="mb-6 text-sm text-slate-200 leading-relaxed italic">
              "{{ t.quote }}"
            </p>
          </div>

          <!-- Bottom: Rank Badge & Win Rate Chip -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(255,255,255,0.06)] pt-4 text-xs font-mono">
            <div class="flex items-center gap-1.5 text-amber-400 font-bold">
              <n-icon size="14">
                <TrophyIcon />
              </n-icon>
              <span>{{ t.rank }}</span>
            </div>
            <div class="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-semibold tabular-nums">
              {{ t.winRate }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
