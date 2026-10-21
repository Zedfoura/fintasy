# ARC / Battle Plan — HYPE-2 Mechanic Vignettes (campaign 2026-10-20_fintasy-hero)

## Claim frame
- **Outcome:** four Vue components (`VignetteDrop`, `VignetteDuel`, `VignetteStorm`, `VignetteLobby`) render the locked direction-1 animations inside any parent box. Each is seeded and deterministic, `aria-hidden`, animates only while ≥10% visible and the tab is visible, shows one static frame under `prefers-reduced-motion`, and caps DPR at 2. Drop and storm geometry comes from `heroSim.ts`, not a fork.
- **Required stage:** CANONICAL, meaning committed on `feature/hype-section`, with tests green and the full suite unchanged apart from known failures. Mounting on `/` is HYPE-4's job.
- **Authority needed to EXECUTE:** an explicit grant to edit `packages/client`. None yet: the 2026-10-21 instruction was "Write the HYPE-2 and HYPE-3 battle plans first; don't edit packages/ yet."
- **Ref:** `refs/heads/feature/hype-section` @ `d46b06a` (upstream unset). Probed 2026-10-21: 0 changed files under `packages/`.
- **Spec inputs (read-only):** `hype-direction.md` § Vignettes and § Slot contract; `tokens.json#hype` (colors, `vignettes.loopSeconds`, `visibilityThreshold`, `reducedMotionFrameSeconds`, `dprCap`); the reference engine in `wargames/hype-directions/hype-parts.html` (`draw.drop/duel/storm/lobby`).
- **Data model:** `.wargaming/DATA-MODEL-AUTHORITY.md` (sha256 `1807e0c9…f3207`), client-only / no-data-tier. Vignettes depict DMA §1.2 mechanics (11 sectors in 3 rings, storm over 5 rounds, 30 s duels, 60 traders).
- **Invariants:**
  - `HeroVisual.test.ts` stays 11/11.
  - Prototype parity holds (seed 2026, 1440x460, 700 steps → 14 alive).
  - `heroSim.ts` behavior is byte-for-byte unchanged; the only edit is an added `export` keyword.
  - No new dependency, no network I/O.
- **Falsifiers:**
  1. Same seed → identical snapshot hash, **and** a different seed → a different hash, for every vignette (otherwise the determinism test is vacuous).
  2. A mutation run that breaks one vignette's reduced-motion branch (forcing the rAF path) must fail the "0 rAF calls under reduced motion" test.
  3. The lobby must end with exactly 1 survivor across 3 seeds. Forcing `alive` to 0 must fail that test.
- **Flows:** FLOW-HYPE-SECTION @ MECHANISM.

