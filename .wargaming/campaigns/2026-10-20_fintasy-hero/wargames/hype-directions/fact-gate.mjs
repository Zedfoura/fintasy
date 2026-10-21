// HYPE fact gate: every number in hype copy must be an allowlisted product fact, and no copy may imply the game
// is playable or launching. Usage: node fact-gate.mjs <file.html> [regionId ...]
// Regions are delimited in the HTML by <!-- FACTS:id --> ... <!-- /FACTS:id -->. Exit 1 on any violation.
import { readFileSync } from 'node:fs'

// Sources: .wargaming/DATA-MODEL-AUTHORITY.md §1 (30–60 players, 10 Hz / 100 ms, 11 sectors, 30–60 s duels,
// Copper → Golden Trader, divisions I–III) and the Stock Royale product-spec rows ROYALE-0/2/4 ($15,000 pot,
// 5 rounds, 1x–5x leverage). Ordinals 01–04 are section numbering, not claims.
const ALLOWED = new Set(['60', '30', '30–60', '30-60', '11', '10', '100', '5', '1', '1x', '2x', '3x', '4x', '5x', '1x–5x', '1x-5x', '$15,000', '15,000', '2+', '01', '02', '03', '04'])
const BANNED = [/play now/i, /coming soon/i, /sign in/i, /sign up/i, /download/i, /join the beta/i, /pre-?order/i, /wishlist/i, /launch(ing)? (soon|in)/i]

const [file, ...ids] = process.argv.slice(2)
const html = readFileSync(file, 'utf-8')
const regions = [...html.matchAll(/<!-- FACTS:([\w-]+) -->([\s\S]*?)<!-- \/FACTS:\1 -->/g)]
  .filter(m => !ids.length || ids.includes(m[1]))
if (!regions.length) {
  console.log('no FACTS regions found')
  process.exit(1)
}

let bad = 0
for (const [, id, body] of regions) {
  const text = body.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ')
  const nums = text.match(/\$?\d[\d,]*(?:\.\d+)?(?:[–-]\d+)?(?:x(?:[–-]\d+x)?|\+)?/g) || []
  const offenders = nums.filter(n => !ALLOWED.has(n.replace(/,$/, '')))
  const banned = BANNED.filter(r => r.test(text)).map(String)
  const ok = !offenders.length && !banned.length
  if (!ok)
    bad++
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${nums.length} numbers checked${offenders.length ? `; not allowlisted: ${[...new Set(offenders)].join(', ')}` : ''}${banned.length ? `; banned phrases: ${banned.join(', ')}` : ''}`)
}
console.log(`${regions.length - bad} of ${regions.length} regions pass`)
process.exit(bad ? 1 : 0)
