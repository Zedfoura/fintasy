# Execution receipt — CLOSE-1 Direction Lock: FAQ & Final CTA (run 1: directions rendered, awaiting pick)

- **Run:** close-1-run1-20261021 (session a4a10a71-8f49-47f0-ac4f-8ec743402514)
- **User instruction:** "Proceed to CLOSE-1: render 2–3 FAQ + final CTA directions under the real page for me to pick from (prototypes only, no packages/ edits)."
- **Rulings:** D4 (no live game; outbound links only); D7 (CTA = source + case study; branch `feature/closing-sections`).
- **Data model:** DATA-MODEL-AUTHORITY.md sha256 `1807e0c9…f3207`, client-only / no-data-tier.
- **Stage:** `executing`. Outcome (your pick) is still pending.
- **Ref:** `refs/heads/feature/closing-sections` (local, not pushed); 0 changed files under `packages/`.

## What was built (`wargames/close-directions/`)
- `page/`: a byte copy of `packages/client/dist-hero` (the real standalone build of `2227c2d`, which you reviewed). The only change is that `index.html` loads `../close.css` and `../close.js`. The directions therefore render **under the real hero and hype section**, not a mock-up of them. The HYPE-1 prototype hero is stale (it has "Enter a match" and "Sign in" from before D4).
- `directions.html`: three `<template>`s (c1, c2, c3), each a FACTS region holding an FAQ `<section id="faq">` and a CTA `<section id="cta">`. The FAQ copy is identical across directions; the layout and CTA treatment differ. The header comment lists the repo source for every answer.
- `close.js`: mounts `?c=` inside `main.fintasy-page`, wires the c1 accordion, and adds a prototype switcher (`?clean` hides it).
- `close.css`: hero/hype tokens only.
- `fact-gate.mjs`: the HYPE rules plus a link rule. Every `href` must be the GitHub source or the case-study URL.

| Direction | FAQ pattern | CTA |
|---|---|---|
| c1 · Closing bell | `<button aria-expanded>` accordion in the hype 12-column grid; Q1 open | Centred "That's the match." over static storm rings; hero-style button and link |
| c2 · Index | Sticky heading; every answer always open (`<dl>`), no interaction | "See how it's built." with two large split link tiles (Source / Case study) |
| c3 · Match report | Mono debrief log; native `<details>`/`<summary>` (works without JS); Q1 and Q2 open | "Match over." receipt card (60 / 11 / 5 / 1) with hero-style button and link |

## Gates
```
$ node close-directions/fact-gate.mjs close-directions/directions.html
PASS c1: 12 numbers, 2 links checked
PASS c2: 12 numbers, 2 links checked
PASS c3: 16 numbers, 2 links checked
3 of 3 regions pass                                   (exit 0)
F1 "Up to 100,000 traders"      → FAIL c1,c2,c3: not allowlisted: 100,000   (exit 1)
F2 "Play now."                   → FAIL c1,c2,c3: banned phrases: /play now/i (exit 1)
F3 case-study href → /login      → FAIL c1,c3: links not allowed: /login     (exit 1)
F4 c2 tile href → /dashboard/royale → FAIL c2: links not allowed: /dashboard/royale (exit 1)
$ node hero-directions/contrast.mjs        (CLOSE group added)
CLOSE PASS 5.60:1 mute on frame · 9.31:1 body on frame · 5.82:1 violet on frame
CLOSE PASS 14.94:1 bone on tile · 5.33:1 mute on tile · 5.54:1 violet on tile
control flagged as failing: true · 0 failing pair(s) across 33 direction pairs (exit 0)
```

## Rendered (browser pane, `http://127.0.0.1:4478/close-directions/page/?c=…`)
- **Order and structure:**
  - section order is `hero → match → faq → cta`;
  - 1 h1, 1 h2 each in FAQ and CTA;
  - 2 distinct links in the new sections, 0 internal links in `main`, for all three directions.
- **Overflow** (per-element rect check, at 1440 and 375): **0** elements outside the viewport in `#faq` / `#cta` for c1, c2 and c3, after one fix during the run. `.cl` lacked `box-sizing: border-box`, so the sections were 78 px too wide.
- **Interaction:**
  - c1 is a native `<button>`; a click toggles `aria-expanded` false → true and `hidden` true → false.
  - c3 is native `<details>`; a click toggles it, and Q1 and Q2 start open.

