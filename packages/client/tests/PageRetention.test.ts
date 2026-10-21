/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Page-level retention guard for the Fintasy marketing page (HYPE-4, extended in CLOSE-3). Fails if
 * the Match-timeline section, its four locked beats, the beat -> vignette wiring, the FAQ and its six locked
 * questions, the closing CTA, the section order, the fact rule, the outbound-only links (D4) or the hero above it
 * regress on `/`, or if the standalone build stops rendering the same page.
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import IndexPage from '../src/pages/index.vue'
import StandaloneHero from '../hero-standalone/StandaloneHero.vue'
import { factViolations } from '../src/components/hype/hypeBeats'
import { CASE_STUDY_URL, SOURCE_URL } from '../src/components/hero/heroLinks'

vi.mock('@unhead/vue', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useHead: vi.fn() }
})

// Locked in hype-direction.md; deliberately not read from hypeBeats.ts so a dropped or renamed beat fails here.
const LOCKED_BEATS = [
  { id: 'drop', title: 'Drop' },
  { id: 'duel', title: 'Duel' },
  { id: 'storm', title: 'Storm' },
  { id: 'lobby', title: 'Last one solvent' },
] as const

// Locked in close-direction.md; deliberately not read from closeCopy.ts.
const LOCKED_QUESTIONS = [
  'Can I play Fintasy?',
  'Is real money involved?',
  'Where do the prices come from?',
  'Who am I up against?',
  'How does a match end?',
  'What is it built with?',
]

function stub(name: string, marker: string) {
  return defineComponent({ name, setup: () => () => h('div', { 'data-test': marker }) })
}

const stubs = {
  HeroVisual: defineComponent({ name: 'HeroVisual', emits: ['update'], setup: () => () => h('div', { 'data-test': 'hero-visual' }) }),
  VignetteDrop: stub('VignetteDrop', 'vignette-drop'),
  VignetteDuel: stub('VignetteDuel', 'vignette-duel'),
  VignetteStorm: stub('VignetteStorm', 'vignette-storm'),
  VignetteLobby: stub('VignetteLobby', 'vignette-lobby'),
}

function mountIndex() {
  return mount(IndexPage, { global: { stubs } })
}

function text(el: Element): string {
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim()
}

describe('hYPE-4 retention guard: marketing page on /', () => {
  it('keeps the Match-timeline section with its four locked beats in order', () => {
    const wrapper = mountIndex()
    const section = wrapper.get('section#match')
    expect(section.attributes('aria-labelledby')).toBe('hype-title')
    expect(wrapper.get('h2#hype-title').element.textContent?.trim()).toBe('Drop in. Trade hard.Stay solvent.')
    expect(section.findAll('article')).toHaveLength(LOCKED_BEATS.length)
    expect(section.findAll('h3').map(h3 => h3.text())).toEqual(LOCKED_BEATS.map(b => b.title))
    wrapper.unmount()
  })

  it('mounts exactly the matching live vignette in each beat frame, replacing the fallback', () => {
    const wrapper = mountIndex()
    const ids = LOCKED_BEATS.map(b => b.id)
    for (const id of ids) {
      const frame = wrapper.get(`[data-test="hype-frame-${id}"]`)
      expect(frame.find(`[data-test="vignette-${id}"]`).exists(), `vignette-${id} in its frame`).toBe(true)
      for (const other of ids.filter(o => o !== id))
        expect(frame.find(`[data-test="vignette-${other}"]`).exists(), `vignette-${other} not in ${id}`).toBe(false)
      expect(frame.find(`[data-test="hype-fallback-${id}"]`).exists(), `fallback-${id} replaced`).toBe(false)
    }
    wrapper.unmount()
  })

  it('passes the fact rule over the section and the whole page', () => {
    const wrapper = mountIndex()
    expect(factViolations(text(wrapper.get('section#match').element))).toEqual({ offenders: [], banned: [] })
    expect(factViolations(text(wrapper.element))).toEqual({ offenders: [], banned: [] })
    wrapper.unmount()
  })

  it('links only outbound to the source and the case study (D4)', () => {
    const wrapper = mountIndex()
    const hrefs = wrapper.findAll('a').map(a => a.attributes('href') ?? '')
    expect(hrefs.filter(href => !/^https?:\/\//.test(href))).toEqual([])
    expect(new Set(hrefs)).toEqual(new Set([SOURCE_URL, CASE_STUDY_URL]))
    wrapper.unmount()
  })

  it('keeps the hero above the section with one nav and one h1', () => {
    const wrapper = mountIndex()
    expect(wrapper.findAll('nav')).toHaveLength(1)
    expect(wrapper.findAll('h1')).toHaveLength(1)
    const h1 = wrapper.get('h1#hero-title').element
    const section = wrapper.get('section#match').element
    expect(h1.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    wrapper.unmount()
  })

  it('keeps the page order: hero, Match timeline, FAQ, then the closing CTA', () => {
    const wrapper = mountIndex()
    expect(wrapper.findAll('main > section').map(s => s.attributes('id') ?? s.classes()[0])).toEqual(['hero', 'match', 'faq', 'cta'])
    wrapper.unmount()
  })

  it('keeps the six locked FAQ questions as disclosure buttons wired to their answers', () => {
    const wrapper = mountIndex()
    const faq = wrapper.get('section#faq')
    expect(faq.attributes('aria-labelledby')).toBe('faq-title')
    const buttons = faq.findAll('h3 > button')
    expect(buttons.map(b => b.find('.close-q-text').text())).toEqual(LOCKED_QUESTIONS)
    for (const b of buttons) {
      expect(b.attributes('aria-expanded')).toMatch(/^(true|false)$/)
      const region = faq.get(`#${b.attributes('aria-controls')}`)
      expect(region.attributes('aria-labelledby')).toBe(b.attributes('id'))
    }
    wrapper.unmount()
  })

  it('closes on the locked CTA with only the source and case-study links', () => {
    const wrapper = mountIndex()
    const cta = wrapper.get('section#cta')
    expect(cta.get('h2#cta-title').text()).toBe('That\'s the match.')
    expect(cta.findAll('a').map(a => a.attributes('href'))).toEqual([SOURCE_URL, CASE_STUDY_URL])
    wrapper.unmount()
  })

  it('renders the same sections in the standalone build', () => {
    const page = mountIndex()
    const standalone = mount(StandaloneHero, { global: { stubs } })
    for (const sel of ['section#match', 'section#faq', 'section#cta'])
      expect(standalone.get(sel).html(), sel).toBe(page.get(sel).html())
    page.unmount()
    standalone.unmount()
  })
})
