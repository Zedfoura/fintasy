# Wargame ARC Simulation — Mission ROYALE-7

**Mission:** `ROYALE-7` — PostgreSQL Database Migrations & Match Persistence Layer  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** `ROYALE-10` (Real-Time WebSocket Client & Victory HUD) & `ROYALE-11` (Full Match Simulation)  
**Applicable Flows:** `FLOW-RANKED-PROGRESS`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **All Existing Tests Green** | `pnpm test` | 51 server + 1 client tests pass | ✅ Holds |
| **Monorepo Linting Clean** | `pnpm run lint` | 49 files cleanly formatted | ✅ Holds |
| **Programmatic Blast Radius** | `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "..."` | Verified functioning | ✅ Holds |
| **Existing DB Mixins Intact** | `view_file packages/server/src/services/database/database.py` | 7 tables created with IF NOT EXISTS, updated_at triggers | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: Destructive Schema Alteration / Migration Crash
* **Action:** Migration drops existing tables or alters constraints on legacy tables (`users`, `portfolios`, `tournaments`).
* **Adversarial Reaction:** Legacy paper trading routes crash, existing tournament records corrupt, violating invariant preservation.
* **Counteraction:** Strict Additive-Only DDL with Foreign Key References:
  - Add 5 new standalone tables (`ranked_seasons`, `user_ranks`, `matches`, `match_participants`, `match_duels`).
  - Use `CREATE TABLE IF NOT EXISTS`.
  - Use `ON DELETE SET NULL` or `CASCADE` referencing `users(uuid)` without modifying existing columns.
  - Zero modifications to existing tables.

### Scenario 2: Connection Pool Exhaustion on Mass Participant Persistence
* **Action:** 60 participants and 15 duel records write in 75 separate single-row `INSERT` transactions, exhausting PostgreSQL connection pool (max 20 connections).
* **Adversarial Reaction:** Connection starvation crashes concurrent web requests with `pool exhausted` or deadlock errors.
* **Counteraction:** Atomic Single-Connection Batch Persistence:
  - `save_match_record` borrows a single connection from the pool (`conn = self.connectionPool.getconn()`), executes match header, bulk `execute_values` for participants and duels within a single transaction, and immediately returns the connection in `finally: self.connectionPool.putconn(conn)`.

### Scenario 3: Database Disconnect Graceful Fallback
* **Action:** Match concludes while PostgreSQL is temporarily restarting or connection is dropped.
* **Adversarial Reaction:** Server uncaught exception terminates the in-memory game loop and drops real-time match state.
* **Counteraction:** Decoupled In-Memory Buffer & Error Isolation:
  - Per `DATA-MODEL-AUTHORITY.md`, real-time match state runs purely in-memory. Database persistence is asynchronous/isolated; DB write failure logs an error but never interrupts the real-time match outcome or client WebSocket broadcast.

### Scenario 4: Concurrent Leaderboard Read Contention
* **Action:** Hundreds of clients poll `/api/v1/royale/leaderboard` simultaneously.
* **Adversarial Reaction:** Heavy table scans on `user_ranks` cause query latency spikes.
* **Counteraction:** Index-Optimized Queries:
  - Create index `idx_user_ranks_season_rp` on `user_ranks(season_uuid, rp DESC)`.
  - Add pagination (`limit`, `offset`) with max limit cap of 100.

---

## 3. Invariants & Negative Constraints
* **INV-1 (Additive Schema Invariant):** Zero modifications to existing legacy tables (`users`, `tournaments`, `portfolios`, `transactions`, `sessions`, `attributes`, `settings`, `friends`).
* **INV-2 (Atomic Match Saving):** Match header, participant placements, and duel records persist within a single database transaction.
* **INV-3 (Connection Safety):** Every acquired connection from `SimpleConnectionPool` must be released in a `finally` block.
* **INV-4 (RP Consistency):** Persisted `user_ranks` match `MMREngine` calculations.
