<!--
  @author: adibarra (Alec Ibarra), Mariptime (Akshay), Tinatsei Chingaya (Zedfoura), Antigravity
  @description: High-converting marketing landing page for Fintasy Stock Royale
-->

<script setup lang="ts">
import {
  Flame as FlameIcon,
  Crosshair as RoyaleIcon,
  ShieldCheck as ShieldIcon,
  TrendingUp as TrendingUpIcon,
  Trophy as TrophyIcon,
  Users as UsersIcon,
  Bolt as ZapIcon,
} from '@vicons/tabler'
import {
  Dashboard as DashboardIcon,
  Login as LoginIcon,
} from '@vicons/carbon'
import LandingGameplayPillars from '~/components/landing/LandingGameplayPillars.vue'
import LandingDuelSimulator from '~/components/landing/LandingDuelSimulator.vue'
import LandingSocialProof from '~/components/landing/LandingSocialProof.vue'
import LandingFooter from '~/components/landing/LandingFooter.vue'

const { t } = useI18n()
const router = useRouter()
const commitHash = import.meta.env.VITE_COMMIT_HASH

useHead({
  title: `${t('pages.main.title')} • Fintasy`,
})

// Simulated ticker stream for visual hero animation
const tickerStream = ref([
  { symbol: 'NVDA', price: '$128.40', change: '+4.8%', isUp: true },
  { symbol: 'TSLA', price: '$242.10', change: '-2.1%', isUp: false },
  { symbol: 'AAPL', price: '$224.25', change: '+1.4%', isUp: true },
  { symbol: 'MSFT', price: '$448.90', change: '+0.9%', isUp: true },
  { symbol: 'SPY', price: '$556.30', change: '-0.3%', isUp: false },
  { symbol: 'AMZN', price: '$186.50', change: '+2.6%', isUp: true },
  { symbol: 'BTC/USD', price: '$64,250', change: '+5.7%', isUp: true },
  { symbol: 'AMD', price: '$162.80', change: '+3.2%', isUp: true },
])
</script>

