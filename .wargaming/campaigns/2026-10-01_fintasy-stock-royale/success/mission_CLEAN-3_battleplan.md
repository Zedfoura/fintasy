# Battle Plan — Mission CLEAN-3: Comprehensive In-App Game Manual & Interactive Help Overhaul

**Mission:** `CLEAN-3`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_tactical_ui`  
**Target Files:**
- `packages/client/src/pages/dashboard/help/index.md` (Rewrite)
- `packages/client/src/pages/dashboard/help/faq.md` (Rewrite)
- `packages/client/tests/HelpGuideContent.test.ts` (New)

---

## 1. Concrete Execution Specification

### 1.1 In-App Game Manual (`packages/client/src/pages/dashboard/help/index.md`)
* Complete rewrite with:
  1. Introduction to Stock Royale & Paper Trading
  2. Match Structure (60 traders, 6 minutes, 5 storm rounds, $15,000 initial pot)
  3. Market Sector Map (12 sectors: Outer, Mid, Inner) & Storm Damage mechanics
  4. Trading Combat: 30s micro-duels, 1x/2x/5x leverage, 90% auto-liquidation, third-party battle joining
  5. Ranked Progression: Rocket League MMR tiers (Bronze to Golden Trader) & Apex RP scoring
  6. Preserves `<I18nTitle>` and `<route>` YAML blocks.

### 1.2 Interactive FAQ (`packages/client/src/pages/dashboard/help/faq.md`)
* Complete rewrite addressing core gameplay, economics, MMR scoring, steam desktop packaging, and market simulation questions.

### 1.3 Validation Test Suite (`packages/client/tests/HelpGuideContent.test.ts`)
* **Assay A (Game Manual Completeness):** Asserts `index.md` contains core sections on sectors, duels, leverage, MMR, and starting pot.
* **Assay B (FAQ Completeness):** Asserts `faq.md` contains comprehensive answers on storm damage, margin liquidation, third-party combat, and desktop play.
* **Assay C (Placeholder Purge):** Verifies all legacy class placeholder text has been completely eradicated.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/HelpGuideContent.test.ts` passes 100%.
2. Client build `pnpm --filter client build` passes without errors.
3. Full test suite `pnpm test` passes 100%.
4. Monorepo linting `pnpm run lint` passes with 0 errors.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `CLEAN-2` completed at `9c9a3c3`.
* **Rollback Plan:** `git checkout -- packages/client/src/pages/dashboard/help/`
* **Point of No Return:** None.
