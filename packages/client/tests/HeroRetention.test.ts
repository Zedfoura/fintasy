/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Retention guard for the marketing hero (HERO-4). Fails if the locked headline, the outbound-only
 * links (D4), the live visual mount and its strip wiring, or the HERO-1 locked palette regress on `/`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, onMounted } from 'vue'
import IndexPage from '../src/pages/index.vue'

vi.mock('@unhead/vue', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useHead: vi.fn() }
})

// Stands in for the canvas renderer (jsdom has no canvas) while keeping its public contract: emits `update`.
const HeroVisualStub = defineComponent({
  name: 'HeroVisual',
  emits: ['update'],
  setup(_, { emit }) {
    onMounted(() => emit('update', { round: 4, storm: 'closing', alive: 9 }))
    return () => h('div', { 'data-test': 'hero-visual' })
  },
})

function mountPage() {
  return mount(IndexPage, { global: { stubs: { HeroVisual: HeroVisualStub } } })
}

const tokensPath = path.resolve(__dirname, '../../../.wargaming/campaigns/2026-10-20_fintasy-hero/tokens.json')

describe('hERO-4 retention guard: marketing hero on /', () => {
  it('keeps the locked headline', () => {
    const wrapper = mountPage()
    expect(wrapper.get('h1#hero-title').element.textContent?.trim()).toBe('Sixty traders.One market.Last one solvent.')
  })

  it('links only outward: GitHub source and the portfolio case study (D4)', () => {
    const wrapper = mountPage()
    const hrefs = wrapper.findAll('a').map(a => a.attributes('href'))
    expect(hrefs).toContain('https://github.com/Zedfoura/fintasy')
    expect(hrefs).toContain('https://www.tinatseichingaya.com/projects/fintasy')
    for (const href of hrefs)
      expect(href).toMatch(/^https:\/\//)
    expect(wrapper.text()).not.toMatch(/Enter a match|Sign in|Coming soon/i)
  })

  it('mounts the live visual in the hero frame and wires its updates to the caption strip', async () => {
    const wrapper = mountPage()
    expect(wrapper.find('.hero-visual [data-test="hero-visual"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="hero-fallback"]').exists()).toBe(false)
    await nextTick()
    const strip = wrapper.get('[data-test="hero-strip"]').text()
    expect(strip).toContain('Round 4 / 5')
    expect(strip).toContain('Storm closing')
    expect(strip).toContain('09 / 60')
  })

  it('keeps every HERO-1 locked colour in the hero stylesheet', () => {
    const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8')) as { color: Record<string, string> }
    const css = readFileSync(path.resolve(__dirname, '../src/components/hero/HeroSection.vue'), 'utf-8').toLowerCase().replace(/\s+/g, '')
    for (const [name, value] of Object.entries(tokens.color))
      expect(css, `token ${name}`).toContain(value.toLowerCase().replace(/\s+/g, ''))
  })
})
