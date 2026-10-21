<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: High-converting landing navigation header (Element 2) adhering to Grounded in Reason HUD
-->

<script setup lang="ts">
import {
  Login as LoginIcon,
} from '@vicons/carbon'
import {
  Flame as FlameIcon,
  Crosshair as RoyaleIcon,
} from '@vicons/tabler'

const router = useRouter()

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <header
    class="landing-header sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.08)] bg-[#07090E]/90 px-4 py-3.5 backdrop-blur-md md:px-8"
  >
    <div class="mx-auto max-w-7xl flex items-center justify-between">
      <!-- Left: Tactical Brand Logo -->
      <div class="flex items-center gap-3">
        <a
          href="/"
          class="group text-decoration-none flex items-center gap-2.5"
          @click.prevent="router.push('/')"
        >
          <div class="h-9 w-9 flex items-center justify-center border border-[rgba(255,255,255,0.15)] rounded-lg bg-[#0E121B] text-emerald-400 shadow-sm transition-all group-hover:border-emerald-500/50 group-hover:text-emerald-300">
            <n-icon size="20">
              <RoyaleIcon />
            </n-icon>
          </div>
          <div class="flex flex-col text-left">
            <span class="text-base text-white font-extrabold tracking-wider font-mono uppercase">
              FINTASY
            </span>
            <span class="text-[10px] text-slate-400 tracking-widest font-mono uppercase">
              STOCK ROYALE
            </span>
          </div>
        </a>

        <!-- Bracketed Taxonomy Chip -->
        <div class="hidden select-none items-center gap-1 border border-[rgba(255,255,255,0.08)] rounded bg-[#0E121B] px-2 py-0.5 text-[11px] text-slate-400 font-mono sm:inline-flex">
          <span>[</span>
          <span class="text-emerald-400">01</span>
          <span>•</span>
          <span>COMBAT TERMINAL</span>
          <span>]</span>
        </div>
      </div>

      <!-- Center: Navigation Links -->
      <nav class="hidden items-center gap-8 text-xs text-slate-300 font-medium tracking-wider font-mono uppercase lg:flex">
        <button
          type="button"
          class="header-nav-link cursor-pointer border-none bg-transparent text-slate-300 transition-colors hover:text-white"
          @click="scrollToSection('arena-preview')"
        >
          Combat HUD
        </button>
        <button
          type="button"
          class="header-nav-link cursor-pointer border-none bg-transparent text-slate-300 transition-colors hover:text-white"
          @click="scrollToSection('gameplay-pillars')"
        >
          4 Pillars
        </button>
        <button
          type="button"
          class="header-nav-link cursor-pointer border-none bg-transparent text-slate-300 transition-colors hover:text-white"
          @click="scrollToSection('trader-reviews')"
        >
          Intelligence
        </button>
        <button
          type="button"
          class="header-nav-link cursor-pointer border-none bg-transparent text-slate-300 transition-colors hover:text-white"
          @click="scrollToSection('faq-section')"
        >
          Debriefing / FAQ
        </button>
      </nav>

      <!-- Right: Telemetry Dot + Actions -->
      <div class="flex items-center gap-3">
        <!-- 10 Hz Telemetry Dot -->
        <div class="hidden items-center gap-1.5 border border-emerald-500/20 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-400 font-mono xl:flex">
          <span class="relative h-2 w-2 flex">
            <span class="absolute h-full w-full inline-flex animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span class="relative h-2 w-2 inline-flex rounded-full bg-emerald-500" />
          </span>
          <span class="tabular-nums">10 Hz LIVE</span>
        </div>

        <!-- Sign In Button -->
        <button
          type="button"
          class="header-login-btn border border-[rgba(255,255,255,0.12)] rounded-lg bg-[#0E121B] px-3.5 py-1.5 text-xs text-slate-200 font-medium font-mono transition-all hover:border-slate-400 hover:bg-[#151C2B] hover:text-white"
          @click="router.push('/login')"
        >
          <span class="flex items-center gap-1.5">
            <n-icon size="14">
              <LoginIcon />
            </n-icon>
            <span>Sign In</span>
          </span>
        </button>

        <!-- Primary Deploy CTA Button -->
        <button
          type="button"
          class="header-deploy-btn border border-[#FF5522]/40 rounded-lg bg-[#FF5522] px-4 py-1.5 text-xs text-white font-bold font-mono shadow-[#FF5522]/20 shadow-md transition-all active:scale-98 hover:scale-102 hover:bg-[#FF6633]"
          @click="router.push('/dashboard/royale')"
        >
          <span class="flex items-center gap-1.5">
            <n-icon size="14">
              <FlameIcon />
            </n-icon>
            <span>Deploy Arena →</span>
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-nav-link:focus-visible,
.header-login-btn:focus-visible,
.header-deploy-btn:focus-visible {
  outline: 2px solid #06b6d4;
  outline-offset: 2px;
}
</style>
