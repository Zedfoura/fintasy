/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Pure, seeded engine for the Fintasy hero match simulation (direction A "Closing Bell").
 *   Concentric 12-sector map, a storm that closes over 5 rounds, 60 traders that duel until one is left.
 *   Ported verbatim from the approved reference engine (wargames/hero-directions/index.html, section A).
 *   No DOM access: HeroVisual.vue renders it, tests drive it directly.
 */

/**
 * Motion constants. Copied from `.wargaming/campaigns/2026-10-20_fintasy-hero/tokens.json` -> `motion`
 * (numeric fields only). tests/HeroVisual.test.ts asserts these still equal tokens.json, so drift fails.
 */
export const HERO_MOTION = {
  seed: 2026,
  cycleSeconds: 22,
  rounds: 5,
  roundHoldFraction: 0.5,
  players: 60,
  duelSeconds: 1.4,
  duelSpawnSeconds: [0.35, 0.85] as readonly [number, number],
  stormDamagePerSecond: 0.55,
  winnerHoldSeconds: 2.8,
} as const

/** Fixed-step count used for the reduced-motion still frame (tokens.json motion.reducedMotion). */
export const REDUCED_MOTION_STEPS = 700

interface Rect { x: number, y: number, w: number, h: number }
export interface Tile extends Rect { ring: number, n: string }
export type StormState = 'holding' | 'closing' | 'winner'

interface Duel { a: Trader, b: Trader, t: number }
export interface Trader {
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  /** 0 while alive, otherwise seconds since elimination (starts at 1e-3). */
  dead: number
  duel: Duel | null
}

export interface SimState {
  /** mulberry32 internal state (serialisable, unlike a closure). */
  rng: number
  P: Trader[]
  /** Cycle progress, 0..1 over cycleSeconds (keeps running past 1 until the winner hold ends). */
  t: number
  duels: Duel[]
  nextDuel: number
  end: number
  /** Seed of the current cycle; increments when a cycle ends. */
  seed: number
  /** Number of completed cycles since createSim. */
  cycle: number
  w: number
  h: number
}

interface StormInfo { r: Rect, round: number, moving: boolean }

export interface StepResult {
  round: number
  storm: StormState
  alive: number
  stormRect: Rect
  /** True while the boundary is moving (drawn dashed). */
  moving: boolean
}

const NAMES = [
  ['Utilities', 'Real estate', 'Materials', 'Industrials'],
  ['Healthcare', 'Financials', 'Energy', 'Consumer'],
  ['Big tech', 'AI semis', 'High-beta'],
]

/** Seeded mulberry32 step: advances st.rng and returns a value in [0, 1). Same arithmetic as the prototype rng(). */
function nextRandom(st: SimState): number {
  let seed = st.rng | 0
  seed = seed + 0x6D2B79F5 | 0
  st.rng = seed
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
  return ((t ^ t >>> 14) >>> 0) / 4294967296
}

function gauss(st: SimState): number {
  return Math.sqrt(-2 * Math.log(nextRandom(st) + 1e-9)) * Math.cos(2 * Math.PI * nextRandom(st))
}

/** Ring rectangles: outer (R0), middle (R1), inner (R2), and the final core. */
function ringRects(w: number, h: number): [Rect, Rect, Rect, Rect] {
  const R0 = { x: 0, y: 0, w, h }
  const tx = w * 0.15
  const ty = h * 0.2
  const R1 = { x: tx, y: ty, w: w - 2 * tx, h: h - 2 * ty }
  const tx2 = w * 0.14
  const ty2 = h * 0.18
  const R2 = { x: R1.x + tx2, y: R1.y + ty2, w: R1.w - 2 * tx2, h: R1.h - 2 * ty2 }
  const core = { x: R2.x + R2.w * 0.36, y: R2.y + R2.h * 0.3, w: R2.w * 0.28, h: R2.h * 0.4 }
  return [R0, R1, R2, core]
}

/** 11 named sector tiles: 4 on the outer ring, 4 on the middle ring, 3 in the centre. */
export function sectorTiles(w: number, h: number): Tile[] {
  const [R0, R1, R2] = ringRects(w, h)
  const out: Tile[] = []
  const pairs: [Rect, Rect][] = [[R0, R1], [R1, R2]]
  pairs.forEach(([o, i], ring) => {
    const tx = i.x - o.x
    const ty = i.y - o.y
    out.push({ ring, n: NAMES[ring][0], x: o.x, y: o.y, w: o.w - tx, h: ty })
    out.push({ ring, n: NAMES[ring][1], x: o.x + o.w - tx, y: o.y, w: tx, h: o.h - ty })
    out.push({ ring, n: NAMES[ring][2], x: o.x + tx, y: o.y + o.h - ty, w: o.w - tx, h: ty })
    out.push({ ring, n: NAMES[ring][3], x: o.x, y: o.y + ty, w: tx, h: o.h - ty })
  })
  for (let k = 0; k < 3; k++)
    out.push({ ring: 2, n: NAMES[2][k], x: R2.x + R2.w * k / 3, y: R2.y, w: R2.w / 3, h: R2.h })
  return out
}

function lerpR(a: Rect, b: Rect, t: number): Rect {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t }
}

/** Storm geometry at cycle progress t (0..1): rect, round (1..rounds) and whether it is moving. */
export function stormAt(w: number, h: number, t: number): StormInfo {
  const { rounds, roundHoldFraction: hold } = HERO_MOTION
  const k = Math.min(rounds - 1, Math.floor(t * rounds))
  const f = t * rounds - k
  const e = f < hold ? 0 : (1 - Math.cos(Math.PI * (f - hold) / (1 - hold))) / 2
  // 4.2 (prototype literal): the last round finishes just short of the core so the final ring still eases.
  const q = Math.min(1, (k + e) / 4.2) * 3
  const R = ringRects(w, h)
  const i = Math.min(2, Math.floor(q))
  return { r: lerpR(R[i], R[i + 1], q - i), round: k + 1, moving: e > 0 && e < 1 }
}

