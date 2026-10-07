# Battle Plan — Mission LANDING-3: Interactive Client-Side 30-Second Duel Mini-Simulator Widget

**Mission:** `LANDING-3`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_simulator_ui`  
**Target Files:**
- `packages/client/src/components/landing/LandingDuelSimulator.vue` (Interactive client-side duel simulator)
- `packages/client/src/pages/index.vue` (Mounting component)
- `packages/client/tests/LandingDuelSimulator.test.ts` (Vitest test suite)

---

## 1. Concrete Execution Specification

### 1.1 Duel Mini-Simulator Component (`LandingDuelSimulator.vue`)
- **Header:** "TEST YOUR REFLEXES // 30s LIVE DUEL DEMO" with subtitle "Experience the adrenaline of Stock Royale micro-trading before entering the 60-player arena."
- **Duel HUD:**
  - Opponent: `ApexBot_7` (MMR 1,840 • Diamond III) with avatar badge.
  - Active Ticker: `NVDA` ($130.00 base, live simulated price fluctuations).
  - Timer: Circular or badge timer showing remaining seconds (15s demo duration).
  - SVG Price Sparkline: Reactive polyline/polygon showing recent price ticks with gradient fill.
  - Current Price & Direction: High-contrast price display with pulsating green/red tick arrows.
- **Controls & Execution:**
  - Leverage Selector: `1x`, `2x`, `3x`, `5x` buttons (`data-leverage="1"`, etc.).
  - Duel Action Buttons: `LONG` (green) and `SHORT` (red) buttons (`data-action="long"`, `data-action="short"`).
  - Active Position Display: Shows side, entry price, size, and real-time unrealized P&L (`data-metric="pnl"`).
- **Victory Modal / Banner (`.victory-banner`):**
  - Displays when timer expires or manual close.
  - Shows result: `VICTORY! POT SECURED`, final P&L amount, opponent defeated notice.
  - CTA Button: `Deploy to Live 60-Player Arena` (`.deploy-arena-btn`) navigating to `/dashboard/royale`.
  - Secondary Button: `Play Again` (`.restart-duel-btn`) resetting simulation state.

### 1.2 Mounting in Landing Page (`packages/client/src/pages/index.vue`)
- Insert `<LandingDuelSimulator />` between `LandingGameplayPillars` and the footer watermark.

### 1.3 Vitest Test Suite (`LandingDuelSimulator.test.ts`)
- Assay A: Mounts simulator, asserting header, opponent name (`ApexBot_7`), default ticker (`NVDA`), and initial status.
- Assay B: Leverage selector toggles active leverage between 1x, 2x, 3x, and 5x.
- Assay C: Long position entry creates active position and computes positive/negative P&L on price changes.
- Assay D: Short position entry correctly computes inverted P&L on price drop.
- Assay E: Duel completion displays victory modal with CTA button navigating to `/dashboard/royale`, and restart button resets state.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/LandingDuelSimulator.test.ts` passes 100%.
2. Full test suite `pnpm --filter client test` passes 100% with zero regressions.
3. `pnpm --filter client build` exits code 0.
4. Programmatic blast radius check confirms strictly `["client"]`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `LANDING-2` at `canonical`.
* **Rollback Plan:** `rm -f packages/client/src/components/landing/LandingDuelSimulator.vue packages/client/tests/LandingDuelSimulator.test.ts && git checkout -- packages/client/src/pages/index.vue`
* **Point of No Return:** None.
