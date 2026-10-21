/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest unit test suite for Atrium Decision Queue & Cognitive Triage (DESIGN-4)
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DecisionQueue, { type DecisionQueueItem } from '~/components/dashboard/DecisionQueue.vue'

describe('decisionQueue (DESIGN-4)', () => {
  const mockItems: DecisionQueueItem[] = [
    {
      id: 'duel-01',
      title: '30-Sec Duel Challenge from ScalperBot_1',
      symbol: 'NVDA',
      category: 'DUEL',
      urgency: 'CRITICAL',
      badgeText: 'HIGH STAKES 5x',
      timeText: '12s left',
      actionPrimaryText: 'ACCEPT',
      actionSecondaryText: 'Decline',
      payload: { duelId: 'duel-live-01' },
    },
    {
      id: 'margin-01',
      title: 'NVDA Position approaching 75% margin cap',
      symbol: 'NVDA',
      category: 'MARGIN',
      urgency: 'WARNING',
      badgeText: 'MARGIN ALERT',
      timeText: '2m ago',
      actionPrimaryText: 'INSPECT',
      actionSecondaryText: 'Dismiss',
    },
  ]

  describe('assay A: component mounting & header layout', () => {
    it('should render the Decision Queue container, header title, and pending items', () => {
      const wrapper = mount(DecisionQueue, {
        props: {
          items: mockItems,
        },
      })

      expect(wrapper.find('[data-test="decision-queue"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="decision-items-list"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="decision-item-duel-01"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="decision-item-margin-01"]').exists()).toBe(true)
    })
  })

  describe('assay B: Safety Orange urgency counter badge', () => {
    it('should render the active counter badge with International Safety Orange styling', () => {
      const wrapper = mount(DecisionQueue, {
        props: {
          items: mockItems,
        },
      })

      const badge = wrapper.find('[data-test="decision-count-badge"]')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toContain('NEEDS YOUR DECISION')
      expect(badge.text()).toContain('2')
      expect(badge.classes()).toContain('text-[#FF5522]')
    })
  })

  describe('assay C: action button differentiation (Atrium model)', () => {
    it('should differentiate primary and secondary action buttons', () => {
      const wrapper = mount(DecisionQueue, {
        props: {
          items: mockItems,
        },
      })

      const declineBtn = wrapper.find('[data-test="decline-btn-duel-01"]')
      const acceptBtn = wrapper.find('[data-test="accept-btn-duel-01"]')

      expect(declineBtn.exists()).toBe(true)
      expect(acceptBtn.exists()).toBe(true)

      // Secondary action: hairline outline
      expect(declineBtn.classes()).toContain('border-white/10')
      expect(declineBtn.classes()).toContain('bg-white/5')

      // Primary action for CRITICAL urgency: filled Safety Orange
      expect(acceptBtn.classes()).toContain('bg-[#FF5522]')
      expect(acceptBtn.classes()).toContain('border-[#FF5522]')
    })
  })

  describe('assay D: decision acceptance & decline event emission', () => {
    it('should emit acceptDecision with item payload and remove item from local list', async () => {
      const wrapper = mount(DecisionQueue, {
        props: {
          items: mockItems,
        },
      })

      const acceptBtn = wrapper.find('[data-test="accept-btn-duel-01"]')
      await acceptBtn.trigger('click')

      expect(wrapper.emitted('acceptDecision')).toBeTruthy()
      expect(wrapper.emitted('acceptDecision')?.[0][0]).toMatchObject({ id: 'duel-01' })

      // Item should be removed from local view
      expect(wrapper.find('[data-test="decision-item-duel-01"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="decision-item-margin-01"]').exists()).toBe(true)
    })

    it('should emit declineDecision and remove declined item', async () => {
      const wrapper = mount(DecisionQueue, {
        props: {
          items: mockItems,
        },
      })

      const declineBtn = wrapper.find('[data-test="decline-btn-margin-01"]')
      await declineBtn.trigger('click')

      expect(wrapper.emitted('declineDecision')).toBeTruthy()
      expect(wrapper.emitted('declineDecision')?.[0][0]).toMatchObject({ id: 'margin-01' })

      expect(wrapper.find('[data-test="decision-item-margin-01"]').exists()).toBe(false)
    })
  })

  describe('assay E: empty state rendering', () => {
    it('should display quiet empty state when zero items are queued', () => {
      const wrapper = mount(DecisionQueue, {
        props: {
          items: [],
        },
      })

      expect(wrapper.find('[data-test="decision-empty-state"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="decision-empty-state"]').text()).toContain('ALL DECISION QUEUES CLEAR')
      expect(wrapper.find('[data-test="decision-count-badge"]').exists()).toBe(false)
    })
  })

  describe('assay F: Deep Midnight HUD elevation', () => {
    it('should apply 4-tier elevation Level 1 panel token bg-[#0E121B] and hairline border', () => {
      const wrapper = mount(DecisionQueue, {
        props: {
          items: mockItems,
        },
      })

      const root = wrapper.find('[data-test="decision-queue"]')
      expect(root.classes()).toContain('bg-[#0E121B]')
      expect(root.classes()).toContain('border-white/10')
    })
  })
})
