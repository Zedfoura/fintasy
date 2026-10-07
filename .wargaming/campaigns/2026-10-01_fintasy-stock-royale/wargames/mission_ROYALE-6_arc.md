# Wargame ARC Simulation — Mission ROYALE-6

**Mission:** `ROYALE-6` — Rocket League Tiered MMR & Rating System Engine  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** `ROYALE-7` (PostgreSQL Database Migrations & Match Persistence Layer) & `ROYALE-10` (Post-Match Victory HUD)  
**Applicable Flows:** `FLOW-RANKED-PROGRESS`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **All Existing Tests Green** | `pnpm test` | 43 server + 1 client tests pass | ✅ Holds |
| **Monorepo Linting Clean** | `pnpm run lint` | 47 files cleanly formatted | ✅ Holds |
| **Programmatic Blast Radius** | `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "..."` | Verified functioning | ✅ Holds |
| **Duels and Third-Party Settled** | `packages/server/src/services/royale/duel_engine.py` | Multi-way combat, 25% bounties, kills attribution | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: Bot-Farming RP Inflation (Hyper-Kill Exploitation)
* **Action:** In a 40-player lobby, an elite player or bot-hunting exploiter farms 15-20 AI bot kills in outer sectors without engaging human players, generating +500 RP in a single match.
* **Adversarial Reaction:** Uncapped kill RP causes rapid rank inflation, devaluing high tiers and encouraging passive PvE bot farming over genuine survival.
* **Counteraction:** Multi-Tier Diminishing Returns on Liquidation RP:
  - Kills 1–3: 100% base value.
  - Kills 4–6: 80% base value.
  - Kills 7+: 30% base value.
  - Placement multiplier: Low placement (21st–40th) awards only 2 RP/kill, so early bot kills offer minimal progress unless the player survives to top 5 (20 RP/kill) or 1st (25 RP/kill).

### Scenario 2: Demotion Yo-Yo & Ladder Anxiety
* **Action:** A player reaches Platinum (6,000 RP), loses 1 match (net -55 RP), drops to Gold I (5,945 RP), wins next match (+60 RP), promotes again, creating erratic notification spam and risk aversion.
* **Adversarial Reaction:** Players stop queuing once achieving a milestone tier to avoid losing their division badge.
* **Counteraction:** 3-Game Demotion Protection & Promotion Buffer:
  - Upon crossing into a higher tier, the player receives 3 demotion protection matches.
  - During protection matches, RP losses cannot demote the player below the tier floor (e.g. floor = 6,000 RP).
  - Promotion awards a +100 RP progression buffer into the new division.

### Scenario 3: Turtling / Zero-Trade Camper Exploitation
* **Action:** A player hides in outer safe edges with 0 trades, 0 kills, and $0 profit, placing 5th purely by avoiding combat.
* **Adversarial Reaction:** Passive play without economic contribution should not outscore aggressive successful trading.
* **Counteraction:** Composite Scoring Balance:
  - 5th place with 0 kills and 0 profit earns +55 RP - entry cost (e.g. -55 RP in Platinum = 0 Net RP).
  - A player in 10th place with 3 kills and +$5,000 profit earns:
    +35 (placement) + 42 (kills: 3 * 14) + 5 (profit) - 55 = +27 Net RP.
  - Rewarding high combat and trading returns heavily balances placement camping.

### Scenario 4: Negative RP Debt Trap Below Zero
* **Action:** A novice player loses repeatedly in Bronze III (0 RP) where entry fee is 15 RP.
* **Adversarial Reaction:** Unbounded negative RP creates negative debt balances (e.g. -500 RP) demoralizing beginner players.
* **Counteraction:** Absolute Floor at 0 RP:
  - Player RP cannot drop below 0.
  - Net match RP is bounded by `max(-current_rp, net_rp)` at Bronze III floor.

---

## 3. Invariants & Negative Constraints
* **INV-1:** RP is strictly non-negative; absolute floor is 0 RP.
* **INV-2:** Tier progression must strictly map to predefined RP bands with deterministic division thresholds (Divisions III, II, I).
* **INV-3:** Demotion protection decrement occurs only on net negative matches.
* **INV-4:** Kill RP calculations must apply both placement multiplier and diminishing return tier schedules.
