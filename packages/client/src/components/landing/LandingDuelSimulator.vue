<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Interactive Client-Side 30-Second Duel Mini-Simulator Widget
-->

<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NTag } from 'naive-ui'
import {
  Crosshair as CrosshairIcon,
  Flame as FlameIcon,
  Refresh as RefreshIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Trophy as TrophyIcon,
} from '@vicons/tabler'

interface Position {
  side: 'LONG' | 'SHORT'
  entryPrice: number
  leverage: number
  size: number
}

const props = withDefaults(
  defineProps<{
    initialPrice?: number
    autoStart?: boolean
    durationSeconds?: number
  }>(),
  {
    initialPrice: 130.0,
    autoStart: true,
    durationSeconds: 15,
  },
)

const router = useRouter()
const instance = getCurrentInstance()

const currentPrice = ref<number>(props.initialPrice)
const priceHistory = ref<number[]>([props.initialPrice])
const selectedLeverage = ref<number>(1)
const activePosition = ref<Position | null>(null)
const secondsRemaining = ref<number>(props.durationSeconds)
const isFinished = ref<boolean>(false)
const positionSize = 1000 // $1,000 baseline capital

let tickTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const unrealizedPnl = computed<number>(() => {
  if (!activePosition.value)
    return 0

  const { side, entryPrice, leverage, size } = activePosition.value
  const priceDiff = side === 'LONG'
    ? currentPrice.value - entryPrice
    : entryPrice - currentPrice.value

  const roi = priceDiff / entryPrice
  return roi * size * leverage
})

const formattedPnl = computed<string>(() => {
  const pnl = unrealizedPnl.value
  if (Math.abs(pnl) < 0.001)
    return '$0.00'
  const sign = pnl >= 0 ? '+' : '-'
  return `${sign}$${Math.abs(pnl).toFixed(2)}`
})

const pnlColorClass = computed<string>(() => {
  if (unrealizedPnl.value > 0.001)
    return 'text-emerald-700 dark:text-[#00e676]'
  if (unrealizedPnl.value < -0.001)
    return 'text-rose-700 dark:text-[#ff1744]'
  return 'text-slate-500 dark:text-gray-400'
})

