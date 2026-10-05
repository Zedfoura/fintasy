# Execution Receipt — Mission ROYALE-4: 30-Second Micro-Trading Duel & Liquidation Mechanism

**Mission:** `ROYALE-4`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Evidence Stage Proven:** `CANONICAL`  
**Lane:** `lane_combat`  
**Authority Grant:** `grant-2026-10-01-execute-royale-4` (`/wargame-run`)  
**Base Commit SHA:** `62bb63b`  
**Flow Claim:** `.wargaming/flows/claims/mission_ROYALE-4.json` (`FLOW-COMBAT-DUEL`)  

---

## 1. Implemented Subsystems & Modified Artifacts

- **[NEW] `packages/server/src/services/royale/duel_engine.py`:**
  - `PositionSide`: `LONG`, `SHORT`.
  - `DuelPosition`: Pydantic V2 model tracking micro-orders with leverage tiers (`1`, `2`, `5`), entry price, current price, unrealized/realized PnL in integer cents, and margin auto-liquidation status.
  - `DuelResolution`: Records winner/loser, draw status, net profits in cents, 25% cash bounty transfer, stolen loot cards, and bankruptcy status.
  - `DuelState`: Container managing active 30-second duels, participant locks, and multi-position order books.
  - `DuelEngine`:
    - Computes Long/Short leveraged PnL: $\text{pnl} = \text{round}(\text{collateral} \times \text{leverage} \times \pm \Delta P / P_{entry})$.
    - Enforces strict maintenance margin threshold: if position loss $\ge 90\%$ of collateral, position is auto-liquidated and entire collateral is forfeited.
    - Resolves duels at 30-second timer expiry or manual close.
- **[MODIFY] `packages/server/src/services/royale/match_manager.py`:**
  - Integrated `DuelEngine` into authoritative `MatchManager`:
    - `initiate_duel`: Locks 2 participants in the same sector into `ParticipantStatus.IN_DUEL`. Blocks movement and duplicate duel entries.
    - `place_duel_order`: Reserves collateral atomically from participant's liquid capital pot, queries real-time 10 Hz price, and opens position.
    - `close_duel_position`: Allows early profit-taking or stop-loss before timer expiry.
    - `tick_duels`: Advances 30-second countdown, evaluates maintenance margins, resolves expired duels, credits winner profits, extracts 25% cash bounty from loser, transfers loser's held ticker cards to winner, increments winner kills, and executes bankruptcy liquidation (`equity <= 0` $\rightarrow$ `ParticipantStatus.BUSTED`).
- **[MODIFY] `packages/server/src/services/royale/__init__.py`:**
  - Exported `DuelEngine`, `DuelPosition`, `DuelResolution`, `DuelState`, `PositionSide`.
- **[NEW] `packages/server/tests/royale/test_duels.py`:**
  - 8-Assay verification suite validating Long/Short leveraged PnL math, maintenance margin auto-liquidation, duel initiation and movement locking, leverage tier bounds, early position closing, 25% bounty and loot card transfer, bankruptcy liquidation, and draw handling.

---

## 2. Terminal Output Proof (Anti-Hallucination Guard)

### Subsystem Test Suite (`test_duels.py`):
```
$ packages/server/.venv/bin/pytest packages/server/tests/royale/test_duels.py
........                                                                 [100%]
8 passed in 0.39s
```

### Full Royale Test Suite (Match Engine + Zone Collapse + Market Sim + Duels):
```
$ packages/server/.venv/bin/pytest packages/server/tests/royale/
............................                                             [100%]
28 passed in 1.36s
```

### Monorepo Parallel Test Suite (`pnpm test`):
```
$ pnpm test
> fintasy@0.0.0 test /Users/tinatseichingaya/fintasy
> pnpm --parallel --color run test

Scope: 2 of 3 workspace projects
packages/server test$ .venv/bin/pytest || pytest
packages/client test$ vitest run
packages/server test: ....................................                                     [100%]
packages/server test: 36 passed in 2.12s
packages/server test: Done
packages/client test:  ✓ tests/basic.test.ts  (1 test) 4ms
packages/client test:  Test Files  1 passed (1)
packages/client test:       Tests  1 passed (1)
packages/client test:    Duration  3.82s
packages/client test: Done
```

### Monorepo Lint & Format (`pnpm run lint`):
```
$ pnpm run lint
> fintasy@0.0.0 lint /Users/tinatseichingaya/fintasy
> pnpm --parallel --color run lint && eslint . --cache

packages/server lint: 46 files already formatted
packages/server lint: Done
```

---

## 3. Verified Invariants
- **INV-1 (Atomic Collateral Reservation):** Micro-orders deduct collateral from liquid capital pot upon order creation; overdraw requests beyond available cash are rejected.
- **INV-2 (Leverage Enforcement):** Only validated leverage tiers `[1, 2, 5]` are accepted. Uncapped leverage is rejected.
- **INV-3 (Movement Lock):** Participants with status `IN_DUEL` cannot move between sectors or join secondary duels until the current duel concludes.
- **INV-4 (Bounty & Loot Transfer):** Winner receives 100% of net duel profits + 25% cash bounty from loser pot + loser's held loot cards + 1 kill credit.
- **INV-5 (Bankruptcy Liquidation):** Losers whose equity drops $\le 0$ cents transition to `BUSTED`, increment `match.eliminated_count`, and receive ordinal placement based on surviving field size.
