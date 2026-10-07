<script setup lang="ts">
/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Post-Match Victory & Rocket League Ranked Progression Modal for Fintasy Stock Royale
 */

import { computed } from 'vue'
import { formatCentsToUsd } from '~/composables/useRoyaleMatch'
import type { MatchOverEventPayload, RankTier } from '~/types/royale'

const props = withDefaults(
  defineProps<{
    isOpen?: boolean
    matchResult?: MatchOverEventPayload | null
    userUuid?: string
    isSpectating?: boolean
  }>(),
  {
    isOpen: false,
    matchResult: null,
    userUuid: '',
    isSpectating: false,
  },
)

const emit = defineEmits<{
  (e: 'playAgain'): void
  (e: 'spectateMatch'): void
  (e: 'exitMatch'): void
  (e: 'close'): void
}>()

const localParticipant = computed(() => {
  if (!props.matchResult || !props.userUuid)
    return null
  return props.matchResult.finalPlacements.find(p => p.uuid === props.userUuid) ?? null
})

const isWinner = computed(() => {
  if (!props.matchResult)
    return false
  return props.matchResult.winnerUuid === props.userUuid
})

const placement = computed(() => {
  if (isWinner.value)
    return 1
  return localParticipant.value?.placement ?? 2
})

const kills = computed(() => {
  return localParticipant.value?.kills ?? 0
})

const netProfitCents = computed(() => {
  return localParticipant.value?.netProfitCents ?? 0
})

const userRankResult = computed(() => {
  return props.matchResult?.userResult ?? null
})

