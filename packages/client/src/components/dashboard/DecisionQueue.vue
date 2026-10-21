<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Atrium Decision Queue & Cognitive Triage component in Grounded in Reason Design System
-->

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface DecisionQueueItem {
  id: string
  title: string
  subtitle?: string
  symbol?: string
  category: 'DUEL' | 'MARGIN' | 'TOURNAMENT' | 'SYSTEM'
  urgency: 'CRITICAL' | 'WARNING' | 'INFO'
  badgeText: string
  timeText: string
  actionPrimaryText: string
  actionSecondaryText?: string
  payload?: Record<string, any>
}

const props = withDefaults(
  defineProps<{
    items?: DecisionQueueItem[]
    collapsible?: boolean
  }>(),
  {
    items: () => [
      {
        id: 'duel-challenge-scalperbot',
        title: '30-Sec Duel Challenge from \'ScalperBot_1\'',
        symbol: 'NVDA',
        category: 'DUEL',
        urgency: 'CRITICAL',
        badgeText: 'HIGH STAKES 5x',
        timeText: '12s left',
        actionPrimaryText: 'ACCEPT',
        actionSecondaryText: 'Decline',
        payload: { duelId: 'duel-live-01', ticker: 'NVDA', leverage: 5 },
      },
      {
        id: 'margin-alert-nvda',
        title: 'NVDA Position approaching 75% margin cap',
        symbol: 'NVDA',
        category: 'MARGIN',
        urgency: 'WARNING',
        badgeText: 'MARGIN ALERT',
        timeText: '2m ago',
        actionPrimaryText: 'INSPECT',
        actionSecondaryText: 'Dismiss',
        payload: { ticker: 'NVDA', marginDepletion: 75 },
      },
      {
        id: 'tourney-invite-apex',
        title: 'Apex Grandmaster Qualifier starting soon',
        symbol: 'TECH',
        category: 'TOURNAMENT',
        urgency: 'INFO',
        badgeText: 'INVITATION',
        timeText: '15m ago',
        actionPrimaryText: 'ENTER',
        actionSecondaryText: 'Ignore',
        payload: { tournamentId: 'tourney-apex-01' },
      },
    ],
    collapsible: true,
  },
)

const emit = defineEmits<{
  (e: 'acceptDecision', item: DecisionQueueItem): void
  (e: 'declineDecision', item: DecisionQueueItem): void
}>()

const localItems = ref<DecisionQueueItem[]>([...props.items])

function handleAccept(item: DecisionQueueItem) {
  emit('acceptDecision', item)
  localItems.value = localItems.value.filter(i => i.id !== item.id)
}

function handleDecline(item: DecisionQueueItem) {
  emit('declineDecision', item)
  localItems.value = localItems.value.filter(i => i.id !== item.id)
}

const pendingCount = computed(() => localItems.value.length)
</script>

