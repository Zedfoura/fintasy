/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Pure, seeded frame math for the four hype-section vignettes (drop, duel, storm, lobby).
 *   Ported from the approved reference engine (wargames/hype-directions/hype-parts.html, draw.*). Sector and
 *   storm geometry comes from heroSim.ts (sectorTiles, stormAt) rather than a fork. No DOM access: the
 *   Vignette*.vue components draw these frames, tests drive them directly.
 */

import type { Tile } from '../../hero/heroSim'
import { sectorTiles, stormAt } from '../../hero/heroSim'

/**
 * Vignette constants. Copied from `.wargaming/campaigns/2026-10-20_fintasy-hero/tokens.json` -> `hype.vignettes`.
 * tests/HypeVignettes.test.ts asserts these still equal tokens.json, so drift fails.
 */
export const VIGNETTE_LOOP_SECONDS = {
  drop: 4,
  duel: 5,
  storm: 10,
  lobby: 9,
} as const
export const VIGNETTE_VISIBILITY_THRESHOLD = 0.1
export const VIGNETTE_REDUCED_MOTION_SECONDS = 3.7
export const VIGNETTE_DPR_CAP = 2
export const VIGNETTE_DEFAULT_SEED = 2026

export type VignetteId = keyof typeof VIGNETTE_LOOP_SECONDS

/** Colours resolved from tokens.json -> hype.color (names resolved through the top-level color block). */
export const VIGNETTE_COLORS = {
  frameBg: '#10100F',
  bone: '#ECE9E2',
  violet: '#8B7CFF',
  hud: '#8E8B84',
  line: 'rgba(236,233,226,0.12)',
  trailingLine: 'rgba(236,233,226,0.35)',
  stormFill: 'rgba(139,124,255,0.24)',
  tiles: ['#121211', '#161615', '#1B1B19'] as readonly string[],
} as const

export interface Point { x: number, y: number }
interface Rect { x: number, y: number, w: number, h: number }

/** Seeded mulberry32 (same arithmetic as heroSim / the prototype R()). */
export function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function gauss(r: () => number): number {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())
}

/** Loop progress in [0, 1) for a vignette at absolute time t (seconds). */
export function loopProgress(id: VignetteId, t: number): number {
  const L = VIGNETTE_LOOP_SECONDS[id]
  return (((t % L) + L) % L) / L
}

// ---------------------------------------------------------------------------------------------------------------
// 01 Drop: a trader dot falls onto an inner-ring sector; a violet ripple marks the landing.
// ---------------------------------------------------------------------------------------------------------------

export interface DropFrame {
  tiles: Tile[]
  /** Index into tiles of the landing sector (always an inner-ring tile). */
  target: number
  dot: Point
  landed: boolean
  ripple: { r: number, alpha: number } | null
}

export function dropFrame(w: number, h: number, t: number, seed = VIGNETTE_DEFAULT_SEED): DropFrame {
  const tiles = sectorTiles(w, h)
  const r = mulberry32(seed)
  const inner = tiles.map((tile, i) => ({ tile, i })).filter(e => e.tile.ring === 2)
  const pick = inner[Math.floor(r() * inner.length)]
  const T = pick.tile
  const tx = T.x + T.w / 2
  const ty = T.y + T.h / 2
  const sx = w * (0.08 + r() * 0.84)
  const sy = -10
  const p = loopProgress('drop', t)
  const e = Math.min(1, p * 1.6)
  const dot = { x: sx + (tx - sx) * e, y: sy + (ty - sy) * e * e }
  const landed = e >= 1
  const ripple = landed
    ? { r: 6 + (p - 0.625) * 60, alpha: Math.max(0, 1 - (p - 0.625) * 2.6) }
    : null
  return { tiles, target: pick.i, dot, landed, ripple }
}

// ---------------------------------------------------------------------------------------------------------------
// 02 Duel: two seeded P&L lines race for 30 s (compressed into the loop); the leader is violet.
// ---------------------------------------------------------------------------------------------------------------

export const DUEL_POINTS = 120
export const DUEL_SECONDS = 30
/** Share of the loop spent racing; the remainder holds the final result at 0:00. */
const DUEL_RACE_FRACTION = 0.85

export interface DuelSeries { a: number[], b: number[], min: number, max: number }

export function duelSeries(seed: number): DuelSeries {
  const r = mulberry32(seed)
  const a = [0]
  const b = [0]
  for (let i = 1; i < DUEL_POINTS; i++) {
    a.push(a[i - 1] + gauss(r) * 1.1 + 0.05)
    b.push(b[i - 1] + gauss(r) * 1.1 - 0.02)
  }
  const all = a.concat(b)
  return { a, b, min: Math.min(...all), max: Math.max(...all) }
}

