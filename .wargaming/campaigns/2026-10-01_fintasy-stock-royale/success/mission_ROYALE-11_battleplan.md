# Battle Plan — Mission ROYALE-11: 60-Player Full Match Simulation & Regression Verification

**Mission:** `ROYALE-11`  
**Required Evidence Stage:** `OUTCOME`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `match_manager.py`, `duel_engine.py`, & `mmr_engine.py`  
**Assigned Parallel Lane:** `lane_engine`  
**Target Files:**
- `packages/server/tests/royale/test_e2e_match.py`

---

## 1. Concrete Execution Specification

### 1.1 Automated 60-Player Match Simulation Suite (`packages/server/tests/royale/test_e2e_match.py`)
* **Phase 1: Lobby Initialization & Seeding:**
  - Initialize `MatchManager` with `target_players=60` and deterministic seed `seed=133742`.
  - Enqueue 1 local human player + 59 autonomous bots with distinct archetypes (Scalpers, Swing Traders, Degens).
  - Verify match starts in `LOBBY` phase with 60 participants and initial capital $10,000.00 each (60,000,000 cents total).
* **Phase 2: Drop Selection & Topology Distribution:**
  - Transition match to `DROP_SELECTION`.
  - Distribute all 60 players across the 12 market sectors (`UTILITIES`, `REAL_ESTATE`, ..., `SEMIS_AI`).
  - Transition to `ACTIVE_ROUNDS` (Round 1).
* **Phase 3: High-Frequency Market Simulation & Storm Convergence:**
  - Run time progression through Rounds 1, 2, 3, and Final Circle.
  - Apply 10 Hz market ticks, updating ticker prices for all 36 assets.
  - Apply storm collapse ticks; verify participants caught outside safe zones receive integer-cent capital bleed.
* **Phase 4: Concurrent Micro-Trading Duels & Third-Party Escalation:**
  - In sectors with multiple participants, trigger concurrent 30s duels.
  - Escalate at least one duel into a 3-way third-party battle, verifying 15s clock extension.
  - Execute long/short orders with 1x, 2x, 5x leverage.
  - Resolve duels: victor claims bounty and loot; losers bankrupt or take damage.
* **Phase 5: Final Circle & Victor Coronation:**
  - Advance match until only 1 surviving participant remains.
  - Verify winner receives status `VICTORIOUS`, placement 1.
  - Verify all 59 other participants receive status `BUSTED` with placements 2 through 60 (strictly monotonic, no duplicates).
* **Phase 6: Relational Persistence Layer Verification:**
  - Persist completed match using `Database.save_match_record(...)`.
  - Query match back from database; verify match, 60 participants, and duels are accurately saved with integer cents.
* **Phase 7: MMR Progression Evaluation:**
  - Evaluate `MMREngine.evaluate_match_result(...)` across all 60 players.
  - Verify winner gains significant RP and potential promotion.
  - Verify lower placements suffer expected RP deductions.
* **Phase 8: Legacy Paper-Trading Regression Verification:**
  - Import and execute key assertions against legacy endpoints (`/quotes`, `/portfolios`, `/tournaments`, `/sessions`, `/users`) to guarantee 100% backward compatibility and zero regression.

---

## 2. Falsifiable Verification Assays

1. **Assay A (60-Player Lobby & Seeding):** 60 participants initialized, phase transition to LOBBY -> DROP_SELECTION.
2. **Assay B (Drop Selection & Sector Allocation):** All 60 players assigned valid sector coordinates.
3. **Assay C (Market Simulation & Storm Contraction):** Safe sectors contract sequentially; players in hazard sectors take integer-cent storm damage.
4. **Assay D (Concurrent Duels & Third-Party Battle):** Triggers 2-player and 3-player third-party duels with order executions and clock extensions.
5. **Assay E (Elimination Hierarchy & Victor Coronation):** Simulates to completion; verifies exactly 1 victor (#1) and unique placements for positions 2–60.
6. **Assay F (Relational PostgreSQL Persistence):** Match, participants, and duels stored and re-queried with exact integer-cent fidelity.
7. **Assay G (Rocket League MMR Ladder Evaluation):** All 60 participants receive valid MMR results with expected rank/division shifts.
8. **Assay H (Legacy Paper-Trading Regression Suite):** Full execution of legacy test suite confirming zero regression.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** All 94 monorepo tests pass (62 server + 32 client); git tree clean at `940fe15`.
* **Rollback Plan:** `git checkout -- packages/server/tests/royale/test_e2e_match.py`
* **Points of No Return:** None (test suite file).
