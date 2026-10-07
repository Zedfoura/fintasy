# Wargame ARC Probe — Mission THEME-6
## Full Monorepo Build, Theme Toggle E2E Verification & Blast Radius Gate

### 1. Grounded Action (Planned Action)
Author `packages/client/tests/ThemeToggleIntegration.test.ts` to test reactive theme switching between light and dark modes across all revamped components:
- `HomeNav.vue`: frosted sticky navbar, logo branding, and `.play-royale-nav-btn`.
- `login.vue`: dual-theme authentication card, high-contrast segment tabs rail & capsule, and readable labels.
- `index.vue`: landing hero gradient, status chips, ticker tape, and tactical preview card.
- `LandingGameplayPillars.vue`: 4-pillar cards and metrics.
- `LandingDuelSimulator.vue`: duel arena card, sparkline container, and P&L status panel.
- `LandingSocialProof.vue` & `LandingFooter.vue`: stats grid, Apex Leaderboard, FAQ accordion, and platform footer.

Execute full monorepo test suite `pnpm test`, execute client production bundle build `pnpm --filter client build`, and verify programmatic blast radius strictly confirming `["client"]`.

### 2. Anticipated Reaction & Probes
- **Failure Mode 1: TypeScript compilation errors during Vite production build.**
  - *Risk*: Any missed import, type mismatch, or invalid prop in newly modified components will fail `pnpm --filter client build`.
  - *Probe*: Run `pnpm --filter client build` and verify code 0 with clean dist output.
- **Failure Mode 2: Monorepo test regressions across other packages.**
  - *Risk*: Client changes or shared config changes could affect other suites.
  - *Probe*: Run `pnpm test` across all packages in monorepo, requiring 100% pass rate.
- **Failure Mode 3: Blast radius contamination into server or shared infrastructure.**
  - *Probe*: Run `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts` across all touched files, verifying return is strictly `["client"]`.

### 3. Counteraction & Safety Invariants
- 100% backward compatibility of all existing routes, navigation bars, and test suites.
- Blast radius strictly restricted to `packages/client`.
