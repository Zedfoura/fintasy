<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: High-converting hero combat terminal (Elements 3, 4, 5) with massive typography & social proof
-->

<script setup lang="ts">
import {
  ChartLine as LineChartIcon,
  Login as LoginIcon,
} from '@vicons/carbon'
import {
  ArrowRight as ArrowRightIcon,
  Flame as FlameIcon,
} from '@vicons/tabler'

const router = useRouter()

// Key navigation triggers
function deployToRoyale() {
  router.push('/dashboard/royale')
}

function navigateToLogin() {
  router.push('/login')
}

function scrollToPillars() {
  const el = document.getElementById('gameplay-pillars')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <section class="landing-hero relative w-full flex flex-col items-center justify-start px-4 pb-16 pt-10 text-center md:pb-24 md:pt-20">
    <!-- Ambient Depth Lighting (Subtle emerald/cyan glow, zero purple AI cliches) -->
    <div
      class="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] rounded-full opacity-15 blur-[120px] -translate-x-1/2"
      style="background: radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(6, 182, 212, 0.2) 50%, transparent 80%);"
    />

    <!-- Hero Content Chassis -->
    <div class="relative z-10 mx-auto max-w-5xl flex flex-col items-center">
      <!-- Tactical Season Badge (Element 3 Header Tag) -->
      <div class="mb-6 inline-flex items-center gap-2 border border-emerald-500/30 rounded-full bg-[#0E121B]/90 px-4 py-1.5 text-xs text-emerald-400 font-mono shadow-sm backdrop-blur-md">
        <span class="relative h-2 w-2 flex">
          <span class="absolute h-full w-full inline-flex animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span class="relative h-2 w-2 inline-flex rounded-full bg-emerald-500" />
        </span>
        <span class="font-bold tracking-wider uppercase">[ SEASON 01 • S&P 500 LIQUIDITY WARFARE ]</span>
        <span class="hidden text-slate-500 md:inline">•</span>
        <span class="hidden text-slate-400 md:inline">100ms MATCH ENGINE</span>
      </div>

      <!-- Element 3: SEO-Optimized Massive Headline -->
      <h1 class="landing-hero-headline mb-6 max-w-4xl text-5xl text-slate-900 font-extrabold leading-[1.08] tracking-tight font-serif lg:text-7xl md:text-6xl sm:text-5xl dark:text-white">
        High-Stakes Capital Warfare.
        <span class="mt-2 block from-emerald-700 via-teal-700 to-cyan-800 bg-gradient-to-r bg-clip-text text-transparent italic dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
          Where Wall Street Meets Battle Royale.
        </span>
      </h1>

      <!-- Element 3: High-Converting Subtitle (Zero Legacy Copy) -->
      <p class="landing-hero-subtitle mx-auto mb-10 max-w-2xl text-base text-slate-600 leading-relaxed md:text-xl sm:text-lg dark:text-gray-300">
        Trade the tape in ultra-fast 30-second duels. Navigate collapsing sector liquidity, hunt over-leveraged traders, and battle from Bronze to Golden Trader on zero financial risk.
      </p>

      <!-- Element 4: Dual Conversion Call-To-Action Group -->
      <div class="landing-cta-group mb-16 w-full flex flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
        <!-- Primary Action Horizon CTA -->
        <button
          type="button"
          class="group deploy-cta-btn relative w-full overflow-hidden border border-[#FF5522]/50 rounded-xl bg-[#FF5522] px-8 py-4 text-base text-white font-bold font-mono shadow-[#FF5522]/25 shadow-xl transition-all duration-300 sm:w-auto active:scale-98 hover:scale-105 hover:bg-[#FF6633]"
          @click="deployToRoyale"
        >
          <span class="relative z-10 flex items-center justify-center gap-2.5">
            <n-icon size="20" class="text-white">
              <FlameIcon />
            </n-icon>
            <span>Enter Live Combat Arena</span>
            <n-icon size="18" class="transition-transform group-hover:translate-x-1">
              <ArrowRightIcon />
            </n-icon>
          </span>
          <span class="absolute bottom-1 right-2 hidden select-none text-[10px] text-white/70 tracking-widest font-mono sm:inline">
            [ ↵ ]
          </span>
        </button>

        <!-- Secondary CTA: Explore Duel Mechanics -->
        <button
          type="button"
          class="demo-cta-btn w-full border border-[rgba(255,255,255,0.14)] rounded-xl bg-[#0E121B] px-6 py-4 text-base text-slate-200 font-semibold font-mono transition-all sm:w-auto hover:border-emerald-500/50 hover:bg-[#151C2B] hover:text-white"
          @click="scrollToPillars"
        >
          <span class="flex items-center justify-center gap-2">
            <n-icon size="18" class="text-cyan-400">
              <LineChartIcon />
            </n-icon>
            <span>Explore 4 Pillars</span>
          </span>
        </button>

        <!-- Tertiary Link: Login / Register -->
        <button
          type="button"
          class="login-cta-btn w-full border-none bg-transparent px-4 py-4 text-sm text-slate-400 font-medium font-mono transition-colors sm:w-auto hover:text-emerald-400"
          @click="navigateToLogin"
        >
          <span class="flex items-center justify-center gap-1.5">
            <n-icon size="16">
              <LoginIcon />
            </n-icon>
            <span>Sign In / Register</span>
          </span>
        </button>
      </div>

      <!-- Element 5: Social Proof & Institutional Telemetry Strip -->
      <div class="max-w-4xl w-full border border-[rgba(255,255,255,0.08)] rounded-2xl bg-[#0E121B]/80 p-6 shadow-xl backdrop-blur-xl">
        <div class="grid grid-cols-2 gap-6 text-center md:grid-cols-5">
          <!-- Metric 1: Capital Simulated -->
          <div class="flex flex-col items-center">
            <span class="text-2xl text-white font-extrabold font-mono tabular-nums sm:text-3xl">
              $142M+
            </span>
            <span class="mt-1 text-xs text-slate-400 tracking-wider font-mono uppercase">
              Simulated Volume
            </span>
          </div>

          <!-- Metric 2: Active Traders -->
          <div class="flex flex-col items-center">
            <span class="text-2xl text-emerald-400 font-extrabold font-mono tabular-nums sm:text-3xl">
              48,200+
            </span>
            <span class="mt-1 text-xs text-slate-400 tracking-wider font-mono uppercase">
              Active Traders
            </span>
          </div>

          <!-- Metric 3: Fast Engine -->
          <div class="flex flex-col items-center">
            <span class="text-2xl text-cyan-400 font-extrabold font-mono tabular-nums sm:text-3xl">
              100ms
            </span>
            <span class="mt-1 text-xs text-slate-400 tracking-wider font-mono uppercase">
              Fast Game Loop
            </span>
          </div>

          <!-- Metric 4: Trader Rating -->
          <div class="flex flex-col items-center">
            <div class="flex items-center gap-1 text-amber-400">
              <span class="text-2xl text-white font-extrabold font-mono tabular-nums sm:text-3xl">
                4.92
              </span>
              <span class="text-xs text-amber-400 font-mono">/ 5.0</span>
            </div>
            <span class="mt-1 text-xs text-slate-400 tracking-wider font-mono uppercase">
              3,200+ Reviews
            </span>
          </div>

          <!-- Metric 5: Zero Dollar Risk -->
          <div class="col-span-2 flex flex-col items-center md:col-span-1">
            <span class="text-2xl text-emerald-400 font-extrabold font-mono tabular-nums sm:text-3xl">
              $0.00
            </span>
            <span class="mt-1 text-xs text-slate-400 tracking-wider font-mono uppercase">
              Financial Risk
            </span>
          </div>
        </div>

        <!-- Institutional Affiliation Badge Bar -->
        <div class="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-[rgba(255,255,255,0.06)] pt-5 text-[11px] text-slate-500 tracking-widest font-mono uppercase">
          <span>HARVARD TRADING CLUB</span>
          <span>•</span>
          <span>MIT QUANT LAB</span>
          <span>•</span>
          <span>BERKELEY APEX</span>
          <span>•</span>
          <span>LONDON FINTECH LEAGUE</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.deploy-cta-btn:focus-visible,
.demo-cta-btn:focus-visible,
.login-cta-btn:focus-visible {
  outline: 2px solid #ff5522;
  outline-offset: 3px;
}
</style>
