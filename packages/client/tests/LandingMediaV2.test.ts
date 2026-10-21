/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite verifying Interactive Media Showcase & Bento Grid Features (LANDING-REV-3)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import LandingMediaSection from '../src/components/landing/LandingMediaSection.vue'
import LandingBenefits from '../src/components/landing/LandingBenefits.vue'

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

describe('interactive Media Showcase & Bento Grid Features (LANDING-REV-3)', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('assay A: LandingMediaSection renders match telemetry, live ticker tape, and sparkline', () => {
    const wrapper = mount(LandingMediaSection, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('MATCH #9421 • FINAL CIRCLE')
    expect(text).toContain('NVDA')
    expect(text).toContain('TSLA')
    expect(text).toContain('AAPL')
    expect(text).toContain('STORM 0:18')
    expect(text).toContain('$15,000.00')

    const svgChart = wrapper.find('svg')
    expect(svgChart.exists()).toBe(true)
  })

  it('assay B: leverage selector dynamically updates simulated P&L calculation', async () => {
    const wrapper = mount(LandingMediaSection, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    // Initially at 5x MAX leverage -> P&L is +$1,840.50
    expect(wrapper.text()).toContain('+$1,840.50')

    // Find all leverage buttons
    const buttons = wrapper.findAll('.leverage-chip')
    expect(buttons.length).toBe(3)

    // Click 1x button
    await buttons[0].trigger('click')
    expect(wrapper.text()).toContain('+$368.10')

    // Click 2x button
    await buttons[1].trigger('click')
    expect(wrapper.text()).toContain('+$736.20')

    // Click 5x button
    await buttons[2].trigger('click')
    expect(wrapper.text()).toContain('+$1,840.50')
  })

  it('assay C: LandingBenefits renders asymmetric bento grid with all 4 core pillars', () => {
    const wrapper = mount(LandingBenefits, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('30-Second PVP Micro-Trading Duels')
    expect(text).toContain('Federal Reserve Liquidity Storm')
    expect(text).toContain('Rocket League MMR Ladder')
    expect(text).toContain('Institutional 10 Hz Market Simulation')
    expect(text).toContain('100ms Tick Resolution')
    expect(text).toContain('100% Deterministic Replays')
  })

  it('assay D: arena launch button navigates to /dashboard/royale', async () => {
    const wrapper = mount(LandingMediaSection, {
      global: {
        stubs: {
          NIcon: { template: '<i class="n-icon"><slot /></i>' },
        },
      },
    })

    const launchBtn = wrapper.find('button[type="button"].mt-6')
    expect(launchBtn.exists()).toBe(true)
    await launchBtn.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/dashboard/royale')
  })
})
