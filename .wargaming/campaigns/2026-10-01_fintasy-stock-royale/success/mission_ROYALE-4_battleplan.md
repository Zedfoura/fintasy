# Battle Plan — Mission ROYALE-4: 30-Second Micro-Trading Duel & Liquidation Mechanism

**Mission:** `ROYALE-4`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md` (§1.2 Real-Time Match State Engine)  
**Assigned Parallel Lane:** `lane_duels`  
**Target Files:**
- `packages/server/src/services/royale/duel_engine.py`
- `packages/server/src/services/royale/match_manager.py`
- `packages/server/src/services/royale/__init__.py`
- `packages/server/tests/royale/test_duels.py`

---

## 1. Concrete Execution Specification

### 1.1 Duel Domain Models & Engine (`duel_engine.py`)
* **Enums & Models:**
  * `PositionSide`: `LONG`, `SHORT`
  * `DuelPosition`:
    * `position_id: str`
    * `participant_id: str`
    * `symbol: str`
    * `side: PositionSide`
    * `leverage: int` (1, 2, or 5)
    * `collateral_cents: int`
    * `entry_price_cents: int`
    * `is_closed: bool = False`
    * `exit_price_cents: Optional[int] = None`
    * `realized_pnl_cents: int = 0`
  * `DuelState`:
    * `duel_id: str`
    * `match_id: str`
    * `sector: str`
    * `participant_ids: list[str]`
    * `time_remaining_sec: float = 30.0`
    * `positions: dict[str, list[DuelPosition]]` (participant_id -> positions)
    * `is_resolved: bool = False`
    * `winner_id: Optional[str] = None`
    * `bounty_collected_cents: int = 0`
    * `loot_transferred: list[str] = []`
* **API Surface (`DuelEngine`):**
  * `create_duel(match_id, sector, participant_a_id, participant_b_id) -> DuelState`
  * `open_position(duel_id, participant_id, symbol, side, leverage, collateral_cents, current_price_cents) -> DuelPosition`
  * `close_position(duel_id, position_id, current_price_cents) -> int`
  * `compute_position_pnl(position, current_price_cents) -> int`
  * `tick_duel(duel_id, delta_sec, current_prices: dict[str, int]) -> tuple[bool, Optional[DuelResolution]]`
  * `resolve_duel(duel_id, current_prices: dict[str, int]) -> DuelResolution`

### 1.2 Match Manager Integration (`match_manager.py`)
* Track active duels: `_duels: dict[str, DuelState]` (and participant to duel lookup).
* `initiate_duel(match_id, sector, user_a_id, user_b_id) -> DuelState`:
  * Validates participants exist, are `ALIVE`, and in the same sector.
  * Transitions participants to `IN_DUEL`.
* `place_duel_order(duel_id, user_id, symbol, side, leverage, collateral_cents) -> DuelPosition`:
  * Reserves collateral from participant's liquid cash pot.
  * Queries current price from `MarketSimEngine`.
  * Opens position in `DuelEngine`.
* `close_duel_position(duel_id, user_id, position_id) -> int`:
  * Closes position at active market price.
  * Settles realized PnL + returned collateral back into participant's cash pot.
* `tick_duels(match_id, delta_sec) -> list[dict]`:
  * Advances duel timers.
  * Evaluates margin maintenance (auto-liquidation if position loss $\ge 90\%$).
  * Resolves expired duels:
    * Settles open positions at market close.
    * Awards net trading profits.
    * Transfers 25% cash bounty from loser to winner.
    * Transfers loser's sector ticker cards to winner.
    * Updates winner's `kills += 1`.
    * Checks loser bankruptcy (`equity <= 0`): transitions to `BUSTED`, increments `eliminated_count`.
    * Resets surviving participants to `ALIVE`.

---

## 2. Falsifiable Verification Assay (`packages/server/tests/royale/test_duels.py`)

1. **Assay A (Duel Initialization & Participant Locking):**
   * Initiating duel in a contested sector transitions both players to `ParticipantStatus.IN_DUEL`.
   * Rejects movement or secondary duel initiation while locked in duel.
2. **Assay B (Micro-Trading Orders & Leverage Enforcement):**
   * Validates Long and Short order placement at 1x, 2x, 5x leverage.
   * Asserts leverage $>5\text{x}$ or collateral exceeding available capital raises `ValueError`.
3. **Assay C (PnL Calculation & Maintenance Margin Liquidation):**
   * Tests Long profit calculation when price rises and Short profit when price falls.
   * Verifies position auto-liquidates when loss reaches 90% of allocated collateral.
4. **Assay D (Duel Resolution & Loot / Bounty Transfer):**
   * Trader with higher net profit wins duel.
   * Winner collects 100% of trading profit + 25% liquid cash bounty from loser.
   * Winner steals loser's `held_tickers`.
   * Winner `kills` increments.
5. **Assay E (Bankruptcy Liquidation):**
   * If trading losses and bounty drain loser's equity $\le 0$, loser transitions to `BUSTED`.
   * Assigned placement matches remaining player field.
   * `eliminated_count` increments.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** Python 3.12 environment active; clean git tree on `main`; ROYALE-3 tests passing.
* **Rollback Plan:** `git checkout -- packages/server/src/services/royale/`
* **Points of No Return:** None (all components are greenfield in-memory modules).
