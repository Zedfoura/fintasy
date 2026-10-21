# Wargame ARC Specification — Mission DESIGN-5: Landing Blueprint Surface, Editorial Typography & Full Monorepo E2E Gate

**Mission ID:** `DESIGN-5`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `OUTCOME`  
**Flow Coverage:** `FLOW-LANDING-CONVERSION`  
**Lane:** `lane_integration`  

---

## 1. Action (Proposed State Mutation)

1. **Refactor `packages/client/src/pages/index.vue`:**
   - Apply subtle 24px dot-matrix canvas texture (`fn-dot-matrix`) across `landing-page-root`.
   - Apply `Instrument Serif` editorial hero typography (`font-serif`) to `.landing-hero-headline` while strictly preserving existing gradient classes (`from-emerald-700`, `dark:from-emerald-400`) and subtitle classes.
   - Refactor teaser cards and ticker tape with tabular numbers (`tabular-nums`) and bracketed taxonomy chips (`[ 01 • COMBAT TERMINAL ]`).
2. **Execute Full Monorepo Test Suite Verification:**
   - Run `pnpm test` (or client Vitest + Python test suites) to ensure 100% test pass with zero regressions.
3. **Execute Production Build Verification:**
   - Run `npx vite build` in `packages/client` confirming exit code 0.
4. **Programmatic Blast Radius Verification:**
   - Execute `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "packages/client/src/pages/index.vue"` confirming strictly `["client"]`.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)

- **R-1 (Font Fallback Clashing):** Introducing `font-serif` to the headline could cause visual overflow on small mobile viewports if the serif tracking is too wide.
  - *Counteraction:* Preserve `tracking-tight` and responsive font sizes `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`.
- **R-2 (Regression in LandingHero / ThemeToggle Tests):** `LandingHero.test.ts` and `ThemeToggleIntegration.test.ts` assert exact class strings on headline span and subtitle.
  - *Counteraction:* Strictly retain all existing CSS class strings on `.landing-hero-headline span` and `.landing-hero-subtitle`.
- **R-3 (Monorepo Suite Timeouts):** Monorepo test run could take significant wall time.
  - *Counteraction:* Run via asynchronous background tasks with progress tracking.

---

## 3. Counteraction & Gate Checks

- **C-1:** `npx vitest run tests/LandingHero.test.ts tests/LandingPageIntegration.test.ts tests/ThemeToggleIntegration.test.ts` passes 100%.
- **C-2:** Full client test suite (`npx vitest run tests`) passes 100% (19/19 test files).
- **C-3:** Production client build (`npx vite build`) completes with exit code 0.
- **C-4:** Programmatic blast radius calculation strictly confirms `["client"]`.