<template>
  <div
    class="flex flex-col border border-white/10 rounded-lg bg-[#0E121B] p-3 text-slate-100 font-mono shadow-xl transition-all"
    data-test="decision-queue"
  >
    <!-- Atrium Decision Queue Header -->
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
      <div class="flex items-center gap-2.5">
        <div
          v-if="pendingCount > 0"
          class="inline-flex items-center gap-1.5 border border-[#FF5522]/40 rounded bg-[#FF5522]/15 px-2.5 py-0.5 text-xs text-[#FF5522] font-bold"
          data-test="decision-count-badge"
        >
          <span class="h-2 w-2 animate-pulse rounded-full bg-[#FF5522]" />
          <span>NEEDS YOUR DECISION</span>
          <span class="rounded bg-[#FF5522]/20 px-1.5 py-0.2 font-mono tabular-nums">
            {{ pendingCount }}
          </span>
        </div>
        <div
          v-else
          class="inline-flex items-center gap-1.5 border border-emerald-500/40 rounded bg-emerald-950/30 px-2.5 py-0.5 text-xs text-emerald-400 font-bold"
        >
          <span class="h-2 w-2 rounded-full bg-emerald-400" />
          <span>DECISION QUEUE</span>
        </div>
        <span class="hidden text-xs text-slate-400 font-normal lg:inline">
          • Sorted by urgency. Nothing executes until approved.
        </span>
      </div>

      <div class="flex items-center gap-2 text-xs text-slate-400">
        <span class="text-[11px] font-mono tabular-nums">
          {{ pendingCount }} PENDING
        </span>
      </div>
    </div>

    <!-- Active Decision Queue Items -->
    <div v-if="localItems.length > 0" class="mt-3 flex flex-col gap-2.5" data-test="decision-items-list">
      <div
        v-for="item in localItems"
        :key="item.id"
        :data-test="`decision-item-${item.id}`"
        class="flex flex-wrap items-center justify-between gap-3 border border-white/5 rounded-md bg-[#151C2B] p-2.5 transition hover:border-white/20"
      >
        <!-- Item Left: Symbol & Title -->
        <div class="flex items-center gap-2.5">
          <span
            v-if="item.symbol"
            class="border border-white/10 rounded bg-[#07090E] px-2 py-0.5 text-xs text-cyan-300 font-bold font-mono"
          >
            [{{ item.symbol }}]
          </span>
          <div class="flex flex-col">
            <span class="text-xs text-slate-200 font-bold tracking-tight">
              {{ item.title }}
            </span>
            <span v-if="item.subtitle" class="text-[10px] text-slate-400">
              {{ item.subtitle }}
            </span>
          </div>
        </div>

        <!-- Item Center & Right: Metadata Badge, Timer & Action Triggers -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Metadata Badge -->
          <div
            class="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold tracking-wider font-mono uppercase"
            :class="{
              'border border-[#FF5522]/40 bg-[#FF5522]/10 text-[#FF5522]': item.urgency === 'CRITICAL',
              'border border-amber-500/40 bg-amber-950/40 text-amber-300': item.urgency === 'WARNING',
              'border border-emerald-500/40 bg-emerald-950/40 text-emerald-300': item.urgency === 'INFO',
            }"
            data-test="decision-item-badge"
          >
            <span>•</span>
            <span>{{ item.badgeText }}</span>
          </div>

          <!-- Time Ago / Expiry -->
          <span class="text-[11px] text-slate-400 font-mono tabular-nums">
            {{ item.timeText }}
          </span>

          <!-- Differentiated Action Buttons (Atrium Model) -->
          <div class="flex items-center gap-2">
            <!-- Secondary Action (Hairline outline) -->
            <button
              v-if="item.actionSecondaryText"
              type="button"
              :data-test="`decline-btn-${item.id}`"
              class="cursor-pointer select-none border border-white/10 rounded bg-white/5 px-3 py-1 text-xs text-slate-300 font-bold font-mono transition hover:bg-white/10"
              @click.stop="handleDecline(item)"
            >
              {{ item.actionSecondaryText }}
            </button>

            <!-- Primary Action (High-contrast filled button) -->
            <button
              type="button"
              :data-test="`accept-btn-${item.id}`"
              class="cursor-pointer select-none rounded px-3.5 py-1 text-xs text-white font-bold font-mono shadow-md transition active:scale-98"
              :class="{
                'border border-[#FF5522] bg-[#FF5522] hover:bg-[#FF6B35]': item.urgency === 'CRITICAL',
                'border border-amber-500 bg-amber-600 hover:bg-amber-500': item.urgency === 'WARNING',
                'border border-emerald-500 bg-emerald-600 hover:bg-emerald-500': item.urgency === 'INFO',
              }"
              @click.stop="handleAccept(item)"
            >
              {{ item.actionPrimaryText }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State (Silent Unobtrusive Dieter Rams Ethos) -->
    <div
      v-else
      class="flex items-center justify-center gap-2 py-3 text-xs text-slate-400 font-mono"
      data-test="decision-empty-state"
    >
      <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      <span>ALL DECISION QUEUES CLEAR • 0 PENDING ACTIONS</span>
    </div>
  </div>
</template>
