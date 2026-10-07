/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest unit test suite for ROYALE-9 Live Trading Duel Arena HUD & Split-Screen Combat Terminal
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TradingDuelArena from '~/components/royale/TradingDuelArena.vue'
import type { DuelParticipant } from '~/types/royale'

describe('tradingDuelArena (ROYALE-9)', () => {
  const baseParticipants: DuelParticipant[] = [
    {
      userUuid: 'user-local',
      username: 'ApexPredator',
      isLocalUser: true,
      equityCents: 1500000,
      position: null,
      netProfitCents: 0,
      roiPercent: 0,
      isBusted: false,
    },
    {
      userUuid: 'user-opp-1',
      username: 'ScalperBot_1',
      isLocalUser: false,
      equityCents: 1500000,
      position: null,
      netProfitCents: 0,
      roiPercent: 0,
      isBusted: false,
    },
  ]

  describe('assay A: component mounting & dual-pane layout', () => {
    it('should render the combat arena, ticker header, countdown clock, and bounty pot', () => {
      const wrapper = mount(TradingDuelArena, {
        props: {
          ticker: 'NVDA',
          sector: 'SEMIS_AI',
          bountyCents: 375000,
          secondsRemaining: 24,
          durationSeconds: 30,
          participants: baseParticipants,
        },
      })

      expect(wrapper.find('[data-test="trading-duel-arena"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="bounty-pot"]').text()).toBe('$3,750')
      expect(wrapper.find('[data-test="duel-clock"]').text()).toBe('00:24')
      expect(wrapper.find('[data-test="duel-chart-canvas"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="order-entry-panel"]').exists()).toBe(true)
    })
  })

  describe('assay B: leverage selection & order emission', () => {
    it('should allow toggling between 1x, 2x, 5x leverage and emit executeOrder with payload', async () => {
      const wrapper = mount(TradingDuelArena, {
        props: {
          phase: 'ACTIVE',
          participants: baseParticipants,
        },
      })

      // Select 5x leverage
      const lev5Btn = wrapper.find('[data-test="leverage-btn-5"]')
      expect(lev5Btn.exists()).toBe(true)
      await lev5Btn.trigger('click')

      // Click Buy Long
      const buyLongBtn = wrapper.find('[data-test="buy-long-btn"]')
      expect(buyLongBtn.exists()).toBe(true)
      await buyLongBtn.trigger('click')

      expect(wrapper.emitted('executeOrder')).toBeTruthy()
      expect(wrapper.emitted('executeOrder')?.[0]).toEqual([
        {
          side: 'LONG',
          leverage: 5,
          quantity: 10,
        },
      ])
    })

    it('should emit short order with selected quantity', async () => {
      const wrapper = mount(TradingDuelArena, {
        props: {
          phase: 'ACTIVE',
          participants: baseParticipants,
        },
      })

      // Select 2x leverage
      await wrapper.find('[data-test="leverage-btn-2"]').trigger('click')

      // Set quantity to 25
      const qtyInput = wrapper.find('[data-test="order-quantity-input"]')
      await qtyInput.setValue(25)

      // Click Sell Short
      await wrapper.find('[data-test="sell-short-btn"]').trigger('click')

      expect(wrapper.emitted('executeOrder')).toBeTruthy()
      expect(wrapper.emitted('executeOrder')?.[0]).toEqual([
        {
          side: 'SHORT',
          leverage: 2,
          quantity: 25,
        },
      ])
    })
  })

  describe('assay C: active position tracking & close action', () => {
    it('should display active position card and emit closePosition on button click', async () => {
      const participantsWithPosition: DuelParticipant[] = [
        {
          userUuid: 'user-local',
          username: 'ApexPredator',
          isLocalUser: true,
          equityCents: 1500000,
          position: {
            side: 'LONG',
            leverage: 2,
            quantity: 10,
            entryPriceCents: 13000,
          },
          netProfitCents: 4500, // +$45.00
          roiPercent: 3.5,
          isBusted: false,
        },
        baseParticipants[1],
      ]

      const wrapper = mount(TradingDuelArena, {
        props: {
          phase: 'ACTIVE',
          participants: participantsWithPosition,
        },
      })

      expect(wrapper.find('[data-test="active-position-card"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="position-pnl"]').text()).toContain('+$45.00')

      // Click close position
      const closeBtn = wrapper.find('[data-test="close-position-btn"]')
      expect(closeBtn.exists()).toBe(true)
      await closeBtn.trigger('click')

      expect(wrapper.emitted('closePosition')).toBeTruthy()
    })
  })

  describe('assay D: third-party escalation alert', () => {
    it('should display third-party banner and cards when 3 combatants participate', () => {
      const threeParticipants: DuelParticipant[] = [
        ...baseParticipants,
        {
          userUuid: 'user-third-party',
          username: 'IntruderX',
          isLocalUser: false,
          equityCents: 1400000,
          position: null,
          netProfitCents: 0,
          roiPercent: 0,
          isBusted: false,
        },
      ]

      const wrapper = mount(TradingDuelArena, {
        props: {
          participants: threeParticipants,
          thirdPartyAlert: 'IntruderX entered the duel arena!',
        },
      })

      expect(wrapper.find('[data-test="third-party-alert-banner"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="third-party-alert-banner"]').text()).toContain('IntruderX entered the duel arena!')
      expect(wrapper.find('[data-test="participant-card-user-third-party"]').exists()).toBe(true)
    })
  })

  describe('assay E: auto-liquidation 90% margin risk gauge', () => {
    it('should trigger critical margin risk warning when loss exceeds 70% of 90% liquidation buffer', () => {
      // Position: 10 shares @ $130.00, 5x leverage -> Margin = (13000 * 10) / 5 = 26000 cents ($260)
      // 90% margin threshold = 26000 * 0.90 = 23400 cents ($234)
      // Loss: -20000 cents (-$200) -> Depletion = (20000 / 23400) * 100 = ~85% (>= 70%)
      const criticalParticipants: DuelParticipant[] = [
        {
          userUuid: 'user-local',
          username: 'ApexPredator',
          isLocalUser: true,
          equityCents: 1500000,
          position: {
            side: 'LONG',
            leverage: 5,
            quantity: 10,
            entryPriceCents: 13000,
          },
          netProfitCents: -20000,
          roiPercent: -76.9,
          isBusted: false,
        },
        baseParticipants[1],
      ]

      const wrapper = mount(TradingDuelArena, {
        props: {
          participants: criticalParticipants,
        },
      })

      expect(wrapper.find('[data-test="liquidation-warning"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="margin-risk-value"]').text()).toContain('%')
    })
  })

  describe('assay F: concluded duel & victor attribution', () => {
    it('should render victory summary and spoils when duel phase is CONCLUDED', () => {
      const concludedParticipants: DuelParticipant[] = [
        {
          userUuid: 'user-local',
          username: 'ApexPredator',
          isLocalUser: true,
          equityCents: 1580000,
          position: null,
          netProfitCents: 80000,
          roiPercent: 5.3,
          isBusted: false,
        },
        {
          userUuid: 'user-opp-1',
          username: 'ScalperBot_1',
          isLocalUser: false,
          equityCents: 1420000,
          position: null,
          netProfitCents: -80000,
          roiPercent: -5.3,
          isBusted: false,
        },
      ]

      const wrapper = mount(TradingDuelArena, {
        props: {
          phase: 'CONCLUDED',
          bountyCents: 375000,
          ticker: 'NVDA',
          participants: concludedParticipants,
        },
      })

      expect(wrapper.find('[data-test="duel-concluded-summary"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="victor-name"]').text()).toContain('ApexPredator')
    })
  })
})
