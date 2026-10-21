/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: HYPE-2 tests. Engine: determinism falsifier pair per vignette, lobby ends with exactly one survivor,
 *   storm round/rect monotonicity, duel clock 30 -> 0, 11 drop tiles, tokens.json drift. Components: reduced motion
 *   (no rAF, one still), rAF scheduling, offscreen pause, observer cleanup, aria-hidden canvas.
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { Component } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VignetteDrop from '../src/components/hype/vignettes/VignetteDrop.vue'
import VignetteDuel from '../src/components/hype/vignettes/VignetteDuel.vue'
import VignetteLobby from '../src/components/hype/vignettes/VignetteLobby.vue'
import VignetteStorm from '../src/components/hype/vignettes/VignetteStorm.vue'
import type { VignetteId } from '../src/components/hype/vignettes/vignetteSim'
import {
  DUEL_SECONDS,
  LOBBY_PLAYERS,
  VIGNETTE_COLORS,
  VIGNETTE_DPR_CAP,
  VIGNETTE_LOOP_SECONDS,
  VIGNETTE_REDUCED_MOTION_SECONDS,
  VIGNETTE_VISIBILITY_THRESHOLD,
  dropFrame,
  duelFrame,
  duelSeries,
  lobbyFrame,
  stormFrame,
  vignetteSnapshot,
} from '../src/components/hype/vignettes/vignetteSim'

/** tokens.json (HYPE-1 lock) lives in the campaign folder at the repo root. */
const TOKENS_CANDIDATES = [
  path.resolve(__dirname, '../../../.wargaming/campaigns/2026-10-20_fintasy-hero/tokens.json'),
]
function loadTokens() {
  for (const p of TOKENS_CANDIDATES) {
    if (!existsSync(p))
      continue
    const json = JSON.parse(readFileSync(p, 'utf8'))
    if (json.hype)
      return json
  }
  throw new Error(`no tokens.json with a hype block in ${TOKENS_CANDIDATES.join(', ')}`)
}

const W = 640
const H = 360
const IDS: VignetteId[] = ['drop', 'duel', 'storm', 'lobby']

describe('vignetteSim engine', () => {
  for (const id of IDS) {
    it(`${id}: same seed gives an identical snapshot; a different seed differs`, () => {
      const a = vignetteSnapshot(id, 2026, W, H)
      const b = vignetteSnapshot(id, 2026, W, H)
      const c = vignetteSnapshot(id, 2027, W, H)
      expect(a).toBe(b)
      expect(c).not.toBe(a)
      expect(a.length).toBeGreaterThan(100)
    })
  }

  it('lobby: 60 alive at t=0, ends with exactly 1 survivor across 3 seeds, never fewer than 1', () => {
    for (const seed of [2026, 7, 31337]) {
      expect(lobbyFrame(seed, 0).alive).toBe(LOBBY_PLAYERS)
      let prevAlive = LOBBY_PLAYERS
      for (let i = 0; i <= 900; i++) {
        const f = lobbyFrame(seed, VIGNETTE_LOOP_SECONDS.lobby * i / 901)
        expect(f.alive).toBeGreaterThanOrEqual(1)
        expect(f.alive).toBeLessThanOrEqual(prevAlive)
        expect(f.dead).toHaveLength(LOBBY_PLAYERS - f.alive)
        prevAlive = f.alive
      }
      const end = lobbyFrame(seed, VIGNETTE_LOOP_SECONDS.lobby - 1e-6)
      expect({ seed, alive: end.alive }).toEqual({ seed, alive: 1 })
      expect(end.dead).toHaveLength(LOBBY_PLAYERS - 1)
      expect(end.survivor).not.toBeNull()
      expect(end.dead).not.toContain(end.survivor)
    }
  })

  it('storm: round starts at 1, never goes backwards, reaches 5; rect never grows within a cycle', () => {
    const eps = 1e-9
    const L = VIGNETTE_LOOP_SECONDS.storm
    let prev: ReturnType<typeof stormFrame> | null = null
    let sawMoving = false
    for (let i = 0; i < 1000; i++) {
      const f = stormFrame(W, H, L * i / 1000)
      if (f.moving)
        sawMoving = true
      if (!prev) {
        expect(f.round).toBe(1)
      }
      else {
        expect(f.round).toBeGreaterThanOrEqual(prev.round)
        expect(f.rect.w).toBeLessThanOrEqual(prev.rect.w + eps)
        expect(f.rect.h).toBeLessThanOrEqual(prev.rect.h + eps)
        expect(f.rect.x).toBeGreaterThanOrEqual(prev.rect.x - eps)
        expect(f.rect.y).toBeGreaterThanOrEqual(prev.rect.y - eps)
      }
      expect(f.round).toBeLessThanOrEqual(5)
      prev = f
    }
    expect(prev!.round).toBe(5)
    expect(sawMoving).toBe(true)
    // The next cycle starts over at round 1.
    expect(stormFrame(W, H, L).round).toBe(1)
  })

  it('duel: the clock runs 30 -> 0 and never goes up within a cycle', () => {
    const s = duelSeries(2026)
    const L = VIGNETTE_LOOP_SECONDS.duel
    expect(duelFrame(s, 0).countdown).toBe(DUEL_SECONDS)
    let prev = DUEL_SECONDS
    for (let i = 0; i < 500; i++) {
      const f = duelFrame(s, L * i / 500)
      expect(f.countdown).toBeLessThanOrEqual(prev)
      expect(f.leader === 'a' ? s.a[f.index] >= s.b[f.index] : s.b[f.index] > s.a[f.index]).toBe(true)
      prev = f.countdown
    }
    expect(duelFrame(s, L - 1e-6).countdown).toBe(0)
  })

  it('drop: 11 sector tiles (4 + 4 + 3), lands on an inner-ring tile', () => {
    const f = dropFrame(W, H, 0)
    expect(f.tiles).toHaveLength(11)
    expect(f.tiles.filter(t => t.ring === 2)).toHaveLength(3)
    expect(f.tiles[f.target].ring).toBe(2)
    const landed = dropFrame(W, H, VIGNETTE_LOOP_SECONDS.drop * 0.8)
    expect(landed.landed).toBe(true)
    const T = landed.tiles[landed.target]
    expect(landed.dot.x).toBeCloseTo(T.x + T.w / 2)
    expect(landed.dot.y).toBeCloseTo(T.y + T.h / 2)
  })

  it('constants equal tokens.json hype.vignettes and hype.color', () => {
    const tokens = loadTokens()
    const v = tokens.hype.vignettes
    expect({ ...VIGNETTE_LOOP_SECONDS }).toEqual(v.loopSeconds)
    expect(Object.keys(VIGNETTE_LOOP_SECONDS)).toEqual(v.ids)
    expect(VIGNETTE_VISIBILITY_THRESHOLD).toBe(v.visibilityThreshold)
    expect(VIGNETTE_REDUCED_MOTION_SECONDS).toBe(v.reducedMotionFrameSeconds)
    expect(VIGNETTE_DPR_CAP).toBe(v.dprCap)
    const hc = tokens.hype.color
    const resolve = (n: string) => tokens.color[n] ?? n
    expect(VIGNETTE_COLORS.frameBg).toBe(hc.frameBg)
    expect(VIGNETTE_COLORS.stormFill).toBe(hc.stormFill)
    expect(VIGNETTE_COLORS.trailingLine).toBe(hc.trailingLine)
    expect(VIGNETTE_COLORS.violet).toBe(resolve(hc.accent))
    expect(VIGNETTE_COLORS.bone).toBe(resolve(hc.text))
    expect(VIGNETTE_COLORS.line).toBe(resolve(hc.line))
    expect(VIGNETTE_COLORS.hud).toBe(resolve(hc.mute))
    expect([...VIGNETTE_COLORS.tiles]).toEqual(hc.tiles.map(resolve))
  })
})

