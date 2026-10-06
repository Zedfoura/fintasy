/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite for Mission LANDING-2: 4-Pillar Gameplay Loop Showcase & Tactical Sector Teaser
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import LandingGameplayPillars from '../src/components/landing/LandingGameplayPillars.vue'

describe('marketing Landing Page Gameplay Pillars (LANDING-2)', () => {
  function mountPillars() {
    return mount(LandingGameplayPillars, {
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
            props: ['type', 'size'],
            emits: ['click'],
            template: '<button class="n-button-stub" @click="$emit(\'click\')"><slot /></button>',
          }),
        },
      },
    })
  }

  it('assay A: mounts component asserting header copy and 4 core pillar cards', () => {
    const wrapper = mountPillars()

    expect(wrapper.text()).toContain('THE 4 PILLARS OF STOCK ROYALE')
    expect(wrapper.text()).toContain('TACTICAL BLUEPRINT // CORE GAMEPLAY')
    expect(wrapper.text()).toContain('Master the mechanics of high-frequency competitive trading')

    const pillarCards = wrapper.findAll('.pillar-card')
    expect(pillarCards.length).toBe(4)
  })

  it('assay B: renders all 4 distinct pillar titles and badges', () => {
    const wrapper = mountPillars()

    // Pillar 1: Lobbies
    expect(wrapper.text()).toContain('30–60 Player Lobbies')
    expect(wrapper.text()).toContain('100ms TICK ENGINE')

    // Pillar 2: Dynamic Sector Map
    expect(wrapper.text()).toContain('Dynamic Sector Map')
    expect(wrapper.text()).toContain('ZONE CONTRACTION')

    // Pillar 3: Micro-Trading Duels
    expect(wrapper.text()).toContain('30s Micro-Trading Duels')
    expect(wrapper.text()).toContain('1x–5x LEVERAGE')

    // Pillar 4: Ranked MMR
    expect(wrapper.text()).toContain('Ranked MMR Progression')
    expect(wrapper.text()).toContain('ROCKET LEAGUE RANKS')
  })

  it('assay C: verifies $15,000 starting capital invariant in Pillar 1 (INV-1)', () => {
    const wrapper = mountPillars()

    expect(wrapper.text()).toContain('STARTING POT')
    expect(wrapper.text()).toContain('$15,000.00')
  })

  it('assay D: interactive tab filtering displays specific pillar or all pillars', async () => {
    const wrapper = mountPillars()

    // Initially 4 cards
    expect(wrapper.findAll('.pillar-card').length).toBe(4)

    // Find and click the 'map' tab button
    const mapTabBtn = wrapper.find('[data-tab="map"]')
    await mapTabBtn.trigger('click')

    // Filtered to only 1 card (Dynamic Sector Map)
    const filteredCards = wrapper.findAll('.pillar-card')
    expect(filteredCards.length).toBe(1)
    expect(filteredCards[0].text()).toContain('Dynamic Sector Map')
    expect(filteredCards[0].text()).not.toContain('30–60 Player Lobbies')

    // Click 'all' tab button to restore
    const allTabBtn = wrapper.find('[data-tab="all"]')
    await allTabBtn.trigger('click')

    expect(wrapper.findAll('.pillar-card').length).toBe(4)
  })

  it('assay E: renders tactical mechanics points and key metrics across pillars', () => {
    const wrapper = mountPillars()

    // Key metrics
    expect(wrapper.text()).toContain('12 S&P 500 NODES')
    expect(wrapper.text()).toContain('90% LIQUIDATION')
    expect(wrapper.text()).toContain('GOLDEN TRADER')

    // Mechanics points
    expect(wrapper.text()).toContain('Algorithmic bot fill')
    expect(wrapper.text()).toContain('Concentric topology')
    expect(wrapper.text()).toContain('Third-party battle escalation')
    expect(wrapper.text()).toContain('Zero-sum MMR rating calculations')
  })
})
