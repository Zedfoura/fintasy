<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Market Sector Radar & Treemap Map with Storm Visualizer in Football Manager tactical theme
-->

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  type ActiveDuelSummary,
  MarketSector,
  SECTOR_DEFINITIONS,
  type SectorDefinition,
  type SectorStatus,
  type StormState,
  isSectorAdjacent,
} from '~/types/royale'

const props = withDefaults(
  defineProps<{
    currentSector?: string | null
    sectorStates?: Record<string, SectorStatus>
    playerDistribution?: Record<string, number>
    activeDuels?: ActiveDuelSummary[]
    stormState?: StormState
    width?: number
    height?: number
    interactive?: boolean
  }>(),
  {
    currentSector: MarketSector.UTILITIES,
    sectorStates: () => ({
      [MarketSector.UTILITIES]: 'SAFE',
      [MarketSector.REAL_ESTATE]: 'SAFE',
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
    }),
    playerDistribution: () => ({}),
    activeDuels: () => [],
    stormState: () => ({
      roundNumber: 1,
      name: 'Outer Sector Contraction',
      phase: 'SAFE',
      secondsRemaining: 90,
      damageRateCentsPerSec: 5000,
      safeSectorCount: 8,
    }),
    width: 600,
    height: 600,
    interactive: true,
  },
)

