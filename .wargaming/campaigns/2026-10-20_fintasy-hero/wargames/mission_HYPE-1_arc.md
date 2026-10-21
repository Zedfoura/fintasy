# ARC / Battle Plan — HYPE-1 Hype Direction Lock (campaign 2026-10-20_fintasy-hero)

## Claim frame
- **Outcome:** you pick one of three rendered hype-section directions, each shown directly under the real direction-A hero at 1440 and 375 widths. The pick is codified as `hype-direction.md` plus a `hype` block in `tokens.json`.
- **Required stage:** OUTCOME (consumer = your selection in chat).
- **Authority:** "Create a new branch as the last one was deleted. Then begin." (2026-10-21). HYPE-1 writes campaign artifacts only and changes 0 files under `packages/`.
- **Ref:** branch `feature/hype-section` cut from `origin/main` `d46b06a`, upstream unset (so a push cannot target main by accident).
- **Data model:** `.wargaming/DATA-MODEL-AUTHORITY.md` (sha256 `1807e0c9…f3207`); run mode `client-only / no-data-tier`.
- **Falsifiers:**
  1. Fact gate: a number or claim not in the allowlist must fail, and the injected "100,000 players" control must be flagged.
  2. Banned phrases ("play now", "coming soon", "sign in", "download", "join the beta") must fail.
  3. Contrast: any new pair below 4.5:1 fails, and the #777-on-#888 control stays flagged.
- **Flows:** FLOW-HYPE-SECTION @ PLAN.

## Fact allowlist (sources)
- DATA-MODEL-AUTHORITY §1.2: 30–60 participants (human + AI bots); 10 Hz / 100 ms loop; phases LOBBY → DROP_SELECTION → ACTIVE_ROUNDS → FINAL_CIRCLE → MATCH_OVER; **11 sectors** (Outer 4, Mid 4, Inner 3); storm boundary and tick damage; GBM ticks with sector correlation and event shocks; DuelArena 30–60 s with 2+ players, leverage, third-party entry; WebSocket state deltas; seeded deterministic replay. §1.1: ranks COPPER → GOLDEN_TRADER, divisions I–III, MMR.
- Stock Royale ledger (product spec rows ROYALE-0/2/4): $15,000 starting pot, 5 rounds, 1x–5x leverage, 30 s duels, risk styles Scalper / Swing / Degenerate.

## Finding (debt intake)
| Severity | Signature | Location | Route |
|---|---|---|---|
| Low (accessibility text factually wrong) | "Animated simulation: 60 traders across **12** market sectors" | `packages/client/src/components/hero/HeroVisual.vue:308`; `hero-direction.md` lines 10, 21, 34 | DMA has 11 sectors (4+4+3) and heroSim draws 11 tiles. Fixed in HYPE-3 (packages edit, which needs a grant); hero-direction.md corrected at the HYPE-1 lock. |

## ARC rows
| Action | Reaction (risk) | Counteraction |
|---|---|---|
| Hype copy for a game that isn't live | Copy reads like a playable product | Banned-phrase gate; mechanic copy written as "how a match works", not "play now" |
| Big numbers for hype | Invented stats creep in (the old page had "48,200 traders") | Fact gate with allowlist and an injected control |
| Three directions | Look like one layout reskinned | Directions differ in structure and angle: timeline (sequence), grid (breadth), patch notes (engineering credibility) |
| Animated vignettes | Motion overload under a hero that already animates | Only one or two animated at a time (IntersectionObserver); static under reduced motion |
| Prototype in context | Section judged in isolation, not against the hero | Each direction renders below the real hero A markup and engine copied from the HERO-1 prototype |

## Transitions
planned → executing (build) → mechanism_verified (renders at 1440/375 with 0 console errors; gates pass on the variants and fail their controls) → outcome_verified (your pick plus `hype-direction.md` and `tokens.json` written).
Rollback: delete `wargames/hype-directions/`. No point of no return.
