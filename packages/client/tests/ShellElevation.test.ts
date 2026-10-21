/**
 * @description: Vitest test suite for Mission DESIGN-2: Global Shell & 4-Tier Midnight HUD Elevation Refactor
 * Governed by DATA-MODEL-AUTHORITY.md and docs/design-system/
 */

import fs from 'node:fs'
import path from 'node:path'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

import NavBar from '../src/components/navigation/NavBar.vue'
import SideBar from '../src/components/navigation/SideBar.vue'

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
  useRoute: () => ({ path: '/dashboard', query: {} }),
  useRouter: () => ({ push: mockPush }),
  RouterLink: defineComponent({
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  }),
}))

// Mock Naive UI components
vi.mock('naive-ui', async (importOriginal) => {
  const actual = await importOriginal<Record<string, any>>()
  return {
    ...actual,
    useMessage: () => ({
      info: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    }),
  }
})

describe('global Shell & 4-Tier Midnight HUD Elevation Refactor (DESIGN-2)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockClear()
  })

  it('assay A: App.vue binds CSS root variables to Deep Midnight #07090E chassis', () => {
    const appPath = path.resolve(__dirname, '../src/App.vue')
    // Lowercased: the eslint formatter normalizes hex color casing in App.vue
    const appContent = fs.readFileSync(appPath, 'utf-8').toLowerCase()

    expect(appContent).toContain('--c-bg: #07090e;')
    expect(appContent).toContain('--c-fg: #0e121b;')
    expect(appContent).toContain('--c-text: #f8fafc;')
    expect(appContent).toContain('--c-accent: #10b981;')
  })

  it('assay B: NavBar.vue renders the live 10 Hz telemetry status dot and tabular balance', () => {
    const wrapper = mount(NavBar, {
      global: {
        stubs: {
          Logo: { template: '<div class="logo-stub">Logo</div>' },
          LanguageSwitch: { template: '<div class="lang-stub" />' },
          ThemeSwitch: { template: '<div class="theme-stub" />' },
          AddPortfolioModal: { template: '<div class="modal-stub" />' },
          RouterLink: true,
        },
      },
    })

    const header = wrapper.find('.n-layout-header')
    expect(header.exists()).toBe(true)
    expect(header.classes()).toContain('border-b')
    expect(header.classes()).toContain('border-white/10')
    expect(header.classes()).toContain('bg-[#0E121B]/95')

    const telemetryDot = wrapper.find('[data-test="nav-telemetry-chip"]')
    expect(telemetryDot.exists()).toBe(true)
    expect(telemetryDot.text()).toContain('10 Hz | 14ms')

    const balanceChip = wrapper.find('[data-test="nav-balance-chip"]')
    expect(balanceChip.exists()).toBe(true)
    expect(balanceChip.classes()).toContain('tabular-nums')
    expect(balanceChip.classes()).toContain('font-mono')
  })

  it('assay C: SideBar.vue renders with Deep Midnight panel elevation and hairline border', () => {
    const wrapper = mount(SideBar)
    const sider = wrapper.find('.n-layout-sider')
    expect(sider.exists()).toBe(true)
    expect(sider.classes()).toContain('border-r')
    expect(sider.classes()).toContain('border-white/10')
    expect(sider.classes()).toContain('bg-[#0E121B]')
  })
})
