<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Stock Royale Tactical Command Center & Battle Royale Arena Page
-->

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NButton,
  NCard,
  NGrid,
  NGridItem,
  NIcon,
  NTag,
} from 'naive-ui'
import { Crosshair, Flame, Shield, Trophy } from '@vicons/tabler'
import { useRoyaleMatch } from '~/composables/useRoyaleMatch'
import {
  MarketSector,
  type SectorStatus,
  type StormState,
} from '~/types/royale'

useHead({
  title: 'Stock Royale • Fintasy',
})

// Initialize Royale match composable
const {
  currentMatchId,
  currentUserUuid,
  matchState,
  killFeed,
  activeDuel,
  isSpectating,
  matchResult,
  isVictoryModalOpen,
  connect,
  disconnect,
  dismissVictoryModal,
} = useRoyaleMatch({
  userUuid: 'user-pilot-01',
})

const inMatch = ref(false)
const selectedSector = ref<string>(MarketSector.SEMIS_AI)
const activeDuelState = ref(false)

// Tactical radar state computed or mocked for offline/preview mode
const radarSectorStates = computed<Record<string, SectorStatus>>(() => {
  if (matchState.value?.sectors)
    return matchState.value.sectors as Record<string, SectorStatus>
  return {
    [MarketSector.UTILITIES]: 'CLOSED',
    [MarketSector.REAL_ESTATE]: 'CLOSED',
    [MarketSector.MATERIALS]: 'SAFE',
    [MarketSector.INDUSTRIALS]: 'SAFE',
    [MarketSector.HEALTHCARE]: 'SAFE',
    [MarketSector.FINANCIALS]: 'SAFE',
    [MarketSector.ENERGY]: 'SAFE',
    [MarketSector.CONSUMER]: 'SAFE',
    [MarketSector.BIOTECH]: 'SAFE',
    [MarketSector.MEME_ALPHA]: 'SAFE',
    [MarketSector.BIG_TECH]: 'SAFE',
    [MarketSector.SEMIS_AI]: 'SAFE',
  }
})

const radarPlayerDist = computed<Record<string, number>>(() => {
  const dist: Record<string, number> = {}
  if (matchState.value) {
    for (const p of Object.values(matchState.value.participants)) {
      if (p.activeSector)
        dist[p.activeSector] = (dist[p.activeSector] || 0) + 1
    }
  }
  else {
    dist[MarketSector.SEMIS_AI] = 8
    dist[MarketSector.BIG_TECH] = 12
    dist[MarketSector.FINANCIALS] = 5
    dist[MarketSector.ENERGY] = 4
  }
  return dist
})

const currentStorm = computed<StormState>(() => {
  if (matchState.value?.storm)
    return matchState.value.storm
  return {
    round: 2,
    totalRounds: 5,
    phase: 'SAFE',
    secondsRemaining: 45,
    damageRateCentsPerSec: 2500, // $25.00/sec
    safeSectorIds: [MarketSector.SEMIS_AI, MarketSector.BIG_TECH],
    collapsingSectorIds: [MarketSector.ENERGY],
  }
})

function handleDeployMatch() {
  inMatch.value = true
  const randomMatchId = `match-${Math.floor(1000 + Math.random() * 9000)}`
  currentMatchId.value = randomMatchId
  connect(randomMatchId)
}

function handleExitMatch() {
  inMatch.value = false
  activeDuelState.value = false
  disconnect()
}

function handleSelectSector(sectorId: string) {
  selectedSector.value = sectorId
}

function handleRotateSector(sectorId: string) {
  selectedSector.value = sectorId
}

function handleToggleDuel() {
  activeDuelState.value = !activeDuelState.value
}
</script>

