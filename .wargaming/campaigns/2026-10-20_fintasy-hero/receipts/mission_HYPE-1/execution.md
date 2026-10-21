# Execution receipt — HYPE-1 (2026-10-21, session a4a10a71)

- Authority: "Create a new branch as the last one was deleted. Then begin." Branch `feature/hype-section` was created from `origin/main` `d46b06a`, and its upstream unset (`git rev-parse @{u}` → "no upstream configured").
- Artifacts: `wargames/hype-directions/index.html` (sha256 0b78fed785872138bfc1b93620e178aa31ca437ba842e76a35adfec170743206), `hype-parts.html`, `fact-gate.mjs`. Served on `127.0.0.1:4478`. The page is the real HERO-1 direction-A hero (markup and engine copied) with sections 1/2/3 below it.
- packages/ files changed: 0

## Directions
1. **Match timeline:** four numbered beats (Drop / Duel / Storm / Last one solvent), each with a live vignette, plus a stats strip.
2. **Loadout grid:** a bento of mechanic cards with big numerals (30s, 5, 60, 5x, 2+), three animated card backgrounds, and a ranked ladder.
3. **Patch notes / field manual:** a sticky title, a spec row (60 / 10 Hz / 30 s / 11), a seeded 10 Hz price tape, and six tagged notes ([MATCH] [MAP] [DUEL] [CHAOS] [ENGINE] [RANKED]). This is the engineering-flex angle.

## Gates
Fact gate on the prototypes:
```
PASS h1: 14 numbers checked
PASS h2: 11 numbers checked
PASS h3: 9 numbers checked
3 of 3 regions pass
```
Falsifier (copy with "Over 100,000 players" and "Play now" injected): FAIL h1 "not allowlisted: 100,000"; FAIL h2 "banned phrases: /play now/i"; exit 1.
Real-code probe: `HeroVisual.vue:308` alt text → "FAIL heroAlt … not allowlisted: 12" (finding; see below).
Contrast (new surfaces): mute on card 5.42, body on card 9.01, violet on card 5.64, bone on card 15.20, mute on frame 5.60, bone on storm-tint 12.09 (all ≥ 4.5); control #777 on #888 1.26, FAIL as expected.

## Render (browser pane, 4478)
- 1440x900: all three directions render with live vignettes; console errors: none.
- 375x812: scrollWidth == innerWidth (375) for h1/h2/h3.
- Defects found and fixed during the run: (1) direction-1 header collapsed into a 1-word column at 375, because the kicker's `span 12` created implicit grid columns; fixed by giving the kicker `grid-column: 1/-1` on mobile, then re-rendered OK. (2) Direction-2 card vignettes overlapped labels; background opacity lowered from .9 to .45.

## Finding (ROUTED to HYPE-3)
HeroVisual alt text and hero-direction.md say "12 market sectors". DATA-MODEL-AUTHORITY §1.2 lists 11 (4 + 4 + 3) and heroSim draws 11 tiles. The packages/ fix is routed to HYPE-3; hero-direction.md is corrected at the HYPE-1 lock.

## Stage
mechanism_verified. OUTCOME waits on your pick.

---
# Run 2 — direction lock (2026-10-21)
- Consumer evidence: "Lock direction 1 (Match timeline) for HYPE-1 and write hype-direction.md + the tokens hype block."
- Written: hype-direction.md sha256 ef530dbd2273fdeac7a2912d775b5b812d84e9a0557cf1e72fa253380bd39cfa; tokens.json (with the `hype` block) sha256 cfa65cd307dc5086941b0b09b1396149e71e8c1c18727150ba059a3b927b2b56. Anchor locked: `#match`. HYPE-2 scope fixed to 4 vignettes: drop, duel, storm, lobby.
- Contrast gate (contrast.mjs now also reads tokens.hype.contrast):
```
HYPE    PASS 16.04:1 (min 4.5) h2 / h3 (#ECE9E2 on #0D0D0C)
HYPE    PASS  9.51:1 (min 4.5) body copy (#B9B5AC on #0D0D0C)
HYPE    PASS  5.72:1 (min 4.5) kicker / stats / captions (#8E8B84 on #0D0D0C)
HYPE    PASS  5.95:1 (min 3) ordinals (#8B7CFF on #0D0D0C)
HYPE    PASS  5.60:1 (min 4.5) frame caption (#8E8B84 on #10100F)
HYPE    PASS  5.60:1 (min 4.5) vignette HUD text (ROUND n / 5, 0:30) (#8E8B84 on #10100F)
control flagged as failing: true
0 failing pair(s) across 27 direction pairs
```
- Fact gate on the locked direction's region:
```
PASS h1: 14 numbers checked
1 of 1 regions pass
```
- hero-direction.md "12 sectors" changed to 11 in 3 places, with a correction note appended. The HeroVisual.vue text fix stays routed to HYPE-3.
- packages/ files changed: 0
## Stage
outcome_verified (your pick; locked spec and tokens written; gates pass and fail their controls). Retention is delegated to the HYPE-4 page retention guard.
