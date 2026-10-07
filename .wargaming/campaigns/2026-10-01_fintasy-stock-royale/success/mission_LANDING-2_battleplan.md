# Battle Plan — Mission LANDING-2: 4-Pillar Gameplay Loop Showcase & Tactical Sector Teaser

**Mission:** `LANDING-2`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_landing_ui`  
**Target Files:**
- `packages/client/src/components/landing/LandingGameplayPillars.vue` (New 4-pillar showcase component)
- `packages/client/src/pages/index.vue` (Mounting component)
- `packages/client/tests/LandingPillars.test.ts` (New Vitest test suite)

---

## 1. Concrete Execution Specification

### 1.1 Gameplay Pillars Component (`LandingGameplayPillars.vue`)
- Structure:
  - Header: "THE 4 PILLARS OF STOCK ROYALE" with subtitle "Master the mechanics of high-frequency competitive trading."
  - Interactive Filter/Tab Bar: "ALL PILLARS", "LOBBY & BOTS", "MAP & STORM", "DUELS & COMBAT", "RANKED & MMR".
  - 4 Cards in responsive CSS Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`):
    - **Pillar 1:** *30-60 Player Lobbies* (Bot Fill, 100ms Tick Engine, $15,000 Starting Pot)
    - **Pillar 2:** *Dynamic Sector Map* (12 concentric sectors, liquidity storm collapse, safe zones)
    - **Pillar 3:** *30s Micro-Trading Duels* (1x-5x leverage, loot stealing, 90% auto-liquidation, third-party)
    - **Pillar 4:** *Ranked MMR Progression* (Rocket League ranks, MMR rating, Golden Trader Apex)
  - Card Styling: Glassmorphic dark cards (`border border-[#1f2438] bg-[#0c0d14]/80 hover:border-[#00e676]/50 transition-all`), badge tags, and key bullet points.

### 1.2 Mounting in Landing Page (`packages/client/src/pages/index.vue`)
- Place `<LandingGameplayPillars />` immediately following the Hero arena section.

### 1.3 Vitest Test Suite (`LandingPillars.test.ts`)
- Assay A: Mounts component asserting header and 4 distinct pillar cards.
- Assay B: All 4 pillars display correct titles, badges, and descriptive mechanics.
- Assay C: Tab switching filters visible pillars or highlights active tab.
- Assay D: Financial invariant check: Pillar 1 asserts $15,000 starting pot (`INV-1`).

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/LandingPillars.test.ts` passes 100%.
2. Full test suite `pnpm test` passes 100% (145+ tests).
3. `pnpm run lint` passes with 0 errors and 0 warnings.
4. `pnpm --filter client build` exits code 0.
5. Programmatic blast radius check confirms strictly `["client"]`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `LANDING-1` at `canonical`.
* **Rollback Plan:** `rm -f packages/client/src/components/landing/LandingGameplayPillars.vue packages/client/tests/LandingPillars.test.ts && git checkout -- packages/client/src/pages/index.vue`
* **Point of No Return:** None.
