/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite verifying Navigation Header & Hero Combat Terminal (LANDING-REV-2)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import LandingHeader from '../src/components/landing/LandingHeader.vue'
import LandingHero from '../src/components/landing/LandingHero.vue'

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

describe('navigation Header & Hero Combat Terminal (LANDING-REV-2)', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('assay A: LandingHeader renders tactical brand logo, taxonomy chip, and 10 Hz status dot', () => {
    const wrapper = mount(LandingHeader, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('FINTASY')
    expect(text).toContain('STOCK ROYALE')
    expect(text).toContain('COMBAT TERMINAL')
    expect(text).toContain('10 Hz LIVE')
  })

  it('assay B: LandingHeader buttons trigger router navigation to /dashboard/royale and /login', async () => {
    const wrapper = mount(LandingHeader, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const deployBtn = wrapper.find('.header-deploy-btn')
    expect(deployBtn.exists()).toBe(true)
    await deployBtn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/dashboard/royale')

    const loginBtn = wrapper.find('.header-login-btn')
    expect(loginBtn.exists()).toBe(true)
    await loginBtn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('assay C: LandingHero renders brand-new headline with Instrument Serif and fresh copy', () => {
    const wrapper = mount(LandingHero, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const headline = wrapper.find('.landing-hero-headline')
    expect(headline.exists()).toBe(true)
    expect(headline.classes()).toContain('font-serif')
    expect(headline.text()).toContain('High-Stakes Capital Warfare.')
    expect(headline.text()).toContain('Where Wall Street Meets Battle Royale.')

    const subtitle = wrapper.find('.landing-hero-subtitle')
    expect(subtitle.text()).toContain('Trade the tape in ultra-fast 30-second duels.')
    // Verify absence of legacy copy
    expect(subtitle.text()).not.toContain('The 60-Player Stock Market Battle Royale')
  })

  it('assay D: primary Action Horizon CTA executes router push to /dashboard/royale', async () => {
    const wrapper = mount(LandingHero, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const deployCta = wrapper.find('.deploy-cta-btn')
    expect(deployCta.exists()).toBe(true)
    await deployCta.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/dashboard/royale')

    const loginCta = wrapper.find('.login-cta-btn')
    expect(loginCta.exists()).toBe(true)
    await loginCta.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('assay E: social proof strip renders all 5 telemetry statistics with tabular digits', () => {
    const wrapper = mount(LandingHero, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('$142M+')
    expect(text).toContain('48,200+')
    expect(text).toContain('100ms')
    expect(text).toContain('4.92')
    expect(text).toContain('$0.00')
    expect(text).toContain('HARVARD TRADING CLUB')
    expect(text).toContain('MIT QUANT LAB')
  })
})
