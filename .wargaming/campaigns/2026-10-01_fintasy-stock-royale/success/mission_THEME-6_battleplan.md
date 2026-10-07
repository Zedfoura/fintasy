# Battle Plan — Mission THEME-6: Full Monorepo Build, Theme Toggle E2E Verification & Blast Radius Gate

## Mission Charter
- **Mission ID**: `THEME-6`
- **Objective**: Author end-to-end theme switching integration test `ThemeToggleIntegration.test.ts`, run monorepo-wide test suite (`pnpm test`), run production build (`pnpm --filter client build`), and verify programmatic blast radius strictly confirming `["client"]`.
- **Required Stage**: OUTCOME
- **Upstream Dependency**: `THEME-2@canonical`, `THEME-3@canonical`, `THEME-4@canonical`, `THEME-5@canonical`
- **Subsystem**: `packages/client/tests/ThemeToggleIntegration.test.ts`, monorepo build pipeline
- **Subagent Lane**: `lane_theme_integration`

## Step-by-Step Implementation Sequence
1. **Author `ThemeToggleIntegration.test.ts`**:
   - Mount each key component (`HomeNav.vue`, `login.vue`, `index.vue`, `LandingGameplayPillars.vue`, `LandingDuelSimulator.vue`, `LandingSocialProof.vue`, `LandingFooter.vue`).
   - Validate that each surface contains both base light-mode styling tokens and `dark:` responsive overrides.
   - Assert contrast compliance: dark text on light backgrounds in light mode, vibrant luminous text on dark backgrounds in dark mode.
2. **Execute Vitest Integration Suite**:
   - `pnpm --filter client test tests/ThemeToggleIntegration.test.ts`
3. **Execute Monorepo Test Suite**:
   - `pnpm test`
4. **Execute Production Bundle Build**:
   - `pnpm --filter client build`
5. **Programmatic Blast Radius Verification**:
   - `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "..."` strictly returning `["client"]`.
6. **Campaign Closure & Ledger Update**:
   - Mark `THEME-6` as canonical / outcome in `ledger.md`.
   - Update `mission_THEME-6.json` stage to `outcome`.
   - Update session file to completed state.
   - Write execution receipt.
