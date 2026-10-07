# Battle Plan — Mission LANDING-4: Social Proof Stats, Golden Trader Apex Leaderboard Preview & FAQ

**Mission:** `LANDING-4`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_social_proof`  
**Target Files:**
- `packages/client/src/components/landing/LandingSocialProof.vue` (Social proof metrics, Apex leaderboard preview, interactive FAQ)
- `packages/client/src/components/landing/LandingFooter.vue` (Platform footer with Steam Deck badge and navigation links)
- `packages/client/src/pages/index.vue` (Mounting components)
- `packages/client/tests/LandingSocialProof.test.ts` (Vitest test suite)

---

## 1. Concrete Execution Specification

### 1.1 Social Proof & FAQ Component (`LandingSocialProof.vue`)
- **Key Stats Grid:**
  - 4 counters: `60 MAX TRADERS`, `$15,000.00 STARTING POT`, `100ms FAST TICK ENGINE`, `12 MARKET SECTORS`.
- **Golden Trader Apex Leaderboard Preview Table:**
  - Headers: Rank, Trader, MMR, Win Rate, Liquidations.
  - Rows for Top 5 simulated traders (`QuantumBull`, `MomentumKing`, `HFT_Viper`, `AlphaSeeker`, `DeltaNeutral`).
  - Action Button: `View Full Ranked Ladder` (`.ranked-ladder-btn`) routing to `/dashboard/royale`.
- **Interactive FAQ Accordion:**
  - 5 key questions regarding gameplay, simulated capital, storm collapse, leverage rules, and desktop availability.
  - Expand/collapse toggle clicking each question header.

### 1.2 Platform Footer Component (`LandingFooter.vue`)
- **Branding & Identity:** Fintasy Stock Royale logo and cyberpunk description.
- **Steam Deck Badge:** `STEAM DECK READY • TAURI 2.0` badge highlighting native gaming desktop support.
- **Navigation Links:** Internal routes to `/dashboard/royale`, `/dashboard`, `/login`.
- **Legal & Copyright:** `© 2026 Fintasy Inc.` and status ping.

### 1.3 Mounting in Landing Page (`packages/client/src/pages/index.vue`)
- Append `<LandingSocialProof />` and `<LandingFooter />` to `index.vue`.

### 1.4 Vitest Test Suite (`LandingSocialProof.test.ts`)
- Assay A: Mounts `LandingSocialProof`, asserting 4 key stat counters and `$15,000.00` invariant.
- Assay B: Renders Apex leaderboard preview table with top 5 traders and MMR values.
- Assay C: Leaderboard CTA button triggers navigation to `/dashboard/royale`.
- Assay D: FAQ accordion expands and collapses answers upon clicking question buttons.
- Assay E: `LandingFooter` renders brand title, Steam Deck badge, and navigation links.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/LandingSocialProof.test.ts` passes 100%.
2. Full test suite `pnpm --filter client test` passes 100%.
3. `pnpm --filter client build` exits code 0.
4. Programmatic blast radius check confirms strictly `["client"]`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `LANDING-3` at `canonical`.
* **Rollback Plan:** `rm -f packages/client/src/components/landing/LandingSocialProof.vue packages/client/src/components/landing/LandingFooter.vue packages/client/tests/LandingSocialProof.test.ts && git checkout -- packages/client/src/pages/index.vue`
* **Point of No Return:** None.
