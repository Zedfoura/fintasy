/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite verifying Testimonials, FAQ Accordion & Final Hero CTA (LANDING-REV-4)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import LandingTestimonials from '../src/components/landing/LandingTestimonials.vue'
import LandingFAQ from '../src/components/landing/LandingFAQ.vue'
import LandingFinalCTA from '../src/components/landing/LandingFinalCTA.vue'

// Mock vue-router
const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/' }),
  useRouter: () => ({ push: mockPush }),
  RouterLink: defineComponent({
    name: 'RouterLink',
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  }),
}))

describe('testimonials, FAQ Accordion & Final Hero CTA (LANDING-REV-4)', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('assay A: LandingTestimonials renders all 4 authentic trader cards with ranks and win rates', () => {
    const wrapper = mount(LandingTestimonials, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('Marcus Vance')
    expect(text).toContain('Golden Trader Tier #14')
    expect(text).toContain('78.4% Win Rate')

    expect(text).toContain('Elena Rostova')
    expect(text).toContain('Apex MMR 2,840')
    expect(text).toContain('82.1% Win Rate')

    expect(text).toContain('David Chen')
    expect(text).toContain('Diamond II Division')
    expect(text).toContain('69.5% Win Rate')

    expect(text).toContain('Sarah Jenkins')
    expect(text).toContain('Platinum III')
    expect(text).toContain('71.0% Win Rate')
  })

  it('assay B: LandingFAQ expands and collapses question accordions interactively', async () => {
    const wrapper = mount(LandingFAQ, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const triggers = wrapper.findAll('.faq-trigger')
    expect(triggers.length).toBe(6)

    // Initially item 0 is expanded
    expect(wrapper.text()).toContain('Every trader enters each match with $15,000 in simulated equity')

    // Click item 1 to expand
    await triggers[1].trigger('click')
    expect(wrapper.text()).toContain('macro interest rate shocks drain liquidity')

    // Click item 1 again to collapse
    await triggers[1].trigger('click')
    expect(wrapper.find('.faq-content').isVisible()).toBe(false)
  })

  it('assay C: LandingFinalCTA renders tournament countdown, $15,000 starting stake, and trust signals', () => {
    const wrapper = mount(LandingFinalCTA, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('NEXT GLOBAL TOURNAMENT DROPS IN 04:32')
    expect(text).toContain('Claim Your $15,000 Starting Stake')
    expect(text).toContain('No Credit Card Required')
    expect(text).toContain('Instant Browser Play')
    expect(text).toContain('Steam Deck Verified')
  })

  it('assay D: final deploy CTA button navigates to /dashboard/royale', async () => {
    const wrapper = mount(LandingFinalCTA, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const deployBtn = wrapper.find('.final-deploy-btn')
    expect(deployBtn.exists()).toBe(true)
    await deployBtn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/dashboard/royale')

    const loginBtn = wrapper.find('.final-login-btn')
    expect(loginBtn.exists()).toBe(true)
    await loginBtn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
