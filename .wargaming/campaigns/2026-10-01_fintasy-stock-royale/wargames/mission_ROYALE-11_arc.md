# Wargame ARC Simulation — Mission ROYALE-11

**Mission:** `ROYALE-11` — 60-Player Full Match Simulation & Regression Verification  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** `ROYALE-12` (Tauri Desktop Wrapper & Steamworks SDK Scaffolding)  
**Applicable Flows:** `FLOW-ROYALE-GOLDEN`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **All Existing Tests Green** | `pnpm test` | 62 server + 32 client tests pass (100%) | ✅ Holds |
| **Monorepo Linting Clean** | `pnpm run lint` | All server & client files cleanly formatted | ✅ Holds |
| **Programmatic Blast Radius** | `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "..."` | Verified functioning | ✅ Holds |
| **Server Test Suite** | `pnpm --filter server run test` | Pytest passes 62 tests in 2.69s | ✅ Holds |
| **Match Engine Available** | `packages/server/src/services/royale/match_manager.py` | Authoritative MatchManager with Storm, MarketSim, Duels & MMR | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: Non-Deterministic Tie-Breaking During Mass Storm Collapse
* **Action:** 12 bots in outer sector reach $0 equity simultaneously during a heavy storm tick.
* **Adversarial Reaction:** Non-deterministic iteration order causes placement numbers to vary between test runs or creates duplicate placements.
* **Counteraction:** Strict Deterministic Sort Order:
  - `match_manager.py` sorts participants by current equity and stable UUID keys during each tick.
  - Placements are strictly monotonic: `alive_count + 1`.
  - Automated assertions verify that all 60 placements from 1 to 60 are uniquely assigned without duplicates or gaps.

### Scenario 2: Zero Floating-Point Financial Conservation Leak
* **Action:** 60 players execute dozens of duels, third-party escalations, and storm damages over an accelerated 10-minute simulated match.
* **Adversarial Reaction:** Rounding errors in bounty transfers, loot splits, or margin fees leak or duplicate pennies across the match state.
* **Counteraction:** Closed-System Capital Auditing:
  - Sum of starting capitals equals $60 \times \$10,000.00 = \$600,000.00$ (60,000,000 cents).
  - Every transaction (storm damage, duel bounty transfer, loot salvage) is recorded in integer cents.
  - Test verifies: `Sum(Ending Equities) + Total Storm Burn == Starting Pot + Net Market Gains` with zero precision drift.

### Scenario 3: Legacy Paper-Trading Route Regression
* **Action:** Extensive imports and database mixin invocations in `test_e2e_match.py` modify global database state or mock singletons.
* **Adversarial Reaction:** Legacy unit tests (`basic_test.py`, `quote_test.py`, `sessions_test.py`, `tournaments_test.py`, `transactions_test.py`, `user_test.py`) fail due to polluted tables or broken foreign keys.
* **Counteraction:** Isolated Match Scoping & Full Regression Sweep:
  - Match records are assigned clean UUIDs and isolated foreign keys.
  - `Database.reset_for_testing()` or clean fixture teardown maintains isolation.
  - The verification harness runs all legacy tests before and after the 60-player simulation to guarantee 100% backward compatibility.

---

## 3. Invariants & Negative Constraints
* **INV-1 (60-Player Scalability):** The match engine must simulate 60 concurrent participants from drop selection to sole victor coronation without unhandled exceptions.
* **INV-2 (Integer-Cent Financial Conservation):** All participant capitals, equities, and bounties must remain exact integer cents.
* **INV-3 (Monotonic Placement Hierarchy):** Every participant receives a unique placement from 1 to 60.
* **INV-4 (Relational Persistence):** Completed match state must successfully persist into PostgreSQL tables (`matches`, `match_participants`, `match_duels`).
* **INV-5 (Competitive MMR Evaluation):** All 60 players receive evaluated MMR/RP deltas with placement bonuses, kill bonuses, and division updates.
* **INV-6 (Legacy Regression Zero-Tolerance):** 100% of existing paper-trading tests must pass with zero regression.
