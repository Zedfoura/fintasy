/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest integration test suite verifying Stock Royale client route and navigation mounting (CLEAN-2)
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SideBar from '../src/components/navigation/SideBar.vue'
import RoyaleDashboard from '../src/pages/dashboard/royale.vue'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/dashboard/royale' }),
  useRouter: () => ({ push: mockPush }),
}))

// Mock @vueuse/head
vi.mock('@vueuse/head', () => ({
  useHead: vi.fn(),
}))

// Mock pinia stores
vi.mock('~/stores/sidebar', () => ({
  useSidebarStore: () => ({
    collapsed: false,
    toggle: vi.fn(),
  }),
}))

describe('stock Royale Route & Navigation Integration (CLEAN-2)', () => {
  it('assay A: SideBar navigation renders Stock Royale entry pointing to /dashboard/royale', () => {
    const wrapper = mount(SideBar, {
      global: {
        provide: {
          'n-layout': {
            siderClsRef: { value: '' },
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Stock Royale')
  })

  it('assay B: royale.vue mounts with header HUD and Deploy button in standby state', () => {
    const wrapper = mount(RoyaleDashboard, {
      global: {
        stubs: {
          NCard: { template: '<div class="n-card-stub"><slot name="header" /><slot /></div>' },
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
          NTag: { template: '<span class="n-tag"><slot /></span>' },
          NButton: { template: '<button class="n-button"><slot name="icon" /><slot /></button>' },
          NGrid: { template: '<div><slot /></div>' },
          NGridItem: { template: '<div><slot /></div>' },
          MarketRadarMap: { template: '<div class="radar-stub">Radar</div>' },
          TradingDuelArena: { template: '<div class="duel-stub">Duel</div>' },
          KillFeed: { template: '<div class="killfeed-stub">KillFeed</div>' },
          MatchVictoryModal: { template: '<div class="victory-stub">Victory</div>' },
        },
      },
    })

    expect(wrapper.text()).toContain('STOCK ROYALE')
    expect(wrapper.text()).toContain('SEASON 1')
    expect(wrapper.text()).toContain('$15,000.00')
    expect(wrapper.text()).toContain('DEPLOY STOCK ROYALE')
  })

  it('assay C: clicking deploy transitions into active tactical match mode', async () => {
    const wrapper = mount(RoyaleDashboard, {
      global: {
        stubs: {
          NCard: { template: '<div class="n-card-stub"><slot name="header" /><slot /></div>' },
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
          NTag: { template: '<span class="n-tag"><slot /></span>' },
          NButton: { template: '<button class="n-button" @click="$emit(\'click\')"><slot name="icon" /><slot /></button>' },
          NGrid: { template: '<div><slot /></div>' },
          NGridItem: { template: '<div><slot /></div>' },
          MarketRadarMap: { template: '<div class="radar-stub">Radar</div>' },
          TradingDuelArena: { template: '<div class="duel-stub">Duel</div>' },
          KillFeed: { template: '<div class="killfeed-stub">KillFeed</div>' },
          MatchVictoryModal: { template: '<div class="victory-stub">Victory</div>' },
        },
      },
    })

    // Initially in standby
    expect(wrapper.find('.radar-stub').exists()).toBe(false)

    // Click deploy button
    const deployBtn = wrapper.find('.n-button')
    await deployBtn.trigger('click')

    // Now in match: radar and kill feed render
    expect(wrapper.find('.radar-stub').exists()).toBe(true)
    expect(wrapper.find('.killfeed-stub').exists()).toBe(true)
  })

  it('assay D: toggling duel reveals TradingDuelArena component', async () => {
    const wrapper = mount(RoyaleDashboard, {
      global: {
        stubs: {
          NCard: { template: '<div class="n-card-stub"><slot name="header" /><slot /></div>' },
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
          NTag: { template: '<span class="n-tag"><slot /></span>' },
          NButton: { template: '<button class="n-button" @click="$emit(\'click\')"><slot name="icon" /><slot /></button>' },
          NGrid: { template: '<div><slot /></div>' },
          NGridItem: { template: '<div><slot /></div>' },
          MarketRadarMap: { template: '<div class="radar-stub">Radar</div>' },
          TradingDuelArena: { template: '<div class="duel-stub">Duel</div>' },
          KillFeed: { template: '<div class="killfeed-stub">KillFeed</div>' },
          MatchVictoryModal: { template: '<div class="victory-stub">Victory</div>' },
        },
      },
    })

    // Deploy match
    const deployBtn = wrapper.find('.n-button')
    await deployBtn.trigger('click')

    // Find the duel toggle button
    const buttons = wrapper.findAll('.n-button')
    const duelBtn = buttons.find(b => b.text().includes('Combat Duel'))
    expect(duelBtn).toBeDefined()
    if (duelBtn) {
      await duelBtn.trigger('click')
      expect(wrapper.find('.duel-stub').exists()).toBe(true)
    }
  })
})
