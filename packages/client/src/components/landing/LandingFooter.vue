<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Multi-column authoritative footer (Element 11) with legal, community, and system status
-->

<script setup lang="ts">
import {
  BrandDiscord as DiscordIcon,
  BrandGithub as GithubIcon,
  Crosshair as RoyaleIcon,
  DeviceGamepad as SteamIcon,
} from '@vicons/tabler'

const router = useRouter()
const commitHash = import.meta.env.VITE_COMMIT_HASH || 'dev-local'
</script>

<template>
  <footer class="landing-footer w-full border-t border-slate-200 bg-slate-100/90 px-4 py-16 text-slate-400 dark:border-[#1f2438] dark:bg-[#07080d] md:px-8">
    <div class="mx-auto max-w-7xl">
      <!-- 4-Column Grid -->
      <div class="grid grid-cols-1 mb-14 gap-10 lg:grid-cols-5 sm:grid-cols-2">
        <!-- Col 1: Brand & Mission Statement (Spans 2 cols on lg) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 flex items-center justify-center border border-[rgba(255,255,255,0.15)] rounded-lg bg-[#0E121B] text-emerald-400">
              <n-icon size="18">
                <RoyaleIcon />
              </n-icon>
            </div>
            <span class="text-base text-white font-extrabold tracking-wider font-mono uppercase">
              FINTASY
            </span>
          </div>

          <p class="max-w-sm text-xs text-slate-400 leading-relaxed">
            The world's first competitive stock market battle royale. Combining 100ms high-frequency simulation with tournament game theory. Designed with Dieter Rams' principles: honest, unobtrusive, and down to the least design.
          </p>

          <!-- Live Telemetry Status Pill -->
          <div class="inline-flex items-center gap-2 border border-emerald-500/20 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 font-mono">
            <span class="relative h-2 w-2 flex">
              <span class="absolute h-full w-full inline-flex animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span class="relative h-2 w-2 inline-flex rounded-full bg-emerald-500" />
            </span>
            <span class="tabular-nums">10 Hz Fast Match Engine • All Systems Nominal</span>
          </div>
        </div>

        <!-- Col 2: Platform Architecture -->
        <div class="text-xs font-mono space-y-3">
          <h4 class="text-xs text-white font-bold tracking-wider uppercase">
            Platform
          </h4>
          <ul class="m-0 list-none p-0 space-y-2">
            <li>
              <a
                href="/dashboard/royale"
                class="text-decoration-none cursor-pointer text-slate-400 transition-colors hover:text-white"
                @click.prevent="router.push('/dashboard/royale')"
              >
                Combat Arena
              </a>
            </li>
            <li>
              <a
                href="/dashboard"
                class="text-decoration-none cursor-pointer text-slate-400 transition-colors hover:text-white"
                @click.prevent="router.push('/dashboard')"
              >
                Paper Trading
              </a>
            </li>
            <li>
              <a
                href="/dashboard/rankings"
                class="text-decoration-none cursor-pointer text-slate-400 transition-colors hover:text-white"
                @click.prevent="router.push('/dashboard/rankings')"
              >
                MMR Leaderboard
              </a>
            </li>
            <li>
              <a
                href="/login"
                class="text-decoration-none cursor-pointer text-slate-400 transition-colors hover:text-white"
                @click.prevent="router.push('/login')"
              >
                Sign In / Register
              </a>
            </li>
          </ul>
        </div>

        <!-- Col 3: Resources & Community -->
        <div class="text-xs font-mono space-y-3">
          <h4 class="text-xs text-white font-bold tracking-wider uppercase">
            Resources
          </h4>
          <ul class="m-0 list-none p-0 space-y-2">
            <li>
              <a
                href="https://github.com/adibarra/fintasy"
                target="_blank"
                rel="noopener"
                class="text-decoration-none flex items-center gap-1.5 text-slate-400 transition-colors hover:text-white"
              >
                <n-icon size="14">
                  <GithubIcon />
                </n-icon>
                <span>GitHub Repository</span>
              </a>
            </li>
            <li>
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener"
                class="text-decoration-none flex items-center gap-1.5 text-slate-400 transition-colors hover:text-white"
              >
                <n-icon size="14">
                  <DiscordIcon />
                </n-icon>
                <span>Discord Community</span>
              </a>
            </li>
            <li>
              <span class="flex items-center gap-1.5 text-slate-500">
                <n-icon size="14">
                  <SteamIcon />
                </n-icon>
                <span>STEAM DECK READY • TAURI 2.0</span>
              </span>
            </li>
          </ul>
        </div>

        <!-- Col 4: Legal & Fair Play -->
        <div class="text-xs font-mono space-y-3">
          <h4 class="text-xs text-white font-bold tracking-wider uppercase">
            Legal & Trust
          </h4>
          <ul class="m-0 list-none p-0 space-y-2">
            <li>
              <span class="cursor-pointer transition-colors hover:text-white">
                Terms of Service
              </span>
            </li>
            <li>
              <span class="cursor-pointer transition-colors hover:text-white">
                Privacy Policy
              </span>
            </li>
            <li>
              <span class="cursor-pointer transition-colors hover:text-white">
                Rules of Engagement
              </span>
            </li>
            <li>
              <span class="text-emerald-400 font-semibold">
                100% Simulated Capital
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar: Copyright & Commit Hash -->
      <div class="flex flex-col items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.06)] pt-8 text-xs text-slate-500 font-mono sm:flex-row">
        <p class="m-0">
          © 2026 Fintasy Inc. All rights reserved. Competitive financial simulation platform.
        </p>

        <div class="flex items-center gap-3">
          <span>COMMIT: {{ commitHash }}</span>
          <span>•</span>
          <span class="text-slate-400">DESIGNED BY DIETER RAMS PRINCIPLES</span>
        </div>
      </div>
    </div>
  </footer>
</template>
