# Wargame ARC Simulation — Mission ROYALE-9

**Mission:** `ROYALE-9` — Live Trading Duel Arena HUD & Split-Screen Combat Terminal  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** `ROYALE-10` (Real-Time WebSocket Client & Victory HUD) & `ROYALE-11` (Full Match Simulation)  
**Applicable Flows:** `FLOW-COMBAT-DUEL`, `FLOW-COMBAT-THIRDPARTY`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **All Existing Tests Green** | `pnpm test` | 62 server + 11 client tests pass (100%) | ✅ Holds |
| **Monorepo Linting Clean** | `pnpm run lint` | 52 server + client files cleanly formatted | ✅ Holds |
| **Programmatic Blast Radius** | `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "..."` | Verified functioning | ✅ Holds |
| **Client Test Runner** | `pnpm --filter client run test` | Vitest + JSDOM operational | ✅ Holds |
| **Royale Types Available** | `packages/client/src/types/royale.ts` | 12 sectors, topology, types exported | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: Chart Memory Leak & Headless Test Environment Failure
* **Action:** Dueling terminal initializes high-frequency candlestick charts at 10 Hz in browser and test runner.
* **Adversarial Reaction:** Heavy canvas libraries leak animation timers or throw missing `HTMLCanvasElement` context errors in Vitest / JSDOM.
* **Counteraction:** Standalone Lightweight Canvas Micro-Chart with Graceful Fallbacks:
  - Custom responsive canvas sparkline/candlestick renderer.
  - Safe `canvas.getContext('2d')` guard ensuring tests run cleanly in headless JSDOM.
  - Lifecycle cleanup (`cancelAnimationFrame`) on component unmount.

### Scenario 2: Floating-Point Financial Discrepancies
* **Action:** Client computes P&L or margin requirements using JavaScript IEEE 754 floats, displaying `$123.4500000000002` or deviating from server `duel_engine.py`.
* **Adversarial Reaction:** Financial display drifts from backend settlement values, breaking invariant fidelity.
* **Counteraction:** Zero Floating-Point Money Invariant:
  - All input props (`equityCents`, `bountyCents`, `entryPriceCents`, `currentPriceCents`) are strict integer cents.
  - Client P&L calculations maintain integer arithmetic (`deltaPriceCents * quantity * leverage`).
  - Strict display helper functions format integer cents to localized USD only at render time.

### Scenario 3: Third-Party Combat Escalation & Clock Extension
* **Action:** A third trader enters the active sector midway through a duel, triggering backend 15-second clock extension floor (capped at 45s).
* **Adversarial Reaction:** Duel HUD timer expires prematurely or fails to alert the local player to the incoming third-party threat.
* **Counteraction:** Dynamic Multi-Participant Reactive State:
  - Clock bar reacts to updated `expiresAt` or `secondsRemaining` props.
  - Displays high-priority warning banner: `⚠️ THIRD-PARTY INTRUSION: [Username] HAS ENTERED THE COMBAT ARENA!`.
  - Splits opponent HUD into multi-participant comparison cards (supporting up to 4 concurrent traders).

### Scenario 4: Unauthorized Leverage Manipulation & Late Order Execution
* **Action:** User attempts to select 10x or 50x leverage or places orders after duel timer reaches 0.
* **Adversarial Reaction:** Invalid orders trigger backend rejection or desynchronize local client state.
* **Counteraction:** Strict Client Validation Guards:
  - Leverage selector strictly clamped to `[1x, 2x, 5x]` per `ROYALE-0` economic specification.
  - Order execution buttons disabled when duel is concluded (`phase !== 'ACTIVE'`) or when an open position already exists.

---

## 3. Invariants & Negative Constraints
* **INV-1 (Integer-Cent Financial Accuracy):** All cash, equity, prices, and bounties passed to or emitted from the component must be formatted strictly from integer cents.
* **INV-2 (Leverage Limits):** Leverage choices are strictly limited to `1x`, `2x`, and `5x`.
* **INV-3 (Multi-Participant Scalability):** Dueling HUD supports 2 to 4 concurrent combatants seamlessly for third-party battles.
* **INV-4 (Reactive Clock Extension):** Dynamic extension of the countdown clock reflects backend extensions without resetting countdown progress.