export interface DuelFrame {
  /** Last series index drawn (0..DUEL_POINTS-1). */
  index: number
  leader: 'a' | 'b'
  /** Seconds left on the duel clock (30 -> 0). */
  countdown: number
}

export function duelFrame(series: DuelSeries, t: number): DuelFrame {
  const race = Math.min(1, loopProgress('duel', t) / DUEL_RACE_FRACTION)
  const index = Math.min(DUEL_POINTS - 1, Math.floor(race * (DUEL_POINTS - 1)))
  const countdown = Math.max(0, DUEL_SECONDS - Math.floor(race * DUEL_SECONDS))
  return { index, leader: series.a[index] >= series.b[index] ? 'a' : 'b', countdown }
}

/** Loop count since t = 0, so each duel cycle can race a fresh seeded pair. */
export function duelCycle(t: number): number {
  return Math.floor(Math.max(0, t) / VIGNETTE_LOOP_SECONDS.duel)
}

export function formatClock(seconds: number): string {
  return `0:${String(seconds).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------------------------------------------
// 03 Storm: the hero storm (stormAt) closing over ROUND 1/5 -> 5/5, with a few seeded traders caught in it.
// ---------------------------------------------------------------------------------------------------------------

export const STORM_TRADERS = 9

export interface StormFrame {
  tiles: Tile[]
  rect: Rect
  round: number
  moving: boolean
  traders: Array<Point & { inside: boolean }>
}

export function stormFrame(w: number, h: number, t: number, seed = VIGNETTE_DEFAULT_SEED): StormFrame {
  const s = stormAt(w, h, loopProgress('storm', t))
  const r = mulberry32(seed)
  const R = s.r
  const traders: StormFrame['traders'] = []
  for (let i = 0; i < STORM_TRADERS; i++) {
    const x = w * (0.04 + r() * 0.92)
    const y = h * (0.06 + r() * 0.88)
    traders.push({ x, y, inside: x > R.x && x < R.x + R.w && y > R.y && y < R.y + R.h })
  }
  return { tiles: sectorTiles(w, h), rect: R, round: s.round, moving: s.moving, traders }
}

// ---------------------------------------------------------------------------------------------------------------
// 04 Lobby: 60 traders eliminated in seeded order until exactly one survivor remains.
// ---------------------------------------------------------------------------------------------------------------

export const LOBBY_PLAYERS = 60
export const LOBBY_COLS = 12
export const LOBBY_ROWS = 5

/** Seeded Fisher-Yates elimination order; the last entry is the survivor. */
export function lobbyOrder(seed: number): number[] {
  const r = mulberry32(seed)
  const order = Array.from({ length: LOBBY_PLAYERS }, (_, i) => i)
  for (let i = LOBBY_PLAYERS - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

export interface LobbyFrame {
  alive: number
  /** Sorted indices of eliminated traders. */
  dead: number[]
  /** Survivor index once alive === 1, otherwise null. */
  survivor: number | null
}

export function lobbyFrame(seed: number, t: number, order = lobbyOrder(seed)): LobbyFrame {
  const p = loopProgress('lobby', t)
  const alive = Math.max(1, Math.round(LOBBY_PLAYERS - p * 1.25 * (LOBBY_PLAYERS - 1)))
  const dead = order.slice(0, LOBBY_PLAYERS - alive).sort((x, y) => x - y)
  return { alive, dead, survivor: alive === 1 ? order[LOBBY_PLAYERS - 1] : null }
}

// ---------------------------------------------------------------------------------------------------------------
// Snapshots for determinism hashing
// ---------------------------------------------------------------------------------------------------------------

/** Stable serialisation of any frame (numbers rounded to 1e-6 so float noise cannot hide in the hash). */
export function snapshotFrame(frame: unknown): string {
  return JSON.stringify(frame, (_k, v) => typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v)
}

/** Snapshot of one vignette sampled `samples` times across a full loop at seed and size. */
export function vignetteSnapshot(id: VignetteId, seed: number, w: number, h: number, samples = 24): string {
  const L = VIGNETTE_LOOP_SECONDS[id]
  const frames: unknown[] = []
  const order = id === 'lobby' ? lobbyOrder(seed) : null
  for (let i = 0; i < samples; i++) {
    const t = L * i / samples
    if (id === 'drop') {
      frames.push(dropFrame(w, h, t, seed))
    }
    else if (id === 'duel') {
      const series = duelSeries(seed + duelCycle(t))
      frames.push({ series, ...duelFrame(series, t) })
    }
    else if (id === 'storm') {
      frames.push(stormFrame(w, h, t, seed))
    }
    else {
      frames.push(lobbyFrame(seed, t, order!))
    }
  }
  return snapshotFrame({ id, seed, w, h, frames })
}
