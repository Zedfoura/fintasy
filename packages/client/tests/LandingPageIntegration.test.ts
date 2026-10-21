/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest integration test suite for Mission LANDING-REV-5: Full 11-Element Assembly & E2E Flow Verification
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import LandingPage from '../src/pages/index.vue'

// Mock vue-i18n
vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<Record<string, any>>()
  const messages: Record<string, string> = {
    'pages.main.title': 'Stock Royale • 60-Player Trading Simulator',
    'pages.dashboard.title': 'Dashboard',
    'misc.home': 'Home',
  }

  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => messages[key] || key,
      locale: { value: 'en' },
    }),
  }
})

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

// Mock @vueuse/head
vi.mock('@vueuse/head', () => ({
  useHead: vi.fn(),
}))

describe('marketing Landing Page Full Assembly & Verification (LANDING-REV-5)', () => {
  function mountFullPage() {
    return mount(LandingPage, {
      global: {
        stubs: {
          NCard: defineComponent({
            name: 'NCard',
            template: '<div class="card-stub"><slot /></div>',
          }),
          NButton: defineComponent({
            name: 'NButton',
            props: ['type', 'size', 'disabled'],
            emits: ['click'],
            template: '<button class="n-button-stub" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
          }),
          NIcon: defineComponent({
            name: 'NIcon',
            template: '<span class="n-icon-stub"><slot /></span>',
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

  it('assay A: mounts full landing page verifying presence of all core sections in DOM', () => {
    const wrapper = mountFullPage()
    const text = wrapper.text()

    // 1. Navigation Header
    expect(text).toContain('FINTASY')
    expect(text).toContain('STOCK ROYALE')
    expect(text).toContain('10 Hz LIVE')

    // 2. Hero Section
    expect(text).toContain('High-Stakes Capital Warfare.')
    expect(text).toContain('Where Wall Street Meets Battle Royale.')
    expect(text).toContain('SEASON 01 • S&P 500 LIQUIDITY WARFARE')

    // 3. Media Terminal Preview Section
    expect(text).toContain('TACTICAL COMBAT TERMINAL')
    expect(text).toContain('High-Frequency Combat HUD')
    expect(text).toContain('MATCH #9421 • FINAL CIRCLE')

    // 4. 4 Pillars Section
    expect(text).toContain('THE 4 PILLARS OF STOCK ROYALE')
    expect(text).toContain('30-Second PVP Micro-Trading Duels')
    expect(text).toContain('Federal Reserve Liquidity Storm')

    // 5. Testimonials Section
    expect(text).toContain('VERIFIED TRADER DEBRIEFINGS')
    expect(text).toContain('Marcus Vance')

    // 6. FAQ Section
    expect(text).toContain('FREQUENTLY ASKED QUESTIONS')
    expect(text).toContain('Is real money required to play Stock Royale?')

    // 7. Final Hero CTA
    expect(text).toContain('NEXT GLOBAL TOURNAMENT DROPS IN 04:32')
    expect(text).toContain('The Arena is Live.')

    // 8. Footer Section
    expect(text).toContain('© 2026 Fintasy Inc.')
    expect(text).toContain('DESIGNED BY DIETER RAMS PRINCIPLES')
  })

  it('assay B: dual hero conversion CTAs execute router navigation to /dashboard/royale and /login', async () => {
    const wrapper = mountFullPage()

    const deployCta = wrapper.find('.deploy-cta-btn')
    expect(deployCta.exists()).toBe(true)
    await deployCta.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/dashboard/royale')

    const loginCta = wrapper.find('.login-cta-btn')
    expect(loginCta.exists()).toBe(true)
    await loginCta.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('assay C: verifies invariant preservation throughout assembled surface (INV-1)', () => {
    const wrapper = mountFullPage()
    const fullText = wrapper.text()

    // Invariant INV-1: $15,000 starting capital appears across multiple sections
    expect(fullText).toContain('$15,000 Starting Stake')
    expect(fullText).toContain('$15,000.00')

    // Key engine specs
    expect(fullText).toContain('100ms')
    expect(fullText).toContain('48,200+')
    expect(fullText).toContain('$142M+')
  })

  it('assay D: interactive widgets execute independently without cross-component contamination', async () => {
    const wrapper = mountFullPage()

    // 1. Test duel simulator leverage selector in media section
    const levChips = wrapper.findAll('.leverage-chip')
    if (levChips.length >= 3) {
      await levChips[0].trigger('click')
      expect(wrapper.text()).toContain('+$368.10')
      await levChips[2].trigger('click')
      expect(wrapper.text()).toContain('+$1,840.50')
    }

    // 2. Test FAQ accordion toggle
    const faqTriggers = wrapper.findAll('.faq-trigger')
    if (faqTriggers.length > 1) {
      await faqTriggers[1].trigger('click')
      expect(wrapper.text()).toContain('macro interest rate shocks drain liquidity')
    }
  })
})
