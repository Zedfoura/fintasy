# Wargame ARC Simulation — Mission ROYALE-4

**Mission:** `ROYALE-4` — 30-Second Micro-Trading Duel & Liquidation Mechanism  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** `ROYALE-5` (Third-Party Battle Escalation Protocol) & `ROYALE-7` (Tactical UI / Arena View)  
**Applicable Flows:** `FLOW-COMBAT-DUEL`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **ROYALE-1, 2, 3 Suite** | `pytest packages/server/tests/royale/` | 20 tests pass in 0.90s | ✅ Holds |
| **10 Hz Market Ticks Ready** | `view_file packages/server/src/services/royale/market_sim.py` | 36 tickers, seeded GBM, integer cents pricing | ✅ Holds |
| **Monorepo Suite Green** | `pnpm test` | 28 server + 1 client tests pass | ✅ Holds |
| **Clean Formatting** | `pnpm run lint` | 44 files cleanly formatted | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: Double-Order Collateral Overdraw (Insolvency Attack)
* **Action:** A player with \$2,000 available cash submits two simultaneous 5x leverage orders for \$1,500 collateral each (\$3,000 total).
* **Adversarial Reaction:** If orders are evaluated without atomic balance locking, the player opens \$15,000 of notional exposure with only \$2,000 collateral, risking unbacked negative equity.
* **Counteraction:** Atomic collateral reservation: `open_position` immediately deducts `collateral_cents` from participant's liquid `capital_cents`. If requested collateral exceeds available capital, order is rejected (`ValueError: Insufficient capital`).

### Scenario 2: Uncapped Leverage Wipeout / Instant Ruin
* **Action:** A trader selects 20x or 50x leverage on a high-beta ticker like `GME` or `NVDA`.
* **Adversarial Reaction:** Normal 10 Hz price fluctuations ($\pm 0.5\%$) cause immediate wipeout on ordinary noise, degrading gameplay into a coin flip.
* **Counteraction:** Strict leverage caps: Allowed leverage tiers are strictly `[1, 2, 5]`. Leverage $>5\text{x}$ is rejected with a validation error. Maintenance margin auto-liquidation triggers if position loss reaches $90\%$ of allocated collateral.

### Scenario 3: Disputed Duel Tie at Timer Expiry
* **Action:** Both participants open 0 positions (or have identical net profit of \$0) when the 30-second duel timer expires.
* **Adversarial Reaction:** Undefined winner, deadlock, or race condition in loot/bounty transfer.
* **Counteraction:** Strict deterministic tie-breaker hierarchy:
  1. Higher net profit in cents.
  2. If tied, higher ROI % on allocated collateral.
  3. If tied, higher total participant equity.
  4. If tied, deterministic seed hash tie-break.
  If neither player traded, both return to `ALIVE` without bounty deduction; ticker loot remains contested.

### Scenario 4: Bounty Over-Drain into Negative Balance
* **Action:** Winner is entitled to steal 25% of loser's cash pot, but loser experienced catastrophic trading loss leaving less than \$0.
* **Adversarial Reaction:** Bounty deduction drives loser's cash into unrecoverable negative debt or crashes integer math.
* **Counteraction:** Clamped bounty extraction:
  `bounty = max(0, min(loser.capital_cents, int(loser.capital_cents * 0.25)))`.
  Winner collects available bounty; loser equity is zeroed out and marked `BUSTED`.

---

## 3. Invariants & Negative Constraints
* **INV-1:** Micro-orders must accept only validated leverage values: `1`, `2`, `5`.
* **INV-2:** All collateral, PnL, bounties, and equity must be calculated in integer cents.
* **INV-3:** Participants engaged in a duel must have status `IN_DUEL` and cannot initiate new duels until current duel resolves.
* **INV-4:** Loser liquidation must attribute finish placement and increment `match.eliminated_count`.
