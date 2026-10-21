/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Vitest suite for HYPE-3 — hype section structure, vignette slot contract, no links (D4), the fact
 * rule over the rendered copy and HeroVisual's screen-reader text, and the shared FintasyPage composition with its
 * #match deep-link scroll.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import HypeSection from '../src/components/hype/HypeSection.vue'
import HeroSection from '../src/components/hero/HeroSection.vue'
import FintasyPage from '../src/components/page/FintasyPage.vue'
import { HYPE_BEATS, factViolations } from '../src/components/hype/hypeBeats'

const HeroVisualStub = defineComponent({
  name: 'HeroVisual',
  emits: ['update'],
  setup: () => () => h('div', { 'data-test': 'hero-visual' }),
})

function sectionText(el: Element): string {
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim()
}

describe('hYPE-3 HypeSection structure', () => {
  it('is one section #match labelled by its h2', () => {
    const wrapper = mount(HypeSection)
    const sections = wrapper.findAll('section')
    expect(sections).toHaveLength(1)
    const section = sections[0]
    expect(section.attributes('id')).toBe('match')
    expect(section.attributes('aria-labelledby')).toBe('hype-title')
    const h2 = wrapper.get('h2#hype-title')
    expect(h2.findAll('br')).toHaveLength(1)
    expect(h2.element.textContent?.trim()).toBe('Drop in. Trade hard.Stay solvent.')
    expect(wrapper.findAll('h2')).toHaveLength(1)
    expect(wrapper.findAll('h1')).toHaveLength(0)
  })

  it('renders the kicker and intro verbatim', () => {
    const wrapper = mount(HypeSection)
    expect(sectionText(wrapper.get('.hype-kicker').element)).toBe('[ How a match is won ]')
    expect(wrapper.get('.hype-intro').text()).toBe('Every match runs the same four beats. Survive all of them and you\'re the last trader standing.')
  })

  it('renders four beats with h3s in match order and aria-hidden ordinals', () => {
    const wrapper = mount(HypeSection)
    const articles = wrapper.findAll('article')
    expect(articles).toHaveLength(4)
    expect(wrapper.findAll('h3').map(h3 => h3.text())).toEqual(['Drop', 'Duel', 'Storm', 'Last one solvent'])
    articles.forEach((article, i) => {
      const ordinal = article.get('.hype-ordinal')
      expect(ordinal.attributes('aria-hidden')).toBe('true')
      expect(ordinal.text()).toBe(`0${i + 1}`)
      expect(article.get('p').text()).toBe(HYPE_BEATS[i].body)
      expect(article.get('.hype-cap').text()).toBe(HYPE_BEATS[i].caption)
    })
    expect(articles[1].get('p').text()).toBe('Meet a rival and a 30-second trading duel starts. Long or short, 1x–5x leverage. Higher P&L takes the fight, the tickers and the bounty.')
  })

  it('renders the stats strip', () => {
    const wrapper = mount(HypeSection)
    const items = wrapper.get('[data-test="hype-stats"]').findAll('li').map(li => sectionText(li.element))
    expect(items.join(' · ')).toBe('60 traders · 11 sectors · 30 s duels · 10 Hz ticks · 5 rounds')
  })
})

describe('hYPE-3 vignette slot contract', () => {
  it('renders an aria-hidden three-ring fallback in each 16:9 frame when no vignette is slotted', () => {
    const wrapper = mount(HypeSection)
    for (const id of ['drop', 'duel', 'storm', 'lobby']) {
      const frame = wrapper.get(`[data-test="hype-frame-${id}"]`)
      const fallback = frame.get(`[data-test="hype-fallback-${id}"]`)
      expect(fallback.attributes('aria-hidden')).toBe('true')
      expect(fallback.findAll('.hype-ring')).toHaveLength(3)
    }
  })

  it('a slotted vignette replaces only its own fallback', () => {
    const wrapper = mount(HypeSection, {
      slots: { 'vignette-duel': () => h('canvas', { 'data-test': 'slotted-duel' }) },
    })
    const duel = wrapper.get('[data-test="hype-frame-duel"]')
    expect(duel.find('[data-test="slotted-duel"]').exists()).toBe(true)
    expect(duel.find('[data-test="hype-fallback-duel"]').exists()).toBe(false)
    expect(duel.get('.hype-cap').text()).toBe('P&L race')
    for (const id of ['drop', 'storm', 'lobby'])
      expect(wrapper.find(`[data-test="hype-fallback-${id}"]`).exists()).toBe(true)
  })
})

describe('hYPE-3 links and facts', () => {
  it('adds no links (D4: the hero\'s outbound links stay the page\'s only links)', () => {
    const wrapper = mount(HypeSection)
    expect(wrapper.get('section#match').findAll('a')).toHaveLength(0)
    expect(wrapper.findAll('[href]')).toHaveLength(0)
  })

  it('every number in the rendered section is an allowlisted fact and no banned phrase appears', () => {
    const wrapper = mount(HypeSection)
    const text = sectionText(wrapper.get('section#match').element)
    expect(text.length).toBeGreaterThan(200)
    expect(factViolations(text)).toEqual({ offenders: [], banned: [] })
  })

  it('heroVisual screen-reader text passes the same fact rule (11 market sectors)', () => {
    const source = readFileSync(path.resolve(__dirname, '../src/components/hero/HeroVisual.vue'), 'utf-8')
    const alt = source.match(/<p class="hero-visual__alt">([\s\S]*?)<\/p>/)?.[1].replace(/\s+/g, ' ').trim()
    expect(alt).toBeTruthy()
    expect(factViolations(alt!)).toEqual({ offenders: [], banned: [] })
    expect(alt).toContain('11 market sectors')
  })

  it('the fact rule rejects an off-list number and a playable call to action (control)', () => {
    expect(factViolations('12 sectors').offenders).toEqual(['12'])
    expect(factViolations('100,000 players').offenders).toEqual(['100,000'])
    expect(factViolations('Play now').banned).toHaveLength(1)
  })
})

describe('hYPE-3 FintasyPage composition', () => {
  const scrollIntoView = vi.fn()
  let originalScroll: typeof Element.prototype.scrollIntoView

  beforeEach(() => {
    originalScroll = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView
    scrollIntoView.mockClear()
  })

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScroll
    window.history.replaceState(null, '', window.location.pathname)
    document.body.innerHTML = ''
  })

  function mountPage() {
    return mount(FintasyPage, {
      attachTo: document.body,
      global: { stubs: { HeroVisual: HeroVisualStub } },
    })
  }

  it('renders HeroSection then HypeSection with exactly one nav and one h1', () => {
    const wrapper = mountPage()
    expect(wrapper.findComponent(HeroSection).exists()).toBe(true)
    expect(wrapper.findComponent(HypeSection).exists()).toBe(true)
    const sections = wrapper.findAll('main > section')
    expect(sections.map(s => s.classes()[0])).toEqual(['hero', 'hype', 'close-faq', 'close-cta'])
    expect(wrapper.findAll('nav')).toHaveLength(1)
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('.hero-visual [data-test="hero-visual"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('scrolls #match into view on mount when the URL hash is #match', () => {
    window.history.replaceState(null, '', '#match')
    const wrapper = mountPage()
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.instances[0]).toBe(document.getElementById('match'))
    expect(scrollIntoView.mock.calls[0][0]).toMatchObject({ block: 'start' })
    wrapper.unmount()
  })

  it('does not scroll when the hash is absent or different', () => {
    const plain = mountPage()
    plain.unmount()
    window.history.replaceState(null, '', '#other')
    const other = mountPage()
    other.unmount()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