function getRankTierColor(tier?: RankTier): string {
  switch (tier) {
    case 'BRONZE':
      return 'text-amber-600 border-amber-600/50'
    case 'SILVER':
      return 'text-slate-300 border-slate-300/50'
    case 'GOLD':
      return 'text-yellow-400 border-yellow-400/50'
    case 'PLATINUM':
      return 'text-cyan-400 border-cyan-400/50'
    case 'DIAMOND':
      return 'text-blue-400 border-blue-400/50'
    case 'CHAMPION':
      return 'text-purple-400 border-purple-400/50'
    case 'GRAND_CHAMPION':
      return 'text-rose-500 border-rose-500/50'
    case 'SUPERSONIC_LEGEND':
      return 'text-white border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.4)]'
    default:
      return 'text-yellow-400 border-yellow-400/50'
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono backdrop-blur-md"
    data-testid="match-victory-modal"
  >
    <div
      class="relative max-w-xl w-full border border-slate-700/80 rounded-2xl bg-[#090d16] p-6 text-slate-100 shadow-2xl"
      :class="isWinner ? 'border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.25)]' : 'border-slate-800'"
    >
      <!-- Close button in top-right -->
      <button
        type="button"
        class="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        aria-label="Close modal"
        data-testid="modal-close-btn"
        @click="emit('close')"
      >
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Header Celebration -->
      <div class="text-center">
        <template v-if="isWinner">
          <div class="mb-2 inline-flex items-center justify-center border border-amber-400/40 rounded-full bg-amber-500/10 p-3 text-3xl">
            👑
          </div>
          <h2
            class="text-3xl text-amber-400 font-black tracking-widest uppercase md:text-4xl"
            data-testid="victory-royale-title"
          >
            #1 VICTORY ROYALE
          </h2>
          <p class="mt-1 text-sm text-amber-200/80">
            Sole Surviving Alpha Trader in the Market Finals
          </p>
        </template>
        <template v-else>
          <div class="mb-2 inline-flex items-center justify-center border border-slate-700 rounded-full bg-slate-800/50 p-3 text-2xl">
            🎯
          </div>
          <h2
            class="text-2xl text-slate-200 font-black tracking-wider uppercase md:text-3xl"
            data-testid="placement-title"
          >
            #{{ placement }} PLACEMENT
          </h2>
          <p class="mt-1 text-sm text-slate-400">
            Winner: <span class="text-amber-400 font-bold">{{ matchResult?.winnerUsername ?? 'Unknown' }}</span>
          </p>
        </template>
      </div>

      <!-- Rocket League Ranked Progression Section -->
      <div
        v-if="userRankResult"
        class="mt-6 border border-slate-800 rounded-xl bg-slate-900/60 p-4"
        data-testid="ranked-progression-section"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Rank Tier Badge -->
            <div
              class="h-11 w-11 flex items-center justify-center border-2 rounded-lg bg-[#0d1424] font-extrabold"
              :class="getRankTierColor(userRankResult.newRankTier)"
              data-testid="rank-tier-badge"
            >
              {{ userRankResult.newRankTier.substring(0, 2) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-base font-bold tracking-wide" data-testid="rank-tier-name">
                  {{ userRankResult.newRankTier }} {{ userRankResult.newDivision }}
                </span>
                <span
                  v-if="userRankResult.isPromotion"
                  class="border border-emerald-500/60 rounded bg-emerald-950/60 px-1.5 py-0.5 text-[10px] text-emerald-300 font-extrabold uppercase"
                  data-testid="promotion-badge"
                >
                  PROMOTED!
                </span>
                <span
                  v-else-if="userRankResult.isDemotion"
                  class="border border-rose-500/60 rounded bg-rose-950/60 px-1.5 py-0.5 text-[10px] text-rose-300 font-extrabold uppercase"
                  data-testid="demotion-badge"
                >
                  DEMOTED
                </span>
              </div>
              <div class="text-xs text-slate-400">
                Competitive Division MMR
              </div>
            </div>
          </div>

          <!-- RP Delta Chip -->
          <div
            class="border rounded-lg px-2.5 py-1 text-right"
            :class="userRankResult.rpDelta >= 0 ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400' : 'border-rose-500/40 bg-rose-950/30 text-rose-400'"
            data-testid="rp-delta-chip"
          >
            <div class="text-xs font-black">
              {{ userRankResult.rpDelta >= 0 ? `+${userRankResult.rpDelta}` : userRankResult.rpDelta }} RP
            </div>
            <div class="text-[10px] text-slate-400">
              {{ userRankResult.newRp }} Total RP
            </div>
          </div>
        </div>

        <!-- RP Breakdown Grid -->
        <div class="grid grid-cols-3 mt-3 gap-2 border-t border-slate-800/80 pt-3 text-xs">
          <div class="rounded bg-slate-950/40 p-1.5">
            <span class="text-[10px] text-slate-400">Placement</span>
            <div class="text-slate-200 font-bold">
              +{{ userRankResult.placementBonusRp }} RP
            </div>
          </div>
          <div class="rounded bg-slate-950/40 p-1.5">
            <span class="text-[10px] text-slate-400">Eliminations</span>
            <div class="text-slate-200 font-bold">
              +{{ userRankResult.killBonusRp }} RP
            </div>
          </div>
          <div class="rounded bg-slate-950/40 p-1.5">
            <span class="text-[10px] text-slate-400">Alpha P&L</span>
            <div class="text-slate-200 font-bold">
              +{{ userRankResult.profitBonusRp }} RP
            </div>
          </div>
        </div>
      </div>

      <!-- Match Performance Stats -->
      <div class="grid grid-cols-3 mt-4 gap-2 text-center" data-testid="match-stats-grid">
        <div class="border border-slate-800/60 rounded-lg bg-slate-900/40 p-2.5">
          <div class="text-[10px] text-slate-400 tracking-wider uppercase">
            Placement
          </div>
          <div class="mt-0.5 text-lg text-slate-100 font-bold">
            #{{ placement }}
          </div>
        </div>
        <div class="border border-slate-800/60 rounded-lg bg-slate-900/40 p-2.5">
          <div class="text-[10px] text-slate-400 tracking-wider uppercase">
            Liquidations
          </div>
          <div class="mt-0.5 text-lg text-rose-400 font-bold">
            {{ kills }}
          </div>
        </div>
        <div class="border border-slate-800/60 rounded-lg bg-slate-900/40 p-2.5">
          <div class="text-[10px] text-slate-400 tracking-wider uppercase">
            Net P&L
          </div>
          <div
            class="mt-0.5 text-lg font-bold"
            :class="netProfitCents >= 0 ? 'text-emerald-400' : 'text-rose-400'"
          >
            {{ netProfitCents > 0 ? `+${formatCentsToUsd(netProfitCents)}` : formatCentsToUsd(netProfitCents) }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          class="flex-1 rounded-xl bg-amber-400 py-3 text-slate-900 font-bold tracking-wider uppercase transition-all active:scale-98 hover:bg-amber-300"
          data-testid="play-again-btn"
          @click="emit('playAgain')"
        >
          🎮 Play Again
        </button>

        <button
          v-if="isSpectating"
          type="button"
          class="flex-1 border border-cyan-500/50 rounded-xl bg-cyan-950/40 py-3 text-cyan-300 font-bold tracking-wider uppercase transition-all active:scale-98 hover:bg-cyan-900/50"
          data-testid="spectate-match-btn"
          @click="emit('spectateMatch')"
        >
          👁️ Spectate
        </button>

        <button
          type="button"
          class="flex-1 border border-slate-700 rounded-xl bg-slate-800/80 py-3 text-slate-300 font-bold tracking-wider uppercase transition-all active:scale-98 hover:bg-slate-700"
          data-testid="exit-match-btn"
          @click="emit('exitMatch')"
        >
          Exit to Lobby
        </button>
      </div>
    </div>
  </div>
</template>