## Finding: the overflow instrument was blind, and the shipped hype section overflows (DEF-HYPE-OVERFLOW)
- `main.fintasy-page` has `overflow-x: clip`. The "`scrollWidth == innerWidth`" signal used in HYPE-3 and HYPE-4 therefore **cannot** detect horizontal overflow on this page, because clipped content does not scroll.
- The per-element rect check found that **`section.hype` is 1596 px wide at a 1440 px viewport** (right edge 1596; first frame's right edge 1518). In `packages/client/src/components/hype/HypeSection.vue`, `.hype` has `width: 100%` plus gutter padding, and `border-box` applies only to `.hype *` (line 87). The right gutter is lost and the section's content runs to the viewport edge.
- `section.hero` is unaffected (1440).
- The fix is outside CLOSE-1 authority (it edits `packages/`). It is one line: add `box-sizing: border-box` to `.hype`. It would land on `feature/hype-section`, so in PR #4. CLOSE-2/3 verification now uses the rect check instead of `scrollWidth`.

## Run 2 (2026-10-21): prices answer changed by the user (ruling D8)
- **User:** "The prices are actually supposed to come from AlpacaAPI which pulls live stock market data."
- **Probe:**
  - Alpaca is used by `packages/server/src/services/alpaca/alpaca.py` (`https://data.alpaca.markets/v2/stocks/trades`) via `/quotes/{symbol}` and `/transactions`.
  - `services/royale/` has no Alpaca reference; in-match prices tick from `market_sim.py` `base_price_cents`.
  - `pages/dashboard/help/faq.md:70` says in-match duels run on the 10 Hz engine and that Alpaca is "reserved for non-royale paper-trading portfolio lookups".
- **Options shown:** "both, as built" (recommended), "Alpaca only", or "drop the question". **The user chose "Alpaca only".**
- **Change:** Q3 in c1, c2 and c3 now reads "Live stock market data from the Alpaca Markets API." (3 occurrences; 0 of the old simulator line remain).
- **Gate:**
```
PASS c1: 10 numbers, 2 links checked
PASS c2: 10 numbers, 2 links checked
PASS c3: 14 numbers, 2 links checked
3 of 3 regions pass   (exit 0)
```
- **Accepted gap (D8):** the line does not mention that matches use the seeded simulator. Flagged so CLOSE-2 copy reviews don't revert it unasked.

## Run 3 (2026-10-21): direction locked — outcome verified
- **User:** "Lock C1 (Closing bell) for CLOSE-1 and write close-direction.md + the tokens close block."
- **Written:**
  - `close-direction.md`: anatomy, final copy (03 per D8), disclosure contract, accessibility, and CLOSE-2 build notes (section-root `border-box`, rect-based overflow check, links imported from `heroLinks.ts`).
  - `tokens.json` gains a `close` block. Existing keys are value-identical; the only textual diff is `≥` → `≥` in one hype `$comment`.
  - `contrast.mjs` reads `close.contrast` (group `CLOSE_L`).
- **Gates:**
```
CLOSE_L PASS 16.04:1 h2 / questions · 9.51:1 answers / CTA body · 5.72:1 kicker / intro
CLOSE_L PASS 5.95:1 ordinals · 16.04:1 CTA button text · 5.95:1 CTA button focused
control flagged as failing: true · 0 failing pair(s) across 39 direction pairs (exit 0)
vitest HeroRetention + HypeVignettes (both read tokens.json): Test Files 2 passed (2) · Tests 33 passed (33)
```
- **Stage:** `outcome_verified` (the user's pick is the CLOSE-1 outcome). The next transition is CLOSE-2 PLAN, then EXECUTE with a packages/ grant.

## DEF-HYPE-OVERFLOW fixed (2026-10-21)
- **User:** "Fix the hype-section overflow on feature/hype-section (one-line box-sizing fix in HypeSection.vue), verify it with the rect check, and push it to PR #4."
- **Fix:** `c95d4bb fix(hype): stop the hype section overflowing its right gutter`, which adds `box-sizing: border-box` to `.hype`. Pushed to `origin/feature/hype-section` (PR #4 head = `c95d4bb`) and merged into `feature/closing-sections` as `d4acd02`.
- **Tests:** HypeSection, PageRetention, HeroSection, HeroRetention and HypeVignettes pass 66/66. `build:hero` exits 0; bundle check clean.
- **Rect check:** every element in `main` on the rebuilt standalone page (`vite preview`, iframes at fixed widths). Visually hidden 1px elements are excluded.

| Width | `section.hype` width | Overflowing elements | Control (fix reverted in-page): width / overflowing |
|---|---|---|---|
| 1440 | 1440 | 0 | 1596 / 21 |
| 768 | 768 | 0 | 851 / 21 |
| 375 | 375 | 0 | 416 / 38 |

The defect also affected mobile: before the fix the section was 416 px wide on a 375 px viewport.

## Correction (2026-10-21): the overflow fix did not reach PR #4
PR #4 merged into main at 2026-10-21T20:00:12Z (merge `388dbf7`, head `962e402`) **before** `c95d4bb` was pushed to `feature/hype-section`. The earlier statements "pushed to PR #4" and "PR #4 head = `c95d4bb`" were wrong: the PR's state was not checked before the push. main therefore shipped DEF-HYPE-OVERFLOW. The fix reaches main through PR #5 (`feature/closing-sections` → `main`, opened 2026-10-21; the user chose base `main` over the already-merged `feature/hype-section`). PR #5 merges cleanly with `origin/main` (checked with `git merge-tree`).
