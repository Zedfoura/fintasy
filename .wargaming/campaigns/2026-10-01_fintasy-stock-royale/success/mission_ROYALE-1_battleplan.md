# Battle Plan — Mission ROYALE-1: Match State Machine & Lobby Orchestrator

**Mission:** `ROYALE-1`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md` (§1.2 Real-Time Match State Engine)  
**Assigned Parallel Lane:** `lane_engine`  
**Target Files:**
- `packages/server/src/services/royale/models.py`
- `packages/server/src/services/royale/match_manager.py`
- `packages/server/tests/royale/test_match_engine.py`

---

## 1. Concrete Execution Specification

### 1.1 Data Models (`packages/server/src/services/royale/models.py`)
* `MatchPhase` (Enum): `LOBBY`, `DROP_SELECTION`, `ACTIVE_ROUNDS`, `FINAL_CIRCLE`, `MATCH_OVER`.
* `BotArchetype` (Enum): `SCALPER`, `SWING`, `DEGEN`.
* `ParticipantStatus` (Enum): `ALIVE`, `IN_DUEL`, `BUSTED`, `VICTORIOUS`.
* `Participant`:
  * `uuid: UUID4`
  * `username: str`
  * `is_bot: bool`
  * `bot_archetype: Optional[BotArchetype]`
  * `capital: int = 1500000` (in cents: $15,000.00)
  * `held_tickers: List[str] = []`
  * `active_sector: Optional[str] = None`
  * `status: ParticipantStatus = ALIVE`
  * `kills: int = 0`
  * `placement: Optional[int] = None`
* `MatchState`:
  * `match_id: UUID4`
  * `phase: MatchPhase = LOBBY`
  * `target_players: int = 40`
  * `participants: Dict[UUID4, Participant]`
  * `seed: int`
  * `created_at: datetime`
  * `round_number: int = 0`

### 1.2 In-Memory Orchestrator (`packages/server/src/services/royale/match_manager.py`)
* `MatchManager` class (Singleton):
  * `create_match(target_players: int = 40, seed: Optional[int] = None) -> MatchState`
  * `join_match(match_id: str, user_id: str, username: str) -> Participant`
  * `fill_bots(match_id: str) -> List[Participant]`:
    * Computes remaining slots $K = \text{target\_players} - \text{current\_players}$.
    * Assigns archetypes according to verified balance ratio: 40% Scalper, 35% Swing, 25% Degen.
    * Generates authentic bot personas (e.g. `ThetaGangster`, `MacroWhale`, `DiamondHands420`).
  * `start_drop_phase(match_id: str)`: Transitions phase to `DROP_SELECTION`.
  * `start_active_rounds(match_id: str)`: Transitions phase to `ACTIVE_ROUNDS`.
  * `get_state(match_id: str) -> dict`: Fast serialization for WebSocket frames.

---

## 2. Falsifiable Verification Assay (`packages/server/tests/royale/test_match_engine.py`)

1. **Assay A (Lobby Initialization & Join):** Verify match spawns with `phase == MatchPhase.LOBBY` and human joins correctly with \$15,000 initial capital.
2. **Assay B (Bot Auto-Fill Performance & Ratio):** Request auto-fill on 1-player lobby to 40 players. Assert:
   * Total participant count == 40.
   * Execution time $<20\text{ms}$.
   * Archetype distribution matches target ratio within integer rounding.
3. **Assay C (State Progression & Guards):** Assert transition to `DROP_SELECTION` locks lobby from further joins and throws `ValueError` on late join attempts.
4. **Assay D (Seed Reproducibility):** Instantiating two matches with identical `seed` generates identical bot rosters and initial parameters.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** Python 3.12 environment active; clean git tree on `main`.
* **Rollback Plan:** `git checkout -- packages/server/src/services/royale/ packages/server/tests/royale/`
* **Points of No Return:** None (all components are greenfield in-memory modules).