## Grounding probes (2026-10-21)
| Probe | Result |
|---|---|
| `heroSim.ts` exports | ✅ `sectorTiles`, `createSim`, `stepSim`, `snapshot`, `HERO_MOTION`, `REDUCED_MOTION_STEPS` and types. ❌ `stormAt` and `ringRects` are **not** exported (removed in HERO-2's knip cleanup, `0288857`). |
| Loop and observer pattern to reuse | ✅ `HeroVisual.vue:249-275`: matchMedia reduced motion, ResizeObserver, IntersectionObserver, `visibilitychange`, DPR cap |
| Test environment | ✅ jsdom without canvas. Use the same recording 2D-context stub as `tests/HeroVisual.test.ts`. |
| Reference engine | ✅ `hype-parts.html` `draw.*`. Rendered at 1440/375 with 0 console errors (HYPE-1 receipt). |

## Design
1. **`src/components/hype/vignettes/vignetteSim.ts`**, pure TypeScript with no DOM:
   - `dropFrame(w, h, t)` uses `sectorTiles`.
   - `duelSeries(seed)` and `duelFrame(series, t)` hold two seeded P&L series and give leader, index and countdown.
   - `stormFrame(w, h, t)` uses `stormAt` and gives `{ rect, round 1–5, moving }`.
   - `lobbyFrame(seed, t)` gives a seeded elimination order, `alive` (60 → 1) and the dead set.
   - `snapshot(...)` serialises a frame for hashing.
   - Loop lengths come from `tokens.json#hype.vignettes.loopSeconds`, copied into a typed const with a test asserting they still match.
2. **`useVignetteLoop.ts`** is one composable that owns:
   - reduced-motion detection (static frame at 3.7 s);
   - ResizeObserver with DPR ≤ 2;
   - IntersectionObserver (threshold 0.1) and the `visibilitychange` pause;
   - rAF start and stop;
   - full cleanup on unmount.

   The four components stay thin and differ only in their draw function.
3. **`VignetteDrop.vue`, `VignetteDuel.vue`, `VignetteStorm.vue`, `VignetteLobby.vue`:**
   - each renders a `<canvas aria-hidden="true">` filling 100% of its parent;
   - each takes an optional `seed` prop;
   - each has a header comment in the repo's `@author` / `@description` style.
4. **`heroSim.ts`:** add back `export` on `stormAt` (and on `ringRects` only if `dropFrame` needs it). These are the **only** permitted edits to that file. `HeroVisual.test.ts` and the parity check must stay green.
5. **`tests/HypeVignettes.test.ts`:**
   - **Engine:** the determinism pair for each vignette; lobby 60 → 1 with exactly 1 survivor; storm round never goes backwards within a cycle and the rect never grows; duel countdown runs 30 → 0; the drop tile count is 11; loop constants equal `tokens.json`.
   - **Components:** a stubbed context and observers, then:
     - reduced motion → 0 rAF calls and ≥1 draw;
     - normal motion → rAF is scheduled;
     - IO reports hidden → `cancelAnimationFrame` is called;
     - unmount → both observers are disconnected;
     - the canvas is `aria-hidden`.

## ARC rows
| Action | Reaction (risk) | Counteraction |
|---|---|---|
| Re-export `stormAt` from a HERO-2 file | Silently changes hero behavior | Add the export keyword only; re-run `HeroVisual.test.ts` (11/11) and the parity script (14 alive) and record both |
| Four canvases plus the hero canvas | CPU drain, jank on scroll | Shared loop; only intersecting canvases draw; the hero pauses offscreen already. HYPE-4 measures it live. |
| Duel and lobby randomness | Flaky tests | Seeded mulberry32 everywhere; tests compare hashes, never pixels |
| Canvas in jsdom | Vacuous component tests | Logic lives in `vignetteSim.ts` and is tested directly; component tests fail if the draw stub records 0 calls |
| Parallel lane with HYPE-3 | Shared stash or commit collision (HERO-2/3 incident) | Lane works in `wt/hype_visuals`; **commits only when the parent says so**, never at the same time as the HYPE-3 lane |

## Lane charter (DEEP-1/6/7/8)
- Lane `hype_visuals`; worktree `wt/hype_visuals` on a lane branch cut from `feature/hype-section` @ `d46b06a`.
- **Owns:** `packages/client/src/components/hype/vignettes/**` (`vignetteSim.ts`, `useVignetteLoop.ts`, the four `Vignette*.vue`), `packages/client/tests/HypeVignettes.test.ts`, and the `export` keyword(s) in `packages/client/src/components/hero/heroSim.ts`.
- **Excludes:** `components/hype/HypeSection.vue`, `components/hype/hypeBeats.ts`, `components/page/**`, `pages/**`, `hero-standalone/**`, `HeroVisual.vue`, `HeroSection.vue`, every other test file, `.wargaming/**` (except this mission's receipt, written by the parent).
- **Peer:** `hype_layout` (HYPE-3). The shared contract is the slot names `vignette-drop|duel|storm|lobby`; components are mounted by HYPE-4.
- **Digest for the subagent** (< 50 lines): Claim frame, Design, Lane charter, `hype-direction.md` § Vignettes and `tokens.json#hype.vignettes`.

## Transitions and evidence
1. `planned → executing`: grant recorded; worktree HEAD = `d46b06a` embedded in the receipt.
2. `→ mechanism_verified`:
   - `vitest run tests/HypeVignettes.test.ts` raw summary (`N passed / M`);
   - falsifiers 2 and 3 failing as expected, raw output;
   - `HeroVisual.test.ts` 11/11 and parity 14/14 after the export change.
3. `→ canonical`:
   - lane commit, then merge into `feature/hype-section`, with `git show --stat`;
   - full client suite `N of M`, where the only accepted failures are the 2 known `DesignTokens` ones, named;
   - `vite build` exit 0;
   - `pnpm dlx knip`: `stormAt` no longer flagged, and no new findings in `hype/**`.

## Rollback / point of no return
Revert the lane merge commit. No point of no return; no push (Tier B).
