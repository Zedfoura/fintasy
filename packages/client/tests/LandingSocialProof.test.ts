/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite for Mission LANDING-4: Social Proof Stats, Golden Trader Apex Leaderboard Preview & FAQ
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import LandingSocialProof from '../src/components/landing/LandingSocialProof.vue'
import LandingFooter from '../src/components/landing/LandingFooter.vue'

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('marketing Landing Page Social Proof, Leaderboard & FAQ (LANDING-4)', () => {
  function mountSocialProof() {
    return mount(LandingSocialProof, {
      global: {
        stubs: {
          NCard: defineComponent({
            name: 'NCard',
            template: '<div class="n-card-stub" :class="$attrs.class"><slot /></div>',
          }),
          NTag: defineComponent({
            name: 'NTag',
            props: ['type'],
            template: '<span class="n-tag-stub" :data-type="type"><slot /></span>',
          }),
          NButton: defineComponent({
            name: 'NButton',
            props: ['type', 'size'],
            emits: ['click'],
            template: '<button class="n-button-stub" @click="$emit(\'click\')"><slot /></button>',
          }),
        },
      },
    })
  }

  function mountFooter() {
    return mount(LandingFooter, {
      global: {
        stubs: {
          NTag: defineComponent({
            name: 'NTag',
            template: '<span class="n-tag-stub"><slot /></span>',
          }),
          RouterLink: defineComponent({
            name: 'RouterLink',
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          }),
        },
      },
    })
  }

  beforeEach(() => {
    mockPush.mockClear()
  })

  it('assay A: renders 4 key platform stats including $15,000 starting capital invariant (INV-1)', () => {
    const wrapper = mountSocialProof()

    expect(wrapper.text()).toContain('60')
    expect(wrapper.text()).toContain('MAX TRADERS')

    expect(wrapper.text()).toContain('$15,000.00')
    expect(wrapper.text()).toContain('STARTING POT')

    expect(wrapper.text()).toContain('100ms')
    expect(wrapper.text()).toContain('TICK ENGINE')

    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('S&P SECTORS')
  })

  it('assay B: renders Golden Trader Apex Leaderboard preview table with top 5 ranked traders', () => {
    const wrapper = mountSocialProof()

    expect(wrapper.text()).toContain('GOLDEN TRADER APEX LADDER')
    expect(wrapper.text()).toContain('QuantumBull')
    expect(wrapper.text()).toContain('MomentumKing')
    expect(wrapper.text()).toContain('HFT_Viper')
    expect(wrapper.text()).toContain('AlphaSeeker')
    expect(wrapper.text()).toContain('DeltaNeutral')

    expect(wrapper.text()).toContain('2,840')
    expect(wrapper.text()).toContain('GOLDEN TRADER')
  })

  it('assay C: ranked leaderboard CTA button triggers navigation to /dashboard/royale', async () => {
    const wrapper = mountSocialProof()

    const ladderBtn = wrapper.find('.ranked-ladder-btn')
    expect(ladderBtn.exists()).toBe(true)
    await ladderBtn.trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/dashboard/royale')
  })

  it('assay D: interactive FAQ accordion expands and collapses Q&A items', async () => {
    const wrapper = mountSocialProof()

    expect(wrapper.text()).toContain('FREQUENTLY ASKED QUESTIONS')
    expect(wrapper.text()).toContain('What is Stock Royale?')

    // Initial state: FAQ item 0 might be open or closed
    const faqButtons = wrapper.findAll('.faq-question-btn')
    expect(faqButtons.length).toBeGreaterThanOrEqual(4)

    // Click second question (Index 1: "Do I need real money?")
    await faqButtons[1].trigger('click')
    expect(wrapper.text()).toContain('100% risk-free simulated capital')

    // Click again to toggle collapse
    await faqButtons[1].trigger('click')
    expect(wrapper.find('.faq-answer-1').exists()).toBe(false)
  })

  it('assay E: platform footer renders brand, Steam Deck readiness badge, and navigation links', () => {
    const wrapper = mountFooter()

    expect(wrapper.text()).toContain('FINTASY')
    expect(wrapper.text()).toContain('STEAM DECK READY • TAURI 2.0')
    expect(wrapper.text()).toContain('© 2026 Fintasy Inc.')

    const links = wrapper.findAll('a')
    const hrefs = links.map(l => l.attributes('href'))
    expect(hrefs).toContain('/dashboard/royale')
    expect(hrefs).toContain('/dashboard')
    expect(hrefs).toContain('/login')
  })

  it('assay F: dual-theme styling tokens applied to stats cards, leaderboard, and footer', () => {
    const proofWrapper = mountSocialProof()
    const statCard = proofWrapper.find('.social-stat-card')
    expect(statCard.exists()).toBe(true)
    expect(statCard.classes()).toContain('border-slate-200')
    expect(statCard.classes()).toContain('dark:border-[#1f2438]')
    expect(statCard.classes()).toContain('bg-white/90')
    expect(statCard.classes()).toContain('dark:bg-[#0c0d14]/80')

    const leaderboardCard = proofWrapper.find('.leaderboard-card')
    expect(leaderboardCard.exists()).toBe(true)
    expect(leaderboardCard.classes()).toContain('border-slate-200')
    expect(leaderboardCard.classes()).toContain('dark:border-[#1f2438]')

    const footerWrapper = mountFooter()
    const footer = footerWrapper.find('.landing-footer')
    expect(footer.exists()).toBe(true)
    expect(footer.classes()).toContain('border-slate-200')
    expect(footer.classes()).toContain('dark:border-[#1f2438]')
    expect(footer.classes()).toContain('bg-slate-100/90')
    expect(footer.classes()).toContain('dark:bg-[#07080d]')
  })
})
