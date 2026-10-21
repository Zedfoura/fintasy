# ARC — HERO-1 Direction Lock (campaign 2026-10-20_fintasy-hero)

## Claim frame
- Outcome: the user selects one of three rendered hero directions; the pick is codified as `hero-direction.md` + `tokens.json`.
- Required stage: OUTCOME. Consumer: the user's explicit selection in chat.
- Authority: user message 2026-10-20 "Proceed to HERO-1." Grant covers writing campaign artifacts only. `packages/**` is excluded.
- Source/ref: `feature/stock-royale-full-platform` @ `511b80c`. Runtime: static HTML viewed in the built-in browser pane (file://).
- Dependencies: none. D2 decided (hero-only `/`).
- Invariants: zero diff under `packages/`; DATA-MODEL-AUTHORITY untouched (client-only / no-data-tier).
- Falsifier: any text/background token pair below 4.5:1 (body) or 3:1 (display ≥ 24px) fails the gate. The contrast script must flag a known-bad control pair (#777 on #888), otherwise the instrument is vacuous.
- Flows: FLOW-HERO-FIRST-IMPRESSION @ PLAN.

## ARC rows
| Action | Reaction (risk) | Counteraction |
|---|---|---|
| Build 3 directions from the 3 references | They read as copies of the references, not as Fintasy | Every visual is drawn from Fintasy's domain (sectors, storm, 60 players, duels); copy is product-specific |
| Use real product claims in copy | Invented metrics (the old page had "$142M+", "48,200 traders") are dishonest for recruiters | Only facts in DATA-MODEL-AUTHORITY / ledger: 60 players, 10 Hz ticks, $15,000 pot, 30 s duels, 12 sectors, 5 rounds |
| Load web fonts | Not available in packages yet | Prototypes use Google Fonts; HERO-3 registers the chosen pair via presetWebFonts |
| Canvas animation | Motion sickness; cost | Prototypes honour prefers-reduced-motion with a static frame |
| Mobile | Large display type overflows | Check 375px for horizontal scroll (scrollWidth ≤ innerWidth) |

## Postconditions → transitions
1. `wargames/hero-directions/index.html` renders A/B/C with no console errors at 1440 and 375 → mechanism evidence.
2. `contrast.mjs` passes for all three palettes and fails the control → instrument evidence.
3. User pick → write `hero-direction.md` + `tokens.json` → `outcome_verified`. HERO-1 is a design decision, so retention = HERO-4's retention guard consuming those tokens.

Rollback: delete `wargames/hero-directions/`. No point of no return.
