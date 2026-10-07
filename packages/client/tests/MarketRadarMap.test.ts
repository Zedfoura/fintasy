/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest unit test suite for ROYALE-8 Market Sector Radar & Treemap Map with Storm Visualizer
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MarketRadarMap from '~/components/royale/MarketRadarMap.vue'
import {
  MarketSector,
  SECTOR_DEFINITIONS,
  getSectorsByTier,
  isSectorAdjacent,
} from '~/types/royale'

describe('marketRadarMap & Sector Topology (ROYALE-8)', () => {
  describe('assay A: topology & 12-sector representation', () => {
    it('should have all 12 canonical sectors defined', () => {
      const sectorKeys = Object.keys(SECTOR_DEFINITIONS)
      expect(sectorKeys).toHaveLength(12)
      expect(sectorKeys).toContain(MarketSector.UTILITIES)
      expect(sectorKeys).toContain(MarketSector.REAL_ESTATE)
      expect(sectorKeys).toContain(MarketSector.MATERIALS)
      expect(sectorKeys).toContain(MarketSector.INDUSTRIALS)
      expect(sectorKeys).toContain(MarketSector.HEALTHCARE)
      expect(sectorKeys).toContain(MarketSector.FINANCIALS)
      expect(sectorKeys).toContain(MarketSector.ENERGY)
      expect(sectorKeys).toContain(MarketSector.CONSUMER)
      expect(sectorKeys).toContain(MarketSector.BIOTECH)
      expect(sectorKeys).toContain(MarketSector.MEME_ALPHA)
      expect(sectorKeys).toContain(MarketSector.BIG_TECH)
      expect(sectorKeys).toContain(MarketSector.SEMIS_AI)
    })

    it('should correctly partition 4 sectors per concentric tier', () => {
      const outer = getSectorsByTier('OUTER')
      const mid = getSectorsByTier('MID')
      const inner = getSectorsByTier('INNER')

      expect(outer).toHaveLength(4)
      expect(mid).toHaveLength(4)
      expect(inner).toHaveLength(4)
    })

    it('should match canonical adjacency topology from backend', () => {
      // Outer ring adjacencies
      expect(isSectorAdjacent(MarketSector.UTILITIES, MarketSector.REAL_ESTATE)).toBe(true)
      expect(isSectorAdjacent(MarketSector.UTILITIES, MarketSector.INDUSTRIALS)).toBe(true)
      // Outer <-> Mid inward connector
      expect(isSectorAdjacent(MarketSector.UTILITIES, MarketSector.HEALTHCARE)).toBe(true)
      // Non-adjacent sector
      expect(isSectorAdjacent(MarketSector.UTILITIES, MarketSector.BIG_TECH)).toBe(false)
      expect(isSectorAdjacent(MarketSector.UTILITIES, MarketSector.ENERGY)).toBe(false)
    })
  })

  describe('assay B: component mounting & canvas initialization', () => {
    it('should mount with default props and render canvas and HUD elements', () => {
      const wrapper = mount(MarketRadarMap)

      expect(wrapper.find('[data-test="market-radar-container"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="radar-canvas"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="storm-countdown"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="storm-phase"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="storm-damage-rate"]').exists()).toBe(true)
    })
  })

  describe('assay C: storm countdown & state reactivity', () => {
    it('should format seconds into MM:SS correctly', async () => {
      const wrapper = mount(MarketRadarMap, {
        props: {
          stormState: {
            roundNumber: 2,
            name: 'Mid Sector Contraction',
            phase: 'SAFE',
            secondsRemaining: 75,
            damageRateCentsPerSec: 7500,
            safeSectorCount: 5,
          },
        },
      })

      expect(wrapper.find('[data-test="storm-countdown"]').text()).toBe('01:15')

      // Update remaining seconds to 9
      await wrapper.setProps({
        stormState: {
          roundNumber: 2,
          name: 'Mid Sector Contraction',
          phase: 'WARNING',
          secondsRemaining: 9,
          damageRateCentsPerSec: 7500,
          safeSectorCount: 5,
        },
      })

      expect(wrapper.find('[data-test="storm-countdown"]').text()).toBe('00:09')
      expect(wrapper.find('[data-test="storm-phase"]').text()).toContain('CLOSING WARNING')
    })

    it('should render correct phase badges for CLOSING and FINAL', async () => {
      const wrapper = mount(MarketRadarMap, {
        props: {
          stormState: {
            roundNumber: 4,
            name: 'Epicenter Showdown',
            phase: 'CLOSING',
            secondsRemaining: 30,
            damageRateCentsPerSec: 15000,
            safeSectorCount: 1,
          },
        },
      })

      expect(wrapper.find('[data-test="storm-phase"]').text()).toContain('STORM COLLAPSE IN PROGRESS')

      await wrapper.setProps({
        stormState: {
          roundNumber: 5,
          name: 'Final Sudden Death',
          phase: 'FINAL',
          secondsRemaining: 15,
          damageRateCentsPerSec: 20000,
          safeSectorCount: 0,
        },
      })

      expect(wrapper.find('[data-test="storm-phase"]').text()).toContain('SUDDEN DEATH')
    })
  })

  describe('assay D: currency & hazard damage formatting', () => {
    it('should format integer cents into whole dollars per second rate', () => {
      const wrapper = mount(MarketRadarMap, {
        props: {
          stormState: {
            roundNumber: 1,
            name: 'Outer Sector Contraction',
            phase: 'SAFE',
            secondsRemaining: 90,
            damageRateCentsPerSec: 5000,
            safeSectorCount: 8,
          },
        },
      })

      expect(wrapper.find('[data-test="storm-damage-rate"]').text()).toBe('$50/sec')
    })
  })

  describe('assay E: sector selection & adjacency rotation emits', () => {
    it('should emit selectSector and rotateSector when adjacent sector is clicked', async () => {
      const wrapper = mount(MarketRadarMap, {
        props: {
          currentSector: MarketSector.UTILITIES,
        },
      })

      // Click on HEALTHCARE card (adjacent to UTILITIES)
      const healthcareBtn = wrapper.find(`[data-test="sector-card-${MarketSector.HEALTHCARE}"]`)
      expect(healthcareBtn.exists()).toBe(true)

      await healthcareBtn.trigger('click')

      expect(wrapper.emitted('selectSector')).toBeTruthy()
      expect(wrapper.emitted('selectSector')?.[0]).toEqual([MarketSector.HEALTHCARE])

      expect(wrapper.emitted('rotateSector')).toBeTruthy()
      expect(wrapper.emitted('rotateSector')?.[0]).toEqual([
        MarketSector.UTILITIES,
        MarketSector.HEALTHCARE,
      ])
    })

    it('should emit selectSector but NOT rotateSector when clicking non-adjacent sector', async () => {
      const wrapper = mount(MarketRadarMap, {
        props: {
          currentSector: MarketSector.UTILITIES,
        },
      })

      // Click on BIG_TECH (NOT adjacent to UTILITIES)
      const bigTechBtn = wrapper.find(`[data-test="sector-card-${MarketSector.BIG_TECH}"]`)
      expect(bigTechBtn.exists()).toBe(true)

      await bigTechBtn.trigger('click')

      expect(wrapper.emitted('selectSector')).toBeTruthy()
      expect(wrapper.emitted('selectSector')?.[0]).toEqual([MarketSector.BIG_TECH])

      // rotateSector should NOT be emitted because BIG_TECH is not adjacent to UTILITIES
      expect(wrapper.emitted('rotateSector')).toBeFalsy()
    })
  })

  describe('assay F: combat duel & player count indicators', () => {
    it('should aggregate player distribution correctly', () => {
      const distribution = {
        [MarketSector.UTILITIES]: 4,
        [MarketSector.BIG_TECH]: 12,
        [MarketSector.SEMIS_AI]: 8,
      }

      const wrapper = mount(MarketRadarMap, {
        props: {
          playerDistribution: distribution,
        },
      })

      expect(wrapper.find('[data-test="traders-count"]').text()).toBe('24 / 40')
    })
  })
})
