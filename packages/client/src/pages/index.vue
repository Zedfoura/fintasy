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
      class="pointer-events-none absolute left-1/2 h-96 w-96 rounded-full opacity-20 blur-3xl -top-40 -translate-x-1/2"
      style="background: radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.2) 70%, transparent 100%);"
    />

    <!-- Hero Content Container -->
    <div class="relative z-10 mx-auto max-w-5xl flex flex-col items-center text-center">
      <!-- Live Status Chips Row -->
      <div class="mb-6 flex flex-wrap items-center justify-center gap-2.5">
        <div class="flex items-center gap-1.5 border border-emerald-500/30 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs text-emerald-400 font-semibold backdrop-blur-sm">
          <span class="relative h-2 w-2 flex">
            <span class="absolute h-full w-full inline-flex animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span class="relative h-2 w-2 inline-flex rounded-full bg-emerald-500" />
          </span>
          <span>{{ t('pages.main.badge-season') }}</span>
        </div>

        <div class="flex items-center gap-1.5 border border-gray-700/50 rounded-full bg-gray-800/40 px-3 py-1 text-xs text-gray-300 font-medium backdrop-blur-sm">
          <n-icon size="14" class="text-amber-400">
            <UsersIcon />
          </n-icon>
          <span>{{ t('pages.main.badge-traders') }}</span>
        </div>

        <div class="flex items-center gap-1.5 border border-gray-700/50 rounded-full bg-gray-800/40 px-3 py-1 text-xs text-gray-300 font-medium backdrop-blur-sm">
          <n-icon size="14" class="text-cyan-400">
            <ZapIcon />
          </n-icon>
          <span>{{ t('pages.main.badge-engine') }}</span>
        </div>

        <div class="flex items-center gap-1.5 border border-gray-700/50 rounded-full bg-gray-800/40 px-3 py-1 text-xs text-gray-300 font-medium backdrop-blur-sm">
          <n-icon size="14" class="text-emerald-400">
            <TrendingUpIcon />
          </n-icon>
          <span>{{ t('pages.main.badge-starting-pot') }}</span>
        </div>
      </div>

      <!-- Main Headline -->
      <h1 class="landing-hero-headline mb-4 max-w-4xl text-4xl font-extrabold tracking-tight lg:text-7xl md:text-6xl sm:text-5xl">
        <span class="from-emerald-400 via-teal-300 to-cyan-400 bg-gradient-to-r bg-clip-text text-transparent">
          {{ t('pages.main.hero-headline') }}
        </span>
      </h1>

      <!-- Subtitle Description -->
      <p class="landing-hero-subtitle mx-auto mb-8 max-w-2xl text-base text-gray-300 leading-relaxed md:text-xl sm:text-lg">
        {{ t('pages.main.hero-subtitle') }}
      </p>

      <!-- Dual Call to Action Buttons -->
      <div class="landing-cta-group mb-12 w-full flex flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
        <!-- Primary Action: Deploy to Royale -->
        <n-button
          type="primary"
          size="large"
          round
          class="deploy-cta-btn w-full px-8 py-6 text-base font-bold shadow-emerald-500/25 shadow-lg transition-all sm:w-auto hover:scale-105 hover:shadow-emerald-500/40"
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
          round secondary
          class="login-cta-btn w-full border-gray-700 px-6 py-6 text-base font-semibold transition-all sm:w-auto hover:scale-105 hover:border-emerald-500"
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
          class="text-gray-400 transition-colors hover:text-emerald-400"
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
      <div class="mb-14 max-w-4xl w-full overflow-hidden border border-gray-800 rounded-xl bg-gray-900/60 p-2.5 shadow-inner backdrop-blur-md">
        <div class="no-scrollbar flex items-center justify-center gap-6 overflow-x-auto px-2 text-xs sm:justify-between">
          <div
            v-for="ticker in tickerStream"
            :key="ticker.symbol"
            class="flex items-center gap-2 whitespace-nowrap"
          >
            <span class="text-gray-200 font-bold">{{ ticker.symbol }}</span>
            <span class="text-gray-400">{{ ticker.price }}</span>
            <span
              :class="ticker.isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'"
              class="rounded px-1.5 py-0.5 font-semibold"
            >
              {{ ticker.change }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tactical Arena Preview Teaser Glass Card -->
      <div class="relative max-w-4xl w-full overflow-hidden border border-gray-700/60 rounded-2xl from-gray-900/90 to-gray-950/90 bg-gradient-to-b p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div class="flex flex-col items-center justify-between gap-6 text-left md:flex-row">
          <!-- Left: Tactical Preview Info -->
          <div class="flex-1 space-y-4">
            <div class="flex items-center gap-2 text-xs text-emerald-400 font-bold tracking-wider uppercase">
              <n-icon size="16">
                <FlameIcon />
              </n-icon>
              <span>High-Stakes Combat Terminal</span>
            </div>
            <h2 class="text-2xl text-gray-100 font-bold sm:text-3xl">
              12 S&P Sectors. 30-Second Duels. 1 Winner.
            </h2>
            <p class="text-sm text-gray-400 leading-relaxed">
              Every round drops you with $15,000 in equity. Scout Big Tech, Financials, or Healthcare sectors.
              Engage contested players in high-speed micro-trading battles with 1x to 5x leverage before the Federal Reserve liquidity storm forces you inward.
            </p>
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <div class="flex items-center gap-1.5 rounded-lg bg-gray-800/80 px-3 py-1.5 text-xs text-gray-300">
                <n-icon size="14" class="text-amber-400">
                  <TrophyIcon />
                </n-icon>
                <span>Rocket League MMR Ladder</span>
              </div>
              <div class="flex items-center gap-1.5 rounded-lg bg-gray-800/80 px-3 py-1.5 text-xs text-gray-300">
                <n-icon size="14" class="text-emerald-400">
                  <ShieldIcon />
                </n-icon>
                <span>100% Risk-Free Simulated Capital</span>
              </div>
            </div>
          </div>

          <!-- Right: Visual Duel Simulation Mock Teaser Card -->
          <div class="w-full border border-emerald-500/20 rounded-xl bg-gray-900/90 p-4 shadow-lg md:w-80">
            <div class="mb-3 flex items-center justify-between border-b border-gray-800 pb-2 text-xs">
              <span class="text-gray-300 font-bold">MATCH #9421 • FINAL CIRCLE</span>
              <span class="animate-pulse rounded bg-rose-500/20 px-1.5 py-0.5 text-rose-400 font-bold font-mono">STORM 0:28</span>
            </div>
            <div class="space-y-2.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400">Sector:</span>
                <span class="text-emerald-400 font-semibold">AI Semiconductors (Hot Zone)</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400">Your Equity:</span>
                <span class="text-emerald-400 font-bold font-mono">$19,420.50 (+29.4%)</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400">Traders Remaining:</span>
                <span class="text-amber-400 font-bold font-mono">4 / 60</span>
              </div>
              <div class="mt-3 border border-gray-800 rounded-lg bg-gray-950 p-2.5 text-center">
                <div class="mb-1 text-[11px] text-gray-400">
                  Active Duel vs ApexBot_7
                </div>
                <div class="text-sm text-emerald-400 font-bold font-mono">
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
    <span class="pointer-events-none absolute bottom-1 left-2 text-xs text-gray-500 font-mono opacity-20">
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
