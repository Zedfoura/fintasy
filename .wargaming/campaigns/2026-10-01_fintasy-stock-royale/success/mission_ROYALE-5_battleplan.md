# Battle Plan — Mission ROYALE-5: Sector Contestation & Third-Party Battle Protocol

**Mission:** `ROYALE-5`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md` (§1.2 Real-Time Match State Engine)  
**Assigned Parallel Lane:** `lane_combat`  
**Target Files:**
- `packages/server/src/services/royale/duel_engine.py`
- `packages/server/src/services/royale/match_manager.py`
- `packages/server/src/services/royale/__init__.py`
- `packages/server/tests/royale/test_third_party.py`

---

## 1. Concrete Execution Specification

### 1.1 Multi-Participant Duel Engine Upgrades (`duel_engine.py`)
* **`DuelState` Extensions:**
  * Support arbitrary $N \ge 2$ participant IDs.
  * Add `max_duration_sec: float = 45.0`.
  * Add `third_party_count: int = 0`.
* **`DuelResolution` Model:**
  * `rankings: list[str]`: Full ordinal performance ranking `[Rank 1, Rank 2, ... Rank N]`.
  * `loser_ids: list[str]`: Defeated participants.
  * `bounties_by_loser: dict[str, int]`: Loser ID $\rightarrow$ bounty extracted in cents.
  * `kills_credited: int = 1`: Total liquidations credited to the winner.
* **`DuelEngine.add_participant(duel, participant_id)`:**
  * Validates participant is not already registered in `duel.participant_ids`.
  * Adds participant to `duel.participant_ids` and initializes `duel.positions[participant_id] = []`.
  * Dynamically extends clock: `duel.time_remaining_sec = min(duel.max_duration_sec, max(duel.time_remaining_sec, 15.0))`.
  * Increments `duel.third_party_count += 1`.
* **`DuelEngine.resolve_duel(duel, current_prices)`:**
  * Mark-to-market all open positions for all $N$ participants.
  * Rank all participants using deterministic priority:
    1. Higher `net_profit_cents`.
    2. Higher ROI percentage on allocated collateral (`profit / max(1, total_collateral)`).
    3. Deterministic participant ID sort.
  * Set `winner_id = rankings[0]`, `loser_ids = rankings[1:]`.
  * Handle edge cases (all participants \$0 profit/collateral $\rightarrow$ `is_draw = True`).

### 1.2 Match Manager Escalation Protocol (`match_manager.py`)
* **`third_party_duel(match_id, duel_id, participant_id) -> DuelState`:**
  * Validates match exists, participant exists, and status is `ParticipantStatus.ALIVE`.
  * Validates participant is located in `duel.sector`.
  * Rejects if participant is already in any active duel.
  * Transitions participant to `ParticipantStatus.IN_DUEL`.
  * Maps participant to active duel in lookup index.
  * Calls `DuelEngine.add_participant`.
* **Multi-Way Settlement in `tick_duels`:**
  * For each loser in `resolution.loser_ids`:
    * If loser experienced net negative PnL or is eliminated:
      * Extract 25% cash bounty: `min(loser.capital_cents, int(loser.capital_cents * 0.25))`.
      * Transfer held sector loot cards to `winner`.
      * If loser's equity $\le 0$, transition loser to `ParticipantStatus.BUSTED`, assign placement, increment `eliminated_count`, and increment winner's `kills`.
  * Return all surviving participants to `ParticipantStatus.ALIVE`.

---

## 2. Falsifiable Verification Assay (`packages/server/tests/royale/test_third_party.py`)

1. **Assay A (Third-Party Duel Entry & Clock Extension):**
   * P1 and P2 initiate duel (30s timer). Clock ticks down to 5s.
   * P3 in same sector third-parties the duel.
   * P3 transitions to `IN_DUEL`; clock extends to 15s.
2. **Assay B (Sector & Status Guards):**
   * Player in a different sector cannot third-party the duel (`ValueError`).
   * Player who is already `IN_DUEL` or `BUSTED` cannot third-party (`ValueError`).
3. **Assay C (Multi-Way Order Placement & Position Isolation):**
   * P1, P2, and P3 each open distinct leveraged positions on active sector tickers.
   * Orders execute independently; collateral deductions remain strictly atomic.
4. **Assay D (3-Way Performance Ranking & Spoils Distribution):**
   * P1 gains +\$1,000, P2 loses -\$500, P3 gains +\$300.
   * Resolution produces `rankings = [P1, P3, P2]`.
   * P1 is crowned Winner; P2 pays 25% bounty.
5. **Assay E (Multi-Kill Double Bankruptcy):**
   * P1 goes 5x Long during surge (+\$4,000). Both P2 and P3 wipe out ($-\$15,000$).
   * P1 is awarded Double Kill (`kills += 2`) and collects loot cards from both losers.
   * Both P2 and P3 transition to `BUSTED`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** Python 3.12 environment active; clean git tree on `main` at `bb248df`; all 36 tests passing.
* **Rollback Plan:** `git checkout -- packages/server/src/services/royale/`
* **Points of No Return:** None.
