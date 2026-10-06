<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Stock Royale 4-Pillar Gameplay Loop Showcase & Tactical Sector Teaser Component
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NCard, NTag } from 'naive-ui'

export interface Pillar {
  id: string
  number: string
  title: string
  subtitle: string
  badge: string
  badgeType: 'success' | 'warning' | 'error' | 'info'
  accentColor: string
  metricLabel: string
  metricValue: string
  description: string
  points: string[]
}

const activePillarId = ref<string>('all')

const pillars: Pillar[] = [
  {
    id: 'lobbies',
    number: '01',
    title: '30–60 Player Lobbies',
    subtitle: 'Instant Matchmaking & Bot Fill',
    badge: '100ms TICK ENGINE',
    badgeType: 'info',
    accentColor: '#00e5ff',
    metricLabel: 'STARTING POT',
    metricValue: '$15,000.00',
    description: 'Jump directly into high-intensity matches with rapid bot filling and zero queue delay.',
    points: [
      'Algorithmic bot fill with adaptive trader personalities (Momentum, Mean-Reversion, High-Beta)',
      'Sub-100ms match tick frequency powered by authoritative in-memory state engine',
      'Equalized 64-bit integer cent capitalization ($15,000.00 starting capital per trader)',
    ],
  },
  {
    id: 'map',
    number: '02',
    title: 'Dynamic Sector Map',
    subtitle: '12-Sector Topology & Liquidity Storm',
    badge: 'ZONE CONTRACTION',
    badgeType: 'warning',
    accentColor: '#ff9100',
    metricLabel: 'MARKET SECTORS',
    metricValue: '12 S&P 500 NODES',
    description: 'Navigate concentric market sectors as the Federal Reserve liquidity drain collapses outer zones.',
    points: [
      'Concentric topology: Outer (Defensive), Mid (Cyclical), Inner (High-Beta Mega-Cap Tech)',
      'Timed storm contractions forcing surviving traders toward central high-volume zones',
      'Exponential storm damage draining cash from 1% to 10% per second for out-of-bounds traders',
    ],
  },
  {
    id: 'duels',
    number: '03',
    title: '30s Micro-Trading Duels',
    subtitle: 'High-Leverage Combat & Loot Stealing',
    badge: '1x–5x LEVERAGE',
    badgeType: 'error',
    accentColor: '#ff1744',
    metricLabel: 'RISK THRESHOLD',
    metricValue: '90% LIQUIDATION',
    description: 'Engage neighboring traders in 30-second leveraged duels. Eliminate opponents to seize their cash.',
    points: [
      '30-second rapid duels: Long or Short live ticker volatility in real-time',
      'Selectable 1x to 5x leverage multipliers amplifying returns and margin risk',
      'Third-party battle escalation: adjacent traders can intercept and turn 1v1 duels into multi-way combat',
    ],
  },
  {
    id: 'ranked',
    number: '04',
    title: 'Ranked MMR Progression',
    subtitle: 'Competitive Apex Ladder & Badges',
    badge: 'ROCKET LEAGUE RANKS',
    badgeType: 'success',
    accentColor: '#00e676',
    metricLabel: 'APEX DIVISION',
    metricValue: 'GOLDEN TRADER',
    description: 'Climb through competitive tiers inspired by Rocket League, from Copper to Golden Trader.',
    points: [
      'Zero-sum MMR rating calculations balancing match placement against entry fees',
      'Tiered ranks: Copper, Bronze, Silver, Gold, Platinum, Diamond, Master, Apex Grandmaster',
      'Seasonal reset leaderboards with exclusive prestige badges and platform flair',
    ],
  },
]

const filteredPillars = computed(() => {
  if (activePillarId.value === 'all')
    return pillars
  return pillars.filter(p => p.id === activePillarId.value)
})

function selectTab(id: string) {
  activePillarId.value = id
}
</script>

<template>
  <section class="landing-pillars-section px-4 py-16" aria-label="Core Gameplay Pillars">
    <div class="mx-auto max-w-7xl">
      <!-- Section Header -->
      <div class="mb-12 text-center">
        <div class="mb-3 inline-flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-[#00e676]" />
          <span class="text-xs text-[#00e676] tracking-widest font-mono uppercase">
            TACTICAL BLUEPRINT // CORE GAMEPLAY
          </span>
        </div>
        <h2 class="text-3xl text-white font-black tracking-tight font-mono md:text-5xl">
          THE 4 PILLARS OF STOCK ROYALE
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-base text-gray-400">
          Master the mechanics of high-frequency competitive trading. Four integrated systems built for relentless, fast-paced financial combat.
        </p>

        <!-- Interactive Filter Bar -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-2">
          <NButton
            size="small"
            :type="activePillarId === 'all' ? 'primary' : 'default'"
            class="pillar-tab text-xs font-mono uppercase"
            data-tab="all"
            @click="selectTab('all')"
          >
            All Pillars (4)
          </NButton>
          <NButton
            v-for="p in pillars"
            :key="p.id"
            size="small"
            :type="activePillarId === p.id ? 'primary' : 'default'"
            class="pillar-tab text-xs font-mono uppercase"
            :data-tab="p.id"
            @click="selectTab(p.id)"
          >
            {{ p.number }}. {{ p.title }}
          </NButton>
        </div>
      </div>

      <!-- 4-Pillar Grid -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-4 md:grid-cols-2">
        <NCard
          v-for="pillar in filteredPillars"
          :key="pillar.id"
          class="pillar-card border border-[#1f2438] bg-[#0c0d14]/90 transition-all duration-300 hover:border-[#00e676]/60 hover:shadow-[0_0_30px_rgba(0,230,118,0.15)]"
          :data-pillar-id="pillar.id"
          size="medium"
        >
          <!-- Pillar Number & Badge Header -->
          <div class="mb-4 flex items-center justify-between">
            <span class="text-2xl font-black font-mono" :style="{ color: pillar.accentColor }">
              {{ pillar.number }}
            </span>
            <NTag :type="pillar.badgeType" size="small" :bordered="false" class="text-[10px] tracking-wider font-mono uppercase">
              {{ pillar.badge }}
            </NTag>
          </div>

          <!-- Pillar Title & Subtitle -->
          <h3 class="text-lg text-white font-bold tracking-wide font-mono">
            {{ pillar.title }}
          </h3>
          <p class="mb-4 text-xs text-gray-400 font-mono uppercase">
            {{ pillar.subtitle }}
          </p>

          <!-- Key Metric Banner -->
          <div class="mb-4 border border-[#1f2438] rounded bg-[#121526]/80 p-2.5">
            <div class="text-[10px] text-gray-400 tracking-wider font-mono uppercase">
              {{ pillar.metricLabel }}
            </div>
            <div class="text-base font-bold font-mono" :style="{ color: pillar.accentColor }">
              {{ pillar.metricValue }}
            </div>
          </div>

          <!-- Description -->
          <p class="mb-4 text-xs text-gray-300 leading-relaxed">
            {{ pillar.description }}
          </p>

          <!-- Mechanics Bullet List -->
          <ul class="border-t border-[#1f2438] pt-4 text-xs text-gray-400 space-y-2">
            <li
              v-for="(point, idx) in pillar.points"
              :key="idx"
              class="flex items-start gap-2"
            >
              <span class="mt-0.5 text-xs font-bold" :style="{ color: pillar.accentColor }">▸</span>
              <span>{{ point }}</span>
            </li>
          </ul>
        </NCard>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pillar-card {
  backdrop-filter: blur(12px);
}
</style>
