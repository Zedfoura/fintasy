/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: HERO-2 tests. Engine: determinism falsifier pair, last-trader invariant, round/storm monotonicity,
 *   sector tiles, tokens.json drift. Component: reduced motion, rAF scheduling, offscreen pause, emits, a11y, cleanup.
 */

import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroVisual from '../src/components/hero/HeroVisual.vue'
import { HERO_MOTION, createSim, sectorTiles, snapshot, stepSim } from '../src/components/hero/heroSim'

const TOKENS_PATH = '/Users/tinatseichingaya/fintasy/.wargaming/campaigns/2026-10-20_fintasy-hero/tokens.json'
const W = 1440
const H = 460
const DT = 1 / 60

function run(seed: number, steps: number) {
  const s = createSim({ seed, width: W, height: H })
  for (let i = 0; i < steps; i++) stepSim(s, DT)
  return snapshot(s)
}

describe('heroSim engine', () => {
  it('same seed + same steps gives an identical snapshot; a different seed differs', () => {
    const a = run(2026, 700)
    const b = run(2026, 700)
    const c = run(2027, 700)
    expect(a).toBe(b)
    expect(c).not.toBe(a)
    expect(a.length).toBeGreaterThan(100)
  })

  it('never lets the last trader be eliminated (alive >= 1) across 3 seeds x 3000 steps', () => {
    for (const seed of [2026, 7, 31337]) {
      const s = createSim({ seed, width: W, height: H })
      let minAlive = Infinity
      for (let i = 0; i < 3000; i++) {
        const r = stepSim(s, DT)
        minAlive = Math.min(minAlive, r.alive)
      }
      expect({ seed, minAlive: minAlive >= 1 ? 'ok' : minAlive }).toEqual({ seed, minAlive: 'ok' })
    }
  })

  it('round starts at 1, never goes backwards and stays <= 5 within a cycle; storm rect never grows', () => {
    const eps = 1e-9
    let sawRound5 = false
    for (const seed of [2026, 7, 31337]) {
      const s = createSim({ seed, width: W, height: H })
      let prev: ReturnType<typeof stepSim> | null = null
      let cycle = s.cycle
      for (let i = 0; i < 3000; i++) {
        const before = s.cycle
        const r = stepSim(s, DT)
        if (before !== cycle) {
          prev = null
          cycle = before
        }
        expect(r.round).toBeGreaterThanOrEqual(1)
        expect(r.round).toBeLessThanOrEqual(HERO_MOTION.rounds)
        if (r.round === 5)
          sawRound5 = true
        if (!prev) {
          expect(r.round).toBe(1)
        }
        else {
          expect(r.round).toBeGreaterThanOrEqual(prev.round)
          expect(r.stormRect.w).toBeLessThanOrEqual(prev.stormRect.w + eps)
          expect(r.stormRect.h).toBeLessThanOrEqual(prev.stormRect.h + eps)
          expect(r.stormRect.x).toBeGreaterThanOrEqual(prev.stormRect.x - eps)
          expect(r.stormRect.y).toBeGreaterThanOrEqual(prev.stormRect.y - eps)
        }
        prev = r
      }
      expect(s.cycle).toBeGreaterThanOrEqual(1)
    }
    expect(sawRound5).toBe(true)
  })

  it('has 11 sector tiles (4 + 4 + 3) with unique names', () => {
    const tiles = sectorTiles(W, H)
    expect(tiles).toHaveLength(11)
    expect(tiles.filter(t => t.ring === 0)).toHaveLength(4)
    expect(tiles.filter(t => t.ring === 1)).toHaveLength(4)
    expect(tiles.filter(t => t.ring === 2)).toHaveLength(3)
    expect(new Set(tiles.map(t => t.n)).size).toBe(11)
  })

  it('motion constants equal tokens.json', () => {
    const motion = JSON.parse(readFileSync(TOKENS_PATH, 'utf8')).motion
    for (const [k, v] of Object.entries(HERO_MOTION))
      expect({ k, v }).toEqual({ k, v: motion[k] })
  })
})

// ---------------------------------------------------------------------------------------------------------------
// Component (jsdom: no real canvas; getContext is stubbed with a recording context)
// ---------------------------------------------------------------------------------------------------------------

type Call = [string, unknown[]]
let calls: Call[]
let rafQueue: Map<number, FrameRequestCallback>
let rafId: number
let reducedMotion: boolean
const ioInstances: MockIO[] = []
const roInstances: MockRO[] = []

