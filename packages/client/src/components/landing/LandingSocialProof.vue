<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Social Proof Stats, Golden Trader Apex Leaderboard Preview & FAQ Component
-->

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NTag } from 'naive-ui'
import {
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Help as HelpIcon,
  Trophy as TrophyIcon,
  Users as UsersIcon,
} from '@vicons/tabler'

const router = useRouter()
const instance = getCurrentInstance()

const stats = [
  { value: '60', label: 'MAX TRADERS', desc: 'Real-time competitive match lobbies', color: '#00e5ff' },
  { value: '$15,000.00', label: 'STARTING POT', desc: 'Equalized integer-cent capital (INV-1)', color: '#00e676' },
  { value: '100ms', label: 'TICK ENGINE', desc: 'Sub-tick state machine sync frequency', color: '#ff9100' },
  { value: '12', label: 'S&P SECTORS', desc: 'Concentric high-volatility market zones', color: '#b388ff' },
]

const leaderboard = [
  { rank: '#1', name: 'QuantumBull', tier: 'GOLDEN TRADER', tierType: 'success' as const, mmr: '2,840', winRate: '74.2%', liquidations: 342 },
  { rank: '#2', name: 'MomentumKing', tier: 'GOLDEN TRADER', tierType: 'success' as const, mmr: '2,790', winRate: '71.8%', liquidations: 318 },
  { rank: '#3', name: 'HFT_Viper', tier: 'APEX MASTER', tierType: 'warning' as const, mmr: '2,710', winRate: '68.5%', liquidations: 294 },
  { rank: '#4', name: 'AlphaSeeker', tier: 'APEX MASTER', tierType: 'warning' as const, mmr: '2,680', winRate: '66.1%', liquidations: 275 },
  { rank: '#5', name: 'DeltaNeutral', tier: 'APEX MASTER', tierType: 'warning' as const, mmr: '2,640', winRate: '64.9%', liquidations: 260 },
]

const faqs = [
  {
    q: 'What is Stock Royale?',
    a: 'Stock Royale is a 60-player competitive trading battle royale simulator. Traders drop into real-time S&P 500 sectors, fight 30-second trading duels, escape the Fed liquidity storm, and battle to become the last surviving trader.',
  },
  {
    q: 'Do I need real money or brokerage credentials to trade?',
    a: 'No! Stock Royale operates on 100% risk-free simulated capital. Every participant starts with $15,000.00 in equalized portfolio equity, competing purely on market acumen and trading reflexes.',
  },
  {
    q: 'How does the sector storm collapse work?',
    a: 'As the match progresses, the Federal Reserve liquidity drain collapses outer sectors into storm zones. Traders remaining in collapsed sectors suffer continuous cash penalties, forcing high-stakes rotations toward inner high-volume tech sectors.',
  },
  {
    q: 'How does leverage work during micro-trading duels?',
    a: 'When contesting a sector or opponent, you can trigger a 30-second duel with 1x to 5x leverage. If your margin drops past the 90% liquidation cutoff, you are instantly eliminated and your remaining cash is awarded to the victor.',
  },
  {
    q: 'Can I play on Steam Deck or Linux?',
    a: 'Yes! Fintasy Stock Royale is packaged with Tauri 2.0 and is Steam Deck ready out of the box with native gamepad controls, hardware-accelerated rendering, and desktop bridging.',
  },
]

const openFaqIndex = ref<number | null>(0)

function toggleFaq(index: number) {
  if (openFaqIndex.value === index)
    openFaqIndex.value = null
  else
    openFaqIndex.value = index
}

function viewFullLadder() {
  const r = router || instance?.proxy?.$router
  if (r)
    r.push('/dashboard/royale')
}
</script>

