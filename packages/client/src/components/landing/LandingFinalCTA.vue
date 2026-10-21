<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Final hero conversion CTA section (Element 10) with tournament countdown & zero-risk trust signals
-->

<script setup lang="ts">
import {
  ArrowRight as ArrowRightIcon,
  Clock as ClockIcon,
  Flame as FlameIcon,
  ShieldCheck as ShieldIcon,
  Bolt as ZapIcon,
} from '@vicons/tabler'

const router = useRouter()

function deployNow() {
  router.push('/dashboard/royale')
}

function navigateToLogin() {
  router.push('/login')
}
</script>

<template>
  <section class="landing-final-cta relative w-full overflow-hidden px-4 py-20 md:py-28">
    <!-- Ambient Depth Lighting Glow -->
    <div
      class="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[750px] rounded-full opacity-20 blur-[130px] -translate-x-1/2 -translate-y-1/2"
      style="background: radial-gradient(circle, rgba(255, 85, 34, 0.4) 0%, rgba(16, 185, 129, 0.2) 60%, transparent 80%);"
    />

    <div class="relative z-10 mx-auto max-w-4xl w-full">
      <div class="border border-[#FF5522]/35 rounded-3xl from-[#0E121B] to-[#07090E] bg-gradient-to-b p-8 text-center shadow-[#FF5522]/10 shadow-2xl backdrop-blur-2xl md:p-14">
        <!-- Tournament Drop Timer Badge -->
        <div class="mb-6 inline-flex items-center gap-2 border border-[#FF5522]/30 rounded-full bg-[#FF5522]/10 px-4 py-1.5 text-xs text-[#FF5522] font-mono shadow-sm">
          <n-icon size="14">
            <ClockIcon />
          </n-icon>
          <span class="font-bold tracking-wider uppercase">NEXT GLOBAL TOURNAMENT DROPS IN 04:32</span>
        </div>

        <!-- Headline -->
        <h2 class="mb-4 text-3xl text-white font-extrabold leading-tight tracking-tight font-serif md:text-5xl sm:text-4xl">
          The Arena is Live.
          <span class="mt-1 block from-orange-400 via-amber-300 to-emerald-400 bg-gradient-to-r bg-clip-text text-transparent italic">
            Claim Your $15,000 Starting Stake.
          </span>
        </h2>

        <!-- Subtitle -->
        <p class="mx-auto mb-10 max-w-xl text-base text-slate-300 leading-relaxed sm:text-lg">
          Join over 48,000 traders competing in daily ranked seasons. Pure execution speed, zero financial loss, institutional-grade market simulation.
        </p>

        <!-- Giant Primary CTA Button -->
        <div class="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            class="group final-deploy-btn relative w-full overflow-hidden border border-[#FF5522]/60 rounded-xl bg-[#FF5522] px-10 py-5 text-lg text-white font-bold font-mono shadow-[#FF5522]/30 shadow-2xl transition-all duration-300 sm:w-auto active:scale-98 hover:scale-105 hover:bg-[#FF6633]"
            @click="deployNow"
          >
            <span class="flex items-center justify-center gap-3">
              <n-icon size="22" class="text-white">
                <FlameIcon />
              </n-icon>
              <span>Deploy to Stock Royale Now</span>
              <n-icon size="20" class="transition-transform group-hover:translate-x-1.5">
                <ArrowRightIcon />
              </n-icon>
            </span>
          </button>

          <button
            type="button"
            class="final-login-btn w-full border border-[rgba(255,255,255,0.12)] rounded-xl bg-[#0E121B] px-6 py-5 text-base text-slate-200 font-semibold font-mono transition-all sm:w-auto hover:bg-[#151C2B] hover:text-white"
            @click="navigateToLogin"
          >
            <span>Sign In / Create Account</span>
          </button>
        </div>

        <!-- Zero-Risk Trust Signal Badges -->
        <div class="flex flex-wrap items-center justify-center gap-6 border-t border-[rgba(255,255,255,0.06)] pt-6 text-xs text-slate-400 font-mono">
          <div class="flex items-center gap-1.5">
            <n-icon size="16" class="text-emerald-400">
              <ShieldIcon />
            </n-icon>
            <span>No Credit Card Required</span>
          </div>

          <span class="hidden text-slate-600 sm:inline">•</span>

          <div class="flex items-center gap-1.5">
            <n-icon size="16" class="text-cyan-400">
              <ZapIcon />
            </n-icon>
            <span>Instant Browser Play</span>
          </div>

          <span class="hidden text-slate-600 sm:inline">•</span>

          <div class="flex items-center gap-1.5">
            <n-icon size="16" class="text-amber-400">
              <ShieldIcon />
            </n-icon>
            <span>Steam Deck Verified (Tauri 2.0)</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.final-deploy-btn:focus-visible,
.final-login-btn:focus-visible {
  outline: 2px solid #ff5522;
  outline-offset: 3px;
}
</style>
