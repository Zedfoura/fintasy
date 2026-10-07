# Battle Plan — Mission ROYALE-9: Live Trading Duel Arena HUD & Split-Screen Combat Terminal

**Mission:** `ROYALE-9`  
**Required Evidence Stage:** `ACTIVATION`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md` & `duel_engine.py`  
**Assigned Parallel Lane:** `lane_tactical_ui`  
**Target Files:**
- `packages/client/src/types/royale.ts`
- `packages/client/src/components/royale/TradingDuelArena.vue`
- `packages/client/tests/TradingDuelArena.test.ts`

---

## 1. Concrete Execution Specification

### 1.1 Type Additions (`packages/client/src/types/royale.ts`)
* Export `DuelSide`: `'LONG' | 'SHORT'`
* Export `DuelLeverage`: `1 | 2 | 5`
* Export `DuelPhase`: `'COUNTDOWN' | 'ACTIVE' | 'SETTLING' | 'CONCLUDED'`
* Export `DuelPosition`: `{ side: DuelSide, leverage: DuelLeverage, quantity: number, entryPriceCents: number }`
* Export `DuelParticipant`:
  * `userUuid`: string
  * `username`: string
  * `isLocalUser`: boolean
  * `equityCents`: number
  * `position`: DuelPosition | null
  * `netProfitCents`: number
  * `roiPercent`: number
  * `isBusted`: boolean
* Export `DuelOrderPayload`: `{ side: DuelSide, leverage: DuelLeverage, quantity: number }`

### 1.2 Split-Screen Combat Terminal (`packages/client/src/components/royale/TradingDuelArena.vue`)
* **Visual Theme:** Football Manager tactical combat command center (`bg-[#090d16]`, `border-[#1e293b]`, `font-mono`).
* **Top Combat Bar:**
  * Duel sector badge & ticker focus (`TECH_SEMIS: NVDA`).
  * 30-Second duel countdown bar with progress indicator (color-shifted to crimson below 10s).
  * Duel Bounty Pot badge (`BOUNTY POT: $3,750` in gold/amber).
  * Third-Party banner: High-visibility warning alert when participant count $> 2$.
* **Left Combat Pane (Trading Execution Terminal):**
  * HTML5 Canvas sparkline / tick candlestick chart with entry price line marker and high-DPI scaling.
  * Live price banner: `$130.45` with percentage change indicator.
  * Order execution panel:
    * Leverage selector buttons: `[1x, 2x, 5x]`.
    * Share quantity stepper or slider.
    * Action buttons: `BUY LONG` (emerald `#10b981`) and `SELL SHORT` (rose `#f43f5e`).
    * Close position button if trade is active.
    * Liquidation warning gauge: Margin depletion meter highlighting 90% auto-liquidation limit.
* **Right Combat Pane (Opponent & Spoils Radar):**
  * Local trader card vs Opponent trader cards (supporting 2, 3, or 4 concurrent combatants).
  * Relative ROI progress bar: Live visual comparison of which trader currently holds the winning profit advantage.
  * Ticker loot prize card displayed as the victor's spoils upon duel conclusion.

---

## 2. Falsifiable Verification Assay (`packages/client/tests/TradingDuelArena.test.ts`)

1. **Assay A (Component Mounting & Dual-Pane Layout):**
   * Verifies dual-pane layout, countdown timer, and bounty pot display.
2. **Assay B (Leverage Clamping & Order Emission):**
   * Verifies 1x, 2x, and 5x leverage options; emits `@executeOrder` with valid payload.
3. **Assay C (Position Tracking & Close Action):**
   * When local user has an active position, shows position card and emits `@closePosition` on click.
4. **Assay D (Third-Party Escalation Alert):**
   * Passes 3 participants and `thirdPartyAlert`; verifies banner alert and multi-opponent cards render.
5. **Assay E (Margin Depletion & Liquidation Risk Gauge):**
   * Computes margin loss; verifies critical warning renders when loss exceeds 70%.
6. **Assay F (Concluded Duel & Winner Attribution):**
   * Sets `phase = 'CONCLUDED'`; verifies victory/defeat summary and spoils display.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** Python and client test suites passing (62 server + 11 client tests); clean git tree at `96c2650`.
* **Rollback Plan:** `git checkout -- packages/client/`
* **Points of No Return:** None (additive Vue component and types).
