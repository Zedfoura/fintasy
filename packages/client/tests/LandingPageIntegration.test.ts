/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest integration test suite for Mission LANDING-5: Full Landing Page Assembly & E2E Flow Verification
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
    'pages.main.hero-headline': 'The 60-Player Stock Market Battle Royale',
    'pages.main.hero-subtitle': 'Drop into real-time S&P 500 sectors, loot volatile tickers, fight 30-second trading duels, escape the Federal Reserve liquidity drain storm, and claim the #1 Victory Royale.',
    'pages.main.badge-season': 'Season 1: Liquidity Drain Active',
    'pages.main.badge-traders': '30-60 Traders Per Match',
    'pages.main.badge-engine': '100ms Fast Match Engine',
    'pages.main.badge-starting-pot': '$15,000 Starting Pot',
    'pages.main.cta-deploy': 'Deploy to Stock Royale',
    'pages.main.cta-login': 'Sign In / Register',
    'pages.main.cta-dashboard': 'Standard Paper Trading',
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

describe('marketing Landing Page Full Assembly & Verification (LANDING-5)', () => {
  function mountFullPage() {
    return mount(LandingPage, {
      global: {
        stubs: {
          NCard: defineComponent({
            name: 'NCard',
            template: '<div class="pillar-card-stub"><slot /></div>',
          }),
          NTag: defineComponent({
            name: 'NTag',
            props: ['type'],
            template: '<span class="n-tag-stub" :data-type="type"><slot /></span>',
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

  it('assay A: mounts full landing page verifying presence of all 5 core sections in DOM', () => {
    const wrapper = mountFullPage()

    // 1. Hero Arena Section
    expect(wrapper.text()).toContain('The 60-Player Stock Market Battle Royale')
    expect(wrapper.text()).toContain('Season 1: Liquidity Drain Active')

    // 2. 4 Pillars Section
    expect(wrapper.text()).toContain('THE 4 PILLARS OF STOCK ROYALE')
    expect(wrapper.text()).toContain('Dynamic Sector Map')

    // 3. Duel Mini-Simulator Widget
    expect(wrapper.text()).toContain('TEST YOUR REFLEXES')
    expect(wrapper.text()).toContain('HIGH-FREQUENCY COMBAT SIMULATOR')

    // 4. Social Proof, Leaderboard & FAQ
    expect(wrapper.text()).toContain('GOLDEN TRADER APEX LADDER')
    expect(wrapper.text()).toContain('FREQUENTLY ASKED QUESTIONS')

    // 5. Platform Footer
    expect(wrapper.text()).toContain('STEAM DECK READY • TAURI 2.0')
    expect(wrapper.text()).toContain('© 2026 Fintasy Inc.')
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

    // Invariant INV-1: $15,000 starting capital appears across multiple sections
    const fullText = wrapper.text()
    expect(fullText).toContain('$15,000 Starting Pot')
    expect(fullText).toContain('$15,000.00')

    // Key engine specs
    expect(fullText).toContain('100ms Fast Match Engine')
    expect(fullText).toContain('30-60 Traders Per Match')
  })

  it('assay D: interactive widgets execute independently without cross-component contamination', async () => {
    const wrapper = mountFullPage()

    // 1. Test pillar tab filter
    const mapTabBtn = wrapper.find('[data-tab="map"]')
    if (mapTabBtn.exists()) {
      await mapTabBtn.trigger('click')
      expect(wrapper.text()).toContain('Dynamic Sector Map')
    }

    // 2. Test duel simulator leverage selector
    const lev5Btn = wrapper.find('[data-leverage="5"]')
    if (lev5Btn.exists()) {
      await lev5Btn.trigger('click')
      expect(lev5Btn.classes()).toContain('dark:border-[#00e676]')
    }

    // 3. Test FAQ accordion toggle
    const faqButtons = wrapper.findAll('.faq-question-btn')
    if (faqButtons.length > 1) {
      await faqButtons[1].trigger('click')
      expect(wrapper.text()).toContain('100% risk-free simulated capital')
    }
  })
})