<template>
  <div class="royale-dashboard p-4 space-y-4 md:p-6">
    <!-- Tactical Top Bar HUD -->
    <NCard size="small" class="border-emerald-900/60 bg-dark-800 shadow-lg">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 flex items-center justify-center border border-emerald-500/40 rounded bg-emerald-500/10 text-emerald-400">
            <NIcon size="24">
              <Crosshair />
            </NIcon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl text-emerald-400 font-bold tracking-wider font-mono">
                STOCK ROYALE
              </h1>
              <NTag size="small" type="success" round>
                SEASON 1
              </NTag>
            </div>
            <div class="text-xs text-zinc-400 font-mono">
              60-TRADER MARKET BATTLE ROYALE • APEX MMR TIER
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 text-sm font-mono">
          <div class="flex items-center gap-1.5 border border-zinc-800 rounded bg-dark-900 px-3 py-1.5">
            <NIcon class="text-amber-400">
              <Trophy />
            </NIcon>
            <span class="text-zinc-400">RANK:</span>
            <span class="text-amber-400 font-bold">GOLD I (Div III)</span>
          </div>

          <div class="flex items-center gap-1.5 border border-zinc-800 rounded bg-dark-900 px-3 py-1.5">
            <NIcon class="text-emerald-400">
              <Shield />
            </NIcon>
            <span class="text-zinc-400">CAPITAL:</span>
            <span class="text-emerald-400 font-bold">$15,000.00</span>
          </div>

          <div class="flex items-center gap-1.5">
            <span
              class="h-2.5 w-2.5 rounded-full"
              :class="inMatch ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'"
            />
            <span class="text-xs text-zinc-400">
              {{ inMatch ? 'ACTIVE BATTLE' : 'STANDBY' }}
            </span>
          </div>
        </div>
      </div>
    </NCard>

    <!-- Main View: Standby Lobby vs Tactical Match Surface -->
    <div v-if="!inMatch" class="lobby-launcher">
      <NGrid :cols="1" responsive="screen" :x-gap="16" :y-gap="16">
        <NGridItem :span="1">
          <NCard class="border-zinc-800 bg-dark-900 px-6 py-10 text-center">
            <div class="mx-auto max-w-2xl space-y-6">
              <div class="inline-flex border border-emerald-500/30 rounded-full bg-emerald-500/10 p-4 text-emerald-400">
                <NIcon size="48">
                  <Flame />
                </NIcon>
              </div>

              <div>
                <h2 class="text-3xl text-zinc-100 font-extrabold tracking-tight">
                  Deploy Into The Market Arena
                </h2>
                <p class="mt-2 text-sm text-zinc-400 leading-relaxed">
                  Drop into 12 market sectors, loot high-beta tickers, execute 30-second trading duels at 5x leverage, and survive shrinking sector storms to claim #1 Victory Royale.
                </p>
              </div>

              <div class="grid grid-cols-1 gap-4 pt-4 text-left text-xs font-mono md:grid-cols-3">
                <div class="border border-zinc-800/80 rounded bg-dark-800 p-3">
                  <div class="text-zinc-400">
                    LOBBY SIZE
                  </div>
                  <div class="mt-1 text-lg text-emerald-400 font-bold">
                    60 Traders
                  </div>
                  <div class="mt-0.5 text-[10px] text-zinc-500">
                    Human + Scalper/Swing/Degen Bots
                  </div>
                </div>

                <div class="border border-zinc-800/80 rounded bg-dark-800 p-3">
                  <div class="text-zinc-400">
                    STARTING POT
                  </div>
                  <div class="mt-1 text-lg text-emerald-400 font-bold">
                    $15,000.00
                  </div>
                  <div class="mt-0.5 text-[10px] text-zinc-500">
                    Strict Integer Cents (INV-1)
                  </div>
                </div>

                <div class="border border-zinc-800/80 rounded bg-dark-800 p-3">
                  <div class="text-zinc-400">
                    MATCH DURATION
                  </div>
                  <div class="mt-1 text-lg text-amber-400 font-bold">
                    6 Minutes
                  </div>
                  <div class="mt-0.5 text-[10px] text-zinc-500">
                    5 Rounds • 10 Hz Market Ticks
                  </div>
                </div>
              </div>

              <div class="pt-4">
                <NButton
                  type="primary"
                  size="large"
                  class="w-full font-bold tracking-wide md:w-64"
                  @click="handleDeployMatch"
                >
                  <template #icon>
                    <NIcon><Crosshair /></NIcon>
                  </template>
                  DEPLOY STOCK ROYALE
                </NButton>
              </div>
            </div>
          </NCard>
        </NGridItem>
      </NGrid>
    </div>

    <!-- Active Tactical Surface -->
    <div v-else class="tactical-arena grid grid-cols-1 gap-4 xl:grid-cols-12">
      <!-- Sector Radar & Storm Navigation (Col 7/12) -->
      <div class="xl:col-span-7 space-y-4">
        <NCard size="small" class="border-zinc-800 bg-dark-900">
          <template #header>
            <div class="flex items-center justify-between text-xs text-zinc-300 font-mono">
              <span>MARKET SECTOR RADAR • FOOTBALL MANAGER TACTICAL</span>
              <div class="flex items-center gap-2">
                <NButton size="tiny" secondary type="warning" @click="handleToggleDuel">
                  {{ activeDuelState ? 'Close Combat Arena' : 'Test Combat Duel' }}
                </NButton>
                <NButton size="tiny" secondary type="error" @click="handleExitMatch">
                  Exit Match
                </NButton>
              </div>
            </div>
          </template>

          <div class="flex justify-center p-2">
            <MarketRadarMap
              :current-sector="selectedSector"
              :sector-states="radarSectorStates"
              :player-distribution="radarPlayerDist"
              :storm-state="currentStorm"
              @select-sector="handleSelectSector"
              @rotate-sector="handleRotateSector"
            />
          </div>
        </NCard>
      </div>

      <!-- Combat Arena & Tactical Kill Feed (Col 5/12) -->
      <div class="xl:col-span-5 space-y-4">
        <!-- Live Trading Duel Arena Component (renders when duel is active) -->
        <div v-if="activeDuelState || activeDuel" class="duel-section">
          <TradingDuelArena
            :duel-id="activeDuel?.duelId || 'duel-001'"
            :ticker="activeDuel?.ticker || 'NVDA'"
            :sector="activeDuel?.sector || selectedSector"
            :duration-seconds="30"
          />
        </div>

        <!-- Kill Feed & Liquidation Ticker -->
        <div class="kill-feed-section">
          <KillFeed :events="killFeed" />
        </div>
      </div>
    </div>

    <!-- Post-Match Victory Crest Modal -->
    <MatchVictoryModal
      :is-open="isVictoryModalOpen"
      :match-result="matchResult"
      :user-uuid="currentUserUuid"
      :is-spectating="isSpectating"
      @play-again="handleDeployMatch"
      @exit-match="handleExitMatch"
      @close="dismissVictoryModal"
    />
  </div>
</template>

<style scoped>
.royale-dashboard {
  min-height: calc(100vh - 80px);
}
</style>

<route lang="yaml">
meta:
  layout: dashboard
</route>
