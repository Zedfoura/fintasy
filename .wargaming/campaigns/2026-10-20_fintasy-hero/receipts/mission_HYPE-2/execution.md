# Execution receipt — HYPE-2 Mechanic Vignettes

- **Run:** hype-2-exec-20261021 (session a4a10a71-8f49-47f0-ac4f-8ec743402514)
- **Grant:** `grant-2026-10-21-hype-2-3-exec`. User: "Authorized: execute HYPE-2 and HYPE-3 per the battle plans on feature/hype-section (worktrees, sequential local commits; no push/PR/merge)."
- **Data model:** DATA-MODEL-AUTHORITY.md sha256 `1807e0c9…f3207`, client-only / no-data-tier.
- **Stage reached:** `canonical` (the required stage). Mounting the vignettes on `/` is HYPE-4.

## Bindings
| Item | Value |
|---|---|
| Lane | `hype_visuals`, worktree `wt/hype_visuals`, branch `hype/hype_visuals` |
| Lane base | `32ccff0` (fast-forwarded from `d46b06a` to pick up the committed `.wargaming` records, so the tokens test path is relative) |
| Lane commit | `06f051c feat(hype): HYPE-2 seeded mechanic vignettes (drop, duel, storm, lobby) with shared visibility-aware loop`, 8 files |
| Merge | `c25ceae merge(hype): HYPE-2 mechanic vignettes` (`--no-ff` into `feature/hype-section`) |
| Integration fix | `cb4221c refactor(hype): drop exports used only inside their own module (knip)` |
| Ref | `refs/heads/feature/hype-section` (local only; upstream unset; not pushed) |

## Mechanism (lane, re-run by parent before commit)
- `vitest run tests/HypeVignettes.test.ts tests/HeroVisual.test.ts`: **40 passed / 40**.
- **Falsifier 2** (forcing the rAF path in one vignette's reduced-motion branch) fails "0 rAF calls under reduced motion", as expected.
- **Falsifier 3** (forcing lobby `alive` to 0) fails the 1-survivor test, as expected.
- **Falsifier 1** passes: the same seed gives an identical hash and a different seed a different hash, for every vignette.
- `heroSim.ts` diff: only `-function stormAt(` → `+export function stormAt(`.

## Canonical (merged tree, 2026-10-21)
```
$ npx vitest run            # on e2d1ef3, before the integration fix
 Test Files  2 failed | 20 passed (22)
      Tests  3 failed | 166 passed (169)
 FAIL  tests/HeroVisual.test.ts > <HeroVisual> > canvas is aria-hidden and a text alternative is present
```
That third failure is an integration defect between the lanes, not a HYPE-2 regression: HYPE-3 corrected the alt text to 11 sectors and the old assertion pinned 12. It was fixed in `104546e` (see the HYPE-3 receipt).
```
$ npx vitest run            # on 104546e
 FAIL  tests/DesignTokens.test.ts > … > assay A: design-tokens.css defines 4-tier surface elevation system
 FAIL  tests/DesignTokens.test.ts > … > assay B: design-tokens.css defines functional chromatic telemetry tokens
 Test Files  1 failed | 21 passed (22)
      Tests  2 failed | 167 passed (169)
```
The only failures are the 2 known DesignTokens assays, which also fail at baseline `d46b06a` (2 failed | 125 passed of 127).
```
$ npx tsx parity-merged.ts   # heroSim from the merged checkout
parity alive after 700 steps: 14
$ npx vite build             → exit 0
```

**Knip on the merged tree:**
- `stormAt` is no longer flagged.
- The first run flagged new findings in `hype/**`. In `vignetteSim.ts`: `mulberry32`, `loopProgress`, `STORM_TRADERS`, `snapshotFrame` and `Point`. In `hypeBeats.ts`: `FACT_ALLOWLIST`, `BANNED_PHRASES`, `FACT_NUMBER_PATTERN` and `HypeVignetteId`.
- Each was used only inside its own file, so the `export` keyword was removed in `cb4221c`.
- After that: the HypeVignettes, HypeSection and HeroVisual tests pass 53/53, and knip reports **0 findings under `packages/client/src/components/hype/**`**.
- The only hype-related item left is `.wargaming/…/hype-directions/fact-gate.mjs`, a prototype script in the same class as the already-listed `contrast.mjs`.

## Deviations
- The storm vignette draws 9 seeded trader dots, which the reference engine does not. This is decorative only and doesn't change any fact.

## Not proven here
- The vignettes are not mounted on `/` yet, so live animation, offscreen pause and CPU cost are HYPE-4.
- The flow claim's per-row matrix stays at PLAN, following the HERO-3 precedent. The claim's `stage` field records `canonical`, with this receipt as the evidence.