// ---------------------------------------------------------------------------------------------------------------
// Components (jsdom: no real canvas; getContext is stubbed with a recording context)
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
  constructor(public cb: (entries: Array<{ isIntersecting: boolean }>) => void, public opts?: { threshold?: number }) {
    ioInstances.push(this)
  }
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

const DRAW_OPS = new Set(['fillRect', 'clearRect', 'stroke', 'fill', 'fillText', 'strokeRect'])
const drawCalls = () => calls.filter(([n]) => DRAW_OPS.has(n)).length

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

const COMPONENTS: Array<[string, Component]> = [
  ['VignetteDrop', VignetteDrop],
  ['VignetteDuel', VignetteDuel],
  ['VignetteStorm', VignetteStorm],
  ['VignetteLobby', VignetteLobby],
]

describe.each(COMPONENTS)('<%s>', (_name, Comp) => {
  beforeEach(() => {
    calls = []
    rafQueue = new Map()
    rafId = 0
    reducedMotion = false
    ioInstances.length = 0
    roInstances.length = 0
    HTMLCanvasElement.prototype.getContext = vi.fn(() => recordingContext()) as any
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 640 })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 360 })
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

  it('reduced motion: 0 requestAnimationFrame calls and at least one draw', () => {
    reducedMotion = true
    const w = mount(Comp, { props: { seed: 7 } })
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
    expect(drawCalls()).toBeGreaterThan(0)
    w.unmount()
  })

  it('normal motion: schedules rAF and draws on frames', () => {
    const w = mount(Comp)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1)
    flushFrames(3)
    expect(drawCalls()).toBeGreaterThan(0)
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(4)
    w.unmount()
  })

  it('observes at threshold 0.1 and cancels rAF when the IntersectionObserver reports it hidden', () => {
    const w = mount(Comp)
    expect(ioInstances).toHaveLength(1)
    expect(ioInstances[0].opts?.threshold).toBe(0.1)
    const pendingId = rafId
    ioInstances[0].cb([{ isIntersecting: false }])
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingId)
    expect(rafQueue.size).toBe(0)
    ioInstances[0].cb([{ isIntersecting: true }])
    expect(rafQueue.size).toBe(1)
    w.unmount()
  })

  it('unmount disconnects both observers and cancels rAF', () => {
    const w = mount(Comp)
    const pendingId = rafId
    w.unmount()
    expect(ioInstances[0].disconnect).toHaveBeenCalled()
    expect(roInstances[0].disconnect).toHaveBeenCalled()
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingId)
    expect(rafQueue.size).toBe(0)
  })

  it('renders a single aria-hidden canvas', () => {
    const w = mount(Comp)
    const cv = w.findAll('canvas')
    expect(cv).toHaveLength(1)
    expect(cv[0].attributes('aria-hidden')).toBe('true')
    w.unmount()
  })
})
