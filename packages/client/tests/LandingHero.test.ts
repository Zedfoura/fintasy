/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite verifying Marketing Landing Page Hero & Conversion CTAs (LANDING-1 & LANDING-REV-2)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
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

describe('homeNav Play Royale CTA (LANDING-1; page assays retired by HERO-4 — the old landing page is no longer mounted on /)', () => {
  beforeEach(() => {
    mockPush.mockClear()
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
})
