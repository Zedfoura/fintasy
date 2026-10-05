<script setup lang="ts">
/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Real-time tactical kill feed & match event ticker for Fintasy Stock Royale
 */

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { KillFeedItem } from '~/types/royale'

const props = withDefaults(
  defineProps<{
    items?: KillFeedItem[]
    maxVisible?: number
    autoDismissMs?: number
  }>(),
  {
    items: () => [],
    maxVisible: 6,
    autoDismissMs: 6000,
  },
)

const emit = defineEmits<{
  (e: 'dismiss', id: string): void
}>()

const visibleItems = computed(() => {
  return props.items.slice(0, props.maxVisible)
})

const timers = ref<Map<string, ReturnType<typeof setTimeout>>>(new Map())

function setupDismissTimer(item: KillFeedItem) {
  if (props.autoDismissMs <= 0 || timers.value.has(item.id))
    return

  const timer = setTimeout(() => {
    emit('dismiss', item.id)
    timers.value.delete(item.id)
  }, props.autoDismissMs)

  timers.value.set(item.id, timer)
}

watch(
  () => props.items,
  (newItems) => {
    if (props.autoDismissMs > 0) {
      newItems.slice(0, props.maxVisible).forEach((item) => {
        setupDismissTimer(item)
      })
    }
  },
  { immediate: true, deep: true },
)

function onManualDismiss(id: string) {
  const t = timers.value.get(id)
  if (t) {
    clearTimeout(t)
    timers.value.delete(id)
  }
  emit('dismiss', id)
}

onMounted(() => {
  if (props.autoDismissMs > 0) {
    props.items.slice(0, props.maxVisible).forEach((item) => {
      setupDismissTimer(item)
    })
  }
})

onUnmounted(() => {
  timers.value.forEach(t => clearTimeout(t))
  timers.value.clear()
})

function getSeverityBadgeClass(severity: KillFeedItem['severity']) {
  switch (severity) {
    case 'danger':
      return 'border-rose-500/60 bg-rose-950/40 text-rose-300'
    case 'warning':
      return 'border-amber-500/60 bg-amber-950/40 text-amber-300'
    case 'gold':
      return 'border-yellow-400/60 bg-yellow-950/40 text-yellow-300'
    default:
      return 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300'
  }
}

function getIcon(item: KillFeedItem): string {
  if (item.type === 'LIQUIDATION') {
    if (item.metadata?.reason === 'STORM')
      return '☠️'
    if (item.metadata?.reason === 'MARGIN_CALL')
      return '📉'
    return '💥'
  }
  if (item.type === 'STORM_TICK')
    return '⚡'
  if (item.type === 'SECTOR_CLOSURE')
    return '⚠️'
  if (item.type === 'DUEL_START')
    return '⚔️'
  if (item.type === 'MATCH_OVER')
    return '👑'
  return '📢'
}
</script>

<template>
  <aside
    class="pointer-events-none fixed right-4 top-4 z-50 max-w-sm w-full flex flex-col gap-2 font-mono"
    aria-label="Royale Kill Feed"
  >
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-8 opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-8 opacity-0"
    >
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="group pointer-events-auto relative flex items-start gap-2.5 border rounded-lg bg-[#090d16]/95 p-2.5 shadow-xl backdrop-blur-md transition-all hover:border-slate-400"
        :class="getSeverityBadgeClass(item.severity)"
        data-testid="kill-feed-item"
        :data-severity="item.severity"
      >
        <!-- Icon & Tag -->
        <span class="mt-0.5 select-none text-base">{{ getIcon(item) }}</span>

        <!-- Event Body -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-xs font-bold tracking-wide" data-testid="feed-title">
              {{ item.title }}
            </span>
            <span class="select-none text-[10px] text-slate-400 opacity-75">
              {{ item.type }}
            </span>
          </div>
          <p class="line-clamp-2 mt-0.5 text-[11px] text-slate-300 leading-snug" data-testid="feed-desc">
            {{ item.description }}
          </p>
        </div>

        <!-- Manual Dismiss Button -->
        <button
          type="button"
          class="shrink-0 rounded p-0.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-800 hover:text-white group-hover:opacity-100"
          title="Dismiss"
          aria-label="Dismiss alert"
          @click="onManualDismiss(item.id)"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </aside>
</template>
