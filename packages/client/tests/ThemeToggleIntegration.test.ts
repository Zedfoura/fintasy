/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest integration test suite for Mission THEME-6: Full Theme Toggle & Design Consistency Verification
 */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

import HomeNav from '../src/components/navigation/HomeNav.vue'
import LandingDuelSimulator from '../src/components/landing/LandingDuelSimulator.vue'
import LandingFooter from '../src/components/landing/LandingFooter.vue'
import LandingGameplayPillars from '../src/components/landing/LandingGameplayPillars.vue'
import LandingSocialProof from '../src/components/landing/LandingSocialProof.vue'
import IndexPage from '../src/pages/index.vue'
import LoginView from '../src/pages/login.vue'

// Mock vue-i18n
vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<Record<string, any>>()
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key,
      locale: { value: 'en' },
    }),
  }
})

// Mock vue-router
const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/', query: {} }),
  useRouter: () => ({ push: mockPush }),
  RouterLink: defineComponent({
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  }),
}))

// Mock @vueuse/head
vi.mock('@vueuse/head', () => ({
  useHead: vi.fn(),
}))

// Mock Naive UI components for reliable DOM assertions
vi.mock('naive-ui', () => ({
  NCard: defineComponent({
    name: 'NCard',
    template: '<div class="n-card-stub" :class="$attrs.class"><slot /></div>',
  }),
  NTag: defineComponent({
    name: 'NTag',
    props: ['type', 'size'],
    template: '<span class="n-tag-stub" :class="$attrs.class" :data-type="type"><slot /></span>',
  }),
  NTabs: defineComponent({
    name: 'NTabs',
    props: ['value'],
    template: '<div class="n-tabs-stub"><slot /></div>',
  }),
  NTabPane: defineComponent({
    name: 'NTabPane',
    props: ['name', 'tab'],
    template: '<button class="tab-btn" :data-tab="name">{{ tab }}</button>',
  }),
  NAlert: defineComponent({
    name: 'NAlert',
    props: ['type'],
    template: '<div class="n-alert-stub" :data-type="type"><slot /></div>',
  }),
  NInput: defineComponent({
    name: 'NInput',
    props: ['value', 'type', 'placeholder'],
    template: '<input class="n-input-stub" :type="type || \'text\'" :value="value" :placeholder="placeholder" />',
  }),
  NCheckbox: defineComponent({
    name: 'NCheckbox',
    props: ['checked'],
    template: '<label class="n-checkbox-stub"><slot /></label>',
  }),
  NButton: defineComponent({
    name: 'NButton',
    props: ['type', 'size', 'round', 'secondary', 'text', 'disabled'],
    template: '<button class="n-button-stub" :class="$attrs.class" :disabled="disabled"><slot name="icon" /><slot /></button>',
  }),
  NTooltip: defineComponent({
    name: 'NTooltip',
    template: '<div class="n-tooltip-stub"><slot name="trigger" /><slot /></div>',
  }),
  NIcon: defineComponent({
    name: 'NIcon',
    template: '<i class="n-icon-stub"><slot /></i>',
  }),
}))

