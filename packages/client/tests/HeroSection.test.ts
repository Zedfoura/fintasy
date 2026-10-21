/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Vitest suite for HERO-3/HERO-5 — hero composition, single nav, outbound-only links (D4), caption strip and
 * visual slot fallback, plus the `/` route rendering only the hero (legacy landing sections unmounted).
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import HeroSection from '../src/components/hero/HeroSection.vue'
import IndexPage from '../src/pages/index.vue'
import LandingHeader from '../src/components/landing/LandingHeader.vue'
import LandingHero from '../src/components/landing/LandingHero.vue'
import LandingMediaSection from '../src/components/landing/LandingMediaSection.vue'
import LandingBenefits from '../src/components/landing/LandingBenefits.vue'
import LandingTestimonials from '../src/components/landing/LandingTestimonials.vue'
import LandingFAQ from '../src/components/landing/LandingFAQ.vue'
import LandingFinalCTA from '../src/components/landing/LandingFinalCTA.vue'
import LandingFooter from '../src/components/landing/LandingFooter.vue'

const { mockPush, mockUseHead } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUseHead: vi.fn(),
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

vi.mock('@unhead/vue', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useHead: mockUseHead }
})

const legacyStubs = {
  NIcon: { template: '<i class="n-icon"><slot /></i>' },
  NButton: { template: '<button><slot /></button>' },
  NCard: { template: '<div><slot /></div>' },
}

function mountHero(options: Record<string, any> = {}) {
  return mount(HeroSection, { global: { stubs: legacyStubs }, ...options })
}

