/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite for Mission LANDING-3: Interactive Client-Side 30-Second Duel Mini-Simulator Widget
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import LandingDuelSimulator from '../src/components/landing/LandingDuelSimulator.vue'

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('marketing Landing Page Duel Mini-Simulator (LANDING-3)', () => {
  function mountSimulator(props = {}) {
    return mount(LandingDuelSimulator, {
      props: {
        autoStart: false,
        ...props,
      },
      global: {
        stubs: {
          NCard: defineComponent({
            name: 'NCard',
            template: '<div class="n-card-stub"><slot /></div>',
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
        },
      },
    })
  }

  it('assay A: mounts component asserting header, opponent profile, and initial ticker standby', () => {
    const wrapper = mountSimulator()

    expect(wrapper.text()).toContain('TEST YOUR REFLEXES')
    expect(wrapper.text()).toContain('30s LIVE DUEL DEMO')
    expect(wrapper.text()).toContain('ApexBot_7')
    expect(wrapper.text()).toContain('NVDA')
    expect(wrapper.text()).toContain('$0.00')

    // Long and Short buttons present
    expect(wrapper.find('[data-action="long"]').exists()).toBe(true)
    expect(wrapper.find('[data-action="short"]').exists()).toBe(true)
  })

  it('assay B: toggles leverage multiplier across 1x, 2x, 3x, and 5x', async () => {
    const wrapper = mountSimulator()

    const btn1x = wrapper.find('[data-leverage="1"]')
    const btn2x = wrapper.find('[data-leverage="2"]')
    const btn3x = wrapper.find('[data-leverage="3"]')
    const btn5x = wrapper.find('[data-leverage="5"]')

    expect(btn1x.exists()).toBe(true)
    expect(btn2x.exists()).toBe(true)
    expect(btn3x.exists()).toBe(true)
    expect(btn5x.exists()).toBe(true)

    // Initially 1x is selected
    expect(wrapper.vm.selectedLeverage).toBe(1)

    // Switch to 5x
    await btn5x.trigger('click')
    expect(wrapper.vm.selectedLeverage).toBe(5)

    // Switch to 3x
    await btn3x.trigger('click')
    expect(wrapper.vm.selectedLeverage).toBe(3)
  })

  it('assay C: executes LONG position and dynamically calculates P&L on price movements', async () => {
    const wrapper = mountSimulator({ initialPrice: 130.0 })

    // Set 5x leverage
    await wrapper.find('[data-leverage="5"]').trigger('click')

    // Click LONG
    await wrapper.find('[data-action="long"]').trigger('click')

    expect(wrapper.vm.activePosition).not.toBeNull()
    expect(wrapper.vm.activePosition?.side).toBe('LONG')
    expect(wrapper.vm.activePosition?.leverage).toBe(5)
    expect(wrapper.vm.activePosition?.entryPrice).toBe(130.0)

    // Step price up to 132.60 (+2% price change -> * 5x leverage = +10% return)
    // Base position size $1,000 -> +$100.00 profit
    wrapper.vm.stepPrice(132.6)
    await wrapper.vm.$nextTick()

    const pnlText = wrapper.find('[data-metric="pnl"]').text()
    expect(pnlText).toContain('+')
    expect(wrapper.vm.unrealizedPnl).toBeGreaterThan(0)
  })

  it('assay D: executes SHORT position and gains profit on price drops', async () => {
    const wrapper = mountSimulator({ initialPrice: 130.0 })

    // Select 2x leverage
    await wrapper.find('[data-leverage="2"]').trigger('click')

    // Click SHORT
    await wrapper.find('[data-action="short"]').trigger('click')

    expect(wrapper.vm.activePosition?.side).toBe('SHORT')
    expect(wrapper.vm.activePosition?.leverage).toBe(2)

    // Step price down to 127.40 (-2% price change -> Short gains +2% * 2x = +4%)
    wrapper.vm.stepPrice(127.4)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.unrealizedPnl).toBeGreaterThan(0)
    expect(wrapper.find('[data-metric="pnl"]').text()).toContain('+')
  })

  beforeEach(() => {
    mockPush.mockClear()
  })

  it('assay E: duel conclusion triggers victory outcome modal with CTA button and replay reset', async () => {
    const wrapper = mount(LandingDuelSimulator, {
      props: {
        autoStart: false,
        initialPrice: 130.0,
      },
      global: {
        stubs: {
          NCard: defineComponent({ template: '<div><slot /></div>' }),
          NTag: defineComponent({ template: '<span><slot /></span>' }),
          NButton: defineComponent({
            emits: ['click'],
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          }),
        },
      },
    })

    // Enter a LONG position and step price up
    await wrapper.find('[data-action="long"]').trigger('click')
    wrapper.vm.stepPrice(135.0)

    // Complete duel
    wrapper.vm.finishDuel()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isFinished).toBe(true)
    const victoryBanner = wrapper.find('.victory-banner')
    expect(victoryBanner.exists()).toBe(true)
    expect(victoryBanner.text()).toContain('VICTORY')
    expect(victoryBanner.text()).toContain('LOOT SECURED')

    // Verify Deploy to Live Arena CTA
    const deployBtn = wrapper.find('.deploy-arena-btn')
    expect(deployBtn.exists()).toBe(true)
    await deployBtn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/dashboard/royale')

    // Verify Restart / Rematch button resets state
    const restartBtn = wrapper.find('.restart-duel-btn')
    expect(restartBtn.exists()).toBe(true)
    await restartBtn.trigger('click')

    expect(wrapper.vm.isFinished).toBe(false)
    expect(wrapper.vm.activePosition).toBeNull()
    expect(wrapper.find('.victory-banner').exists()).toBe(false)
  })
})
