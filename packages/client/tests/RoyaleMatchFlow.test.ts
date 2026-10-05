/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite for ROYALE-10 Real-Time WebSocket Client, Kill Feed Ticker & Post-Match Victory HUD
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import KillFeed from '~/components/royale/KillFeed.vue'
import MatchVictoryModal from '~/components/royale/MatchVictoryModal.vue'
import { formatCentsToUsd, useRoyaleMatch } from '~/composables/useRoyaleMatch'
import type {
  KillFeedItem,
  LiveMatchState,
  MatchOverEventPayload,
  MatchRankResult,
} from '~/types/royale'

class MockWebSocket {
  static OPEN = 1
  static CLOSED = 3
  readyState = MockWebSocket.OPEN
  url: string
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  sentMessages: string[] = []

  constructor(url: string) {
    this.url = url
    setTimeout(() => {
      if (this.onopen)
        this.onopen()
    }, 0)
  }

  send(data: string) {
    this.sentMessages.push(data)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose)
      this.onclose()
  }

  simulateServerMessage(payload: unknown) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(payload) })
    }
  }
}

describe('royaleMatchFlow (ROYALE-10)', () => {
  const baseRankResult: MatchRankResult = {
    oldRankTier: 'GOLD',
    oldDivision: 'I',
    oldRp: 420,
    newRankTier: 'GOLD',
    newDivision: 'II',
    newRp: 485,
    rpDelta: 65,
    placement: 1,
    placementBonusRp: 40,
    kills: 2,
    killBonusRp: 20,
    netProfitCents: 450000,
    profitBonusRp: 5,
    isPromotion: true,
    isDemotion: false,
  }

  const baseMatchResult: MatchOverEventPayload = {
    matchId: 'match-101',
    winnerUuid: 'user-local',
    winnerUsername: 'ApexPredator',
    finalPlacements: [
      { uuid: 'user-local', username: 'ApexPredator', placement: 1, kills: 2, netProfitCents: 450000 },
      { uuid: 'user-bot-1', username: 'AlgoScalp_01', placement: 2, kills: 1, netProfitCents: 120000 },
      { uuid: 'user-bot-2', username: 'ThetaGangster', placement: 3, kills: 0, netProfitCents: -50000 },
    ],
    userResult: baseRankResult,
  }

  describe('assay A: composable connection lifecycle', () => {
    it('should manage connection states from CONNECTING to CONNECTED and DISCONNECTED', async () => {
      let createdSocket: MockWebSocket | null = null
      const royale = useRoyaleMatch({
        socketFactory: (url) => {
          createdSocket = new MockWebSocket(url)
          return createdSocket as unknown as WebSocket
        },
      })

      expect(royale.connectionStatus.value).toBe('DISCONNECTED')
      expect(royale.isConnected.value).toBe(false)

      royale.connect('match-123', 'user-local')
      expect(royale.connectionStatus.value).toBe('CONNECTING')

      await new Promise(resolve => setTimeout(resolve, 10))
      expect(royale.connectionStatus.value).toBe('CONNECTED')
      expect(royale.isConnected.value).toBe(true)

      royale.disconnect()
      expect(royale.connectionStatus.value).toBe('DISCONNECTED')
      expect(royale.isConnected.value).toBe(false)
    })
  })

  describe('assay B: match state synchronization', () => {
    it('should update reactive matchState upon receiving MATCH_STATE event', () => {
      const royale = useRoyaleMatch({ userUuid: 'user-local' })

      const mockState: LiveMatchState = {
        matchId: 'match-abc',
        phase: 'ACTIVE_ROUNDS',
        roundNumber: 2,
        roundTimeRemainingSec: 45,
        safeSectors: ['SEMIS_AI', 'BIG_TECH'],
        collapsingSectors: ['ENERGY'],
        participants: {
          'user-local': {
            uuid: 'user-local',
            username: 'ApexPredator',
            equityCents: 1250000,
            capitalCents: 1250000,
            activeSector: 'SEMIS_AI',
            status: 'ALIVE',
            kills: 1,
            netProfitCents: 250000,
          },
        },
        eliminatedCount: 15,
        totalPlayers: 40,
      }

      royale.handleMessage({
        type: 'MATCH_STATE',
        payload: mockState,
        timestamp: Date.now(),
      })

      expect(royale.matchState.value).toEqual(mockState)
      expect(royale.localPlayer.value?.equityCents).toBe(1250000)
      expect(royale.localPlayer.value?.activeSector).toBe('SEMIS_AI')
    })
  })

  describe('assay C: kill feed dispatching & formatting', () => {
    it('should format liquidation event with killer, victim, and integer-cent bounty', () => {
      const royale = useRoyaleMatch({ userUuid: 'user-local' })

      royale.handleMessage({
        type: 'LIQUIDATION',
        payload: {
          victimUuid: 'user-victim',
          victimUsername: 'OverleveragedTrader',
          killerUuid: 'user-killer',
          killerUsername: 'SniperWhale',
          reason: 'MARGIN_CALL',
          bountyCents: 375000,
          sector: 'MEME_ALPHA',
          placement: 12,
        },
        timestamp: Date.now(),
      })

      expect(royale.killFeed.value.length).toBe(1)
      const item = royale.killFeed.value[0]
      expect(item.type).toBe('LIQUIDATION')
      expect(item.title).toContain('SniperWhale 💥 OverleveragedTrader')
      expect(item.description).toContain('$3,750.00 bounty')
      expect(item.description).toContain('MEME_ALPHA')
    })

    it('should format sector closure warning correctly', () => {
      const royale = useRoyaleMatch()

      royale.handleMessage({
        type: 'SECTOR_CLOSURE',
        payload: {
          roundNumber: 3,
          collapsedSector: 'UTILITIES',
          remainingSafeSectors: ['SEMIS_AI', 'BIG_TECH'],
        },
        timestamp: Date.now(),
      })

      expect(royale.killFeed.value.length).toBe(1)
      const item = royale.killFeed.value[0]
      expect(item.type).toBe('SECTOR_CLOSURE')
      expect(item.title).toContain('UTILITIES')
      expect(item.description).toContain('2 safe sectors remaining')
    })
  })

  describe('assay D: spectator mode activation on local player bankruptcy', () => {
    it('should switch isSpectating to true when local player is liquidated', () => {
      const royale = useRoyaleMatch({ userUuid: 'user-local' })

      // Seed match state with participants
      royale.handleMessage({
        type: 'MATCH_STATE',
        payload: {
          matchId: 'match-test',
          phase: 'ACTIVE_ROUNDS',
          roundNumber: 1,
          roundTimeRemainingSec: 60,
          safeSectors: ['SEMIS_AI'],
          collapsingSectors: [],
          participants: {
            'user-local': {
              uuid: 'user-local',
              username: 'LocalGuy',
              equityCents: 1000000,
              capitalCents: 1000000,
              activeSector: 'SEMIS_AI',
              status: 'ALIVE',
              kills: 0,
              netProfitCents: 0,
            },
            'user-killer': {
              uuid: 'user-killer',
              username: 'KillerBot',
              equityCents: 1500000,
              capitalCents: 1500000,
              activeSector: 'SEMIS_AI',
              status: 'ALIVE',
              kills: 1,
              netProfitCents: 500000,
            },
          },
          eliminatedCount: 0,
          totalPlayers: 2,
        },
        timestamp: Date.now(),
      })

      expect(royale.isSpectating.value).toBe(false)

      // Liquidate local player
      royale.handleMessage({
        type: 'LIQUIDATION',
        payload: {
          victimUuid: 'user-local',
          victimUsername: 'LocalGuy',
          killerUuid: 'user-killer',
          killerUsername: 'KillerBot',
          reason: 'DUEL_LOSS',
          bountyCents: 500000,
          sector: 'SEMIS_AI',
          placement: 2,
        },
        timestamp: Date.now(),
      })

      expect(royale.isSpectating.value).toBe(true)
      expect(royale.spectatorTarget.value?.uuid).toBe('user-killer')
    })
  })

  describe('assay E: spectator target cycling', () => {
    it('should cycle through surviving players via next and prev', () => {
      const royale = useRoyaleMatch({ userUuid: 'user-local' })

      royale.handleMessage({
        type: 'MATCH_STATE',
        payload: {
          matchId: 'match-spec',
          phase: 'ACTIVE_ROUNDS',
          roundNumber: 2,
          roundTimeRemainingSec: 30,
          safeSectors: ['SEMIS_AI'],
          collapsingSectors: [],
          participants: {
            p1: { uuid: 'p1', username: 'TraderOne', equityCents: 1000, capitalCents: 1000, activeSector: 'SEMIS_AI', status: 'ALIVE', kills: 0, netProfitCents: 0 },
            p2: { uuid: 'p2', username: 'TraderTwo', equityCents: 2000, capitalCents: 2000, activeSector: 'SEMIS_AI', status: 'ALIVE', kills: 1, netProfitCents: 100 },
            p3: { uuid: 'p3', username: 'TraderThree', equityCents: 3000, capitalCents: 3000, activeSector: 'SEMIS_AI', status: 'ALIVE', kills: 2, netProfitCents: 200 },
          },
          eliminatedCount: 0,
          totalPlayers: 3,
        },
        timestamp: Date.now(),
      })

      royale.switchSpectatorTarget('p1')
      expect(royale.spectatorTarget.value?.uuid).toBe('p1')

      royale.switchSpectatorTarget('next')
      expect(royale.spectatorTarget.value?.uuid).toBe('p2')

      royale.switchSpectatorTarget('next')
      expect(royale.spectatorTarget.value?.uuid).toBe('p3')

      royale.switchSpectatorTarget('next')
      expect(royale.spectatorTarget.value?.uuid).toBe('p1')

      royale.switchSpectatorTarget('prev')
      expect(royale.spectatorTarget.value?.uuid).toBe('p3')
    })
  })

  describe('assay F: killFeed component mounting & pruning', () => {
    it('should render items, respect maxVisible, and emit dismiss on button click', async () => {
      const sampleItems: KillFeedItem[] = [
        { id: '1', type: 'LIQUIDATION', title: 'Kill 1', description: 'Desc 1', timestamp: 1, severity: 'danger' },
        { id: '2', type: 'STORM_TICK', title: 'Storm 2', description: 'Desc 2', timestamp: 2, severity: 'warning' },
        { id: '3', type: 'DUEL_START', title: 'Duel 3', description: 'Desc 3', timestamp: 3, severity: 'gold' },
      ]

      const wrapper = mount(KillFeed, {
        props: {
          items: sampleItems,
          maxVisible: 2,
          autoDismissMs: 0,
        },
      })

      const renderedItems = wrapper.findAll('[data-testid="kill-feed-item"]')
      expect(renderedItems.length).toBe(2)
      expect(renderedItems[0].text()).toContain('Kill 1')
      expect(renderedItems[1].text()).toContain('Storm 2')

      const dismissButtons = wrapper.findAll('button[title="Dismiss"]')
      expect(dismissButtons.length).toBe(2)
      await dismissButtons[0].trigger('click')

      expect(wrapper.emitted('dismiss')).toBeTruthy()
      expect(wrapper.emitted('dismiss')![0]).toEqual(['1'])
    })
  })

  describe('assay G: match over & victory modal trigger', () => {
    it('should open victory modal and bind matchResult on MATCH_OVER event', () => {
      const royale = useRoyaleMatch({ userUuid: 'user-local' })
      expect(royale.isVictoryModalOpen.value).toBe(false)

      royale.handleMessage({
        type: 'MATCH_OVER',
        payload: baseMatchResult,
        timestamp: Date.now(),
      })

      expect(royale.isVictoryModalOpen.value).toBe(true)
      expect(royale.matchResult.value?.winnerUuid).toBe('user-local')
    })
  })

  describe('assay H: victory royale #1 rendering', () => {
    it('should render golden #1 Victory Royale celebration banner for winner', () => {
      const wrapper = mount(MatchVictoryModal, {
        props: {
          isOpen: true,
          matchResult: baseMatchResult,
          userUuid: 'user-local',
        },
      })

      const title = wrapper.find('[data-testid="victory-royale-title"]')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('#1 VICTORY ROYALE')
      expect(wrapper.text()).toContain('Sole Surviving Alpha Trader')
    })

    it('should render placement rank header for runner-up', () => {
      const wrapper = mount(MatchVictoryModal, {
        props: {
          isOpen: true,
          matchResult: baseMatchResult,
          userUuid: 'user-bot-1',
        },
      })

      const title = wrapper.find('[data-testid="placement-title"]')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('#2 PLACEMENT')
    })
  })

  describe('assay I: rocket League ranked progression display', () => {
    it('should display rank tier badge, division numeral, and RP breakdown', () => {
      const wrapper = mount(MatchVictoryModal, {
        props: {
          isOpen: true,
          matchResult: baseMatchResult,
          userUuid: 'user-local',
        },
      })

      const rankBadge = wrapper.find('[data-testid="rank-tier-badge"]')
      expect(rankBadge.exists()).toBe(true)
      expect(rankBadge.text()).toBe('GO') // 'GOLD'.substring(0, 2)

      const rankName = wrapper.find('[data-testid="rank-tier-name"]')
      expect(rankName.text()).toBe('GOLD II')

      const rpDelta = wrapper.find('[data-testid="rp-delta-chip"]')
      expect(rpDelta.text()).toContain('+65 RP')
      expect(rpDelta.text()).toContain('485 Total RP')

      expect(wrapper.text()).toContain('+40 RP') // Placement
      expect(wrapper.text()).toContain('+20 RP') // Eliminations
      expect(wrapper.text()).toContain('+5 RP') // Alpha
    })
  })

  describe('assay J: rank promotion badge', () => {
    it('should render PROMOTED! banner when isPromotion is true', () => {
      const wrapper = mount(MatchVictoryModal, {
        props: {
          isOpen: true,
          matchResult: baseMatchResult,
          userUuid: 'user-local',
        },
      })

      const promotionBadge = wrapper.find('[data-testid="promotion-badge"]')
      expect(promotionBadge.exists()).toBe(true)
      expect(promotionBadge.text()).toBe('PROMOTED!')
    })
  })

  describe('assay K: modal user action emits', () => {
    it('should emit playAgain, spectateMatch, and exitMatch on button clicks', async () => {
      const wrapper = mount(MatchVictoryModal, {
        props: {
          isOpen: true,
          matchResult: baseMatchResult,
          userUuid: 'user-local',
          isSpectating: true,
        },
      })

      await wrapper.find('[data-testid="play-again-btn"]').trigger('click')
      expect(wrapper.emitted('playAgain')).toBeTruthy()

      await wrapper.find('[data-testid="spectate-match-btn"]').trigger('click')
      expect(wrapper.emitted('spectateMatch')).toBeTruthy()

      await wrapper.find('[data-testid="exit-match-btn"]').trigger('click')
      expect(wrapper.emitted('exitMatch')).toBeTruthy()

      await wrapper.find('[data-testid="modal-close-btn"]').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('assay L: financial currency formatting fidelity', () => {
    it('should format integer cents into correct USD strings with signs', () => {
      expect(formatCentsToUsd(0)).toBe('$0.00')
      expect(formatCentsToUsd(1500000)).toBe('$15,000.00')
      expect(formatCentsToUsd(37549)).toBe('$375.49')
      expect(formatCentsToUsd(-50000)).toBe('-$500.00')
    })
  })
})
