/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite for Mission THEME-1: Sticky Glassmorphic Navbar & Brand Identity Revamp
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import HomeNav from '../src/components/navigation/HomeNav.vue'

// Mock vue-i18n
vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<Record<string, any>>()
  const messages: Record<string, string> = {
    'misc.home': 'Home',
    'pages.dashboard.title': 'Dashboard',
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

describe('sticky Glassmorphic Navbar & Brand Identity (THEME-1)', () => {
  function mountNav() {
    return mount(HomeNav, {
      global: {
        stubs: {
          LanguageSwitch: defineComponent({
            template: '<div class="language-switch-stub">LANG</div>',
          }),
          ThemeSwitch: defineComponent({
            template: '<div class="theme-switch-stub">THEME</div>',
          }),
          NTooltip: defineComponent({
            template: '<div class="n-tooltip-stub"><slot name="trigger" /></div>',
          }),
          NButton: defineComponent({
            props: ['type', 'size', 'round', 'text'],
            emits: ['click'],
            template: '<button class="n-button-stub" @click="$emit(\'click\')"><slot name="icon" /><slot /></button>',
          }),
          NIcon: defineComponent({
            template: '<span class="n-icon-stub"><slot /></span>',
          }),
          RouterLink: defineComponent({
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

  it('assay A: renders sticky frosted glass header container with brand identity and season badge', () => {
    const wrapper = mountNav()

    const header = wrapper.find('header')
    expect(header.exists()).toBe(true)
    expect(header.classes()).toContain('sticky')
    expect(header.classes()).toContain('top-0')

    // Brand and season badge
    expect(wrapper.text()).toContain('Fintasy')
    expect(wrapper.text()).toContain('BETA S1')
  })

  it('assay B: navigation links point to home and dashboard routes', () => {
    const wrapper = mountNav()

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Dashboard')

    // Check brand home link
    const brandLink = wrapper.find('a[href="/"]')
    expect(brandLink.exists()).toBe(true)
  })

  it('assay C: Play Royale CTA button renders with dual-theme classes and triggers router navigation', async () => {
    const wrapper = mountNav()

    const royaleBtn = wrapper.find('.play-royale-nav-btn')
    expect(royaleBtn.exists()).toBe(true)
    expect(wrapper.text()).toContain('Play Royale')

    await royaleBtn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/dashboard/royale')
  })

  it('assay D: renders language and theme switcher utility widgets', () => {
    const wrapper = mountNav()

    expect(wrapper.find('.language-switch-stub').exists()).toBe(true)
    expect(wrapper.find('.theme-switch-stub').exists()).toBe(true)
  })
})
