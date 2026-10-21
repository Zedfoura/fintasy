<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Live Trading Duel Arena HUD & Split-Screen Combat Terminal in Football Manager tactical theme
-->

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type {
  DuelLeverage,
  DuelOrderPayload,
  DuelParticipant,
  DuelPhase,
  DuelSide,
} from '~/types/royale'

const props = withDefaults(
  defineProps<{
    duelId?: string
    ticker?: string
    sector?: string
    phase?: DuelPhase
    secondsRemaining?: number
    durationSeconds?: number
    currentPriceCents?: number
    priceHistoryCents?: number[]
    participants?: DuelParticipant[]
    thirdPartyAlert?: string | null
    bountyCents?: number
  }>(),
  {
    duelId: 'duel-001',
    ticker: 'NVDA',
    sector: 'SEMIS_AI',
    phase: 'ACTIVE',
    secondsRemaining: 30,
    durationSeconds: 30,
    currentPriceCents: 13000,
    priceHistoryCents: () => [12950, 12980, 13020, 12990, 13010, 13040, 13000],
    participants: () => [
      {
        userUuid: 'user-local',
        username: 'You',
        isLocalUser: true,
        equityCents: 1500000,
        position: null,
        netProfitCents: 0,
        roiPercent: 0,
        isBusted: false,
      },
      {
        userUuid: 'user-opponent-1',
        username: 'ScalperBot_1',
        isLocalUser: false,
        equityCents: 1500000,
        position: null,
        netProfitCents: 0,
        roiPercent: 0,
        isBusted: false,
      },
    ],
    thirdPartyAlert: null,
    bountyCents: 375000,
  },
)

const emit = defineEmits<{
  (e: 'executeOrder', payload: DuelOrderPayload): void
  (e: 'closePosition'): void
}>()

const selectedLeverage = ref<DuelLeverage>(1)
const orderQuantity = ref<number>(10)
const chartCanvasRef = ref<HTMLCanvasElement | null>(null)
const chartAnimId: number | null = null

// Participants breakdown
const localParticipant = computed<DuelParticipant | undefined>(() =>
  props.participants.find(p => p.isLocalUser),
)

// Formatting utilities (Zero Floating-Point Fidelity)
function formatCentsToUsd(cents: number): string {
  const isNegative = cents < 0
  const absDollars = (Math.abs(cents) / 100).toFixed(2)
  return `${isNegative ? '-' : ''}$${absDollars}`
}

function formatCentsWithSign(cents: number): string {
  const sign = cents > 0 ? '+' : cents < 0 ? '-' : ''
  const absDollars = (Math.abs(cents) / 100).toFixed(2)
  return `${sign}$${absDollars}`
}

function formatCentsWhole(cents: number): string {
  const dollars = Math.round(cents / 100)
  return `$${dollars.toLocaleString('en-US')}`
}

// Timer calculations
const timerProgressPercent = computed(() => {
  if (props.durationSeconds <= 0)
    return 0
  return Math.max(0, Math.min(100, (props.secondsRemaining / props.durationSeconds) * 100))
})

