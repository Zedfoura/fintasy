/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite verifying Marketing Landing Page Hero & Conversion CTAs (LANDING-1 & LANDING-REV-2)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingPage from '../src/pages/index.vue'
import HomeNav from '../src/components/navigation/HomeNav.vue'

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
  RouterLink: {
    template: '<a><slot /></a>',
  },
}))

// Mock @vueuse/head
vi.mock('@vueuse/head', () => ({
  useHead: vi.fn(),
}))

describe('marketing Landing Page Hero & Conversion (LANDING-1 & LANDING-REV-2)', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('assay A: renders Stock Royale headline and value proposition subtitle with fresh copy', () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
          NButton: { template: '<button class="n-button" @click="$emit(\'click\')"><slot name="icon" /><slot /></button>' },
          RouterLink: true,
        },
      },
    })

    expect(wrapper.find('.landing-hero-headline').text()).toContain('High-Stakes Capital Warfare.')
    expect(wrapper.find('.landing-hero-subtitle').text()).toContain('Trade the tape in ultra-fast 30-second duels')
  })

  it('assay B: renders live status chips for season, active traders, and 100ms engine', () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
          NButton: { template: '<button class="n-button"><slot name="icon" /><slot /></button>' },
          RouterLink: true,
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('SEASON 01 • S&P 500 LIQUIDITY WARFARE')
    expect(text).toContain('100ms MATCH ENGINE')
    expect(text).toContain('48,200+')
    expect(text).toContain('$15,000.00')
  })

  it('assay C: dual conversion CTAs trigger navigation to /dashboard/royale and /login', async () => {
    const wrapper = mount(LandingPage, {
      global: {
        mocks: {
          $router: { push: mockPush },
        },
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
          NButton: {
            props: ['type', 'secondary', 'text'],
            template: '<button :class="[\'n-button\', $attrs.class]" @click="$emit(\'click\')"><slot name="icon" /><slot /></button>',
          },
          RouterLink: true,
        },
      },
    })

    const deployBtn = wrapper.find('.deploy-cta-btn')
    expect(deployBtn.exists()).toBe(true)
    await deployBtn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/dashboard/royale')

    const loginBtn = wrapper.find('.login-cta-btn')
    expect(loginBtn.exists()).toBe(true)
    await loginBtn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('assay D: HomeNav renders Play Royale CTA button pointing to /dashboard/royale', async () => {
    const wrapper = mount(HomeNav, {
      global: {
        mocks: {
          $router: { push: mockPush },
        },
        stubs: {
          NTooltip: { template: '<div><slot name="trigger" /><slot /></div>' },
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
          NButton: {
            props: ['type'],
            template: '<button :class="[\'n-button\', $attrs.class]" @click="$emit(\'click\')"><slot name="icon" /><slot /></button>',
          },
          LanguageSwitch: { template: '<div class="lang-switch-stub" />' },
          ThemeSwitch: { template: '<div class="theme-switch-stub" />' },
          RouterLink: true,
        },
      },
    })

    const playRoyaleBtn = wrapper.find('.play-royale-nav-btn')
    expect(playRoyaleBtn.exists()).toBe(true)
    expect(playRoyaleBtn.text()).toContain('Play Royale')

    await playRoyaleBtn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/dashboard/royale')
  })

  it('assay E: renders simulated financial ticker stream and tactical preview card', () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
          NButton: { template: '<button class="n-button"><slot name="icon" /><slot /></button>' },
          RouterLink: true,
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('NVDA')
    expect(text).toContain('TSLA')
    expect(text).toContain('AAPL')
    expect(text).toContain('TACTICAL COMBAT TERMINAL')
    expect(text).toContain('High-Frequency Combat HUD')
  })

  it('assay F: dual-theme styling tokens applied to headline, subtitle, and status chips', () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
          NButton: { template: '<button class="n-button"><slot name="icon" /><slot /></button>' },
          RouterLink: true,
        },
      },
    })

    const headlineSpan = wrapper.find('.landing-hero-headline span')
    expect(headlineSpan.classes()).toContain('from-emerald-700')
    expect(headlineSpan.classes()).toContain('dark:from-emerald-400')

    const subtitle = wrapper.find('.landing-hero-subtitle')
    expect(subtitle.classes()).toContain('text-slate-600')
    expect(subtitle.classes()).toContain('dark:text-gray-300')
  })

  it('assay G: Grounded in Reason dot-matrix canvas & Instrument Serif editorial typography', () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
          NButton: { template: '<button class="n-button"><slot name="icon" /><slot /></button>' },
          RouterLink: true,
        },
      },
    })

    const root = wrapper.find('.landing-page-root')
    expect(root.classes()).toContain('fn-dot-matrix')

    const headline = wrapper.find('.landing-hero-headline')
    expect(headline.classes()).toContain('font-serif')

    expect(wrapper.text()).toContain('TACTICAL COMBAT TERMINAL')
  })
})
