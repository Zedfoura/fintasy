# ARC / Battle Plan — HERO-2 Generative Domain Visual (campaign 2026-10-20_fintasy-hero)

## Claim frame
- **Outcome:** `<HeroVisual>` renders the locked direction-A match simulation (12-sector concentric map, violet storm over 5 rounds, 60 traders, duels, one survivor) inside any parent box. It is seeded, deterministic, honours reduced motion, pauses offscreen and in hidden tabs, and emits `update {round, storm, alive}` for the caption strip.
- **Required stage:** CANONICAL, meaning committed on lane branch `wt/hero_visual` and merged locally into `feature/stock-royale-full-platform`. Push is Tier B and **not** part of this mission. ACTIVATION happens in HERO-4, which mounts the component on `/`.
- **Authority needed to EXECUTE:** an explicit user grant to edit `packages/client`. None exists yet: the 2026-10-20 instruction was "Write the HERO-2 and HERO-3 battle plans first; don't edit packages/ yet."
- **Source/ref:** `feature/stock-royale-full-platform` @ `511b80c9f5cfc5eac792084eeb322cbb1a5526da`. `packages/` was clean when probed (0 changed files).
- **Spec inputs (read-only):** `tokens.json` (`color.*`, `motion.*`, `visualSlot`), `hero-direction.md`, and the reference engine in `wargames/hero-directions/index.html` (section A).
- **Runtime/consumer:** Vue 3 SFC in `packages/client`. Test consumer is vitest in jsdom; the live consumer is HERO-4's `/` page.
- **Dependencies:** HERO-1@outcome_verified ✅ (receipt run 2).
- **Invariants:** no new runtime dependency; no network I/O; no edits outside the owned files; royale components (`components/royale/*`) untouched; `DATA-MODEL-AUTHORITY` is not touched (client-only / no-data-tier).
- **Falsifiers:** (1) same seed and same step count give a byte-identical snapshot hash, **and** a different seed gives a different hash. If the second half doesn't hold, the determinism test is vacuous. (2) A mutation run that deletes the last-trader guard must make the invariant test fail; that failing output goes in the receipt.
- **Flows:** FLOW-HERO-FIRST-IMPRESSION @ MECHANISM (visual leg).

## Grounding probes (2026-10-20)
| Probe | Result |
|---|---|
| Vitest environment | ✅ `environment: 'jsdom'` (`vite.config.ts:163`). Tests live in `tests/**/*.test.ts` |
| Canvas in jsdom | ❌ no `canvas` / `vitest-canvas-mock` in `node_modules`, so `getContext()` returns null. **This drives the engine/renderer split below** |
| Component conventions | ✅ `<script setup lang="ts">` with an `@author` / `@description` header comment (`LandingHero.vue:1-4`). Tests use `@vue/test-utils` `mount` |
| Dead-code gate (`pnpm knip`) | ❌ knip is not installed (no package.json entry, 0 binaries). It must be run as `pnpm dlx knip` (network fetch, no install) or recorded as `UNVERIFIED` before CANONICAL. Adding it as a devDependency needs a separate user decision |
| Reference engine | ✅ runs at 1440 and 375 widths with no console errors. The storm-kills-everyone bug is already fixed in the prototype (HERO-1 receipt) |

## Design
Split the work so that the logic is testable without a canvas:

1. `src/components/hero/heroSim.ts` is a **pure TypeScript engine** with no DOM.
   - `createSim({ seed, width, height })` → state
   - `stepSim(state, dt)` → `{ round, storm: 'holding'|'closing'|'winner', alive, stormRect }`
   - `sectorTiles(w, h)` and `stormRect(w, h, t)`
   - `snapshot(state)`, a stable serialisation used for hashing
   - Constants come from `tokens.json.motion`, copied into a typed const with a comment pointing to the source. A test asserts they still equal `tokens.json`, so drift fails.
2. `src/components/hero/HeroVisual.vue` is a **thin renderer**.
   - Canvas with `aria-hidden="true"` plus a visually hidden text alternative (exact copy is in `hero-direction.md`).
   - Sizing: `ResizeObserver` with DPR capped at 2. On resize, `createSim` reseeds rather than stretching the canvas.
   - Animation loop: `requestAnimationFrame`, stopped by `IntersectionObserver` (offscreen) and `visibilitychange` (hidden tab).
   - Reduced motion: `matchMedia('(prefers-reduced-motion: reduce)')` → 700 fixed steps, then one draw, and no rAF loop.
   - Emits `update` only when round, storm or alive actually changes, not every frame.
   - Prop: `seed` (default 2026).
   - The grain texture is generated once per mount.
   - Unmount cancels rAF and disconnects both observers.
