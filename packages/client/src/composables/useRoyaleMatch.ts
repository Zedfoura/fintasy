/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Real-time authoritative WebSocket client composable for Fintasy Stock Royale
 */

import { computed, getCurrentInstance, onUnmounted, ref } from 'vue'
import type {
  DuelStartEventPayload,
  KillFeedItem,
  LiquidationEventPayload,
  LiveMatchState,
  MatchOverEventPayload,
  MatchParticipantState,
  RoyaleWebSocketMessage,
  SectorClosureEventPayload,
  SpectatorTarget,
  StormTickEventPayload,
} from '~/types/royale'

export interface UseRoyaleMatchOptions {
  matchId?: string
  userUuid?: string
  wsBaseUrl?: string
  socketFactory?: (url: string) => WebSocket
  autoReconnect?: boolean
  maxFeedItems?: number
}

export function formatCentsToUsd(cents: number): string {
  const isNegative = cents < 0
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100)
  const remainder = abs % 100
  const formatted = `$${dollars.toLocaleString('en-US')}.${remainder.toString().padStart(2, '0')}`
  return isNegative ? `-${formatted}` : formatted
}

export function useRoyaleMatch(options: UseRoyaleMatchOptions = {}) {
  const currentMatchId = ref<string>(options.matchId ?? '')
  const currentUserUuid = ref<string>(options.userUuid ?? '')
  const wsBaseUrl = options.wsBaseUrl ?? 'ws://localhost:8000/api/v1/royale/ws'
  const maxFeedItems = options.maxFeedItems ?? 6
  const autoReconnect = options.autoReconnect ?? false

  const connectionStatus = ref<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR'>('DISCONNECTED')
  const isConnected = computed(() => connectionStatus.value === 'CONNECTED')

  const matchState = ref<LiveMatchState | null>(null)
  const killFeed = ref<KillFeedItem[]>([])
  const activeDuel = ref<DuelStartEventPayload | null>(null)
  const isSpectating = ref<boolean>(false)
  const spectatorTarget = ref<SpectatorTarget | null>(null)
  const matchResult = ref<MatchOverEventPayload | null>(null)
  const isVictoryModalOpen = ref<boolean>(false)

  let socket: WebSocket | null = null
  let reconnectAttempts = 0
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  let shouldReconnect = autoReconnect

  const localPlayer = computed<MatchParticipantState | null>(() => {
    if (!matchState.value || !currentUserUuid.value)
      return null
    return matchState.value.participants[currentUserUuid.value] ?? null
  })

  const survivingPlayers = computed<SpectatorTarget[]>(() => {
    if (!matchState.value)
      return []
    return Object.values(matchState.value.participants)
      .filter(p => p.status === 'ALIVE' || p.status === 'IN_DUEL')
      .map(p => ({
        uuid: p.uuid,
        username: p.username,
        sector: p.activeSector,
        equityCents: p.equityCents,
        kills: p.kills,
        status: p.status,
      }))
  })

  function addFeedItem(item: Omit<KillFeedItem, 'id' | 'timestamp'>) {
    const newItem: KillFeedItem = {
      ...item,
      id: `feed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    }
    killFeed.value = [newItem, ...killFeed.value].slice(0, maxFeedItems)
  }

  function dismissFeedItem(id: string) {
    killFeed.value = killFeed.value.filter(item => item.id !== id)
  }

  function switchSpectatorTarget(target: 'next' | 'prev' | string) {
    const alive = survivingPlayers.value
    if (alive.length === 0) {
      spectatorTarget.value = null
      return
    }

    if (target === 'next' || target === 'prev') {
      const currentIndex = alive.findIndex(p => p.uuid === spectatorTarget.value?.uuid)
      let nextIndex = 0
      if (currentIndex !== -1) {
        if (target === 'next')
          nextIndex = (currentIndex + 1) % alive.length
        else
          nextIndex = (currentIndex - 1 + alive.length) % alive.length
      }
      spectatorTarget.value = alive[nextIndex]
    }
    else {
      const found = alive.find(p => p.uuid === target)
      if (found)
        spectatorTarget.value = found
    }
  }

  function handleMessage(message: RoyaleWebSocketMessage<unknown>) {
    if (!message || !message.type)
      return

    switch (message.type) {
      case 'MATCH_STATE': {
        const state = message.payload as LiveMatchState
        matchState.value = state

        if (currentUserUuid.value && state.participants[currentUserUuid.value]) {
          const me = state.participants[currentUserUuid.value]
          if (me.status === 'BUSTED' && !isSpectating.value) {
            isSpectating.value = true
            switchSpectatorTarget('next')
          }
        }
        break
      }

      case 'LIQUIDATION': {
        const payload = message.payload as LiquidationEventPayload
        let title = `${payload.victimUsername} Liquidated`
        let description = ''
        let severity: KillFeedItem['severity'] = 'danger'

        if (payload.killerUsername) {
          title = `${payload.killerUsername} 💥 ${payload.victimUsername}`
          description = `Claimed ${formatCentsToUsd(payload.bountyCents)} bounty in ${payload.sector}`
          severity = 'danger'
        }
        else if (payload.reason === 'STORM') {
          title = `${payload.victimUsername} ☠️ The Storm`
          description = `Lost to storm radiation (#${payload.placement})`
          severity = 'warning'
        }
        else if (payload.reason === 'MARGIN_CALL') {
          title = `${payload.victimUsername} 📉 Margin Call`
          description = `Auto-liquidated at 90% margin depletion in ${payload.sector}`
          severity = 'warning'
        }
        else {
          title = `${payload.victimUsername} 📉 Eliminated`
          description = `Eliminated in ${payload.sector} (#${payload.placement})`
        }

        addFeedItem({
          type: 'LIQUIDATION',
          title,
          description,
          severity,
          metadata: { ...payload },
        })

        // If local user is eliminated, switch to spectator mode
        if (payload.victimUuid === currentUserUuid.value) {
          isSpectating.value = true
          // If killed by a surviving player, spectate the killer
          if (payload.killerUuid)
            switchSpectatorTarget(payload.killerUuid)
          else
            switchSpectatorTarget('next')
        }
        break
      }

      case 'STORM_TICK': {
        const payload = message.payload as StormTickEventPayload
        const localDamaged = currentUserUuid.value && payload.damagedPlayerUuids.includes(currentUserUuid.value)
        addFeedItem({
          type: 'STORM_TICK',
          title: localDamaged ? '⚡ CRITICAL STORM DAMAGE' : `⚡ Storm Surge (Round ${payload.roundNumber})`,
          description: localDamaged
            ? `Taking -${formatCentsToUsd(payload.damageRateCentsPerSec)}/s capital bleed!`
            : `Damaging ${payload.damagedPlayerUuids.length} players outside safe sectors`,
          severity: localDamaged ? 'danger' : 'warning',
          metadata: { ...payload },
        })
        break
      }

      case 'SECTOR_CLOSURE': {
        const payload = message.payload as SectorClosureEventPayload
        addFeedItem({
          type: 'SECTOR_CLOSURE',
          title: `⚠️ SECTOR COLLAPSED: ${payload.collapsedSector}`,
          description: `Round ${payload.roundNumber}: ${payload.remainingSafeSectors.length} safe sectors remaining`,
          severity: 'warning',
          metadata: { ...payload },
        })
        break
      }

      case 'DUEL_START': {
        const payload = message.payload as DuelStartEventPayload
        const involvesMe = currentUserUuid.value && payload.participantUuids.includes(currentUserUuid.value)
        activeDuel.value = payload

        addFeedItem({
          type: 'DUEL_START',
          title: involvesMe ? '⚔️ DUEL ENGAGED!' : `⚔️ Sector Duel: ${payload.sector}`,
          description: `${payload.usernames.join(' vs ')} (${formatCentsToUsd(payload.bountyPotCents)} bounty pot)`,
          severity: involvesMe ? 'gold' : 'info',
          metadata: { ...payload },
        })
        break
      }

      case 'MATCH_OVER': {
        const payload = message.payload as MatchOverEventPayload
        matchResult.value = payload
        isVictoryModalOpen.value = true
        addFeedItem({
          type: 'MATCH_OVER',
          title: `👑 VICTORY: ${payload.winnerUsername}`,
          description: `Sole survivor crowned #1 Victory Royale!`,
          severity: 'gold',
          metadata: { ...payload },
        })
        break
      }

      default:
        break
    }
  }

  function connect(matchId?: string, userUuid?: string) {
    if (matchId)
      currentMatchId.value = matchId
    if (userUuid)
      currentUserUuid.value = userUuid

    if (!currentMatchId.value)
      return

    if (socket) {
      socket.close()
      socket = null
    }

    connectionStatus.value = 'CONNECTING'
    const targetUrl = `${wsBaseUrl}/${currentMatchId.value}?user_id=${currentUserUuid.value}`

    try {
      if (options.socketFactory) {
        socket = options.socketFactory(targetUrl)
      }
      else if (typeof WebSocket !== 'undefined') {
        socket = new WebSocket(targetUrl)
      }
      else {
        connectionStatus.value = 'ERROR'
        return
      }

      socket.onopen = () => {
        connectionStatus.value = 'CONNECTED'
        reconnectAttempts = 0
      }

      socket.onmessage = (event) => {
        try {
          const raw = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
          handleMessage(raw)
        }
        catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      socket.onclose = () => {
        if (connectionStatus.value !== 'DISCONNECTED') {
          connectionStatus.value = 'DISCONNECTED'
          if (shouldReconnect && reconnectAttempts < 5) {
            connectionStatus.value = 'RECONNECTING'
            const delay = Math.min(1000 * (2 ** reconnectAttempts), 8000)
            reconnectAttempts++
            reconnectTimeout = setTimeout(() => {
              connect()
            }, delay)
          }
        }
      }

      socket.onerror = () => {
        connectionStatus.value = 'ERROR'
      }
    }
    catch (err) {
      console.error('WebSocket connection error:', err)
      connectionStatus.value = 'ERROR'
    }
  }

  function disconnect() {
    shouldReconnect = false
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    if (socket) {
      socket.close()
      socket = null
    }
    connectionStatus.value = 'DISCONNECTED'
  }

  function sendAction(action: string, data: unknown) {
    if (!socket || socket.readyState !== WebSocket.OPEN)
      return false
    socket.send(JSON.stringify({ action, data, timestamp: Date.now() }))
    return true
  }

  function dismissVictoryModal() {
    isVictoryModalOpen.value = false
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      disconnect()
    })
  }

  return {
    // State
    currentMatchId,
    currentUserUuid,
    connectionStatus,
    isConnected,
    matchState,
    localPlayer,
    killFeed,
    activeDuel,
    isSpectating,
    spectatorTarget,
    survivingPlayers,
    matchResult,
    isVictoryModalOpen,

    // Actions
    connect,
    disconnect,
    handleMessage,
    addFeedItem,
    dismissFeedItem,
    switchSpectatorTarget,
    sendAction,
    dismissVictoryModal,
    formatCentsToUsd,
  }
}
