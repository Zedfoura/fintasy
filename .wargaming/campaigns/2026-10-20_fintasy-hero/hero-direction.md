# Hero Direction — LOCKED: A · "Closing Bell"

- **Decision:** user, 2026-10-20 — "Lock direction A (Closing Bell) for HERO-1".
- **Reference prototype:** `wargames/hero-directions/index.html#a` (served at `http://127.0.0.1:4477/?d=a` while the local server runs).
- **Tokens:** `tokens.json` (single source of truth; HERO-2 and HERO-3 read it, they never re-derive values from the prototype).
- **Rejected:** B · Tape (light editorial mosaic), C · Solvent (equity-curve poster). Both stay on disk as a record.

## Concept

The hero is a scene from a live match, not a marketing illustration. A Prødux-style framing splits the page into a quiet **statement band** (headline left, mono paragraph + CTAs right) and a full-bleed **framed visual**: the 11-sector map as concentric rings (4 outer, 4 mid, 3 inner), a violet storm closing round by round, and 60 traders that duel and drop until one is left. The type direction (big neutral grotesk, mono for meta) comes from the user's portfolio, which keeps it personal. The single accent, violet, appears only on the storm, the alive counter and the CTA hover.

## Anatomy (top → bottom)

1. **Top bar** (3-col grid; nav hidden < 760px)
   - Left: wordmark `FINTASY` + superscript `S01`
   - Center nav (mono, bracketed): `[Source]` → `https://github.com/Zedfoura/fintasy` only (probed 2026-10-20: HTTP 200; new tab, `rel="noopener noreferrer"`). **Superseded by D4:** `[Match]` and `[How it plays]` are removed because the game is not live, so the page links nowhere inside the app.
   - Right: `A project by / Tinatsei Chingaya`
   - The prototype's `[Ranked]` link is **dropped**: no ranked route exists in `packages/client/src/pages` (Anti-Island, DEEP-11).
2. **Statement band** (12-col): `h1` spans cols 1–7; paragraph + CTAs span cols 9–12, bottom-aligned. Below 760px it stacks into one column.
3. **Caption strip** (41px, hairline below): `Fig. 01 — Live match, seeded` · `Round n / 5 · Storm holding|closing|Winner standing` · `NN / 60 solvent` (NN in violet). Below 760px the left item is hidden. The strip is HTML with `aria-live="off"`, because a counter updating 30 times a second must not chatter in a screen reader.
4. **Framed visual** (fills the rest of `100svh`, min 46vh / 52vh mobile): `<HeroVisual>` canvas with `aria-hidden="true"` and a visually hidden text alternative: "Animated simulation: 60 traders across 11 market sectors; a storm closes in over 5 rounds while traders duel until one remains." A bottom-right caption reads `Duels 30 s · Ticks 10 Hz · Starting pot $15,000`.

## Copy (final)

| Slot | Text |
|---|---|
| h1 | Sixty traders. / One market. / Last one solvent. |
| Paragraph | Fintasy is a battle-royale trading game. Drop into a market sector, win 30-second trading duels, and outrun the liquidity storm as the map closes in. |
| Primary CTA | View the source → (`https://github.com/Zedfoura/fintasy`, new tab) — D4 |
| Secondary CTA | Read the case study → `https://www.tinatseichingaya.com/projects/fintasy` (same tab; user-provided 2026-10-20, probed HTTP 200). Still behind the `CASE_STUDY_URL` constant so an empty value hides it — D4 |
| `<title>` | Fintasy — the stock-market battle royale |
| meta description | A 60-player battle-royale trading game: drop into a sector, win 30-second duels, outrun the storm. A project by Tinatsei Chingaya. |

Every number is a product fact from DATA-MODEL-AUTHORITY or the Stock Royale ledger: 60 players, 11 sectors, 5 rounds, 30 s duels, 10 Hz, $15,000. No user counts, money totals, or ratings.

## D4 note (2026-10-20)
The game will not go live. Nothing on the page may imply it is playable or coming soon: no in-app links, no sign-in, no "Enter a match". The paragraph stays as product description. The page lives in the portfolio as a design and engineering artifact.

## Behavior

- **Motion:** seeded (2026), 22 s cycle, 5 rounds (each holds half its time, then the storm moves with a dashed boundary). Duels last 1.4 s. Storm damage can never eliminate the last trader. The winner holds for 2.8 s, then the next seed starts.
- **Reduced motion:** a single static frame (700 fixed steps); no rAF loop.
- **Offscreen / hidden tab:** pause the loop (IntersectionObserver + `visibilitychange`).
- **Performance:** first frame ≤ 100 ms after mount; no layout shift from the canvas (its size is set by the slot, not by content); DPR capped at 2.
- **Fonts:** Archivo + JetBrains Mono, registered via UnoCSS `presetWebFonts` and scoped to the hero (the dashboard keeps DM Sans/Mono).
- **Scope:** all tokens live under a `.hero` scope as `--hero-*` variables. Global `--c-*` tokens are untouched.

## Accessibility gate

`wargames/hero-directions/contrast.mjs` reads the `contrast` pairs straight from `tokens.json`; any pair below its minimum exits 1. Exempt as decorative: canvas sector labels inside the storm (bone at 0.32 alpha) and the duel/elimination marks. They carry no information that isn't also in the caption strip text.

## Hand-off

- **HERO-2** (`hero_visual` lane): port the A canvas engine into `components/hero/HeroVisual.vue`. It emits `round`, `storm`, `alive` for the strip, and takes `seed` as a prop.
- **HERO-3** (`hero_layout` lane): top bar, statement band, caption strip, visual slot, `/` route on a nav-free layout (single nav), legacy sections unmounted (D2). It also owns the schema-v2 flow migration debt.

> **2026-10-21 correction (HYPE-1 fact gate):** this file said "12 sectors" in three places. DATA-MODEL-AUTHORITY §1.2 lists 11 (4 outer, 4 mid, 3 inner) and heroSim draws 11, so all three now say 11. The matching fix to `HeroVisual.vue`'s screen-reader text is routed to HYPE-3.