3. `tests/HeroVisual.test.ts` has two parts:
   - **Engine:** determinism (the falsifier pair above); invariant `alive ≥ 1` across 3 seeds × 3000 steps; round goes 1→5 and never backwards; the storm rect never grows within a cycle; tiles = 11 (4 + 4 + 3) with unique names; constants equal `tokens.json`.
   - **Component:** stub `HTMLCanvasElement.prototype.getContext` with a recording 2D stub, and mock `matchMedia`, `IntersectionObserver` and `ResizeObserver`. Asserts:
     - reduced motion → `requestAnimationFrame` is never called and at least one draw happened;
     - normal motion → rAF is scheduled;
     - hidden via the IntersectionObserver callback → rAF is cancelled;
     - `update` is emitted with `alive === 60` on mount;
     - the canvas has `aria-hidden="true"`;
     - unmount → `disconnect` is called on both observers.

## ARC rows
| Action | Reaction (risk) | Counteraction |
|---|---|---|
| Port the prototype engine into TS | Behaviour drift from the approved visual | Port verbatim. Add a parity test: `stepSim` with seed 2026 for 700 steps gives the same alive count as the prototype. The prototype runs in Node through a tiny extracted harness, and that count gets recorded in the receipt |
| Test canvas in jsdom | `getContext` is null and the tests pass vacuously | Engine tests carry the logic. The component test fails if the draw stub records 0 calls |
| Per-frame `update` emits | Parent re-renders 60 times a second | Emit only on change. Test: 120 steps with no state change → 0 extra emits |
| Variable DPR / resize | Blurry canvas or a reseed loop | Cap DPR at 2. Debounce the ResizeObserver to one rAF. Reseed only when the size changes by at least 1px |
| Long session | Memory leak from the grain canvas or observers | Unmount test checks that every observer is disconnected and rAF cancelled |
| Motion sensitivity | Accessibility harm | Reduced-motion static frame. The caption strip text still carries the information |
| Lane collision with HERO-3 | Both touch `components/hero/` | Disjoint files: HERO-2 owns only `heroSim.ts`, `HeroVisual.vue`, `tests/HeroVisual.test.ts`. A pre-commit check runs `git diff --name-only` and must list nothing else |

## Lane charter (DEEP-1/6/7/8)
- Lane `hero_visual`, worktree `wt/hero_visual` from base SHA `511b80c`.
- **Owns:** `packages/client/src/components/hero/heroSim.ts`, `packages/client/src/components/hero/HeroVisual.vue`, `packages/client/tests/HeroVisual.test.ts`. This changes the ledger row, which listed `HeroVisual*.vue` only; `heroSim.ts` is added because of the canvas-in-jsdom probe.
- **Excludes:** `pages/**`, `layouts/**`, `vite.config.ts`, `unocss.config.ts`, `components/landing/**`, `components/hero/HeroSection.vue`, `components/hero/HeroNav.vue`, all `.wargaming/**` except its own receipt.
- **Peer:** `hero_layout` (HERO-3). Its only shared contract is `tokens.json.visualSlot`, which is read-only for both.
- **Digest for the subagent** (< 50 lines, no images): this file's Claim frame, Design and Lane charter sections plus `tokens.json`.

## Execution transitions & evidence
1. `planned → executing`: grant recorded; worktree created; `git -C wt/hero_visual rev-parse HEAD` = `511b80c…` embedded in the receipt.
2. `→ mechanism_verified`: `pnpm --filter client exec vitest run tests/HeroVisual.test.ts` with the raw output, reported as `N passed / M`; the mutation-run failure output; the prototype parity count.
3. `→ canonical`: full client suite `pnpm --filter client test` (record pass and fail counts before and after; any newly failing file is a blocker, and pre-existing ones are listed by name); `pnpm --filter client build` exit 0; knip result or `UNVERIFIED`; lane commit, then a local merge into the feature branch, with `git show --stat` embedded.
4. ACTIVATION is not claimed here; HERO-4 does it.

## Rollback / point of no return
Rollback is `git revert` of the lane merge commit, or deleting the worktree branch before merge. There is no point of no return: nothing is pushed or deployed.

## Open decisions
- Knip: run `pnpm dlx knip` at CANONICAL (default), or add it as a devDependency (user decision).
