# Battle Plan — Mission LANDING-5: Full Landing Page Assembly, i18n Localization & Vitest/Vite Verification

**Mission:** `LANDING-5`  
**Required Evidence Stage:** `OUTCOME`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_integration`  
**Target Files:**
- `packages/client/src/pages/index.vue` (Unified canonical landing page)
- `packages/client/locales/en.yml` (Localization strings)
- `packages/client/tests/LandingPageIntegration.test.ts` (Full page assembly Vitest test suite)

---

## 1. Concrete Execution Specification

### 1.1 Complete Landing Assembly Verification (`packages/client/src/pages/index.vue`)
- Ensure all 5 modules are cleanly composed in order:
  1. Hero section with status chips, gradient headline, dual CTAs, ticker tape, teaser card.
  2. `LandingGameplayPillars`: 4 gameplay loop cards, filter tabs, key metrics.
  3. `LandingDuelSimulator`: 10 Hz price sparkline, Long/Short buttons, leverage selector, real-time P&L, victory popup.
  4. `LandingSocialProof`: Stats grid, Golden Trader Apex Leaderboard preview, interactive FAQ accordion.
  5. `LandingFooter`: Platform branding, Steam Deck ready badge, navigation links, copyright.

### 1.2 Localization & i18n Guard (`packages/client/locales/en.yml`)
- Verify all required keys are populated with fallback protection.

### 1.3 End-to-End Vitest Test Suite (`LandingPageIntegration.test.ts`)
- Assay A: Mounts complete root landing page `index.vue` and verifies presence of all 5 major sections.
- Assay B: Verifies end-to-end CTA click actions navigate correctly to `/dashboard/royale` and `/login`.
- Assay C: Verifies all financial invariants are maintained throughout the landing page: $15,000 starting pot (`INV-1`), 60 max players, 100ms engine.
- Assay D: Verifies interactive elements across all modules function concurrently without state collisions.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/LandingPageIntegration.test.ts` passes 100%.
2. Full test suite `pnpm --filter client test` passes 100% across all 14 test suites (80+ tests).
3. `pnpm --filter client build` exits code 0.
4. Programmatic blast radius check confirms strictly `["client"]`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `LANDING-1` through `LANDING-4` at `canonical`.
* **Rollback Plan:** `git checkout -- packages/client/`
* **Point of No Return:** None.