<template>
  <div class="landing-page-root relative flex flex-col items-center justify-start overflow-hidden px-4 py-8 md:py-16">
    <!-- Background glowing ambient lights -->
    <div
      class="pointer-events-none absolute left-1/2 h-96 w-96 rounded-full opacity-15 blur-3xl -top-40 -translate-x-1/2 dark:opacity-20"
      style="background: radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, rgba(5, 150, 105, 0.15) 70%, transparent 100%);"
    />

    <!-- Hero Content Container -->
    <div class="relative z-10 mx-auto max-w-5xl flex flex-col items-center text-center">
      <!-- Live Status Chips Row -->
      <div class="mb-6 flex flex-wrap items-center justify-center gap-2.5">
        <div class="shadow-xs flex items-center gap-1.5 border border-emerald-300 rounded-full bg-emerald-100/90 px-3.5 py-1 text-xs text-emerald-800 font-semibold backdrop-blur-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          <span class="relative h-2 w-2 flex">
            <span class="absolute h-full w-full inline-flex animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span class="relative h-2 w-2 inline-flex rounded-full bg-emerald-600 dark:bg-emerald-500" />
          </span>
          <span>{{ t('pages.main.badge-season') }}</span>
        </div>

        <div class="shadow-xs flex items-center gap-1.5 border border-slate-200 rounded-full bg-white/80 px-3 py-1 text-xs text-slate-700 font-medium backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/40 dark:text-gray-300">
          <n-icon size="14" class="text-amber-600 dark:text-amber-400">
            <UsersIcon />
          </n-icon>
          <span>{{ t('pages.main.badge-traders') }}</span>
        </div>

        <div class="shadow-xs flex items-center gap-1.5 border border-slate-200 rounded-full bg-white/80 px-3 py-1 text-xs text-slate-700 font-medium backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/40 dark:text-gray-300">
          <n-icon size="14" class="text-cyan-600 dark:text-cyan-400">
            <ZapIcon />
          </n-icon>
          <span>{{ t('pages.main.badge-engine') }}</span>
        </div>

        <div class="shadow-xs flex items-center gap-1.5 border border-slate-200 rounded-full bg-white/80 px-3 py-1 text-xs text-slate-700 font-medium backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/40 dark:text-gray-300">
          <n-icon size="14" class="text-emerald-600 dark:text-emerald-400">
            <TrendingUpIcon />
          </n-icon>
          <span>{{ t('pages.main.badge-starting-pot') }}</span>
        </div>
      </div>

      <!-- Main Headline -->
      <h1 class="landing-hero-headline mb-4 max-w-4xl text-4xl font-extrabold tracking-tight lg:text-7xl md:text-6xl sm:text-5xl">
        <span class="from-emerald-700 via-teal-700 to-cyan-800 bg-gradient-to-r bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
          {{ t('pages.main.hero-headline') }}
        </span>
      </h1>

      <!-- Subtitle Description -->
      <p class="landing-hero-subtitle mx-auto mb-8 max-w-2xl text-base text-slate-600 leading-relaxed md:text-xl sm:text-lg dark:text-gray-300">
        {{ t('pages.main.hero-subtitle') }}
      </p>

      <!-- Dual Call to Action Buttons -->
      <div class="landing-cta-group mb-12 w-full flex flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
        <!-- Primary Action: Deploy to Royale -->
        <n-button
          type="primary"
          size="large"
          round
          class="deploy-cta-btn w-full px-8 py-6 text-base font-bold shadow-emerald-600/25 shadow-lg transition-all sm:w-auto hover:scale-105 dark:shadow-emerald-500/25"
          @click="router.push('/dashboard/royale')"
        >
          <template #icon>
            <n-icon size="20">
              <RoyaleIcon />
            </n-icon>
          </template>
          <span>{{ t('pages.main.cta-deploy') }}</span>
        </n-button>

        <!-- Secondary Action: Login / Register -->
        <n-button
          size="large"
          round
          secondary
          class="shadow-xs login-cta-btn w-full border-slate-300 bg-white/90 px-6 py-6 text-base text-slate-800 font-semibold transition-all sm:w-auto hover:scale-105 dark:border-gray-700 hover:border-emerald-500 dark:bg-transparent dark:text-white"
          @click="router.push('/login')"
        >
          <template #icon>
            <n-icon size="18">
              <LoginIcon />
            </n-icon>
          </template>
          <span>{{ t('pages.main.cta-login') }}</span>
        </n-button>

        <!-- Auxiliary Action: Standard Paper Trading -->
        <n-button
          text
          size="large"
          class="text-slate-600 font-medium transition-colors dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          @click="router.push('/dashboard')"
        >
          <template #icon>
            <n-icon size="18">
              <DashboardIcon />
            </n-icon>
          </template>
          <span>{{ t('pages.main.cta-dashboard') }}</span>
        </n-button>
      </div>

      <!-- Live Simulated Ticker Tape -->
      <div class="mb-14 max-w-4xl w-full overflow-hidden border border-slate-200 rounded-xl bg-white/90 p-2.5 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/60 dark:shadow-inner">
        <div class="no-scrollbar flex items-center justify-center gap-6 overflow-x-auto px-2 text-xs sm:justify-between">
          <div
            v-for="ticker in tickerStream"
            :key="ticker.symbol"
            class="flex items-center gap-2 whitespace-nowrap"
          >
            <span class="text-slate-900 font-bold font-mono dark:text-gray-200">{{ ticker.symbol }}</span>
            <span class="text-slate-600 font-mono dark:text-gray-400">{{ ticker.price }}</span>
            <span
              :class="ticker.isUp ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10' : 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10'"
              class="rounded px-1.5 py-0.5 font-semibold font-mono"
            >
              {{ ticker.change }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tactical Arena Preview Teaser Glass Card -->
      <div class="relative max-w-4xl w-full overflow-hidden border border-slate-200 rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-xl dark:border-gray-700/60 dark:from-gray-900/90 dark:to-gray-950/90 dark:bg-gradient-to-b md:p-8 dark:shadow-2xl">
        <div class="flex flex-col items-center justify-between gap-6 text-left md:flex-row">
          <!-- Left: Tactical Preview Info -->
          <div class="flex-1 space-y-4">
            <div class="flex items-center gap-2 text-xs text-emerald-600 font-bold tracking-wider uppercase dark:text-emerald-400">
              <n-icon size="16">
                <FlameIcon />
              </n-icon>
              <span>High-Stakes Combat Terminal</span>
            </div>
            <h2 class="text-2xl text-slate-900 font-bold sm:text-3xl dark:text-gray-100">
              12 S&P Sectors. 30-Second Duels. 1 Winner.
            </h2>
            <p class="text-sm text-slate-600 leading-relaxed dark:text-gray-400">
              Every round drops you with $15,000 in equity. Scout Big Tech, Financials, or Healthcare sectors.
              Engage contested players in high-speed micro-trading battles with 1x to 5x leverage before the Federal Reserve liquidity storm forces you inward.
            </p>
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <div class="flex items-center gap-1.5 border border-slate-200/80 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 font-medium dark:border-transparent dark:bg-gray-800/80 dark:text-gray-300">
                <n-icon size="14" class="text-amber-600 dark:text-amber-400">
                  <TrophyIcon />
                </n-icon>
                <span>Rocket League MMR Ladder</span>
              </div>
              <div class="flex items-center gap-1.5 border border-slate-200/80 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 font-medium dark:border-transparent dark:bg-gray-800/80 dark:text-gray-300">
                <n-icon size="14" class="text-emerald-600 dark:text-emerald-400">
                  <ShieldIcon />
                </n-icon>
                <span>100% Risk-Free Simulated Capital</span>
              </div>
            </div>
          </div>

          <!-- Right: Visual Duel Simulation Mock Teaser Card -->
          <div class="w-full border border-emerald-500/30 rounded-xl bg-slate-50/90 p-4 shadow-md md:w-80 dark:border-emerald-500/20 dark:bg-gray-900/90">
            <div class="mb-3 flex items-center justify-between border-b border-slate-200 pb-2 text-xs dark:border-gray-800">
              <span class="text-slate-800 font-bold dark:text-gray-300">MATCH #9421 • FINAL CIRCLE</span>
              <span class="animate-pulse rounded bg-rose-100 px-1.5 py-0.5 text-rose-700 font-bold font-mono dark:bg-rose-500/20 dark:text-rose-400">STORM 0:28</span>
            </div>
            <div class="space-y-2.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 dark:text-gray-400">Sector:</span>
                <span class="text-emerald-600 font-semibold dark:text-emerald-400">AI Semiconductors (Hot Zone)</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 dark:text-gray-400">Your Equity:</span>
                <span class="text-emerald-600 font-bold font-mono dark:text-emerald-400">$19,420.50 (+29.4%)</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 dark:text-gray-400">Traders Remaining:</span>
                <span class="text-amber-600 font-bold font-mono dark:text-amber-400">4 / 60</span>
              </div>
              <div class="shadow-xs mt-3 border border-slate-200 rounded-lg bg-white p-2.5 text-center dark:border-gray-800 dark:bg-gray-950">
                <div class="mb-1 text-[11px] text-slate-500 dark:text-gray-400">
                  Active Duel vs ApexBot_7
                </div>
                <div class="text-sm text-emerald-600 font-bold font-mono dark:text-emerald-400">
                  +$1,450.00 P&L • 5x LONG
                </div>
              </div>
              <n-button
                type="primary"
                block
                size="small"
                class="mt-2 font-bold"
                @click="router.push('/dashboard/royale')"
              >
                Join Live Arena
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- The 4 Pillars of Stock Royale Section -->
    <LandingGameplayPillars />

    <!-- Interactive 30-Second Duel Mini-Simulator Widget -->
    <LandingDuelSimulator />

    <!-- Social Proof Stats, Golden Trader Apex Leaderboard Preview & FAQ -->
    <LandingSocialProof />

    <!-- Platform Footer -->
    <LandingFooter />

    <!-- Commit Hash Watermark -->
    <span class="pointer-events-none absolute bottom-1 left-2 text-xs text-slate-400 font-mono opacity-30 dark:text-gray-500">
      {{ commitHash }}
    </span>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