describe('full Monorepo Theme Toggle & Design Consistency Verification (THEME-6)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
  })

  it('assay A: HomeNav header implements frosted sticky glassmorphism and dual-theme tokens', () => {
    const wrapper = mount(HomeNav, {
      global: {
        stubs: {
          LanguageSwitch: { template: '<div class="lang-switch-stub" />' },
          ThemeSwitch: { template: '<div class="theme-switch-stub" />' },
          RouterLink: defineComponent({
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          }),
        },
      },
    })

    const header = wrapper.find('header')
    expect(header.exists()).toBe(true)
    expect(header.classes()).toContain('sticky')
    expect(header.classes()).toContain('top-0')
    expect(header.classes()).toContain('z-50')
    expect(header.classes()).toContain('backdrop-blur-xl')
    expect(header.classes()).toContain('bg-white/85')
    expect(header.classes()).toContain('dark:bg-[#0c0d14]/85')
    expect(header.classes()).toContain('border-slate-200/80')
    expect(header.classes()).toContain('dark:border-[#1f2438]')

    // Play Royale CTA button
    const cta = wrapper.find('.play-royale-nav-btn')
    expect(cta.exists()).toBe(true)
    expect(cta.text()).toContain('Play Royale')
  })

  it('assay B: LoginView mounts with dual-theme card tokens and high-contrast typography', () => {
    const wrapper = mount(LoginView)

    const card = wrapper.find('.login-card')
    expect(card.exists()).toBe(true)
    expect(card.classes()).toContain('border-slate-200')
    expect(card.classes()).toContain('dark:border-[#1f2438]')
    expect(card.classes()).toContain('bg-white/95')
    expect(card.classes()).toContain('dark:bg-[#0c0d14]/95')

    const title = wrapper.find('h1')
    expect(title.classes()).toContain('text-slate-900')
    expect(title.classes()).toContain('dark:text-white')
  })

  it('assay C: Landing Page Hero features adaptive headline gradient and high-contrast subtitle', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          LandingGameplayPillars: { template: '<div />' },
          LandingDuelSimulator: { template: '<div />' },
          LandingSocialProof: { template: '<div />' },
          LandingFooter: { template: '<div />' },
          RouterLink: defineComponent({
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          }),
        },
      },
    })

    const headlineSpan = wrapper.find('.landing-hero-headline span')
    expect(headlineSpan.exists()).toBe(true)
    expect(headlineSpan.classes()).toContain('from-emerald-700')
    expect(headlineSpan.classes()).toContain('dark:from-emerald-400')

    const subtitle = wrapper.find('.landing-hero-subtitle')
    expect(subtitle.exists()).toBe(true)
    expect(subtitle.classes()).toContain('text-slate-600')
    expect(subtitle.classes()).toContain('dark:text-gray-300')
  })

  it('assay D: 4-Pillar Showcase features adaptive card background and section header', () => {
    const wrapper = mount(LandingGameplayPillars)

    const title = wrapper.find('h2')
    expect(title.classes()).toContain('text-slate-900')
    expect(title.classes()).toContain('dark:text-white')

    const card = wrapper.find('.pillar-card')
    expect(card.exists()).toBe(true)
    expect(card.classes()).toContain('border-slate-200')
    expect(card.classes()).toContain('dark:border-[#1f2438]')
    expect(card.classes()).toContain('bg-white/95')
    expect(card.classes()).toContain('dark:bg-[#0c0d14]/90')
  })

  it('assay E: Duel Simulator arena card implements dual-theme fintech surfaces', () => {
    const wrapper = mount(LandingDuelSimulator, {
      props: { autoStart: false },
    })

    const card = wrapper.find('.duel-arena-card')
    expect(card.exists()).toBe(true)
    expect(card.classes()).toContain('border-slate-200')
    expect(card.classes()).toContain('dark:border-[#1f2438]')
    expect(card.classes()).toContain('bg-white/95')
    expect(card.classes()).toContain('dark:bg-[#0c0d14]/95')
  })

  it('assay F: Social Proof, Leaderboard and Footer feature dual-theme surfaces and borders', () => {
    const proofWrapper = mount(LandingSocialProof)

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

    const footerWrapper = mount(LandingFooter, {
      global: {
        stubs: {
          RouterLink: defineComponent({
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          }),
        },
      },
    })

    const footer = footerWrapper.find('.landing-footer')
    expect(footer.exists()).toBe(true)
    expect(footer.classes()).toContain('border-slate-200')
    expect(footer.classes()).toContain('dark:border-[#1f2438]')
    expect(footer.classes()).toContain('bg-slate-100/90')
    expect(footer.classes()).toContain('dark:bg-[#07080d]')
  })
})
