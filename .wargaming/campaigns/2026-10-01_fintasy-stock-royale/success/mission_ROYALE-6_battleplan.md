# Battle Plan — Mission ROYALE-6: Rocket League Tiered MMR & Rating System Engine

**Mission:** `ROYALE-6`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md` (§1.1 Persistent Tier / `user_ranks`)  
**Assigned Parallel Lane:** `lane_ranked`  
**Target Files:**
- `packages/server/src/services/royale/mmr_engine.py`
- `packages/server/src/services/royale/match_manager.py`
- `packages/server/src/services/royale/__init__.py`
- `packages/server/tests/royale/test_mmr.py`

---

## 1. Concrete Execution Specification

### 1.1 Ranked Models & Scoring Engine (`mmr_engine.py`)
* **`RankTier` (Enum):**
  * `BRONZE` (0 – 1,499 RP; entry: 15 RP)
  * `SILVER` (1,500 – 3,499 RP; entry: 25 RP)
  * `GOLD` (3,500 – 5,999 RP; entry: 40 RP)
  * `PLATINUM` (6,000 – 8,999 RP; entry: 55 RP)
  * `DIAMOND` (9,000 – 12,499 RP; entry: 70 RP)
  * `CHAMPION` (12,500 – 15,999 RP; entry: 85 RP)
  * `GOLDEN_TRADER` ($\ge 16,000$ RP; entry: 100 RP + 5 RP / 1,000 RP over 16,000)
* **`RankDivision` (Enum):**
  * `III` (Lowest division in tier)
  * `II` (Mid division in tier)
  * `I` (Highest division in tier)
* **`UserRank` (Pydantic V2 Model):**
  * `user_id: str`
  * `rp: int = 0`
  * `tier: RankTier = RankTier.BRONZE`
  * `division: RankDivision = RankDivision.III`
  * `demotion_protection_matches: int = 0`
  * `highest_rp: int = 0`
  * `highest_tier: RankTier = RankTier.BRONZE`
  * `total_matches: int = 0`
  * `total_wins: int = 0`
  * `total_kills: int = 0`
* **`MatchRankResult` (Pydantic V2 Model):**
  * `user_id: str`
  * `placement: int`
  * `kills: int`
  * `net_profit_cents: int`
  * `entry_cost: int`
  * `placement_rp: int`
  * `kill_rp: int`
  * `profit_rp: int`
  * `gross_rp: int`
  * `net_rp: int`
  * `previous_rp: int`
  * `new_rp: int`
  * `previous_tier: RankTier`
  * `new_tier: RankTier`
  * `previous_division: RankDivision`
  * `new_division: RankDivision`
  * `tier_promoted: bool = False`
  * `tier_demoted: bool = False`
  * `demotion_protection_used: bool = False`

### 1.2 RP Evaluation Mechanics (`MMREngine`)
* **`compute_entry_cost(tier: RankTier, rp: int) -> int`:**
  * Returns calibrated entry fee per tier. For Golden Trader, calculates +5 RP per full 1,000 RP above 16,000.
* **`compute_placement_rp(placement: int) -> int`:**
  * 1st: 140, 2nd: 100, 3rd: 75, 4th-6th: 55, 7th-10th: 35, 11th-15th: 20, 16th-20th: 10, 21st+: 0.
* **`compute_liquidation_rp(placement: int, kills: int) -> int`:**
  * Base rate per kill by placement (25, 20, 14, 8, 2).
  * Diminishing multiplier: Kills 1–3 (1.0x), Kills 4–6 (0.8x), Kills 7+ (0.3x).
* **`compute_profit_bonus_rp(net_profit_cents: int) -> int`:**
  * $\min(25, \max(0, \text{net\_profit\_cents} // 100000))$ (+1 RP per \$1,000 profit).
* **`evaluate_match_result(rank: UserRank, placement: int, kills: int, net_profit_cents: int) -> MatchRankResult`:**
  * Calculates gross and net RP.
  * Handles tier promotion (+100 RP bonus, grants 3-game demotion protection).
  * Handles demotion protection clamping.
  * Clamps RP at absolute minimum 0.
  * Updates `rank.total_matches`, `total_wins` (if 1st), `total_kills`.

### 1.3 Match Manager Integration (`match_manager.py`)
* Track match ranks dictionary: `_user_ranks: dict[str, UserRank]`.
* `get_or_create_user_rank(user_id: str) -> UserRank`.
* `settle_match_ranks(match_id: str) -> dict[str, MatchRankResult]`:
  * Evaluates RP changes for all participants at match conclusion (`MATCH_OVER`).

---

## 2. Falsifiable Verification Assay (`packages/server/tests/royale/test_mmr.py`)

1. **Assay A (Tier & Division Mapping):**
   * Verifies RP boundary transitions for all 7 tiers (Bronze through Golden Trader).
   * Verifies division thresholds (III, II, I).
2. **Assay B (Entry Cost Scale):**
   * Confirms entry costs for each tier, including variable Golden Trader surcharge ($>16,000$).
3. **Assay C (Placement & Kill Matrix Calculations):**
   * Asserts 1st place with 4 kills calculates 140 + (3 * 25 + 1 * 20) = 235 gross RP.
   * Tests diminishing returns on high kill counts (7+ kills).
4. **Assay D (Trading Profit Bonus):**
   * Confirms \$5,000 profit awards +5 RP; \$30,000 profit caps at +25 RP.
5. **Assay E (Promotion & Demotion Protection):**
   * Moving from Gold I to Platinum grants +100 bonus and 3 protection games.
   * Losing next match with protection active clamps at 6,000 RP (tier floor).
6. **Assay F (Zero RP Floor):**
   * Beginner at 5 RP who finishes 40th with 15 RP entry cost is clamped to 0 RP (never negative).
7. **Assay G (Full Match Settlement Integration):**
   * Concludes a match via `settle_match_ranks` and verifies match rank results across multiple players.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** Python 3.12 active; clean tree at commit `15f0286`; all 43 tests passing.
* **Rollback Plan:** `git checkout -- packages/server/src/services/royale/`
* **Points of No Return:** None.
