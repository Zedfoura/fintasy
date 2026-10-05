# Execution Receipt — Mission ROYALE-5: Sector Contestation & Third-Party Battle Protocol

**Mission:** `ROYALE-5`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Evidence Stage Proven:** `CANONICAL`  
**Lane:** `lane_combat`  
**Authority Grant:** `grant-2026-10-01-execute-royale-5` (`/wargame-run`)  
**Base Commit SHA:** `bb248df`  
**Flow Claim:** `.wargaming/flows/claims/mission_ROYALE-5.json` (`FLOW-COMBAT-THIRDPARTY`)  

---

## 1. Implemented Subsystems & Modified Artifacts

- **[MODIFY] `packages/server/src/services/royale/duel_engine.py`:**
  - Expanded `DuelResolution`:
    - Added `loser_ids: list[str]` and `rankings: list[str]` to capture complete ordinal placement for multi-participant duels.
    - Added `bounties_by_loser: dict[str, int]` and `loot_by_loser: dict[str, list[str]]` for granular audit of stolen assets per defeated trader.
    - Added `liquidated_participant_ids: list[str]` and `kills_credited: int`.
  - Expanded `DuelState`:
    - Added `max_duration_sec: float = 45.0` (hard duration ceiling).
    - Added `third_party_count: int` (tracks intervention frequency).
  - Implemented `DuelEngine.add_participant(duel, participant_id)`:
    - Atomically registers third (or subsequent) participant.
    - Extends clock to 15.0s floor (`time_remaining_sec = min(max_duration_sec, max(time_remaining_sec, 15.0))`) ensuring incoming and incumbent duelists have sufficient time to open/hedge positions.
  - Upgraded `DuelEngine.resolve_duel(duel, current_prices)`:
    - Mark-to-market settlement across all $N \ge 2$ participant order books.
    - Deterministic ranking key: $(-\text{profit}, -\text{roi}, \text{participant\_id})$.
    - Ranks full field: `winner_id = rankings[0]`, `loser_ids = rankings[1:]`.
    - Handles idle draws (`all_zero` profits and collateral $\rightarrow$ `is_draw = True`).
- **[MODIFY] `packages/server/src/services/royale/match_manager.py`:**
  - Implemented `third_party_duel(match_id, duel_id, participant_id)`:
    - Validates match phase (`ACTIVE_ROUNDS` or `FINAL_CIRCLE`).
    - Validates participant is `ALIVE` and in the exact same sector as `duel.sector`.
    - Rejects cross-sector entry or already-engaged participants.
    - Transitions participant to `ParticipantStatus.IN_DUEL` and registers in active duel index.
  - Implemented `get_active_duel_in_sector(match_id, sector)` helper for real-time sector radar and bot query.
  - Upgraded `_settle_duel`:
    - Iterates across all defeated participants in `resolution.loser_ids`.
    - Extracts 25% cash bounty from each loser pot into winner pot.
    - Transfers held sector loot cards from all losers to winner.
    - Enforces bankruptcy check on each loser (`equity <= 0` $\rightarrow$ `ParticipantStatus.BUSTED`).
    - Credits multi-kills (`kills += len(loser_ids)`) to the winning trader.
    - Returns all surviving participants to `ParticipantStatus.ALIVE`.
- **[NEW] `packages/server/tests/royale/test_third_party.py`:**
  - 7-Assay verification suite validating third-party entry and clock extension, sector and status guards, 3-way order isolation, performance ranking, spoils distribution, multi-kill double bankruptcy, and idle 3-way draw.

---

## 2. Terminal Output Proof (Anti-Hallucination Guard)

### Programmatic Blast Radius:
```
$ npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "packages/server/src/services/royale/duel_engine.py,packages/server/src/services/royale/match_manager.py,packages/server/tests/royale/test_third_party.py"
["server"]
```

### Subsystem Test Suite (`test_third_party.py`):
```
$ packages/server/.venv/bin/pytest packages/server/tests/royale/test_third_party.py
.......                                                                  [100%]
7 passed in 0.23s
```

### Full Royale Test Suite:
```
$ packages/server/.venv/bin/pytest packages/server/tests/royale/
...........................................                              [100%]
35 passed in 0.99s
```

### Monorepo Parallel Test Suite (`pnpm test`):
```
$ pnpm test
> fintasy@0.0.0 test /Users/tinatseichingaya/fintasy
> pnpm --parallel --color run test

Scope: 2 of 3 workspace projects
packages/server test$ .venv/bin/pytest || pytest
packages/client test$ vitest run
packages/server test: ...........................................                              [100%]
packages/server test: 43 passed in 1.77s
packages/server test: Done
packages/client test:  ✓ tests/basic.test.ts  (1 test) 5ms
packages/client test:  Test Files  1 passed (1)
packages/client test:       Tests  1 passed (1)
packages/client test:    Duration  2.42s
packages/client test: Done
```

### Monorepo Lint & Format (`pnpm run lint`):
```
$ pnpm run lint
> fintasy@0.0.0 lint /Users/tinatseichingaya/fintasy
> pnpm --parallel --color run lint && eslint . --cache

Scope: 2 of 3 workspace projects
packages/server lint$ python3 -m ruff format --check; exit 0
packages/server lint: 47 files already formatted
packages/server lint: Done
```

---

## 3. Verified Invariants
- **INV-1 (Sector Contestation Locality):** A player must be present in the identical sector as the ongoing duel to third-party. Distant sector entries are rejected with `ValueError`.
- **INV-2 (Combat Clock Extension Floor):** When a third-party joins with $<15.0\text{s}$ remaining, clock extends to $15.0\text{s}$ (bounded by $45.0\text{s}$ ceiling) to guarantee fair order placement windows.
- **INV-3 (Multi-Way Performance Ranking):** All $N$ duelists are ranked strictly by net profit in cents, with collateral ROI and deterministic ID sorting as tie-breakers.
- **INV-4 (Multi-Kill Attribution):** The winning trader claims kills for all defeated participants in the duel, correctly awarding double kills on simultaneous multi-bankruptcies.
- **INV-5 (State Integrity):** Only surviving duelists return to `ParticipantStatus.ALIVE`; bankrupt duelists transition to `ParticipantStatus.BUSTED` and increment `match.eliminated_count`.
