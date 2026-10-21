/**
 * @author: Tinatsei Chingaya (Zedfoura), Claude
 * @description: Locked copy for the hype section (HYPE-1 direction 1 "Match timeline"), word for word from the
 * campaign's hype-direction.md copy table, plus the fact rule (FACT_ALLOWLIST / BANNED_PHRASES) the tests apply to it.
 */

type HypeVignetteId = 'drop' | 'duel' | 'storm' | 'lobby'

export interface HypeBeat {
  id: HypeVignetteId
  ordinal: '01' | '02' | '03' | '04'
  title: string
  body: string
  vignette: HypeVignetteId
  caption: string
}

export interface HypeStat {
  value: string
  label: string
}

export const HYPE_ANCHOR = 'match'

export const HYPE_KICKER = 'How a match is won'

export const HYPE_TITLE_LINES = ['Drop in. Trade hard.', 'Stay solvent.'] as const

export const HYPE_INTRO = 'Every match runs the same four beats. Survive all of them and you\'re the last trader standing.'

export const HYPE_BEATS: readonly HypeBeat[] = [
  {
    id: 'drop',
    ordinal: '01',
    title: 'Drop',
    body: 'Eleven sectors, three rings. Pick a drop zone. Land uncontested and that sector\'s ticker loot is yours.',
    vignette: 'drop',
    caption: 'Sector map',
  },
  {
    id: 'duel',
    ordinal: '02',
    title: 'Duel',
    body: 'Meet a rival and a 30-second trading duel starts. Long or short, 1x–5x leverage. Higher P&L takes the fight, the tickers and the bounty.',
    vignette: 'duel',
    caption: 'P&L race',
  },
  {
    id: 'storm',
    ordinal: '03',
    title: 'Storm',
    body: 'A liquidity storm collapses the map ring by ring over 5 rounds. Get caught in the storm and your balance bleeds every tick.',
    vignette: 'storm',
    caption: 'Storm boundary',
  },
  {
    id: 'lobby',
    ordinal: '04',
    title: 'Last one solvent',
    body: 'Third parties crash live duels. AI bots fill every empty seat. Up to 60 traders drop in. One walks out.',
    vignette: 'lobby',
    caption: 'Traders remaining',
  },
]

// Rendered as "60 traders · 11 sectors · 30 s duels · 10 Hz ticks · 5 rounds".
export const HYPE_STATS: readonly HypeStat[] = [
  { value: '60', label: 'traders' },
  { value: '11', label: 'sectors' },
  { value: '30 s', label: 'duels' },
  { value: '10 Hz', label: 'ticks' },
  { value: '5', label: 'rounds' },
]

// Fact rule mirrored from .wargaming/campaigns/2026-10-20_fintasy-hero/wargames/hype-directions/fact-gate.mjs
// (ALLOWED / BANNED). Sources: DATA-MODEL-AUTHORITY §1 (30–60 players, 10 Hz / 100 ms, 11 sectors, 30–60 s duels)
// and the Stock Royale spec rows ROYALE-0/2/4 ($15,000 pot, 5 rounds, 1x–5x leverage). Ordinals 01–04 are
// section numbering, not claims. Keep both lists in sync with the gate.
const FACT_ALLOWLIST: ReadonlySet<string> = new Set([
  '60',
  '30',
  '30–60',
  '30-60',
  '11',
  '10',
  '100',
  '5',
  '1',
  '1x',
  '2x',
  '3x',
  '4x',
  '5x',
  '1x–5x',
  '1x-5x',
  '$15,000',
  '15,000',
  '2+',
  '01',
  '02',
  '03',
  '04',
  // FAQ ordinals (CLOSE-2): zero-padded section numbering, not claims.
  '05',
  '06',
])

const BANNED_PHRASES: readonly RegExp[] = [
  /play now/i,
  /coming soon/i,
  /sign in/i,
  /sign up/i,
  /download/i,
  /join the beta/i,
  /pre-?order/i,
  /create (an )?account/i,
  /deploy to/i,
  /wishlist/i,
  /launch(ing)? (soon|in)/i,
]

// Same number tokenizer as fact-gate.mjs.
const FACT_NUMBER_PATTERN = /\$?\d[\d,]*(?:\.\d+)?(?:[–-]\d+)?(?:x(?:[–-]\d+x)?|\+)?/g

/** Returns the numbers that are not allowlisted and the banned phrases found in `text`. */
export function factViolations(text: string): { offenders: string[], banned: string[] } {
  const nums = text.match(FACT_NUMBER_PATTERN) ?? []
  const offenders = [...new Set(nums.map(n => n.replace(/,$/, '')).filter(n => !FACT_ALLOWLIST.has(n)))]
  const banned = BANNED_PHRASES.filter(r => r.test(text)).map(String)
  return { offenders, banned }
}