/** Re-initialise state in place for a new cycle (prototype reset()). */
function reset(st: SimState, w: number, h: number, seed: number): void {
  st.rng = seed
  st.P = []
  for (let i = 0; i < HERO_MOTION.players; i++)
    st.P.push({ x: nextRandom(st) * w, y: nextRandom(st) * h, vx: 0, vy: 0, hp: 1, dead: 0, duel: null })
  st.t = 0
  st.duels = []
  st.nextDuel = 0.8
  st.end = 0
  st.seed = seed
  st.w = w
  st.h = h
}

export function createSim(opts: { seed?: number, width: number, height: number }): SimState {
  const st = { cycle: 0 } as SimState
  reset(st, opts.width, opts.height, opts.seed ?? HERO_MOTION.seed)
  return st
}

function aliveCount(st: SimState): number {
  let n = 0
  for (const p of st.P) {
    if (!p.dead)
      n++
  }
  return n
}

/** One simulation tick (prototype step()). */
function tick(st: SimState, dt: number): StormInfo {
  const { P, w, h } = st
  const { cycleSeconds, stormDamagePerSecond, duelSeconds, duelSpawnSeconds } = HERO_MOTION
  st.t += dt / cycleSeconds
  const sa = stormAt(w, h, Math.min(1, st.t))
  const R = sa.r
  const cx = R.x + R.w / 2
  const cy = R.y + R.h / 2
  for (const p of P) {
    if (p.dead) {
      p.dead += dt
      continue
    }
    if (p.duel)
      continue
    const inside = p.x > R.x && p.x < R.x + R.w && p.y > R.y && p.y < R.y + R.h
    const pull = inside ? 0.15 : 1.4
    p.vx += ((cx - p.x) / w * pull + gauss(st) * 0.35) * dt * 60
    p.vy += ((cy - p.y) / h * pull + gauss(st) * 0.35) * dt * 60
    p.vx *= 0.9
    p.vy *= 0.9
    p.x += p.vx * dt * 6
    p.y += p.vy * dt * 6
    if (!inside) {
      p.hp -= dt * stormDamagePerSecond
      // Last-trader guard: storm damage can never eliminate the final survivor.
      if (p.hp <= 0 && aliveCount(st) > 1)
        p.dead = 1e-3
      else if (p.hp <= 0)
        p.hp = 0.05
    }
  }
  st.nextDuel -= dt
  const alive = P.filter(p => !p.dead)
  if (st.nextDuel <= 0 && alive.length > 1) {
    st.nextDuel = duelSpawnSeconds[0] + nextRandom(st) * (duelSpawnSeconds[1] - duelSpawnSeconds[0])
    const free = alive.filter(p => !p.duel)
    if (free.length > 1) {
      const a = free[Math.floor(nextRandom(st) * free.length)]
      let b: Trader | null = null
      let bd = 1e9
      for (const q of free) {
        if (q !== a) {
          const d = Math.hypot(q.x - a.x, q.y - a.y)
          if (d < bd) {
            bd = d
            b = q
          }
        }
      }
      if (b && bd < Math.max(w, h) * 0.22) {
        const d: Duel = { a, b, t: 0 }
        a.duel = b.duel = d
        st.duels.push(d)
      }
    }
  }
  for (const d of st.duels) d.t += dt
  st.duels = st.duels.filter((d) => {
    if (d.t < duelSeconds)
      return true
    const loser = nextRandom(st) < 0.5 ? d.a : d.b
    d.a.duel = d.b.duel = null
    if (!loser.dead && aliveCount(st) > 1)
      loser.dead = 1e-3
    return false
  })
  return sa
}

/**
 * Advance the simulation by dt seconds. Includes the prototype's cycle logic: once one trader is left
 * (or the cycle overruns to t >= 1.12) the winner holds for winnerHoldSeconds, then the next seed starts.
 * The returned result describes the frame just simulated (before any cycle restart).
 */
export function stepSim(st: SimState, dt: number): StepResult {
  const sa = tick(st, dt)
  const alive = aliveCount(st)
  const result: StepResult = {
    round: sa.round,
    storm: alive === 1 ? 'winner' : sa.moving ? 'closing' : 'holding',
    alive,
    stormRect: sa.r,
    moving: sa.moving,
  }
  if (alive === 1 || st.t >= 1.12) {
    st.end += dt
    if (st.end > HERO_MOTION.winnerHoldSeconds) {
      reset(st, st.w, st.h, st.seed + 1)
      st.cycle++
    }
  }
  return result
}

/** Stable serialisation of the full state (RNG included) for determinism hashing. */
export function snapshot(st: SimState): string {
  const idx = new Map<Duel, number>()
  st.duels.forEach((d, i) => idx.set(d, i))
  const tIdx = new Map<Trader, number>()
  st.P.forEach((p, i) => tIdx.set(p, i))
  return JSON.stringify({
    rng: st.rng,
    seed: st.seed,
    cycle: st.cycle,
    w: st.w,
    h: st.h,
    t: st.t,
    nextDuel: st.nextDuel,
    end: st.end,
    P: st.P.map(p => [p.x, p.y, p.vx, p.vy, p.hp, p.dead, p.duel ? idx.get(p.duel) ?? -1 : -1]),
    duels: st.duels.map(d => [tIdx.get(d.a), tIdx.get(d.b), d.t]),
  })
}