describe('hERO-3 HeroSection composition', () => {
  it('renders exactly one <nav>', () => {
    const wrapper = mountHero()
    expect(wrapper.findAll('nav')).toHaveLength(1)
  })

  it('renders the locked h1 copy', () => {
    const wrapper = mountHero()
    const h1 = wrapper.get('h1')
    expect(h1.findAll('br')).toHaveLength(2)
    expect(h1.element.textContent?.trim()).toBe('Sixty traders.One market.Last one solvent.')
    expect(h1.element.innerHTML.replace(/ data-v-[a-z0-9]+=""/g, '').trim()).toBe('Sixty traders.<br>One market.<br>Last one solvent.')
  })

  it('primary CTA opens the GitHub source in a new tab (D4)', () => {
    const wrapper = mountHero()
    const primary = wrapper.get('[data-test="cta-primary"]')
    expect(primary.text()).toContain('View the source')
    expect(primary.attributes('href')).toBe('https://github.com/Zedfoura/fintasy')
    expect(primary.attributes('target')).toBe('_blank')
    expect(primary.attributes('rel')).toContain('noopener')
    expect(primary.attributes('rel')).toContain('noreferrer')
  })

  it('secondary CTA links to the portfolio case study, and hides when the URL is empty', () => {
    const wrapper = mountHero()
    const secondary = wrapper.get('[data-test="cta-secondary"]')
    expect(secondary.text()).toBe('Read the case study')
    expect(secondary.attributes('href')).toBe('https://www.tinatseichingaya.com/projects/fintasy')
    expect(secondary.attributes('target')).toBeUndefined()
    const hidden = mountHero({ props: { caseStudyUrl: '' } })
    expect(hidden.find('[data-test="cta-secondary"]').exists()).toBe(false)
  })

  it('links nowhere inside the app: no game, sign-in or relative links (D4)', () => {
    const wrapper = mountHero()
    const hrefs = wrapper.findAll('a').map(a => a.attributes('href') ?? '')
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs)
      expect(href).toMatch(/^https:\/\//)
    expect(wrapper.text()).not.toMatch(/Enter a match|Sign in|Coming soon/i)
  })

  it('nav has only [Source] (new tab, noopener)', () => {
    const wrapper = mountHero()
    const nav = wrapper.get('nav')
    expect(nav.findAll('a')).toHaveLength(1)
    const source = nav.get('[data-test="nav-source"]')
    expect(source.text()).toBe('[Source]')
    expect(source.attributes('href')).toBe('https://github.com/Zedfoura/fintasy')
    expect(source.attributes('target')).toBe('_blank')
    expect(source.attributes('rel')).toContain('noopener')
    expect(source.attributes('rel')).toContain('noreferrer')
    expect(wrapper.text()).toContain('FINTASY')
    expect(wrapper.text()).toContain('Tinatsei Chingaya')
  })

  it('caption strip is aria-live off and shows defaults', () => {
    const wrapper = mountHero()
    const strip = wrapper.get('[data-test="hero-strip"]')
    expect(strip.attributes('aria-live')).toBe('off')
    expect(strip.text()).toContain('Fig. 01 — Live match, seeded')
    expect(strip.text()).toContain('Round 1 / 5')
    expect(strip.text()).toContain('Storm holding')
    expect(strip.text()).toContain('60 / 60 solvent')
  })

  it('caption strip reflects props', () => {
    const wrapper = mountHero({ props: { round: 3, storm: 'closing', alive: 37 } })
    const strip = wrapper.get('[data-test="hero-strip"]')
    expect(strip.text()).toContain('37 / 60')
    expect(strip.text()).toContain('Round 3 / 5')
    expect(strip.text()).toContain('Storm closing')
  })

  it('onVisualUpdate updates the strip (HERO-4 wiring contract)', async () => {
    const wrapper = mountHero()
    ;(wrapper.vm as any).onVisualUpdate({ round: 5, storm: 'winner', alive: 1 })
    await nextTick()
    const strip = wrapper.get('[data-test="hero-strip"]')
    expect(strip.text()).toContain('Round 5 / 5')
    expect(strip.text()).toContain('Winner standing')
    expect(strip.text()).toContain('01 / 60')
  })

  it('renders the static aria-hidden fallback when no visual slot is given', () => {
    const wrapper = mountHero()
    const fallback = wrapper.get('[data-test="hero-fallback"]')
    expect(fallback.attributes('aria-hidden')).toBe('true')
    expect(fallback.findAll('.ring')).toHaveLength(3)
    expect(wrapper.text()).toContain('Starting pot')
    expect(wrapper.get('[data-test="hero-cap"]').text().replace(/\s+/g, ' ')).toBe('Duels 30 s · Ticks 10 Hz · Starting pot $15,000')
  })

  it('the visual slot replaces the fallback', () => {
    const wrapper = mountHero({
      slots: { visual: () => h('canvas', { 'data-test': 'slotted-visual' }) },
    })
    expect(wrapper.find('[data-test="slotted-visual"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="hero-fallback"]').exists()).toBe(false)
  })
})

describe('hERO-3 index route', () => {
  function mountPage() {
    return mount(IndexPage, { global: { stubs: legacyStubs } })
  }

  it('renders HeroSection with exactly one nav', () => {
    const wrapper = mountPage()
    expect(wrapper.findComponent(HeroSection).exists()).toBe(true)
    expect(wrapper.findAll('nav')).toHaveLength(1)
    expect(wrapper.findAll('h1')).toHaveLength(1)
  })

  it('mounts none of the 8 legacy landing components', () => {
    const wrapper = mountPage()
    for (const legacy of [LandingHeader, LandingHero, LandingMediaSection, LandingBenefits, LandingTestimonials, LandingFAQ, LandingFinalCTA, LandingFooter])
      expect(wrapper.findComponent(legacy).exists()).toBe(false)
  })

  it('sets the locked document title and description', () => {
    mockUseHead.mockClear()
    mountPage()
    expect(mockUseHead).toHaveBeenCalled()
    const arg = mockUseHead.mock.calls[0][0]
    expect(arg.title).toBe('Fintasy — the stock-market battle royale')
    expect(arg.meta[0].content).toContain('A 60-player battle-royale trading game')
  })
})