const emit = defineEmits<{
  (e: 'selectSector', sectorId: string): void
  (e: 'rotateSector', fromSector: string, toSector: string): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const hoveredSector = ref<MarketSector | null>(null)
const selectedSector = ref<MarketSector | null>((props.currentSector as MarketSector) || MarketSector.UTILITIES)
const radarAngle = ref(0)
let animationFrameId: number | null = null

// Formatted telemetry
const formattedCountdown = computed(() => {
  const totalSecs = Math.max(0, props.stormState.secondsRemaining)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const formattedDamageRate = computed(() => {
  const dollars = (props.stormState.damageRateCentsPerSec / 100).toFixed(0)
  return `$${dollars}/sec`
})

const totalTradersAlive = computed(() => {
  const values = Object.values(props.playerDistribution)
  if (values.length === 0)
    return 40
  return values.reduce((sum, count) => sum + count, 0)
})

const currentPhaseBadge = computed(() => {
  const phase = props.stormState.phase
  switch (phase) {
    case 'SAFE':
      return { text: 'ZONE STABLE', class: 'bg-emerald-950 text-emerald-400 border-emerald-500/50' }
    case 'WARNING':
      return { text: 'CLOSING WARNING', class: 'bg-amber-950 text-amber-400 border-amber-500/50 animate-pulse' }
    case 'CLOSING':
      return { text: 'STORM COLLAPSE IN PROGRESS', class: 'bg-rose-950 text-rose-400 border-rose-500/50 animate-pulse' }
    case 'FINAL':
      return { text: 'SUDDEN DEATH', class: 'bg-purple-950 text-purple-300 border-purple-500/50 animate-pulse' }
    default:
      return { text: phase, class: 'bg-slate-900 text-slate-300 border-slate-700' }
  }
})

// Quadrant angle mapping [startAngle, endAngle] in radians
const QUADRANT_ANGLES: Record<number, [number, number]> = {
  0: [-Math.PI / 2, 0], // Top-right (12 to 3 o'clock)
  1: [0, Math.PI / 2], // Bottom-right (3 to 6 o'clock)
  2: [Math.PI / 2, Math.PI], // Bottom-left (6 to 9 o'clock)
  3: [Math.PI, (3 * Math.PI) / 2], // Top-left (9 to 12 o'clock)
}

function getSectorAngles(def: SectorDefinition): [number, number] {
  return QUADRANT_ANGLES[def.quadrant] || [0, Math.PI / 2]
}

function getSectorRadii(tier: 'OUTER' | 'MID' | 'INNER', maxRadius: number): [number, number] {
  switch (tier) {
    case 'INNER':
      return [0, maxRadius * 0.36]
    case 'MID':
      return [maxRadius * 0.36, maxRadius * 0.68]
    case 'OUTER':
      return [maxRadius * 0.68, maxRadius * 0.98]
  }
}

// Find sector under (x, y) relative to canvas center
function hitTestSector(x: number, y: number, maxRadius: number): MarketSector | null {
  const dist = Math.hypot(x, y)
  if (dist > maxRadius * 0.98)
    return null

  // Angle normalized to [-PI/2, 3PI/2] (starting from 12 o'clock)
  let angle = Math.atan2(y, x)
  if (angle < -Math.PI / 2)
    angle += 2 * Math.PI

  // Determine quadrant
  let quadrant = 0
  if (angle >= -Math.PI / 2 && angle < 0)
    quadrant = 0
  else if (angle >= 0 && angle < Math.PI / 2)
    quadrant = 1
  else if (angle >= Math.PI / 2 && angle < Math.PI)
    quadrant = 2
  else
    quadrant = 3

  // Determine tier by radius
  let tier: 'OUTER' | 'MID' | 'INNER'
  if (dist <= maxRadius * 0.36)
    tier = 'INNER'
  else if (dist <= maxRadius * 0.68)
    tier = 'MID'
  else
    tier = 'OUTER'

  for (const def of Object.values(SECTOR_DEFINITIONS)) {
    if (def.tier === tier && def.quadrant === quadrant)
      return def.id
  }
  return null
}

function drawRadar(timestamp: number) {
  const canvas = canvasRef.value
  if (!canvas)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const width = canvas.width / dpr
  const height = canvas.height / dpr
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.min(centerX, centerY) - 10

  ctx.clearRect(0, 0, width, height)

  // 1. Tactical grid background
  ctx.save()
  ctx.fillStyle = '#070b13'
  ctx.fillRect(0, 0, width, height)

  // Concentric radar grid rings
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)'
  ctx.lineWidth = 1
  for (const factor of [0.36, 0.68, 0.98]) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, maxRadius * factor, 0, 2 * Math.PI)
    ctx.stroke()
  }

  // Crosshair tactical axes
  ctx.beginPath()
  ctx.moveTo(centerX - maxRadius, centerY)
  ctx.lineTo(centerX + maxRadius, centerY)
  ctx.moveTo(centerX, centerY - maxRadius)
  ctx.lineTo(centerX, centerY + maxRadius)
  ctx.stroke()

  // 2. Render each sector wedge
  for (const def of Object.values(SECTOR_DEFINITIONS)) {
    const [startAngle, endAngle] = getSectorAngles(def)
    const [innerR, outerR] = getSectorRadii(def.tier, maxRadius)
    const status = props.sectorStates[def.id] || 'SAFE'
    const isCurrent = props.currentSector === def.id
    const isHovered = hoveredSector.value === def.id
    const isLegalMove = props.currentSector && isSectorAdjacent(props.currentSector, def.id)

    ctx.beginPath()
    ctx.arc(centerX, centerY, outerR, startAngle, endAngle, false)
    ctx.arc(centerX, centerY, innerR, endAngle, startAngle, true)
    ctx.closePath()

    // Base fill according to status
    if (status === 'STORM') {
      ctx.fillStyle = isHovered ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.18)'
    }
    else if (status === 'CLOSING') {
      const pulse = 0.2 + 0.1 * Math.sin(timestamp / 200)
      ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`
    }
    else {
      // SAFE
      if (def.tier === 'INNER')
        ctx.fillStyle = isHovered ? 'rgba(56, 189, 248, 0.25)' : 'rgba(14, 165, 233, 0.12)'
      else if (def.tier === 'MID')
        ctx.fillStyle = isHovered ? 'rgba(52, 211, 153, 0.25)' : 'rgba(16, 185, 129, 0.10)'
      else
        ctx.fillStyle = isHovered ? 'rgba(100, 116, 139, 0.25)' : 'rgba(71, 85, 105, 0.08)'
    }
    ctx.fill()

    // Sector border
    if (isCurrent) {
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 2.5
    }
    else if (isLegalMove) {
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 1.5
    }
    else if (status === 'STORM') {
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 1.5
    }
    else if (status === 'CLOSING') {
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 1.5
    }
    else {
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)'
      ctx.lineWidth = 1
    }
    ctx.stroke()

    // 3. Sector labels & telemetry
    const midAngle = (startAngle + endAngle) / 2
    const midR = (innerR + outerR) / 2
    const textX = centerX + Math.cos(midAngle) * midR
    const textY = centerY + Math.sin(midAngle) * midR

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Name & Ticker badge
    ctx.font = 'bold 11px monospace'
    ctx.fillStyle = status === 'STORM' ? '#fca5a5' : '#f8fafc'
    ctx.fillText(def.name.split(' ')[0], textX, textY - 8)

    ctx.font = '9px monospace'
    ctx.fillStyle = status === 'STORM' ? '#ef4444' : '#94a3b8'
    const tickerStr = def.tickers.map(t => t.symbol).join('·')
    ctx.fillText(tickerStr, textX, textY + 5)

    // Player presence & active duels
    const count = props.playerDistribution[def.id] || 0
    const duel = props.activeDuels.find(d => d.sector === def.id)

    if (duel) {
      ctx.font = 'bold 10px monospace'
      ctx.fillStyle = '#f43f5e'
      ctx.fillText(`⚔️ DUEL (${duel.participantCount})`, textX, textY + 18)
    }
    else if (count > 0) {
      ctx.font = '9px monospace'
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(`+${count} traders`, textX, textY + 17)
    }

    // Local user beacon
    if (isCurrent) {
      ctx.beginPath()
      ctx.arc(textX, textY - 20, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#06b6d4'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.font = 'bold 8px monospace'
      ctx.fillStyle = '#06b6d4'
      ctx.fillText('YOU', textX, textY - 27)
    }
  }

  // 4. Sweeping tactical radar beam
  radarAngle.value = (radarAngle.value + 0.02) % (2 * Math.PI)
  const beamX = centerX + Math.cos(radarAngle.value) * maxRadius * 0.98
  const beamY = centerY + Math.sin(radarAngle.value) * maxRadius * 0.98

  const gradient = ctx.createLinearGradient(centerX, centerY, beamX, beamY)
  gradient.addColorStop(0, 'rgba(6, 182, 212, 0.15)')
  gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')

  ctx.beginPath()
  ctx.moveTo(centerX, centerY)
  ctx.arc(centerX, centerY, maxRadius * 0.98, radarAngle.value - 0.2, radarAngle.value, false)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(centerX, centerY)
  ctx.lineTo(beamX, beamY)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)'
  ctx.lineWidth = 1.2
  ctx.stroke()

  ctx.restore()

  if (typeof window !== 'undefined')
    animationFrameId = window.requestAnimationFrame(drawRadar)
}

function handleMouseMove(e: MouseEvent) {
  if (!props.interactive)
    return
  const canvas = canvasRef.value
  if (!canvas)
    return
  const rect = canvas.getBoundingClientRect()
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const x = (e.clientX - rect.left) * (canvas.width / rect.width / dpr) - canvas.width / (2 * dpr)
  const y = (e.clientY - rect.top) * (canvas.height / rect.height / dpr) - canvas.height / (2 * dpr)
  const maxRadius = Math.min(canvas.width, canvas.height) / (2 * dpr) - 10

  hoveredSector.value = hitTestSector(x, y, maxRadius)
}

function handleCanvasClick() {
  if (!props.interactive || !hoveredSector.value)
    return
  triggerSelectSector(hoveredSector.value)
}

function triggerSelectSector(sectorId: MarketSector | string) {
  selectedSector.value = sectorId as MarketSector
  emit('selectSector', sectorId)

  if (props.currentSector && props.currentSector !== sectorId) {
    if (isSectorAdjacent(props.currentSector, sectorId))
      emit('rotateSector', props.currentSector, sectorId)
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas)
    return
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  canvas.width = props.width * dpr
  canvas.height = props.height * dpr
  const ctx = canvas.getContext('2d')
  if (ctx)
    ctx.scale(dpr, dpr)

  if (typeof window !== 'undefined')
    animationFrameId = window.requestAnimationFrame(drawRadar)
})

onBeforeUnmount(() => {
  if (animationFrameId && typeof window !== 'undefined')
    window.cancelAnimationFrame(animationFrameId)
})

watch(
  () => [props.currentSector, props.sectorStates, props.stormState],
  () => {
    // Redraw triggered by reactive frame loop
  },
  { deep: true },
)
</script>

<template>
  <div
    class="flex flex-col border border-slate-800 rounded-lg bg-[#0a0f18] p-4 text-slate-100 font-mono shadow-2xl"
    data-test="market-radar-container"
  >
    <!-- Tactical Football Manager Header Telemetry -->
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          <span class="text-xs text-slate-400 font-bold tracking-wider uppercase">TACTICAL RADAR</span>
        </div>
        <div class="border border-slate-700 rounded bg-slate-900/80 px-2 py-0.5 text-xs text-slate-300 font-bold">
          ROUND {{ String(stormState.roundNumber).padStart(2, '0') }} / 05
        </div>
        <div
          class="border rounded px-2 py-0.5 text-xs font-bold"
          :class="currentPhaseBadge.class"
          data-test="storm-phase"
        >
          {{ currentPhaseBadge.text }}
        </div>
      </div>

      <div class="flex items-center gap-4 text-right">
        <!-- Countdown Clock -->
        <div class="flex flex-col items-end">
          <span class="text-[10px] text-slate-500 uppercase">COLLAPSE TIMER</span>
          <span
            class="text-lg font-bold tracking-widest"
            :class="stormState.secondsRemaining <= 15 ? 'text-rose-400 animate-pulse' : 'text-slate-100'"
            data-test="storm-countdown"
          >
            {{ formattedCountdown }}
          </span>
        </div>

        <!-- Storm Damage Rate -->
        <div class="flex flex-col items-end">
          <span class="text-[10px] text-slate-500 uppercase">STORM DRAIN</span>
          <span
            class="text-sm text-rose-400 font-bold"
            data-test="storm-damage-rate"
          >
            {{ formattedDamageRate }}
          </span>
        </div>

        <!-- Traders Alive -->
        <div class="flex flex-col items-end">
          <span class="text-[10px] text-slate-500 uppercase">TRADERS ALIVE</span>
          <span
            class="text-sm text-amber-400 font-bold"
            data-test="traders-count"
          >
            {{ totalTradersAlive }} / 40
          </span>
        </div>
      </div>
    </div>

    <!-- Canvas Map Container -->
    <div class="relative flex items-center justify-center overflow-hidden border border-slate-800 rounded-md bg-[#070b13]">
      <canvas
        ref="canvasRef"
        :style="{ width: `${width}px`, height: `${height}px` }"
        class="cursor-crosshair select-none"
        data-test="radar-canvas"
        @mousemove="handleMouseMove"
        @mouseleave="hoveredSector = null"
        @click="handleCanvasClick"
      />

      <!-- Hover Tooltip Overlay -->
      <div
        v-if="hoveredSector && SECTOR_DEFINITIONS[hoveredSector]"
        class="pointer-events-none absolute bottom-3 left-3 border border-cyan-500/40 rounded bg-slate-950/90 p-2.5 text-xs shadow-lg backdrop-blur"
        data-test="sector-hover-tooltip"
      >
        <div class="flex items-center justify-between gap-4 text-cyan-400 font-bold">
          <span>{{ SECTOR_DEFINITIONS[hoveredSector].name }}</span>
          <span
            class="rounded px-1.5 py-0.2 text-[10px]"
            :class="{
              'bg-emerald-950 text-emerald-400': sectorStates[hoveredSector] === 'SAFE',
              'bg-amber-950 text-amber-400': sectorStates[hoveredSector] === 'CLOSING',
              'bg-rose-950 text-rose-400': sectorStates[hoveredSector] === 'STORM',
            }"
          >
            {{ sectorStates[hoveredSector] || 'SAFE' }}
          </span>
        </div>
        <div class="mt-1 text-[11px] text-slate-300">
          {{ SECTOR_DEFINITIONS[hoveredSector].description }}
        </div>
        <div class="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
          <span>Tier: <strong class="text-slate-200">{{ SECTOR_DEFINITIONS[hoveredSector].tier }}</strong></span>
          <span>Tickers: <strong class="text-slate-200">{{ SECTOR_DEFINITIONS[hoveredSector].tickers.map(t => t.symbol).join(', ') }}</strong></span>
          <span>Traders: <strong class="text-amber-300">{{ playerDistribution[hoveredSector] || 0 }}</strong></span>
        </div>
        <div
          v-if="currentSector && isSectorAdjacent(currentSector, hoveredSector)"
          class="mt-1 text-[10px] text-emerald-400 font-bold"
        >
          ✓ DIRECT ADJACENT SECTOR — CLICK TO ROTATE
        </div>
      </div>
    </div>

    <!-- Quick Tactical Grid / Accessibility Navigation -->
    <div class="mt-4 border-t border-slate-800/80 pt-3">
      <div class="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span>SECTOR TELEMETRY & FAST ROTATION</span>
        <span>CURRENT SECTOR: <strong class="text-cyan-400">{{ currentSector || 'NONE' }}</strong></span>
      </div>
      <div class="grid grid-cols-2 gap-2 lg:grid-cols-6 sm:grid-cols-4">
        <button
          v-for="def in Object.values(SECTOR_DEFINITIONS)"
          :key="def.id"
          type="button"
          :data-test="`sector-card-${def.id}`"
          class="flex flex-col border rounded p-2 text-left transition"
          :class="[
            currentSector === def.id
              ? 'border-cyan-400 bg-cyan-950/40'
              : currentSector && isSectorAdjacent(currentSector, def.id)
                ? 'border-emerald-600/60 bg-emerald-950/20 hover:bg-emerald-900/40'
                : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/40',
            sectorStates[def.id] === 'STORM' ? 'opacity-50 border-rose-900' : '',
          ]"
          @click="triggerSelectSector(def.id)"
        >
          <div class="flex items-center justify-between">
            <span class="truncate text-[11px] text-slate-200 font-bold">{{ def.name.split(' ')[0] }}</span>
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="{
                'bg-emerald-400': sectorStates[def.id] === 'SAFE',
                'bg-amber-400 animate-pulse': sectorStates[def.id] === 'CLOSING',
                'bg-rose-500': sectorStates[def.id] === 'STORM',
              }"
            />
          </div>
          <div class="mt-0.5 text-[9px] text-slate-400">
            {{ def.tickers.map(t => t.symbol).join(' ') }}
          </div>
          <div class="mt-1 flex items-center justify-between text-[9px]">
            <span class="text-slate-500">{{ def.tier }}</span>
            <span v-if="playerDistribution[def.id]" class="text-amber-400 font-bold">
              👤 {{ playerDistribution[def.id] }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
