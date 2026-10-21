# Wargame ARC Specification — Mission DESIGN-3: Stock Royale Arena & Combat HUD Action Horizon Polish

**Mission ID:** `DESIGN-3`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `CANONICAL`  
**Flow Coverage:** `FLOW-COMBAT-DUEL`, `FLOW-COMBAT-THIRDPARTY`  
**Lane:** `lane_combat_hud`  

---

## 1. Action (Proposed State Mutation)

1. **Refactor `packages/client/src/components/royale/TradingDuelArena.vue`:**
   - Elevate background to Deep Midnight HUD:
     - Outer container: `bg-[#07090E] border border-white/10 rounded-xl`.
     - Execution terminal & combatants telemetry panels: `bg-[#0E121B] border border-white/10 rounded-lg`.
     - Order entry panel: `bg-[#151C2B] border border-white/10 rounded`.
     - Price chart canvas container: `bg-[#07090E] border border-white/10 rounded`.
   - Enforce the Action Horizon:
     - Countdown clock & linear bar: Cyber Cyan (`#06B6D4`) when $>10\text{s}$, transitioning to International Safety Orange (`#FF5522`) with `animate-pulse` when $\le 10\text{s}$, and Storm Crimson (`#F43F5E`) when $\le 3\text{s}$.
     - Auto-liquidation margin meter: graduated color fill (Emerald `#10B981` at $0-50\%$, Amber `#F59E0B` at $50-69\%$, Safety Orange `#FF5522` at $\ge 70\%$, Crimson `#F43F5E` at $\ge 85\%$).
     - Auto-liquidation warning banner: Safety Orange alert styling (`border-[#FF5522] bg-[#FF5522]/15 text-[#FF5522]`) when `isCriticalMarginRisk` ($\ge 70\%$).
   - Leverage selectors:
     - Format as bracketed chips (`[ 1x ]`, `[ 2x ]`, `[ 5x ]`) using `fn-chip-mono` styling and bracket delimiters.
   - Tabular Law:
     - Enforce `fn-mono-tabular` / `font-mono tabular-nums` on all price displays, P&L counters, and clock timers.

2. **Refactor `packages/client/src/components/royale/MarketRadarMap.vue`:**
   - Elevate container and canvas wrapper to Deep Midnight HUD (`bg-[#07090E] border border-white/10`).
   - Sector telemetry cards: elevation Level 2 (`bg-[#0E121B] border border-white/10`).
   - Canvas background clear to `#07090E` with hairline grid rings (`rgba(255, 255, 255, 0.1)`).
   - Collapse timer: Cyber Cyan when $>10\text{s}$, transitioning to Safety Orange pulse (`text-[#FF5522] animate-pulse`) when $\le 10\text{s}$.

3. **Verify and Protect Existing Assays:**
   - Verify `TradingDuelArena.test.ts` (7/7 assays pass).
   - Verify `MarketRadarMap.test.ts` (10/10 assays pass).
   - Author specific Action Horizon assays in `TradingDuelArena.test.ts` to ensure coverage of bracketed leverage chips and color transitions.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)

- **R-1 (Test Breakage on Selectors or Text):** `TradingDuelArena.test.ts` tests `[data-test="leverage-btn-X"]` and emits `executeOrder`. If bracket syntax alters button clicks or removes data attributes, tests will fail.
  - *Counteraction:* Maintain exact `data-test` attributes on buttons, keeping inner text formatted as `[ 1x ]` and ensuring click handlers remain on the root button elements.
- **R-2 (Timer Boundary Flashing):** State transitions at 10s and 3s could cause layout jitter if width or font weight shifts dynamically.
  - *Counteraction:* Use constant font weights and tabular figures (`font-mono tabular-nums`) with continuous CSS transition on the progress bar width.
- **R-3 (Canvas Stroke Blur on High-DPI):** Updating canvas clearing to Deep Midnight without respecting `devicePixelRatio` could cause blurry rendering.
  - *Counteraction:* Preserve existing DPR scaling logic in `drawChart` and `drawRadar`.

---

## 3. Counteraction & Gate Checks

- **C-1:** `npx vitest run tests/TradingDuelArena.test.ts tests/MarketRadarMap.test.ts` passes 100%.
- **C-2:** Full client test suite (`npx vitest run tests`) passes 100%.
- **C-3:** Production client build (`npx vite build`) completes with exit code 0.
- **C-4:** Programmatic blast radius calculation strictly confirms `["client"]`.