const formattedCountdown = computed(() => {
  const secs = Math.max(0, props.secondsRemaining)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

// Auto-liquidation margin depletion gauge
// In Stock Royale, 90% margin depletion triggers auto-liquidation BUST
const marginDepletionPercent = computed(() => {
  const local = localParticipant.value
  if (!local || !local.position || local.netProfitCents >= 0)
    return 0
  const initialMarginCents = (local.position.entryPriceCents * local.position.quantity) / local.position.leverage
  if (initialMarginCents <= 0)
    return 0
  const lossCents = Math.abs(local.netProfitCents)
  const depletion = (lossCents / (initialMarginCents * 0.90)) * 100
  return Math.min(100, Math.round(depletion))
})

const isCriticalMarginRisk = computed(() => marginDepletionPercent.value >= 70)

// Action Horizon countdown styling (Cyan > 10s, Safety Orange <= 10s, Crimson <= 3s)
const countdownClass = computed(() => {
  if (props.secondsRemaining <= 3)
    return 'text-rose-500 animate-pulse'
  if (props.secondsRemaining <= 10)
    return 'text-[#FF5522] animate-pulse'
  return 'text-cyan-400'
})

const timerProgressClass = computed(() => {
  if (props.secondsRemaining <= 3)
    return 'bg-rose-500 animate-pulse'
  if (props.secondsRemaining <= 10)
    return 'bg-[#FF5522] animate-pulse'
  return 'bg-cyan-400'
})

// Graduated 90% auto-liquidation meter color (Emerald 0-50%, Amber 50-69%, Safety Orange 70-84%, Crimson 85%+)
const marginMeterColorClass = computed(() => {
  const val = marginDepletionPercent.value
  if (val >= 85)
    return 'bg-rose-500 animate-pulse'
  if (val >= 70)
    return 'bg-[#FF5522] animate-pulse'
  if (val >= 50)
    return 'bg-amber-400'
  return 'bg-emerald-500'
})

// Winner attribution
const victor = computed(() => {
  if (props.phase !== 'CONCLUDED')
    return null
  const eligible = props.participants.filter(p => !p.isBusted)
  if (eligible.length === 0)
    return null
  return eligible.reduce((prev, curr) => (curr.roiPercent > prev.roiPercent ? curr : prev), eligible[0])
})

function handleExecute(side: DuelSide) {
  if (props.phase !== 'ACTIVE')
    return
  if (localParticipant.value?.position)
    return
  emit('executeOrder', {
    side,
    leverage: selectedLeverage.value,
    quantity: orderQuantity.value,
  })
}

function handleClose() {
  if (props.phase !== 'ACTIVE')
    return
  emit('closePosition')
}

// HTML5 Canvas Price Chart
function drawChart() {
  const canvas = chartCanvasRef.value
  if (!canvas)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const width = canvas.width / dpr
  const height = canvas.height / dpr

  ctx.clearRect(0, 0, width, height)

  const data = props.priceHistoryCents
  if (data.length < 2)
    return

  const minPrice = Math.min(...data) * 0.999
  const maxPrice = Math.max(...data) * 1.001
  const range = maxPrice - minPrice || 1

  const padding = { top: 15, bottom: 20, left: 10, right: 10 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  // Gradient background area
  const isUp = data[data.length - 1] >= data[0]
  const lineColor = isUp ? '#10b981' : '#f43f5e'

  const points = data.map((price, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW
    const y = padding.top + chartH - ((price - minPrice) / range) * chartH
    return { x, y }
  })

  // Area fill
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++)
    ctx.lineTo(points[i].x, points[i].y)
  ctx.lineTo(points[points.length - 1].x, height - padding.bottom)
  ctx.lineTo(points[0].x, height - padding.bottom)
  ctx.closePath()

  const areaGradient = ctx.createLinearGradient(0, padding.top, 0, height)
  areaGradient.addColorStop(0, isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)')
  areaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = areaGradient
  ctx.fill()

  // Price line
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++)
    ctx.lineTo(points[i].x, points[i].y)
  ctx.strokeStyle = lineColor
  ctx.lineWidth = 2
  ctx.stroke()

  // Entry price dashed reference line (if position open)
  const pos = localParticipant.value?.position
  if (pos) {
    const entryY = padding.top + chartH - ((pos.entryPriceCents - minPrice) / range) * chartH
    ctx.beginPath()
    ctx.setLineDash([4, 4])
    ctx.moveTo(padding.left, entryY)
    ctx.lineTo(width - padding.right, entryY)
    ctx.strokeStyle = '#06b6d4'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.setLineDash([])

    ctx.font = '9px monospace'
    ctx.fillStyle = '#06b6d4'
    ctx.fillText(`ENTRY ${formatCentsToUsd(pos.entryPriceCents)}`, width - 80, entryY - 4)
  }

  // Current price point pulsing dot
  const last = points[points.length - 1]
  ctx.beginPath()
  ctx.arc(last.x, last.y, 4, 0, 2 * Math.PI)
  ctx.fillStyle = lineColor
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

onMounted(() => {
  const canvas = chartCanvasRef.value
  if (canvas) {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    const ctx = canvas.getContext('2d')
    if (ctx)
      ctx.scale(dpr, dpr)
    drawChart()
  }
})

onBeforeUnmount(() => {
  if (chartAnimId && typeof window !== 'undefined')
    window.cancelAnimationFrame(chartAnimId)
})

watch(
  () => [props.currentPriceCents, props.priceHistoryCents, localParticipant.value?.position],
  () => {
    drawChart()
  },
  { deep: true },
)
</script>

<template>
  <div
    class="flex flex-col overflow-hidden border border-white/10 rounded-xl bg-[#07090E] p-4 text-slate-100 font-mono"
    data-test="trading-duel-arena"
  >
    <!-- TOP COMBAT TELEMETRY BAR -->
    <div class="mb-4 border-b border-white/10 pb-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Sector & Ticker Focus -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 animate-pulse rounded-full bg-[#FF5522]" />
            <span class="text-xs text-[#FF5522] font-black tracking-wider uppercase">TRADING DUEL ARENA</span>
          </div>
          <span class="border border-white/10 rounded bg-[#0E121B] px-2 py-0.5 text-xs text-slate-300 font-bold">
            {{ sector }}
          </span>
          <span class="border border-cyan-500/40 rounded bg-cyan-950/40 px-2 py-0.5 text-xs text-cyan-300 font-bold">
            FOCUS: {{ ticker }}
          </span>
        </div>

        <!-- Bounty Pot & Countdown Clock -->
        <div class="flex items-center gap-5">
          <div class="flex items-center gap-1.5 border border-amber-500/30 rounded bg-amber-950/30 px-3 py-1">
            <span class="text-xs text-amber-400">🏆 BOUNTY POT:</span>
            <span class="text-sm text-amber-300 font-bold font-mono tabular-nums" data-test="bounty-pot">
              {{ formatCentsWhole(bountyCents) }}
            </span>
          </div>

          <div class="flex flex-col items-end">
            <span class="text-[10px] text-slate-400 tracking-wider uppercase">CLOCK EXPIRY</span>
            <span
              class="text-xl font-black tracking-widest font-mono tabular-nums"
              :class="countdownClass"
              data-test="duel-clock"
            >
              {{ formattedCountdown }}
            </span>
          </div>
        </div>
      </div>

      <!-- Linear Countdown Bar (Action Horizon) -->
      <div class="mt-2.5 h-1.5 w-full overflow-hidden border border-white/5 rounded-full bg-[#151C2B]">
        <div
          class="h-full transition-all duration-300 ease-linear"
          :class="timerProgressClass"
          :style="{ width: `${timerProgressPercent}%` }"
          data-test="countdown-progress-bar"
        />
      </div>

      <!-- THIRD-PARTY ESCALATION BANNER -->
      <div
        v-if="participants.length > 2 || thirdPartyAlert"
        class="mt-2.5 flex animate-pulse items-center justify-between border border-[#FF5522]/80 rounded bg-[#FF5522]/15 px-3 py-1.5 text-xs text-[#FF5522] font-bold shadow-lg"
        data-test="third-party-alert-banner"
      >
        <div class="flex items-center gap-2">
          <span>⚠️</span>
          <span>THIRD-PARTY ESCALATION: {{ thirdPartyAlert || `${participants.length}-WAY BATTLE ACTIVE!` }}</span>
        </div>
        <span class="border border-[#FF5522]/40 rounded bg-[#FF5522]/20 px-1.5 py-0.5 text-[10px] text-[#FF5522] font-bold uppercase">CLOCK EXTENDED</span>
      </div>
    </div>

    <!-- MAIN SPLIT-SCREEN ARENA LAYOUT -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <!-- LEFT PANE: EXECUTION TERMINAL (7 COLS) -->
      <div class="flex flex-col border border-white/10 rounded-lg bg-[#0E121B] p-4 lg:col-span-7">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 font-bold tracking-wider uppercase">LIVE TICK STREAM</span>
            <span class="text-xs text-slate-400 font-mono">[ 10 Hz GBM ]</span>
          </div>
          <div class="text-right">
            <span class="text-lg text-slate-100 font-black font-mono tabular-nums" data-test="current-price">
              {{ formatCentsToUsd(currentPriceCents) }}
            </span>
          </div>
        </div>

        <!-- Canvas Chart -->
        <div class="relative my-3 h-48 w-full overflow-hidden border border-white/10 rounded bg-[#07090E]">
          <canvas
            ref="chartCanvasRef"
            class="h-full w-full"
            data-test="duel-chart-canvas"
          />
        </div>

        <!-- Active Position Display or Order Entry Controls -->
        <div v-if="localParticipant?.position" class="border border-cyan-500/40 rounded bg-[#151C2B] p-3" data-test="active-position-card">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="rounded px-2 py-0.5 text-xs font-bold tracking-tight font-mono"
                :class="localParticipant.position.side === 'LONG' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500' : 'bg-rose-950 text-rose-400 border border-rose-500'"
              >
                {{ localParticipant.position.side }} {{ localParticipant.position.leverage }}x
              </span>
              <span class="text-xs text-slate-300 font-mono tabular-nums">
                {{ localParticipant.position.quantity }} shares @ {{ formatCentsToUsd(localParticipant.position.entryPriceCents) }}
              </span>
            </div>
            <div class="text-right">
              <span
                class="text-sm font-bold font-mono tabular-nums"
                :class="localParticipant.netProfitCents >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                data-test="position-pnl"
              >
                {{ formatCentsWithSign(localParticipant.netProfitCents) }} ({{ localParticipant.roiPercent >= 0 ? '+' : '' }}{{ localParticipant.roiPercent }}%)
              </span>
            </div>
          </div>

          <!-- Auto-Liquidation Margin Risk Gauge (Graduated) -->
          <div class="mt-2.5">
            <div class="flex items-center justify-between text-[10px]">
              <span class="text-slate-400 tracking-wider uppercase">MARGIN DEPLETION (90% BUST CAP)</span>
              <span
                class="font-mono tabular-nums"
                :class="isCriticalMarginRisk ? 'text-[#FF5522] font-bold animate-pulse' : 'text-slate-400'"
                data-test="margin-risk-value"
              >
                {{ marginDepletionPercent }}%
              </span>
            </div>
            <div class="mt-1 h-1.5 w-full overflow-hidden border border-white/5 rounded-full bg-[#07090E]">
              <div
                class="h-full transition-all duration-200"
                :class="marginMeterColorClass"
                :style="{ width: `${marginDepletionPercent}%` }"
                data-test="margin-risk-meter"
              />
            </div>
            <div
              v-if="isCriticalMarginRisk"
              class="mt-1.5 flex animate-pulse items-center gap-1.5 border border-[#FF5522] rounded bg-[#FF5522]/15 px-2 py-1 text-[10px] text-[#FF5522] font-bold"
              data-test="liquidation-warning"
            >
              <span>⚠️</span>
              <span>CRITICAL MARGIN DANGER: 90% AUTO-LIQUIDATION IMMINENT</span>
            </div>
          </div>

          <!-- Close Position Action -->
          <button
            type="button"
            class="mt-3 w-full cursor-pointer border border-white/10 rounded bg-[#07090E] py-1.5 text-xs text-slate-200 font-bold font-mono transition hover:bg-white/10"
            data-test="close-position-btn"
            @click="handleClose"
          >
            CLOSE POSITION & SECURE P&L
          </button>
        </div>

        <!-- Order Entry Form (When Flat) -->
        <div v-else class="flex flex-col gap-3 border border-white/10 rounded bg-[#151C2B] p-3" data-test="order-entry-panel">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-bold tracking-wider uppercase">SELECT LEVERAGE</span>
            <div class="flex items-center gap-1.5">
              <button
                v-for="lev in [1, 2, 5] as DuelLeverage[]"
                :key="lev"
                type="button"
                :data-test="`leverage-btn-${lev}`"
                class="inline-flex cursor-pointer select-none items-center rounded px-2.5 py-0.5 text-xs font-bold font-mono transition"
                :class="selectedLeverage === lev ? 'border border-cyan-400 bg-cyan-500 text-slate-950 font-black' : 'border border-white/10 bg-[#0E121B] text-slate-300 hover:bg-white/10'"
                @click="selectedLeverage = lev"
              >
                <span class="select-none text-slate-500">[ </span>
                <span class="px-0.5">{{ lev }}x</span>
                <span class="select-none text-slate-500"> ]</span>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-bold tracking-wider uppercase">ORDER QUANTITY</span>
            <div class="flex items-center gap-2">
              <input
                v-model.number="orderQuantity"
                type="number"
                min="1"
                max="100"
                class="w-20 border border-white/10 rounded bg-[#07090E] px-2 py-0.5 text-right text-xs text-slate-100 font-bold font-mono tabular-nums focus:border-cyan-500 focus:outline-none"
                data-test="order-quantity-input"
              >
              <span class="text-xs text-slate-400 font-mono">SHARES</span>
            </div>
          </div>

          <!-- Dual Execution Buttons -->
          <div class="grid grid-cols-2 mt-1 gap-3">
            <button
              type="button"
              :disabled="phase !== 'ACTIVE'"
              class="flex cursor-pointer select-none items-center justify-center gap-1.5 border border-emerald-500/80 rounded bg-emerald-950/60 py-2 text-xs text-emerald-300 font-black tracking-wider transition hover:bg-emerald-900/80 disabled:opacity-40"
              data-test="buy-long-btn"
              @click="handleExecute('LONG')"
            >
              <span>▲</span>
              <span>BUY LONG ({{ selectedLeverage }}x)</span>
            </button>

            <button
              type="button"
              :disabled="phase !== 'ACTIVE'"
              class="flex cursor-pointer select-none items-center justify-center gap-1.5 border border-rose-500/80 rounded bg-rose-950/60 py-2 text-xs text-rose-300 font-black tracking-wider transition hover:bg-rose-900/80 disabled:opacity-40"
              data-test="sell-short-btn"
              @click="handleExecute('SHORT')"
            >
              <span>▼</span>
              <span>SELL SHORT ({{ selectedLeverage }}x)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT PANE: COMBAT RADAR & OPPONENTS (5 COLS) -->
      <div class="flex flex-col gap-3 border border-white/10 rounded-lg bg-[#0E121B] p-4 lg:col-span-5">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <span class="text-xs text-slate-400 font-bold tracking-wider uppercase">COMBATANTS TELEMETRY</span>
          <span class="text-xs text-slate-400 font-mono">[ {{ participants.length }} PARTICIPANTS ]</span>
        </div>

        <!-- Participants List -->
        <div class="flex flex-col gap-2.5">
          <div
            v-for="p in participants"
            :key="p.userUuid"
            :data-test="`participant-card-${p.userUuid}`"
            class="flex flex-col border rounded p-2.5 transition"
            :class="[
              p.isLocalUser ? 'border-cyan-500/60 bg-cyan-950/20' : 'border-white/10 bg-[#07090E]',
              p.isBusted ? 'opacity-40 border-rose-950 bg-rose-950/10' : '',
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="h-2 w-2 rounded-full"
                  :class="p.isBusted ? 'bg-rose-500' : p.netProfitCents >= 0 ? 'bg-emerald-400' : 'bg-rose-400'"
                />
                <span class="text-xs text-slate-200 font-bold">
                  {{ p.username }} {{ p.isLocalUser ? '(YOU)' : '' }}
                </span>
              </div>
              <span
                v-if="p.isBusted"
                class="rounded bg-rose-950 px-1.5 py-0.2 text-[10px] text-rose-400 font-bold uppercase"
              >
                BUSTED
              </span>
              <span
                v-else
                class="text-xs font-bold font-mono tabular-nums"
                :class="p.netProfitCents >= 0 ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ formatCentsWithSign(p.netProfitCents) }} ({{ p.roiPercent >= 0 ? '+' : '' }}{{ p.roiPercent }}%)
              </span>
            </div>

            <!-- Position Badge & Equity -->
            <div class="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span class="font-mono">
                {{ p.position ? `${p.position.side} ${p.position.leverage}x (${p.position.quantity})` : 'FLAT' }}
              </span>
              <span class="font-mono tabular-nums">POT: <strong class="text-slate-300">{{ formatCentsWhole(p.equityCents) }}</strong></span>
            </div>
          </div>
        </div>

        <!-- CONCLUDED SUMMARY OVERLAY -->
        <div
          v-if="phase === 'CONCLUDED'"
          class="mt-auto border border-amber-500/60 rounded bg-amber-950/50 p-3 text-center shadow-lg"
          data-test="duel-concluded-summary"
        >
          <div class="text-xs text-amber-300 font-bold tracking-wider font-mono uppercase">
            DUEL CONCLUDED
          </div>
          <div class="my-1 text-sm text-slate-100 font-black font-mono" data-test="victor-name">
            VICTOR: {{ victor ? victor.username : 'NO SURVIVOR' }}
          </div>
          <div class="text-xs text-amber-200 font-mono tabular-nums">
            SPOILS CLAIMED: {{ formatCentsWhole(bountyCents) }} + {{ ticker }} LOOT CARD
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