<template>
  <section class="landing-social-proof px-4 py-16" aria-label="Platform Stats and Leaderboard">
    <div class="mx-auto max-w-7xl">
      <!-- 4 Key Platform Stats Grid -->
      <div class="grid grid-cols-2 mb-20 gap-4 md:grid-cols-4 lg:gap-6">
        <NCard
          v-for="stat in stats"
          :key="stat.label"
          class="social-stat-card border border-slate-200 rounded-xl bg-white/90 text-center shadow-sm backdrop-blur-md transition-colors dark:border-[#1f2438] hover:border-slate-300 dark:bg-[#0c0d14]/80 dark:shadow-none dark:hover:border-gray-600"
          size="medium"
        >
          <div class="text-3xl font-black tracking-tight font-mono md:text-5xl" :style="{ color: stat.color }">
            {{ stat.value }}
          </div>
          <div class="mt-2 text-xs text-slate-700 font-bold tracking-wider font-mono uppercase dark:text-gray-300">
            {{ stat.label }}
          </div>
          <p class="mt-1 text-[11px] text-slate-500 font-mono dark:text-gray-400">
            {{ stat.desc }}
          </p>
        </NCard>
      </div>

      <!-- Golden Trader Apex Leaderboard Preview -->
      <div class="mb-20">
        <div class="mb-8 text-center">
          <div class="mb-3 inline-flex items-center gap-2">
            <TrophyIcon class="h-4 w-4 text-emerald-600 dark:text-[#00e676]" />
            <span class="text-xs text-emerald-700 font-bold tracking-widest font-mono uppercase dark:text-[#00e676]">
              COMPETITIVE RANKED SEASON 1
            </span>
          </div>
          <h2 class="text-3xl text-slate-900 font-black tracking-tight font-mono md:text-4xl dark:text-white">
            GOLDEN TRADER APEX LADDER
          </h2>
          <p class="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-gray-400">
            Top competitive traders in the current seasonal ladder. Climb the ranks to achieve Golden Trader status.
          </p>
        </div>

        <NCard
          class="leaderboard-card overflow-hidden border border-slate-200 rounded-2xl bg-white/95 shadow-xl backdrop-blur-xl dark:border-[#1f2438] dark:bg-[#0c0d14]/90 dark:shadow-2xl"
          size="medium"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50/80 text-[11px] text-slate-500 uppercase dark:border-[#1f2438] dark:bg-transparent dark:text-gray-400">
                  <th class="px-4 py-3">
                    Rank
                  </th>
                  <th class="px-4 py-3">
                    Trader
                  </th>
                  <th class="px-4 py-3">
                    Tier
                  </th>
                  <th class="px-4 py-3 text-right">
                    MMR
                  </th>
                  <th class="px-4 py-3 text-right">
                    Win Rate
                  </th>
                  <th class="px-4 py-3 text-right">
                    Liquidations
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-[#1f2438]/50">
                <tr
                  v-for="entry in leaderboard"
                  :key="entry.name"
                  class="transition-colors hover:bg-slate-50/80 dark:hover:bg-gray-800/20"
                >
                  <td class="px-4 py-3.5 font-black" :class="entry.rank === '#1' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-600 dark:text-gray-300'">
                    {{ entry.rank }}
                  </td>
                  <td class="px-4 py-3.5 text-slate-900 font-bold dark:text-white">
                    {{ entry.name }}
                  </td>
                  <td class="px-4 py-3.5">
                    <NTag size="small" :type="entry.tierType" :bordered="false" class="text-[10px] font-bold uppercase">
                      {{ entry.tier }}
                    </NTag>
                  </td>
                  <td class="px-4 py-3.5 text-right text-cyan-700 font-black dark:text-[#00e5ff]">
                    {{ entry.mmr }} MMR
                  </td>
                  <td class="px-4 py-3.5 text-right text-emerald-700 font-bold dark:text-emerald-400">
                    {{ entry.winRate }}
                  </td>
                  <td class="px-4 py-3.5 text-right text-slate-600 dark:text-gray-300">
                    {{ entry.liquidations }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-6 border-t border-slate-200 pt-4 text-center dark:border-[#1f2438]">
            <NButton
              type="primary"
              size="medium"
              round
              class="ranked-ladder-btn font-bold font-mono shadow-emerald-600/20 shadow-lg hover:scale-105 dark:shadow-emerald-500/20"
              @click="viewFullLadder"
            >
              <template #icon>
                <UsersIcon />
              </template>
              View Full Ranked Ladder
            </NButton>
          </div>
        </NCard>
      </div>

      <!-- Frequently Asked Questions Accordion -->
      <div class="mx-auto max-w-4xl">
        <div class="mb-8 text-center">
          <div class="mb-3 inline-flex items-center gap-2">
            <HelpIcon class="h-4 w-4 text-cyan-600 dark:text-[#00e5ff]" />
            <span class="text-xs text-cyan-700 font-bold tracking-widest font-mono uppercase dark:text-[#00e5ff]">
              INTEL & PROTOCOL
            </span>
          </div>
          <h2 class="text-3xl text-slate-900 font-black tracking-tight font-mono md:text-4xl dark:text-white">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p class="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-gray-400">
            Everything you need to know about Stock Royale match rules, risk boundaries, and desktop support.
          </p>
        </div>

        <div class="space-y-3">
          <div
            v-for="(faq, idx) in faqs"
            :key="idx"
            class="shadow-xs border border-slate-200 rounded-xl bg-white/90 transition-all duration-200 dark:border-[#1f2438] dark:bg-[#0c0d14]/80 dark:shadow-none"
          >
            <button
              type="button"
              class="faq-question-btn w-full flex items-center justify-between p-4 text-left text-sm text-slate-800 font-bold font-mono dark:text-gray-200 hover:text-emerald-600 dark:hover:text-[#00e676]"
              @click="toggleFaq(idx)"
            >
              <span>{{ faq.q }}</span>
              <span class="ml-4 text-slate-400 dark:text-gray-400">
                <ChevronUpIcon v-if="openFaqIndex === idx" class="h-4 w-4" />
                <ChevronDownIcon v-else class="h-4 w-4" />
              </span>
            </button>
            <div
              v-if="openFaqIndex === idx"
              :class="`faq-answer-${idx}`"
              class="border-t border-slate-100 px-4 pb-4 pt-3 text-xs text-slate-600 leading-relaxed font-sans dark:border-[#1f2438] dark:text-gray-400"
            >
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
