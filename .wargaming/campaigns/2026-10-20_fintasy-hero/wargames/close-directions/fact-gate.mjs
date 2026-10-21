// CLOSE fact gate: the HYPE rules (allowlisted numbers, no "playable/launching" phrases) plus a link rule (D4 and the
// 2026-10-21 CTA ruling): every href in a region must be the GitHub source or the portfolio case study.
// Usage: node fact-gate.mjs <file.html> [regionId ...]. Regions: <!-- FACTS:id --> ... <!-- /FACTS:id -->. Exit 1 on any violation.
import { readFileSync } from 'node:fs'

// Number sources as in hype-directions/fact-gate.mjs (DATA-MODEL-AUTHORITY §1, ROYALE-0/2/4); 06 extends the ordinals.
const ALLOWED = new Set(['60', '30', '30–60', '30-60', '11', '10', '100', '5', '1', '1x', '2x', '3x', '4x', '5x', '1x–5x', '1x-5x', '$15,000', '15,000', '2+', '01', '02', '03', '04', '05', '06', '.01', '.02', '.03', '.04', '.05', '.06'])
const BANNED = [/play now/i, /coming soon/i, /sign in/i, /sign up/i, /download/i, /join the beta/i, /pre-?order/i, /wishlist/i, /launch(ing)? (soon|in)/i, /create (an )?account/i, /deploy to/i]
const LINKS = new Set(['https://github.com/Zedfoura/fintasy', 'https://www.tinatseichingaya.com/projects/fintasy'])

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
  const hrefs = [...body.matchAll(/href="([^"]*)"/g)].map(m => m[1])
  const badLinks = hrefs.filter(h => !LINKS.has(h))
  const text = body.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ')
  const nums = text.match(/\$?\.?\d[\d,]*(?:\.\d+)?(?:[–-]\d+)?(?:x(?:[–-]\d+x)?|\+)?/g) || []
  const offenders = nums.filter(n => !ALLOWED.has(n.replace(/,$/, '')))
  const banned = BANNED.filter(r => r.test(text)).map(String)
  const ok = !offenders.length && !banned.length && !badLinks.length && hrefs.length > 0
  if (!ok)
    bad++
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}: ${nums.length} numbers, ${hrefs.length} links checked${offenders.length ? `; not allowlisted: ${[...new Set(offenders)].join(', ')}` : ''}${banned.length ? `; banned phrases: ${banned.join(', ')}` : ''}${badLinks.length ? `; links not allowed: ${[...new Set(badLinks)].join(', ')}` : ''}${hrefs.length ? '' : '; no CTA link found'}`)
}
console.log(`${regions.length - bad} of ${regions.length} regions pass`)
process.exit(bad ? 1 : 0)
