# Execution receipt — HERO-2 (2026-10-20, session a4a10a71)

- Grant: grant-2026-10-20-hero-2-3-exec ("Authorized: execute HERO-2 and HERO-3 in parallel worktrees … local merge OK, no push or deploy. Use pnpm dlx knip at canonical.")
- Lane: wt/hero_visual @ base 511b80c → commits 59e5115 (feature) + 0288857 (knip cleanup by parent)
- Canonical: merged locally into feature/stock-royale-full-platform as c832897 (HEAD 9ef5471). Not pushed.

## Mechanism
- Parent re-run: `npx vitest run tests/HeroVisual.test.ts` → Tests 11 passed (11) at 59e5115 and again at 0288857.
- Mutation falsifier (lane): guard removed → "FAIL … never lets the last trader be eliminated … minAlive: 0", Tests 1 failed | 10 skipped; restored byte-identical.
- Parity (lane): prototype vs stepSim at seed 2026, 1440x460, 700 steps → alive 14 / 14; full trader state byte-identical.

## Canonical gates (merged tree 9ef5471)
Baseline before edits:
```
 Test Files  1 failed | 21 passed (22)
      Tests  2 failed | 127 passed (129)
```
Merged:
```
 ❯ tests/ThemeToggleIntegration.test.ts  (6 tests | 1 failed) 421ms
 ❯ tests/LandingPageIntegration.test.ts  (4 tests | 3 failed) 195ms
 ❯ tests/LandingHero.test.ts  (7 tests | 6 failed) 474ms
 ❯ tests/DesignTokens.test.ts  (4 tests | 2 failed) 17ms
 Test Files  4 failed | 20 passed (24)
      Tests  12 failed | 140 passed (152)
```
New failures relative to baseline are confined to the 3 legacy landing files (ROUTED to HERO-4). DesignTokens is pre-existing (ROUTED, outside campaign).
Build:
```
[webfont-dl] https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap
[webfont-dl] https://fonts.googleapis.com/css2?family=DM+Serif+Display:wght@400;500;700&display=swap
[webfont-dl] https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&display=swap
build exit=0
```
knip (pnpm dlx, merged tree):
```
Unused files (7)
.wargaming/campaigns/2026-10-20_fintasy-hero/wargames/hero-directions/contrast.mjs: .wargaming/campaigns/2026-10-20_fintasy-hero/wargames/hero-directions/contrast.mjs
Unused dependencies (1)
Unused devDependencies (2)
Unused exported types (4)
packages/client/src/components/hero/HeroSection.vue: HeroStorm, HeroVisualUpdate
packages/client/src/components/hero/HeroVisual.vue: HeroVisualUpdate
```
Remaining hero findings are the HeroVisual↔HeroSection event contract types (HeroVisualUpdate, HeroStorm), which HERO-4 consumes. ROUTED to HERO-4: consume or un-export.

## Incident
The shared git stash stack collided across worktrees through the lint-staged pre-commit hook. Leaked files were removed after a byte-compare showed nothing unique. HERO-3 recovered its files from lint-staged WIP commit 38397b1, byte-identical. A stray unmerged heroSim.ts in the main checkout was byte-identical to 0288857 and was removed before the merge. Stash 291c2327 (parent's own superseded backup) is left in place.

## UNVERIFIED
.vue type-check (no vue-tsc); a real-canvas render (HERO-4 mounts it live); the ResizeObserver reseed path and visibilitychange in tests.

## Stage
canonical
