# Battle Plan — Mission DESIGN-5: Landing Blueprint Surface, Editorial Typography & Full Monorepo E2E Gate

**Mission:** `DESIGN-5`  
**Required Evidence Stage:** `OUTCOME`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `docs/design-system/`  
**Assigned Parallel Lane:** `lane_integration`  
**Target Files:**
- `packages/client/src/pages/index.vue` (Landing page with dot-matrix canvas, Instrument Serif headline, and bracketed cards)

---

## 1. Concrete Execution Steps

### 1.1 Refactor `packages/client/src/pages/index.vue`
1. **Dot-Matrix Background Texture**:
   - Add `fn-dot-matrix` to `.landing-page-root`.
2. **Editorial Hero Typography**:
   - Add `font-serif` to `.landing-hero-headline`.
   - Preserve all existing span classes (`from-emerald-700 via-teal-700 to-cyan-800 bg-gradient-to-r bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400`).
   - Preserve `.landing-hero-subtitle` and its classes.
3. **Tabular Law on Ticker Tape**:
   - Ensure `font-mono tabular-nums` is applied to prices and percentage tags in `tickerStream`.
4. **Bracketed Taxonomy Chips**:
   - Add bracketed indicator `[ 01 • S&P COMBAT MATRIX ]` to the Tactical Arena Preview card header.

### 1.2 Verification Assays
1. Run targeted Vitest test suites:
   `npx vitest run tests/LandingHero.test.ts tests/LandingPageIntegration.test.ts tests/ThemeToggleIntegration.test.ts`
2. Run full client suite:
   `npx vitest run tests`
3. Run client production build:
   `npx vite build`
4. Programmatic blast radius analysis:
   `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "packages/client/src/pages/index.vue"`

---

## 2. Falsifiable Verification Assays
1. All landing test files pass 100%.
2. Full test suite (all 19 client test files, 115 tests) passes 100%.
3. Production Vite build exits 0.
4. Programmatic blast radius returns strictly `["client"]`.

---

## 3. Rollback Plan
- Restore `packages/client/src/pages/index.vue` via git checkout.
