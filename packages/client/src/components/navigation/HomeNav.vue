<!--
  @author: adibarra (Alec Ibarra), Tinatsei Chingaya (Zedfoura), Antigravity
  @description: High-performance sticky frosted glass navigation bar with dual-theme design tokens
-->

<script setup lang="ts">
import {
  HomeOutline as HomeIcon,
} from '@vicons/ionicons5'
import {
  Dashboard as DashboardIcon,
} from '@vicons/carbon'
import {
  Flame as FlameIcon,
  Crosshair as RoyaleIcon,
} from '@vicons/tabler'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl transition-all duration-200 dark:border-[#1f2438] dark:bg-[#0c0d14]/85 dark:shadow-none">
    <nav class="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 sm:px-6">
      <!-- Left: Logo & Brand Identity -->
      <router-link
        to="/"
        focusable="false"
        class="group flex select-none items-center gap-3 outline-none"
      >
        <div class="h-9 w-9 flex items-center justify-center border border-emerald-500/30 rounded-xl bg-emerald-500/10 text-emerald-600 shadow-sm transition-transform duration-200 group-hover:scale-105 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-400">
          <RoyaleIcon class="h-5 w-5" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xl text-slate-900 font-black tracking-tight font-mono md:text-2xl dark:text-white">
            Fintasy
          </span>
          <span class="hidden border border-slate-200 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-bold tracking-wider font-mono sm:inline-flex dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
            BETA S1
          </span>
        </div>
      </router-link>

      <!-- Right: Navigation links, CTA & switches -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Nav Links (Home & Dashboard) -->
        <div class="flex items-center gap-1">
          <router-link
            to="/"
            class="rounded-lg px-3 py-1.5 text-xs font-bold font-mono transition-all"
            :class="route.path === '/'
              ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/50'"
          >
            <span class="hidden md:inline">{{ t('misc.home') }}</span>
            <span class="md:hidden">
              <n-icon size="18"><HomeIcon /></n-icon>
            </span>
          </router-link>

          <router-link
            to="/dashboard"
            class="rounded-lg px-3 py-1.5 text-xs font-bold font-mono transition-all"
            :class="route.path.startsWith('/dashboard') && route.path !== '/dashboard/royale'
              ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/50'"
          >
            <span class="hidden md:inline">{{ t('pages.dashboard.title') }}</span>
            <span class="md:hidden">
              <n-icon size="18"><DashboardIcon /></n-icon>
            </span>
          </router-link>
        </div>

        <!-- High-Contrast Dual-Theme Play Royale CTA Button -->
        <n-button
          round
          size="medium"
          class="play-royale-nav-btn border-none font-bold tracking-wide font-mono transition-all duration-200 hover:scale-105"
          :class="route.path === '/dashboard/royale' ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-black' : ''"
          @click="router.push('/dashboard/royale')"
        >
          <template #icon>
            <n-icon size="16">
              <FlameIcon />
            </n-icon>
          </template>
          <span class="hidden sm:inline">Play Royale</span>
          <span class="sm:hidden">Royale</span>
        </n-button>

        <!-- Utility Switches in Rounded Group -->
        <div class="flex items-center gap-1 border border-slate-200/80 rounded-xl bg-slate-50/80 p-1 dark:border-gray-800 dark:bg-[#121526]/80">
          <LanguageSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
/* High contrast styling for Play Royale button across both themes */
:deep(.play-royale-nav-btn) {
  background-color: #059669 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25) !important;
}

:deep(.play-royale-nav-btn:hover) {
  background-color: #047857 !important;
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35) !important;
}

html.dark :deep(.play-royale-nav-btn) {
  background-color: #00e676 !important;
  color: #050608 !important;
  font-weight: 900 !important;
  box-shadow: 0 0 20px rgba(0, 230, 118, 0.35) !important;
}

html.dark :deep(.play-royale-nav-btn:hover) {
  background-color: #00c853 !important;
  box-shadow: 0 0 25px rgba(0, 230, 118, 0.5) !important;
}
</style>
