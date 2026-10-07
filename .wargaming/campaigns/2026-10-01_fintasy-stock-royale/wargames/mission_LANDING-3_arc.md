# Wargame ARC Specification — Mission LANDING-3: Interactive Client-Side 30-Second Duel Mini-Simulator Widget

**Mission ID:** `LANDING-3`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `CANONICAL`  
**Flow Coverage:** `FLOW-LANDING-CONVERSION`, `FLOW-COMBAT-DUEL`  
**Lane:** `lane_simulator_ui`  

---

## 1. Action (Proposed State Mutation)
- Author `packages/client/src/components/landing/LandingDuelSimulator.vue`:
  - An embedded interactive micro-simulator widget directly on the marketing landing page allowing unregistered visitors to test the core 30-second Stock Royale micro-trading duel mechanic:
    1. **Real-Time Price Tick Sparkline:** Simulated 10 Hz price stream on high-volatility ticker (e.g. `NVDA`), showing price history points.
    2. **Interactive Position Controls:** High-contrast `LONG (BUY)` and `SHORT (SELL)` execution buttons.
    3. **Leverage Multiplier Selector:** Selectable `1x`, `2x`, `3x`, and `5x` leverage buttons updating risk and return multipliers.
    4. **Real-Time P&L Delta Engine:** Calculates unrealized profit/loss based on entry price, current price, position side, and leverage, displayed in real-time with dynamic color coding (`+$...` green, `-$...` rose).
    5. **15-Second Demo Duel Timer:** Live countdown timer decrementing to 0.
    6. **Victory Outcome Modal / Banner:** Upon timer expiration (or taking profit), displays duel result celebration ("VICTORY: LOOT SECURED"), final P&L, opponent liquidation badge, and high-converting CTA button navigating to `/dashboard/royale`.
    7. **Instant Reset / Rematch:** Allows replaying the simulation immediately.
- Author Vitest test suite `packages/client/tests/LandingDuelSimulator.test.ts` verifying component mounting, leverage selection, long/short execution, price tick updates, P&L calculations, victory modal, and route navigation.
- Mount `<LandingDuelSimulator />` in `packages/client/src/pages/index.vue`.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)
- **R-1 (Timer Leak / Background Interval on Unmount):** Simulated 10 Hz tick interval and 1-second countdown could leak and continue ticking if component is unmounted.
- **R-2 (Non-Deterministic Price Jumps in Tests):** Random price walks in intervals could cause flaky Vitest assertions if not mockable or deterministic.
- **R-3 (SSR / Canvas Rendering Exceptions):** Canvas-based chart drawing could fail in test environments where canvas contexts are missing or stubs are needed.

---

## 3. Counteraction (Hardened Mitigations & Guards)
- **C-1:** Store interval IDs and clean them up deterministically in `onBeforeUnmount()` lifecycle hook, and pause ticking when duel completes.
- **C-2:** Expose props/methods for tick stepping or use predictable geometric Brownian motion with configurable auto-start flag, allowing tests to verify state synchronously or via fake timers.
- **C-3:** Implement lightweight SVG sparkline for the price chart, eliminating canvas 2D context dependencies and rendering cleanly across both tests and all browser engines.