class MockIO {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
  constructor(public cb: (entries: Array<{ isIntersecting: boolean }>) => void) { ioInstances.push(this) }
}
class MockRO {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
  constructor(public cb: () => void) { roInstances.push(this) }
}

function recordingContext() {
  const store = new Map<PropertyKey, unknown>()
  return new Proxy({}, {
    get(_t, prop) {
      if (store.has(prop))
        return store.get(prop)
      if (prop === 'createImageData')
        return (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h })
      if (prop === 'createPattern')
        return () => ({})
      return (...args: unknown[]) => {
        calls.push([String(prop), args])
      }
    },
    set(_t, prop, value) {
      store.set(prop, value)
      return true
    },
  })
}

const origGetContext = HTMLCanvasElement.prototype.getContext
const sizeProps = ['clientWidth', 'clientHeight'] as const
const sizeDescriptors = sizeProps.map(p => Object.getOwnPropertyDescriptor(HTMLElement.prototype, p))

function flushFrames(n: number, start = 1000) {
  let ts = start
  for (let i = 0; i < n; i++) {
    const pending = [...rafQueue.entries()]
    rafQueue.clear()
    ts += 1000 / 60
    for (const [, cb] of pending) cb(ts)
  }
}

describe('<HeroVisual>', () => {
  beforeEach(() => {
    calls = []
    rafQueue = new Map()
    rafId = 0
    reducedMotion = false
    ioInstances.length = 0
    roInstances.length = 0
    HTMLCanvasElement.prototype.getContext = vi.fn(() => recordingContext()) as any
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 800 })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 400 })
    window.matchMedia = vi.fn((q: string) => ({
      matches: reducedMotion && q.includes('reduce'),
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as any
    window.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      rafQueue.set(++rafId, cb)
      return rafId
    })
    window.cancelAnimationFrame = vi.fn((id: number) => {
      rafQueue.delete(id)
    })
    vi.stubGlobal('IntersectionObserver', MockIO)
    vi.stubGlobal('ResizeObserver', MockRO)
  })

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = origGetContext
    sizeProps.forEach((p, i) => {
      const d = sizeDescriptors[i]
      if (d)
        Object.defineProperty(HTMLElement.prototype, p, d)
      else delete (HTMLElement.prototype as any)[p]
    })
    vi.unstubAllGlobals()
  })

  const fillRects = () => calls.filter(([n]) => n === 'fillRect').length

  it('reduced motion: never calls requestAnimationFrame and draws one still frame', () => {
    reducedMotion = true
    const w = mount(HeroVisual)
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
    expect(fillRects()).toBeGreaterThan(0)
    const ev = w.emitted('update')!
    expect(ev).toHaveLength(1)
    w.unmount()
  })

  it('normal motion: schedules rAF and draws on frames', () => {
    const w = mount(HeroVisual)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
    flushFrames(3)
    expect(fillRects()).toBeGreaterThan(0)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(4)
    w.unmount()
  })

  it('pauses (cancelAnimationFrame) when the IntersectionObserver reports it offscreen', () => {
    const w = mount(HeroVisual)
    expect(ioInstances).toHaveLength(1)
    const pendingId = rafId
    ioInstances[0].cb([{ isIntersecting: false }])
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingId)
    expect(rafQueue.size).toBe(0)
    ioInstances[0].cb([{ isIntersecting: true }])
    expect(rafQueue.size).toBe(1)
    w.unmount()
  })

  it('emits update {round:1, storm:holding, alive:60} on mount, then only on change', () => {
    const w = mount(HeroVisual)
    expect(w.emitted('update')![0][0]).toEqual({ round: 1, storm: 'holding', alive: 60 })
    flushFrames(120)
    const ev = w.emitted('update')!.map(e => e[0] as { round: number, storm: string, alive: number })
    expect(ev.length).toBeLessThan(10)
    for (let i = 1; i < ev.length; i++)
      expect(ev[i]).not.toEqual(ev[i - 1])
    w.unmount()
  })

  it('canvas is aria-hidden and a text alternative is present', () => {
    const w = mount(HeroVisual)
    expect(w.find('canvas').attributes('aria-hidden')).toBe('true')
    expect(w.text()).toContain('60 traders across 11 market sectors')
    w.unmount()
  })

  it('unmount disconnects both observers and cancels rAF', () => {
    const w = mount(HeroVisual)
    const pendingId = rafId
    w.unmount()
    expect(ioInstances[0].disconnect).toHaveBeenCalled()
    expect(roInstances[0].disconnect).toHaveBeenCalled()
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingId)
    expect(rafQueue.size).toBe(0)
  })
})
