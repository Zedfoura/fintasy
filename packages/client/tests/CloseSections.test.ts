/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Vitest suite for CLOSE-2: the FAQ (structure, disclosure contract, fact rule) and the final CTA
 * (outbound-only links, D4) on their own, and their place in the shared FintasyPage and the standalone build.
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import CloseFaq from '../src/components/close/CloseFaq.vue'
import CloseCta from '../src/components/close/CloseCta.vue'
import FintasyPage from '../src/components/page/FintasyPage.vue'
import StandaloneHero from '../hero-standalone/StandaloneHero.vue'
import { CASE_STUDY_URL, SOURCE_URL } from '../src/components/hero/heroLinks'
import { factViolations } from '../src/components/hype/hypeBeats'

vi.mock('@unhead/vue', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useHead: vi.fn() }
})

// Locked in close-direction.md; deliberately not read from closeCopy.ts so a dropped or reworded question fails here.
const LOCKED_QUESTIONS = [
  'Can I play Fintasy?',
  'Is real money involved?',
  'Where do the prices come from?',
  'Who am I up against?',
  'How does a match end?',
  'What is it built with?',
]

function stub(name: string) {
  return defineComponent({ name, setup: () => () => h('div') })
}

const pageStubs = {
  HeroVisual: defineComponent({ name: 'HeroVisual', emits: ['update'], setup: () => () => h('div') }),
  VignetteDrop: stub('VignetteDrop'),
  VignetteDuel: stub('VignetteDuel'),
  VignetteStorm: stub('VignetteStorm'),
  VignetteLobby: stub('VignetteLobby'),
}

function text(el: Element): string {
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim()
}

describe('cLOSE-2 FAQ structure', () => {
  it('is one section #faq labelled by its h2, with the six locked questions in order', () => {
    const wrapper = mount(CloseFaq)
    const section = wrapper.get('section#faq')
    expect(section.attributes('aria-labelledby')).toBe('faq-title')
    expect(wrapper.get('h2#faq-title').element.textContent?.trim()).toBe('Questions,answered.')
    expect(wrapper.findAll('h3 > button').map(b => b.find('.close-q-text').text())).toEqual(LOCKED_QUESTIONS)
    expect(wrapper.findAll('h2')).toHaveLength(1)
    expect(wrapper.findAll('h1')).toHaveLength(0)
  })

  it('keeps ordinals and icons out of the accessible name', () => {
    const wrapper = mount(CloseFaq)
    for (const sel of ['.close-ordinal', '.close-icon'])
      wrapper.findAll(sel).forEach(el => expect(el.attributes('aria-hidden')).toBe('true'))
  })
})

describe('cLOSE-2 FAQ disclosure', () => {
  it('opens only the first question on first render', () => {
    const wrapper = mount(CloseFaq)
    const buttons = wrapper.findAll('h3 > button')
    expect(buttons.map(b => b.attributes('aria-expanded'))).toEqual(['true', 'false', 'false', 'false', 'false', 'false'])
    buttons.forEach((b, i) => {
      const region = wrapper.get(`#${b.attributes('aria-controls')}`)
      expect(region.attributes('hidden') === undefined, `region ${i} visible`).toBe(i === 0)
    })
  })

  it('wires each button to its region both ways', () => {
    const wrapper = mount(CloseFaq)
    for (const b of wrapper.findAll('h3 > button')) {
      expect(b.attributes('type')).toBe('button')
      const region = wrapper.get(`#${b.attributes('aria-controls')}`)
      expect(region.attributes('role')).toBe('region')
      expect(region.attributes('aria-labelledby')).toBe(b.attributes('id'))
    }
  })

  it('toggles aria-expanded and hidden together, independently per item', async () => {
    const wrapper = mount(CloseFaq)
    const buttons = wrapper.findAll('h3 > button')
    const region = (i: number) => wrapper.get(`#${buttons[i].attributes('aria-controls')}`)

    await buttons[2].trigger('click')
    expect(buttons[2].attributes('aria-expanded')).toBe('true')
    expect(region(2).attributes('hidden')).toBeUndefined()
    expect(buttons[0].attributes('aria-expanded')).toBe('true')

    await buttons[0].trigger('click')
    expect(buttons[0].attributes('aria-expanded')).toBe('false')
    expect(region(0).attributes('hidden')).toBeDefined()
    expect(buttons[2].attributes('aria-expanded')).toBe('true')
  })
})

describe('cLOSE-2 facts and links', () => {
  it('passes the fact rule over the FAQ and the CTA', () => {
    expect(factViolations(text(mount(CloseFaq).element))).toEqual({ offenders: [], banned: [] })
    expect(factViolations(text(mount(CloseCta).element))).toEqual({ offenders: [], banned: [] })
  })

  it('cTA links only to the source (new tab) and the case study (D4)', () => {
    const wrapper = mount(CloseCta)
    const section = wrapper.get('section#cta')
    expect(section.attributes('aria-labelledby')).toBe('cta-title')
    expect(wrapper.get('h2#cta-title').text()).toBe('That\'s the match.')
    const links = wrapper.findAll('a')
    expect(links.map(a => a.attributes('href'))).toEqual([SOURCE_URL, CASE_STUDY_URL])
    expect(links[0].attributes('target')).toBe('_blank')
    expect(links[0].attributes('rel')).toBe('noopener noreferrer')
    expect(links[1].attributes('target')).toBeUndefined()
    wrapper.findAll('.close-ring').forEach(r => expect(r.element.closest('[aria-hidden="true"]')).not.toBeNull())
  })

  it('fAQ has no links', () => {
    expect(mount(CloseFaq).findAll('a')).toHaveLength(0)
  })
})

describe('cLOSE-2 page composition', () => {
  it('renders hero, hype, FAQ, then CTA, with one nav, one h1 and no internal links', () => {
    const wrapper = mount(FintasyPage, { global: { stubs: pageStubs } })
    expect(wrapper.findAll('main > section').map(s => s.attributes('id') ?? s.classes()[0])).toEqual(['hero', 'match', 'faq', 'cta'])
    expect(wrapper.findAll('nav')).toHaveLength(1)
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.findAll('a').filter(a => !/^https:\/\//.test(a.attributes('href') ?? ''))).toHaveLength(0)
    wrapper.unmount()
  })

  it('renders the same FAQ and CTA in the standalone build', () => {
    const page = mount(FintasyPage, { global: { stubs: pageStubs } })
    const standalone = mount(StandaloneHero, { global: { stubs: pageStubs } })
    for (const sel of ['section#faq', 'section#cta'])
      expect(standalone.get(sel).html()).toBe(page.get(sel).html())
    page.unmount()
    standalone.unmount()
  })
})
