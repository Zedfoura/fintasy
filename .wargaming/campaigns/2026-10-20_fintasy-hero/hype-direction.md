# Hype Section Direction — LOCKED: 1 · "Match timeline"

- **Decision:** user, 2026-10-21: "Lock direction 1 (Match timeline) for HYPE-1 and write hype-direction.md + the tokens hype block."
- **Reference prototype:** `wargames/hype-directions/index.html?h=h1`. It is served from `wargames/` at `http://127.0.0.1:4478/hype-directions/?h=h1` while the local server runs.
- **Tokens:** the `hype` block in `tokens.json` (colors reuse the locked HERO-1 palette; this file never redefines them).
- **Rejected:** 2 · Loadout grid and 3 · Field manual. Both stay on disk as a record.
- **Angle:** pure game hype told as a sequence. The engineering flex stays out of this section (it lives in the case study).

## Concept

The hero promises "Last one solvent." This section pays that off by walking through one match in four beats, in the order a match actually happens. Each beat pairs a big violet ordinal and a short claim with a live vignette that shows the mechanic, so the visitor watches the game work rather than reading feature bullets. It is the solution / value proposition and the key benefits in one: the beats are the features, and the sequence is the pitch.

## Anatomy (top → bottom)

1. **Section shell:** `<section id="match" aria-labelledby="hype-title">`, ink background, hairline top border, same gutter as the hero. Anchor `#match` is **locked**, so EP-hype-deeplink becomes applicable (HYPE-3 updates the inventory row to `required`).
2. **Header** (12-col): kicker `[ How a match is won ]` across the full width; `h2` cols 1–8; intro paragraph cols 9–12, bottom-aligned.
3. **Four beats.** Each is an `<article>` with a hairline top border; the last beat also has a bottom border. Columns: ordinal 1–2, text 3–6 (`h3` and paragraph), vignette frame 8–12 at 16:9.
4. **Stats strip:** one mono line, `60 traders · 11 sectors · 30 s duels · 10 Hz ticks · 5 rounds`.
5. **Below 760px:** everything stacks into one column (ordinal → text → frame). The kicker spans the column too, which fixes the implicit-grid bug found during HYPE-1.

## Copy (final)

| Slot | Text |
|---|---|
| Kicker | [ How a match is won ] |
| h2 | Drop in. Trade hard. / Stay solvent. |
| Intro | Every match runs the same four beats. Survive all of them and you're the last trader standing. |
| 01 · h3 | Drop |
| 01 · body | Eleven sectors, three rings. Pick a drop zone. Land uncontested and that sector's ticker loot is yours. |
| 02 · h3 | Duel |
| 02 · body | Meet a rival and a 30-second trading duel starts. Long or short, 1x–5x leverage. Higher P&L takes the fight, the tickers and the bounty. |
| 03 · h3 | Storm |
| 03 · body | A liquidity storm collapses the map ring by ring over 5 rounds. Caught outside, your $15,000 bleeds every tick. |
| 04 · h3 | Last one solvent |
| 04 · body | Third parties crash live duels. AI bots fill every empty seat. Up to 60 traders drop in. One walks out. |
| Stats strip | 60 traders · 11 sectors · 30 s duels · 10 Hz ticks · 5 rounds |

The section has no links. The hero's outbound links remain the page's only links (D4).

**Fact rule:** every number above is allowlisted in `wargames/hype-directions/fact-gate.mjs`, which takes its facts from DATA-MODEL-AUTHORITY §1 and the Stock Royale spec rows ROYALE-0/2/4. Any copy change must still pass the gate, and the gate must still fail its "100,000 players" / "Play now" control.

## Vignettes (HYPE-2 scope: exactly these four)

| Beat | Vignette id | What it shows | Canvas caption |
|---|---|---|---|
| 01 | `drop` | 11-sector three-ring map; a trader dot drops onto the inner ring and a violet ripple marks the landing (4 s loop). | Sector map |
| 02 | `duel` | Two seeded P&L lines race; the leader is violet and the trailer muted, with a 0:30 → 0:00 countdown top-right (5 s visual cycle). | P&L race |
| 03 | `storm` | Ring map with a violet storm closing over ROUND 1/5 → 5/5; the boundary is dashed while moving (10 s loop). | Storm boundary |
| 04 | `lobby` | 60-dot grid; dots are eliminated in seeded order until one violet survivor remains (9 s loop). | Traders remaining |

Rules for every vignette:
- Seeded and deterministic.
- Decorative: `aria-hidden="true"`, and the beat's h3 and body carry the meaning.
- Animates only while ≥10% visible (IntersectionObserver), and pauses in a hidden tab.
- `prefers-reduced-motion` gives one static frame (t = 3.7 s), with no rAF loop.
- DPR capped at 2.
- Where geometry overlaps the hero (sector rings, storm), reuse `heroSim.ts` helpers (`sectorTiles`, `stormAt`) rather than forking them.

**Slot contract (HYPE-3 ↔ HYPE-2):**
- HypeSection renders one named slot per beat (`vignette-drop`, `vignette-duel`, `vignette-storm`, `vignette-lobby`) inside a 16:9 frame that has a hairline border and a caption.
- Each slot's fallback is a static aria-hidden ring frame in tile colors.
- Each vignette component fills 100% of its slot and takes an optional `seed` prop.

## Accessibility
- One h1 on the page (the hero's). This section has one h2 and one h3 per beat, and is a `section` labelled by its h2.
- The ordinals are `aria-hidden` (decorative). Reading order is h3 → body.
- No interactive elements, so no focus targets.
- Contrast: every pair is in `tokens.json` `hype.contrast` and gated at ≥ 4.5:1.

## Finding carried into HYPE-3
The hero's screen-reader text (`HeroVisual.vue:308`) says "12 market sectors". The correct count is **11** (DATA-MODEL-AUTHORITY §1.2: 4 + 4 + 3; heroSim draws 11). HYPE-3 fixes the string. `hero-direction.md` is corrected in this lock.
