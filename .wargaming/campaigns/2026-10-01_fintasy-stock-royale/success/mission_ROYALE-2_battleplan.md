# Battle Plan — Mission ROYALE-2: Market Sector Graph Topology & Storm Collapse Engine

**Mission:** `ROYALE-2`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md` (§1.2 Real-Time Match State Engine)  
**Assigned Parallel Lane:** `lane_engine`  
**Target Files:**
- `packages/server/src/services/royale/topology.py`
- `packages/server/src/services/royale/storm.py`
- `packages/server/src/services/royale/match_manager.py`
- `packages/server/src/services/royale/__init__.py`
- `packages/server/tests/royale/test_zone_collapse.py`

---

## 1. Concrete Execution Specification

### 1.1 Market Sector Graph Topology (`topology.py`)
* **12 Sectors & 3 Concentric Tiers:**
  * **Outer Tier (4 sectors):** `UTILITIES`, `REAL_ESTATE`, `MATERIALS`, `INDUSTRIALS`
  * **Mid Tier (4 sectors):** `HEALTHCARE`, `FINANCIALS`, `ENERGY`, `CONSUMER`
  * **Inner Tier / Hot Zones (4 sectors):** `BIG_TECH`, `SEMIS_AI`, `BIOTECH`, `MEME_ALPHA`
* **Graph Adjacency:**
  * Undirected bidirectional edges connecting adjacent sector nodes within same tier and across adjacent tiers.
  * Inward links: Outer $\leftrightarrow$ Mid, Mid $\leftrightarrow$ Inner.
* **API Surface:**
  * `SectorTopology`:
    * `is_valid_sector(sector: str) -> bool`
    * `get_tier(sector: str) -> SectorTier`
    * `get_neighbors(sector: str) -> list[str]`
    * `can_transition(from_sector: str, to_sector: str) -> bool`
    * `shortest_path(from_sector: str, to_sector: str) -> list[str]`

### 1.2 Storm Collapse & Damage Engine (`storm.py`)
* **5-Round Pacing Schedule (6-Minute Match):**
  * Round 0 (Drop Phase, 20s): 12 safe sectors, \$0 damage/s.
  * Round 1 (Early Collapse, 90s): 8 safe sectors (4 Outer collapse), \$50 damage/s (5,000 cents/s).
  * Round 2 (Mid-Game Shrink, 75s): 5 safe sectors (3 Mid collapse), \$75 damage/s (7,500 cents/s).
  * Round 3 (Choke Point, 60s): 3 safe sectors (1 Mid + 1 Inner collapse), \$100 damage/s (10,000 cents/s).
  * Round 4 (Semi-Final, 60s): 1 safe sector (2 Inner collapse), \$150 damage/s (15,000 cents/s).
  * Round 5 (Final Circle, 55s): 1 epicenter sector, \$200 damage/s (20,000 cents/s) sudden death.
* **Deterministic Concentric Shrink:**
  * Driven by `seed`: selects final epicenter in Inner Tier; collapses outer rings inward ensuring no safe sector is topologically orphaned.
* **API Surface:**
  * `StormEngine`:
    * `generate_schedule(seed: int) -> dict[int, RoundSchedule]`
    * `get_damage_rate_cents(round_number: int) -> int`
    * `is_sector_safe(sector: str, round_number: int) -> bool`

### 1.3 Match Manager Integration (`match_manager.py`)
* Add `move_participant(match_id: str, user_id: str, target_sector: str) -> bool`:
  * Validates participant is `ALIVE`.
  * Verifies movement legality via `SectorTopology.can_transition()`.
  * Updates `participant.active_sector`.
* Add `tick_storm(match_id: str, delta_sec: float = 1.0) -> dict`:
  * Updates match round timer and triggers round progression.
  * Evaluates participant locations against active `safe_sectors`.
  * Applies storm damage in integer cents to participants outside safe zone.
  * Detects liquidation (`equity_cents <= 0`), transitions to `BUSTED`, and attributes placement.

---

## 2. Falsifiable Verification Assay (`packages/server/tests/royale/test_zone_collapse.py`)

1. **Assay A (Graph Topology & Adjacency Constraints):**
   * Verifies all 12 sectors are registered across 3 concentric tiers.
   * Tests valid neighbor transitions return `True`.
   * Tests invalid jumps (e.g. `UTILITIES` $\rightarrow$ `SEMIS_AI`) raise error or return `False`.
   * Verifies symmetry ($A \rightarrow B \iff B \rightarrow A$).
2. **Assay B (Deterministic Collapse Schedule):**
   * Identical seed yields identical 5-round collapse sequences.
   * Safe sector count strictly follows $12 \rightarrow 8 \rightarrow 5 \rightarrow 3 \rightarrow 1 \rightarrow 1$.
   * Final circle is always an Inner Tier epicenter.
3. **Assay C (Player Movement & Validation):**
   * Moving a participant between adjacent sectors updates `active_sector`.
   * Attempting non-adjacent move raises `ValueError`.
4. **Assay D (Storm Damage Bleed & Round Scaling):**
   * Player in collapsed sector incurs exact cents-per-second damage according to round rate.
   * Player in safe sector incurs \$0 damage.
5. **Assay E (Storm Liquidation & Placement Ranking):**
   * Player remaining in storm until equity $\le 0$ transitions to `ParticipantStatus.BUSTED`.
   * Assigned placement matches remaining player count.
   * `eliminated_count` increments correctly.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** Python 3.12 environment active; ROYALE-1 tests passing on `main`.
* **Rollback Plan:** `git checkout -- packages/server/src/services/royale/ packages/server/tests/royale/`
* **Points of No Return:** None (all components are greenfield in-memory modules).