// SVG sparkline path calculation
const sparklinePoints = computed<string>(() => {
  if (priceHistory.value.length < 2)
    return '0,40 300,40'

  const min = Math.min(...priceHistory.value)
  const max = Math.max(...priceHistory.value)
  const range = max - min || 1
  const width = 300
  const height = 80
  const padding = 10

  return priceHistory.value
    .map((p, i) => {
      const x = (i / (priceHistory.value.length - 1)) * width
      const y = height - padding - ((p - min) / range) * (height - padding * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

function stepPrice(newPrice: number) {
  currentPrice.value = Math.round(newPrice * 100) / 100
  priceHistory.value.push(currentPrice.value)
  if (priceHistory.value.length > 30)
    priceHistory.value.shift()
}

function tick() {
  if (isFinished.value)
    return
  // Slight upward drift with random noise
  const delta = (Math.random() - 0.47) * 0.35
  stepPrice(currentPrice.value + delta)
}

function enterPosition(side: 'LONG' | 'SHORT') {
  if (isFinished.value)
    return
  activePosition.value = {
    side,
    entryPrice: currentPrice.value,
    leverage: selectedLeverage.value,
    size: positionSize,
  }
}

function setLeverage(lev: number) {
  selectedLeverage.value = lev
  if (activePosition.value)
    activePosition.value.leverage = lev
}

function finishDuel() {
  isFinished.value = true
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function restartDuel() {
  isFinished.value = false
  currentPrice.value = props.initialPrice
  priceHistory.value = [props.initialPrice]
  activePosition.value = null
  secondsRemaining.value = props.durationSeconds

  if (props.autoStart)
    startTimers()
}

function deployToArena() {
  const r = router || instance?.proxy?.$router
  if (r) {
    r.push('/dashboard/royale')
  }
}

function startTimers() {
  if (tickTimer)
    clearInterval(tickTimer)
  if (countdownTimer)
    clearInterval(countdownTimer)

  tickTimer = setInterval(tick, 200)
  countdownTimer = setInterval(() => {
    if (secondsRemaining.value > 1) {
      secondsRemaining.value--
    }
    else {
      secondsRemaining.value = 0
      finishDuel()
    }
  }, 1000)
}

onMounted(() => {
  if (props.autoStart)
    startTimers()
})

onBeforeUnmount(() => {
  if (tickTimer)
    clearInterval(tickTimer)
  if (countdownTimer)
    clearInterval(countdownTimer)
})

defineExpose({
  selectedLeverage,
  activePosition,
  unrealizedPnl,
  currentPrice,
  isFinished,
  stepPrice,
  finishDuel,
  restartDuel,
})
</script>

<template>
  <section class="landing-duel-simulator px-4 py-16" aria-label="Interactive Duel Simulator">
    <div class="mx-auto max-w-4xl">
      <!-- Section Header -->
      <div class="mb-10 text-center">
        <div class="mb-3 inline-flex items-center gap-2">
          <span class="h-2 w-2 animate-ping rounded-full bg-rose-500 dark:bg-[#ff1744]" />
          <span class="text-xs text-rose-700 font-bold tracking-widest font-mono uppercase dark:text-[#ff1744]">
            TEST YOUR REFLEXES // 30s LIVE DUEL DEMO
          </span>
        </div>
        <h2 class="text-3xl text-slate-900 font-black tracking-tight font-mono md:text-5xl dark:text-white">
          HIGH-FREQUENCY COMBAT SIMULATOR
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-sm text-slate-600 dark:text-gray-400">
          Experience the adrenaline of Stock Royale micro-trading before entering the 60-player arena.
          Lock leverage, pick Long or Short, and capitalize on live ticker swings.
        </p>
      </div>

      <!-- Duel Arena Interactive Card -->
      <NCard
        class="duel-arena-card border border-slate-200 rounded-2xl bg-white/95 shadow-xl backdrop-blur-xl dark:border-[#1f2438] dark:bg-[#0c0d14]/95 dark:shadow-2xl"
        size="large"
      >
        <!-- Opponent Banner & Timer HUD -->
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-[#1f2438]">
          <!-- Opponent Profile -->
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 flex items-center justify-center border border-rose-500/40 rounded-lg bg-rose-50 text-rose-600 dark:border-[#ff1744]/40 dark:bg-[#ff1744]/10 dark:text-[#ff1744]">
              <FlameIcon class="h-5 w-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-900 font-bold font-mono dark:text-white">ApexBot_7</span>
                <NTag size="small" type="error" :bordered="false" class="text-[10px] font-mono uppercase">
                  DIAMOND III
                </NTag>
              </div>
              <div class="text-[11px] text-slate-500 font-mono dark:text-gray-400">
                Opponent • Contesting AI Semiconductors
              </div>
            </div>
          </div>

          <!-- Countdown Timer -->
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-[10px] text-slate-500 font-medium tracking-wider font-mono uppercase dark:text-gray-400">
                ROUND TIMER
              </div>
              <div class="text-lg text-amber-600 font-black font-mono dark:text-[#ff9100]">
                0:{{ secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining }}
              </div>
            </div>
            <div class="h-8 w-[1px] bg-slate-200 dark:bg-[#1f2438]" />
            <!-- Ticker Badge -->
            <div class="shadow-xs border border-slate-200 rounded-lg bg-slate-50 px-3 py-1.5 dark:border-[#1f2438] dark:bg-[#121526]">
              <span class="text-xs text-emerald-700 font-bold font-mono dark:text-emerald-400">NVDA</span>
              <span class="ml-2 text-xs text-slate-700 font-mono dark:text-gray-300">${{ currentPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Price Chart & PnL HUD Grid -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Sparkline Chart (2 Cols) -->
          <div class="relative flex flex-col justify-between border border-slate-200 rounded-xl bg-slate-50/90 p-4 shadow-sm lg:col-span-2 dark:border-[#1f2438] dark:bg-[#08090f]">
            <div class="mb-2 flex items-center justify-between text-xs text-slate-600 font-mono dark:text-gray-400">
              <span class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-cyan-500 dark:bg-[#00e5ff]" />
                LIVE 10Hz TICK STREAM
              </span>
              <span class="text-slate-900 font-bold font-mono dark:text-gray-300">${{ currentPrice.toFixed(2) }}</span>
            </div>

            <!-- SVG Sparkline -->
            <div class="h-32 w-full flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 300 80" class="h-full w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="duelGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#00e5ff" stop-opacity="0.0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  class="stroke-cyan-600 dark:stroke-[#00e5ff]"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :points="sparklinePoints"
                />
              </svg>
            </div>

            <div class="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono dark:text-gray-500">
              <span>T-15s</span>
              <span>NOW</span>
            </div>
          </div>

          <!-- Position & P&L Status Panel -->
          <div class="flex flex-col justify-between border border-slate-200 rounded-xl bg-slate-50/90 p-4 shadow-sm dark:border-[#1f2438] dark:bg-[#121526]/80">
            <div>
              <div class="text-[10px] text-slate-500 font-medium tracking-wider font-mono uppercase dark:text-gray-400">
                UNREALIZED P&L
              </div>
              <div
                class="mt-1 text-3xl font-black font-mono"
                :class="pnlColorClass"
                data-metric="pnl"
              >
                {{ formattedPnl }}
              </div>
            </div>

            <div class="my-4 border-y border-slate-200 py-3 text-xs font-mono space-y-2 dark:border-[#1f2438]">
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-gray-400">Position:</span>
                <span class="text-slate-900 font-bold dark:text-white">
                  {{ activePosition ? `${activePosition.side} (${activePosition.leverage}x)` : 'STANDBY' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-gray-400">Capital At Risk:</span>
                <span class="text-slate-700 font-mono dark:text-gray-300">${{ activePosition ? (activePosition.size).toFixed(2) : '1,000.00' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-gray-400">Entry Price:</span>
                <span class="text-slate-700 font-mono dark:text-gray-300">
                  {{ activePosition ? `$${activePosition.entryPrice.toFixed(2)}` : '—' }}
                </span>
              </div>
            </div>

            <!-- Leverage Selector -->
            <div>
              <div class="mb-2 text-[10px] text-slate-500 font-medium tracking-wider font-mono uppercase dark:text-gray-400">
                LEVERAGE MULTIPLIER
              </div>
              <div class="grid grid-cols-4 gap-1.5">
                <button
                  v-for="lev in [1, 2, 3, 5]"
                  :key="lev"
                  type="button"
                  class="border rounded-lg py-1 text-xs font-bold font-mono transition-all"
                  :class="selectedLeverage === lev
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-[#00e676] dark:bg-[#00e676]/20 dark:text-[#00e676]'
                    : 'border-slate-200 bg-white text-slate-600 dark:border-[#1f2438] dark:bg-[#0c0d14] dark:text-gray-400 hover:border-slate-400 dark:hover:border-gray-600'"
                  :data-leverage="lev"
                  @click="setLeverage(lev)"
                >
                  {{ lev }}x
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Duel Execution Controls -->
        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <NButton
            type="primary"
            size="large"
            block
            class="duel-action-btn flex-1 py-6 text-sm font-black font-mono shadow-md"
            data-action="long"
            :disabled="isFinished"
            @click="enterPosition('LONG')"
          >
            <template #icon>
              <TrendingUpIcon />
            </template>
            LONG (BUY VOLATILITY)
          </NButton>

          <NButton
            type="error"
            size="large"
            block
            class="duel-action-btn flex-1 py-6 text-sm font-black font-mono shadow-md"
            data-action="short"
            :disabled="isFinished"
            @click="enterPosition('SHORT')"
          >
            <template #icon>
              <TrendingDownIcon />
            </template>
            SHORT (SELL VOLATILITY)
          </NButton>
        </div>

        <!-- Victory Banner / Outcome Modal -->
        <div
          v-if="isFinished"
          class="victory-banner mt-6 animate-fade-in border border-emerald-500/40 rounded-xl from-emerald-50 via-teal-50 to-emerald-50 bg-gradient-to-r p-6 text-center shadow-lg dark:from-[#00e676]/15 dark:via-[#00e5ff]/10 dark:to-[#00e676]/15 dark:shadow-[0_0_40px_rgba(0,230,118,0.2)]"
        >
          <div class="mb-2 inline-flex items-center gap-2 text-emerald-700 dark:text-[#00e676]">
            <TrophyIcon class="h-6 w-6" />
            <span class="text-lg font-black tracking-wider font-mono uppercase">
              VICTORY! LOOT SECURED
            </span>
          </div>

          <p class="mb-4 text-xs text-slate-700 font-mono dark:text-gray-300">
            Opponent <span class="text-slate-900 font-bold dark:text-white">ApexBot_7</span> eliminated!
            Final Delta: <span class="font-bold" :class="pnlColorClass">{{ formattedPnl }}</span>
          </p>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <NButton
              type="primary"
              size="medium"
              round
              class="deploy-arena-btn font-bold font-mono shadow-emerald-600/30 shadow-lg hover:scale-105 dark:shadow-emerald-500/30"
              @click="deployToArena"
            >
              <template #icon>
                <CrosshairIcon />
              </template>
              Deploy to Live 60-Player Arena
            </NButton>

            <NButton
              size="medium"
              round
              secondary
              class="restart-duel-btn text-xs text-slate-700 font-mono dark:text-gray-300"
              @click="restartDuel"
            >
              <template #icon>
                <RefreshIcon />
              </template>
              Play Again
            </NButton>
          </div>
        </div>
      </NCard>
    </div>
  </section>
</template>

<style scoped>
.landing-duel-simulator {
  perspective: 1000px;
}
</style>
