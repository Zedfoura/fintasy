<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Interactive Tactical Combat Terminal preview (Element 6) with 3D depth, live sparkline, and leverage selector
-->

<script setup lang="ts">
import {
  Clock as ClockIcon,
  Bolt as ZapIcon,
} from '@vicons/tabler'

const router = useRouter()

// Simulated ticker stream for visual ticker tape
const tickers = ref([
  { symbol: 'NVDA', price: '$128.40', change: '+4.8%', isUp: true },
  { symbol: 'TSLA', price: '$242.10', change: '-2.1%', isUp: false },
  { symbol: 'AAPL', price: '$224.25', change: '+1.4%', isUp: true },
  { symbol: 'MSFT', price: '$448.90', change: '+0.9%', isUp: true },
  { symbol: 'BTC/USD', price: '$64,250', change: '+5.7%', isUp: true },
  { symbol: 'AMD', price: '$162.80', change: '+3.2%', isUp: true },
])

// Interactive leverage multiplier state
const selectedLeverage = ref<1 | 2 | 5>(5)

// Dynamic simulated P&L calculation based on selected leverage
const basePnl = 368.10
const baseRoi = 2.45

const simulatedPnl = computed(() => {
  const val = basePnl * selectedLeverage.value
  return `+$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
})

const simulatedRoi = computed(() => {
  const val = baseRoi * selectedLeverage.value
  return `+${val.toFixed(1)}%`
})

function setLeverage(lev: 1 | 2 | 5) {
  selectedLeverage.value = lev
}

function launchArena() {
  router.push('/dashboard/royale')
}
</script>

<template>
  <section
    id="arena-preview"
    class="landing-media-section relative w-full flex flex-col items-center justify-start px-4 py-16 md:py-24"
  >
    <div class="mx-auto max-w-6xl w-full flex flex-col items-center">
      <!-- Section Tag & Taxonomy -->
      <div class="mb-4 inline-flex select-none items-center gap-1.5 border border-[rgba(255,255,255,0.1)] rounded bg-[#0E121B] px-3 py-1 text-xs text-slate-400 font-mono">
        <span class="text-slate-500">[</span>
        <span class="text-cyan-400 font-bold">01</span>
        <span>•</span>
        <span>TACTICAL COMBAT TERMINAL</span>
        <span class="text-slate-500">]</span>
      </div>

      <!-- Section Title & Subtitle -->
      <h2 class="mb-4 text-center text-3xl text-white font-extrabold tracking-tight font-serif md:text-5xl sm:text-4xl">
        High-Frequency Combat HUD.
      </h2>
      <p class="mb-12 max-w-2xl text-center text-base text-slate-300 leading-relaxed sm:text-lg">
        Step into the cockpit of the world's first financial battle royale terminal. Monitor live order flow, duel active opponents, and execute leveraged long/short positions in 100ms ticks.
      </p>

      <!-- Live Ticker Tape Container -->
      <div class="mb-8 max-w-5xl w-full overflow-hidden border border-[rgba(255,255,255,0.08)] rounded-xl bg-[#0E121B]/90 p-2.5 shadow-sm backdrop-blur-md">
        <div class="no-scrollbar flex items-center justify-center gap-6 overflow-x-auto px-2 text-xs sm:justify-between">
          <div
            v-for="ticker in tickers"
            :key="ticker.symbol"
            class="flex items-center gap-2 whitespace-nowrap"
          >
            <span class="text-white font-bold font-mono">{{ ticker.symbol }}</span>
            <span class="text-slate-300 font-mono tabular-nums">{{ ticker.price }}</span>
            <span
              :class="ticker.isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'"
              class="rounded px-1.5 py-0.5 font-semibold font-mono tabular-nums"
            >
              {{ ticker.change }}
            </span>
          </div>
        </div>
      </div>

      <!-- 3D Perspective Terminal Card Wrapper -->
      <div class="terminal-perspective-container max-w-5xl w-full">
        <div class="terminal-card relative overflow-hidden border border-[rgba(255,255,255,0.12)] rounded-2xl bg-[#0E121B] p-6 shadow-2xl backdrop-blur-2xl md:p-8">
          <!-- Terminal Title Bar -->
          <div class="mb-6 flex flex-wrap items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4 text-xs font-mono">
            <div class="flex items-center gap-2 text-slate-300">
              <span class="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              <span class="text-white font-bold tracking-wider uppercase">MATCH #9421 • FINAL CIRCLE</span>
              <span class="text-slate-500">•</span>
              <span class="text-slate-400">SECTOR: AI SEMICONDUCTORS</span>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5 rounded bg-rose-500/20 px-2 py-0.5 text-rose-400 font-bold">
                <n-icon size="14">
                  <ClockIcon />
                </n-icon>
                <span class="tabular-nums">STORM 0:18</span>
              </div>
              <div class="hidden items-center gap-1 text-slate-400 sm:inline-flex">
                <span>TRADERS:</span>
                <span class="text-white font-bold tabular-nums">4 / 60</span>
              </div>
            </div>
          </div>

          <!-- Terminal Grid: Left (Chart & Duel telemetry) vs Right (Order flow & Tactical Radar) -->
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <!-- Left 2 Cols: Live Active Duel Canvas -->
            <div class="flex flex-col justify-between border border-[rgba(255,255,255,0.06)] rounded-xl bg-[#07090E] p-5 lg:col-span-2">
              <!-- Duel Header Telemetry -->
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <div class="text-[11px] text-slate-400 tracking-widest font-mono uppercase">
                    Active Combat Duel vs ApexBot_7
                  </div>
                  <div class="text-lg text-white font-bold font-mono">
                    NVDA • 5-MINUTE SCALP
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-[11px] text-slate-400 tracking-widest font-mono uppercase">
                    Simulated P&L
                  </div>
                  <div class="text-xl text-emerald-400 font-extrabold font-mono tabular-nums">
                    {{ simulatedPnl }} ({{ simulatedRoi }})
                  </div>
                </div>
              </div>

              <!-- Animated SVG Simulated Chart Sparkline -->
              <div class="relative my-4 h-48 w-full overflow-hidden border border-[rgba(255,255,255,0.04)] rounded-lg bg-[#0E121B]/60 p-2">
                <!-- Hairline Horizontal Gridlines -->
                <div class="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 opacity-20">
                  <div class="w-full border-b border-slate-500 border-dashed" />
                  <div class="w-full border-b border-slate-500 border-dashed" />
                  <div class="w-full border-b border-slate-500 border-dashed" />
                </div>

                <!-- Live SVG Sparkline Path -->
                <svg class="h-full w-full overflow-visible" viewBox="0 0 400 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#10B981" stop-opacity="0.35" />
                      <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
                    </linearGradient>
                  </defs>
                  <!-- Gradient area fill -->
                  <path
                    d="M 0,140 L 40,130 L 80,135 L 120,110 L 160,115 L 200,85 L 240,95 L 280,60 L 320,50 L 360,35 L 400,20 L 400,160 L 0,160 Z"
                    fill="url(#chartGradient)"
                  />
                  <!-- Line stroke -->
                  <path
                    d="M 0,140 L 40,130 L 80,135 L 120,110 L 160,115 L 200,85 L 240,95 L 280,60 L 320,50 L 360,35 L 400,20"
                    fill="none"
                    stroke="#10B981"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <!-- Current price pulsing beacon dot -->
                  <circle cx="400" cy="20" r="5" fill="#10B981" />
                  <circle cx="400" cy="20" r="10" fill="#10B981" opacity="0.4" class="animate-ping" />
                </svg>

                <!-- Floating Current Price Tag -->
                <div class="absolute right-3 top-3 rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400 font-bold font-mono tabular-nums">
                  $128.40 (+4.8%)
                </div>
              </div>

              <!-- Interactive Leverage Selection Control -->
              <div class="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.06)] pt-4">
                <div class="flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <span>LEVERAGE MULTIPLIER:</span>
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      :class="selectedLeverage === 1 ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-[rgba(255,255,255,0.1)] bg-[#0E121B] text-slate-400 hover:text-white'"
                      class="leverage-chip border rounded px-2.5 py-1 text-xs font-bold font-mono transition-all"
                      @click="setLeverage(1)"
                    >
                      [ 1x ]
                    </button>
                    <button
                      type="button"
                      :class="selectedLeverage === 2 ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-[rgba(255,255,255,0.1)] bg-[#0E121B] text-slate-400 hover:text-white'"
                      class="leverage-chip border rounded px-2.5 py-1 text-xs font-bold font-mono transition-all"
                      @click="setLeverage(2)"
                    >
                      [ 2x ]
                    </button>
                    <button
                      type="button"
                      :class="selectedLeverage === 5 ? 'border-[#FF5522] bg-[#FF5522]/20 text-[#FF5522]' : 'border-[rgba(255,255,255,0.1)] bg-[#0E121B] text-slate-400 hover:text-white'"
                      class="leverage-chip border rounded px-2.5 py-1 text-xs font-bold font-mono transition-all"
                      @click="setLeverage(5)"
                    >
                      [ 5x MAX ]
                    </button>
                  </div>
                </div>

                <div class="text-xs text-slate-400 font-mono">
                  STARTING EQUITY: <span class="text-white font-bold tabular-nums">$15,000.00</span>
                </div>
              </div>
            </div>

            <!-- Right 1 Col: Sector Radar & Action Panel -->
            <div class="flex flex-col justify-between border border-[rgba(255,255,255,0.06)] rounded-xl bg-[#07090E] p-5">
              <div>
                <div class="mb-3 text-xs text-slate-400 tracking-widest font-mono uppercase">
                  Macro Sector Radar
                </div>

                <div class="text-xs font-mono space-y-2.5">
                  <div class="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-2">
                    <span class="text-slate-400">AI Semiconductors</span>
                    <span class="text-emerald-400 font-bold">[ SAFE ZONE ]</span>
                  </div>
                  <div class="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-2">
                    <span class="text-slate-400">Big Tech Megacap</span>
                    <span class="text-cyan-400 font-bold">[ CLOSING ]</span>
                  </div>
                  <div class="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-2 opacity-50">
                    <span class="text-slate-400">Utilities / Real Estate</span>
                    <span class="text-rose-400 font-bold">[ DRAINED ]</span>
                  </div>
                </div>

                <!-- Combat Alert Teaser -->
                <div class="mt-6 border border-amber-500/30 rounded-lg bg-amber-500/10 p-3 text-xs font-mono">
                  <div class="mb-1 flex items-center gap-1.5 text-amber-400 font-bold">
                    <n-icon size="14">
                      <ZapIcon />
                    </n-icon>
                    <span>THIRD-PARTY ALERT</span>
                  </div>
                  <p class="text-[11px] text-slate-300 leading-normal">
                    Trader <span class="text-white font-bold">Quantum_X</span> entered contested sector. Liquidation bounty increased to <span class="text-emerald-400 font-bold">$3,400.00</span>.
                  </p>
                </div>
              </div>

              <!-- Terminal Launch CTA -->
              <button
                type="button"
                class="mt-6 w-full border border-emerald-500/40 rounded-xl bg-emerald-500/15 py-3.5 text-xs text-emerald-300 font-bold tracking-wider font-mono uppercase transition-all hover:bg-emerald-500 hover:text-white"
                @click="launchArena"
              >
                Join Live Arena Match →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.terminal-perspective-container {
  perspective: 1200px;
}

.terminal-card {
  transform: rotateX(2deg);
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease;
}

.terminal-card:hover {
  transform: rotateX(0deg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
