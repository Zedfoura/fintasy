# Closing Sections Direction — LOCKED: C1 · "Closing bell"

- **Decision:** user, 2026-10-21: "Lock C1 (Closing bell) for CLOSE-1 and write close-direction.md + the tokens close block."
- **Reference prototype:** `wargames/close-directions/page/?c=c1`. It renders under a byte copy of the real standalone build (`dist-hero` @ `2227c2d`) and is served from `wargames/` at `http://127.0.0.1:4478/close-directions/page/?c=c1&at=faq` while the local server runs.
- **Tokens:** the `close` block in `tokens.json`. Colours reuse the locked HERO-1 palette; this file never redefines them.
- **Rejected:** C2 · Index and C3 · Match report. Both stay in `directions.html` as a record.
- **Rulings in force:**
  - **D4:** no live game. No "play now", sign-up, account or countdown copy; outbound links only.
  - **D7:** the CTA targets are the hero's `SOURCE_URL` and `CASE_STUDY_URL`.
  - **D8:** the prices answer, below.

## Concept

The FAQ settles the questions a recruiter or player asks first, in the same 12-column grid and hairline rhythm as the Match-timeline section above it. Then the page ends the way a match does: a single large statement, "That's the match.", over the faint storm rings, with the same two outbound links the hero opened with. The page opens on the bell and closes on it.

## Anatomy (top → bottom, after `#match`)

1. **FAQ shell:** `<section id="faq" aria-labelledby="faq-title">`, ink background, hairline top border, the hype gutter and vertical padding.
2. **FAQ header** (12-col):
   - kicker `[ FAQ ]` spans **the full width** (`1 / -1`);
   - `h2` takes cols 1–8;
   - intro takes cols 9–12, bottom-aligned.
   - Below 760px everything is `1 / -1`.
3. **FAQ list:** six items, each with a hairline bottom border; the list has a hairline top.
   - Each item is `<h3><button type="button" aria-expanded aria-controls>`, holding an aria-hidden violet ordinal (01–06), the question, and an aria-hidden +/− icon.
   - Each answer is `<div role="region" aria-labelledby id hidden>`.
   - Item 01 starts open; the rest start closed.
   - Items are independent (opening one does not close the others).
4. **CTA shell:** `<section id="cta" aria-labelledby="cta-title">`, centred text, larger vertical padding.
5. **CTA rings:** three aria-hidden rectangles (outer, a dashed violet "storm" middle, inner) echoing the sector map. They are static; nothing animates.
6. **CTA body:**
   - kicker `[ Closing bell ]`;
   - `h2` "That's the match." (display size);
   - one line of body copy;
   - the hero's two links in its exact styles: a bone button "View the source →" (new tab, `rel="noopener noreferrer"`) and an underlined link "Read the case study" (same tab).

## Copy (final)

| Slot | Text |
|---|---|
| FAQ kicker | [ FAQ ] |
| FAQ h2 | Questions, / answered. |
| FAQ intro | The short version of what recruiters and players ask first. |
| 01 · Q | Can I play Fintasy? |
| 01 · A | Not right now. Fintasy is a portfolio project, not a live service, so there is no public server to join. The full source is on GitHub, and the case study walks through how it was designed and built. |
| 02 · Q | Is real money involved? |
| 02 · A | No. Every trader starts each match with the same simulated $15,000 balance, held in integer cents. Nothing is bought or sold on a real exchange. |
| 03 · Q | Where do the prices come from? |
| 03 · A | Live stock market data from the Alpaca Markets API. |
| 04 · Q | Who am I up against? |
| 04 · A | Up to 60 traders per match. AI bots fill every empty seat, so a match never waits on a half-empty lobby. |
| 05 · Q | How does a match end? |
| 05 · A | When one trader is left solvent. Duels move P&L between players, the storm shrinks the map over 5 rounds, and anyone whose balance runs dry is out. |
| 06 · Q | What is it built with? |
| 06 · A | A Vue and TypeScript client, a Python FastAPI server backed by PostgreSQL, and an authoritative match loop that runs at 10 Hz on the server. |
| CTA kicker | [ Closing bell ] |
| CTA h2 | That's the match. |
| CTA body | Fintasy isn't live. The code and the story behind it are. |
| CTA primary | View the source → (`SOURCE_URL`, new tab) |
| CTA secondary | Read the case study (`CASE_STUDY_URL`) |

**Sources per answer** are listed in the header of `wargames/close-directions/directions.html`.

**Fact rule:** every number must be allowlisted and the copy must pass `wargames/close-directions/fact-gate.mjs` (the HYPE rules plus outbound-only links). The gate must still fail its controls: "100,000 traders", "Play now", a `/login` href and a `/dashboard/royale` href.

**D8 note:** answer 03 is the user's chosen wording. The repo uses Alpaca for paper-trading quotes, while in-match prices come from the seeded simulator (`services/royale/market_sim.py`). The user accepted that the line doesn't mention the simulator. Do not change it without the user.

## Accessibility

- **Headings:** the page keeps one h1 (the hero's). The FAQ has one h2 plus one h3 per question; the CTA has one h2. Both sections are labelled by their h2.
- **Disclosure** (WAI-ARIA accordion pattern without single-open):
  - a native `<button>` with `aria-expanded` reflecting state and `aria-controls` naming its region;
  - Enter and Space toggle (native button behaviour);
  - focus is visible (2px violet outline);
  - the answers' text is in the DOM even while hidden.
- **Decoration:** ordinals, icons and rings are `aria-hidden`.
- **Motion:** only the icon's 0.2s rotate transition, which is disabled under `prefers-reduced-motion`.
- **Contrast:** every pair is listed in `tokens.json` `close.contrast` and gated at ≥ 4.5:1 by `wargames/hero-directions/contrast.mjs`.

## Build notes for CLOSE-2 (learned in CLOSE-1)

- **Box sizing:** set `box-sizing: border-box` on the section roots themselves (`.close-faq`, `.close-cta`), not only on their children. `width: 100%` plus gutter padding otherwise overflows by two gutters. The shipped `.hype` has exactly this bug (DEF-HYPE-OVERFLOW).
- **Overflow checks:** do not use `scrollWidth == innerWidth` as the overflow signal. `main.fintasy-page` has `overflow-x: clip`, which hides overflow instead of scrolling it. Use a per-element rect check, where every element's right edge must be ≤ `innerWidth`.
- **Links:** import `SOURCE_URL` and `CASE_STUDY_URL` from `heroLinks.ts`; never hard-code them.
