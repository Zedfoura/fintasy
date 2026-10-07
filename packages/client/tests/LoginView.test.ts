/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite for Mission AUTH-3: Tactical Fintech/Cyberpunk Login UI & Form UX Overhaul
 */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import LoginView from '../src/pages/login.vue'
import { useStateStore } from '../src/stores/state'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

// Mock vue-router
const { mockPush, mockRoute } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRoute: {
    path: '/login',
    query: { redirect: '/dashboard/royale' },
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush }),
}))

// Mock @vueuse/head
vi.mock('@vueuse/head', () => ({
  useHead: vi.fn(),
}))

// Mock naive-ui
vi.mock('naive-ui', () => ({
  NCard: defineComponent({
    name: 'NCard',
    template: '<div class="n-card-stub" :class="$attrs.class"><slot /></div>',
  }),
  NTag: defineComponent({
    name: 'NTag',
    props: ['type', 'size'],
    template: '<span class="n-tag-stub" :data-type="type"><slot /></span>',
  }),
  NTabs: defineComponent({
    name: 'NTabs',
    props: ['value'],
    emits: ['update:value'],
    template: '<div class="n-tabs-stub"><slot /></div>',
  }),
  NTabPane: defineComponent({
    name: 'NTabPane',
    props: ['name', 'tab'],
    template: '<button class="tab-btn" :data-tab="name" @click="$parent?.$emit(\'update:value\', name)">{{ tab }}</button>',
  }),
  NAlert: defineComponent({
    name: 'NAlert',
    props: ['type', 'title'],
    template: '<div class="n-alert-stub" :data-type="type"><slot>{{ title }}</slot></div>',
  }),
  NInput: defineComponent({
    name: 'NInput',
    props: ['value', 'type', 'placeholder', 'status', 'size', 'showPasswordOn', 'maxlength', 'autocomplete'],
    emits: ['update:value', 'keydown', 'keyup', 'blur'],
    template: '<input class="n-input-stub" :type="type || \'text\'" :value="value" :placeholder="placeholder" @input="$emit(\'update:value\', $event.target.value)" @keydown="$emit(\'keydown\', $event)" @keyup="$emit(\'keyup\', $event)" @blur="$emit(\'blur\', $event)" />',
  }),
  NCheckbox: defineComponent({
    name: 'NCheckbox',
    props: ['checked'],
    emits: ['update:checked'],
    template: '<label class="n-checkbox-stub"><input type="checkbox" :checked="checked" @change="$emit(\'update:checked\', $event.target.checked)" /><slot /></label>',
  }),
  NButton: defineComponent({
    name: 'NButton',
    props: ['loading', 'type', 'size', 'block'],
    emits: ['click'],
    template: '<button class="n-button-stub" :disabled="loading" :data-type="type" @click="$emit(\'click\')"><slot /></button>',
  }),
}))

describe('tactical Fintech/Cyberpunk Login UI & Form UX (AUTH-3)', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockPush.mockClear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('assay A: mounts login page rendering Stock Royale branding and 3 mode tabs', () => {
    const wrapper = mount(LoginView)

    expect(wrapper.text()).toContain('STOCK ROYALE')
    expect(wrapper.text()).toContain('LIVE TICK ENGINE')
    expect(wrapper.text()).toContain('pages.login.terminal-access')

    const tabButtons = wrapper.findAll('.tab-btn')
    expect(tabButtons.length).toBe(3)
    expect(tabButtons[0].attributes('data-tab')).toBe('login')
    expect(tabButtons[1].attributes('data-tab')).toBe('register')
    expect(tabButtons[2].attributes('data-tab')).toBe('guest')
  })

  it('assay B: switching tabs updates active view between Sign In, Register, and Quick Play Demo', async () => {
    const wrapper = mount(LoginView)

    // Default tab is login: renders 2 inputs (username & password)
    expect(wrapper.findAll('.n-input-stub').length).toBe(2)

    // Switch to Register tab
    const registerTabBtn = wrapper.find('[data-tab="register"]')
    await registerTabBtn.trigger('click')

    // Register tab renders 4 inputs: email, username, password, confirm password
    expect(wrapper.findAll('.n-input-stub').length).toBe(4)
    expect(wrapper.text()).toContain('pages.login.email')
    expect(wrapper.text()).toContain('pages.login.confirm')

    // Switch to Guest Quick-Play Demo tab
    const guestTabBtn = wrapper.find('[data-tab="guest"]')
    await guestTabBtn.trigger('click')

    // Guest tab renders quick play banner and $15,000 starting pot tag
    expect(wrapper.text()).toContain('pages.login.quick-play-title')
    expect(wrapper.text()).toContain('$15,000.00 STARTING POT')
    expect(wrapper.text()).toContain('pages.login.deploy-guest')
  })

  it('assay C: caps-lock detection warns user on password typing and clears on blur', async () => {
    const wrapper = mount(LoginView)

    // Initially no caps-lock warning
    expect(wrapper.find('[data-type="warning"]').exists()).toBe(false)

    // Password input is second input in login view
    const passwordInput = wrapper.findAll('.n-input-stub')[1]
    const capsEvent = {
      key: 'A',
      modifierCapsLock: true,
      getModifierState: (key: string) => key === 'CapsLock',
    }

    await passwordInput.trigger('keydown', capsEvent)
    expect(wrapper.find('[data-type="warning"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('pages.login.caps-lock-warning')

    // Blur clears warning
    await passwordInput.trigger('blur')
    expect(wrapper.find('[data-type="warning"]').exists()).toBe(false)
  })

  it('assay D: form validation blocks submission when required credentials are missing', async () => {
    const wrapper = mount(LoginView)

    // Submit with empty inputs
    const submitBtn = wrapper.find('.n-button-stub')
    await submitBtn.trigger('click')

    // Error alert renders with missing credentials message
    expect(wrapper.find('[data-type="error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('pages.login.missing-credentials')
  })

  it('assay E: guest quick-play button invokes state.loginAsGuest', async () => {
    const wrapper = mount(LoginView)
    const state = useStateStore()
    const guestSpy = vi.spyOn(state, 'loginAsGuest').mockResolvedValue({
      code: 200,
      message: 'Ok',
      data: {
        owner: '00000000-0000-4000-8000-000000000001',
        token: 'test-guest-token',
      },
    } as any)

    // Switch to guest tab
    const guestTabBtn = wrapper.find('[data-tab="guest"]')
    await guestTabBtn.trigger('click')

    // Click deploy as guest button
    const deployBtn = wrapper.find('.n-button-stub')
    expect(deployBtn.text()).toContain('pages.login.deploy-guest')
    await deployBtn.trigger('click')

    expect(guestSpy).toHaveBeenCalledTimes(1)
  })

  it('assay F: dual-theme fintech styling tokens applied to card and typography', () => {
    const wrapper = mount(LoginView)
    const card = wrapper.find('.n-card-stub')
    expect(card.exists()).toBe(true)

    // Card should feature adaptive light and dark classes
    expect(card.classes()).toContain('border-slate-200')
    expect(card.classes()).toContain('dark:border-[#1f2438]')
    expect(card.classes()).toContain('bg-white/95')
    expect(card.classes()).toContain('dark:bg-[#0c0d14]/95')

    // Title should have dual-mode typography classes
    const title = wrapper.find('h1')
    expect(title.classes()).toContain('text-slate-900')
    expect(title.classes()).toContain('dark:text-white')
  })
})
