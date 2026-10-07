# Wargame ARC Specification — Mission LANDING-5: Full Landing Page Assembly, i18n Localization & Vitest/Vite Verification

**Mission ID:** `LANDING-5`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `OUTCOME`  
**Flow Coverage:** `FLOW-LANDING-CONVERSION`  
**Lane:** `lane_integration`  

---

## 1. Action (Proposed State Mutation)
- Finalize cohesive marketing landing page assembly in `packages/client/src/pages/index.vue`:
  - Complete vertical stack:
    1. Hero Arena & Value Proposition (`LandingHero` elements, status chips, animated ticker tape, preview teaser card)
    2. 4-Pillar Gameplay Loop Showcase (`LandingGameplayPillars.vue`)
    3. Interactive Client-Side 30-Second Duel Mini-Simulator (`LandingDuelSimulator.vue`)
    4. Platform Stats Counters, Golden Trader Apex Leaderboard Preview & Interactive FAQ (`LandingSocialProof.vue`)
    5. Platform Marketing Footer & Steam Deck Readiness (`LandingFooter.vue`)
- Review and enhance `packages/client/locales/en.yml` for i18n completeness and fallback safety.
- Author integrated landing page verification test suite `packages/client/tests/LandingPageIntegration.test.ts`.
- Run full client test suite `pnpm --filter client test` ensuring 100% pass across all test suites.
- Run production bundle build `pnpm --filter client build` ensuring zero errors and code 0 exit.
- Perform programmatic blast radius verification via `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts` confirming strictly `["client"]`.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)
- **R-1 (Compound Component Warnings / Stub Discrepancies):** Assembling multiple complex components on `index.vue` in Vitest might trigger cascading missing injection or stub warnings if stubs are misconfigured.
- **R-2 (CSS Overlap / Viewport Clipping):** Complex z-indexes, glows, and backdrop blurs might clip content or cause horizontal scrolling issues on narrow screens.
- **R-3 (Bundle Size Bloat):** Embedding SVG sparklines and multiple components might inflate the production chunk past size limits.

---

## 3. Counteraction (Hardened Mitigations & Guards)
- **C-1:** Provide clean router and layout stubs in `LandingPageIntegration.test.ts` to assert full top-to-bottom page assembly without console noise.
- **C-2:** Enforce `overflow-hidden` on parent wrappers and verify responsive column stacking (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
- **C-3:** SVG sparklines are lightweight mathematical polylines without heavy third-party charting libraries (Chart.js / ECharts / D3), keeping production bundle delta negligible (<30 kB).
