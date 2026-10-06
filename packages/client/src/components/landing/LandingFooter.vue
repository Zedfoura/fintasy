<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Platform Marketing Footer with Steam Deck / Tauri Readiness Badges & Navigation Links
-->

<script setup lang="ts">
import { NTag } from 'naive-ui'
import {
  Crosshair as RoyaleIcon,
  DeviceGamepad as SteamIcon,
} from '@vicons/tabler'
</script>

<template>
  <footer class="landing-footer w-full border-t border-[#1f2438] bg-[#07080d] px-4 py-12 text-gray-400">
    <div class="mx-auto max-w-7xl">
      <div class="flex flex-col items-center justify-between gap-8 md:flex-row">
        <!-- Brand & Description -->
        <div class="text-center space-y-3 md:text-left">
          <div class="flex items-center justify-center gap-2 md:justify-start">
            <div class="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <RoyaleIcon class="h-5 w-5" />
            </div>
            <span class="text-xl text-white font-black tracking-wider font-mono">
              FINTASY
            </span>
            <span class="text-xs text-emerald-400 tracking-widest font-mono uppercase">
              ROYALE
            </span>
          </div>
          <p class="max-w-md text-xs text-gray-500 leading-relaxed font-mono">
            High-frequency 60-player competitive stock market battle royale.
            Built on authoritative in-memory state engine and sub-100ms tick streams.
          </p>

          <!-- Steam Deck Readiness Badge -->
          <div class="pt-1">
            <NTag
              type="info"
              size="small"
              :bordered="false"
              class="inline-flex items-center gap-1.5 text-[10px] tracking-wider font-mono uppercase"
            >
              <template #icon>
                <SteamIcon class="h-3.5 w-3.5" />
              </template>
              STEAM DECK READY • TAURI 2.0
            </NTag>
          </div>
        </div>

        <!-- Quick Navigation Links -->
        <div class="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-mono">
          <RouterLink
            to="/dashboard/royale"
            class="transition-colors hover:text-[#00e676]"
          >
            Play Royale
          </RouterLink>
          <RouterLink
            to="/dashboard"
            class="transition-colors hover:text-white"
          >
            Paper Trading
          </RouterLink>
          <RouterLink
            to="/login"
            class="transition-colors hover:text-white"
          >
            Sign In / Register
          </RouterLink>
          <a
            href="https://github.com/Zedfoura/fintasy"
            target="_blank"
            rel="noopener noreferrer"
            class="transition-colors hover:text-white"
          >
            GitHub
          </a>
        </div>
      </div>

      <!-- Copyright & System Status -->
      <div class="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#1f2438]/50 pt-6 text-[11px] text-gray-600 font-mono sm:flex-row">
        <div>
          © 2026 Fintasy Inc. All rights reserved. 100% Risk-Free Simulated Capital.
        </div>
        <div class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00e676]" />
          <span class="text-gray-400">STATE ENGINE // 100% OPERATIONAL</span>
        </div>
      </div>
    </div>
  </footer>
</template>
