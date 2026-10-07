# Wargame ARC Simulation — Mission ROYALE-5

**Mission:** `ROYALE-5` — Sector Contestation & Third-Party Battle Protocol  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** `ROYALE-6` (Ranked MMR & RP Progression) & `ROYALE-9` (Live Trading Duel Arena HUD)  
**Applicable Flows:** `FLOW-COMBAT-THIRDPARTY`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **ROYALE-1 through 4 Suite** | `pytest packages/server/tests/royale/` | 28 tests pass in 1.36s | ✅ Holds |
| **Dueling Engine Operational** | `packages/server/src/services/royale/duel_engine.py` | 1v1 duels, 1x/2x/5x leverage, 90% margin auto-liquidation | ✅ Holds |
| **Monorepo Suite Green** | `pnpm test` | 36 server + 1 client tests pass | ✅ Holds |
| **Clean Formatting** | `pnpm run lint` | 46 files cleanly formatted | ✅ Holds |
| **Programmatic Blast Radius** | `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "..."` | Returns strict JSON `["server"]` | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: Buzzer-Beater Exploit (Late-Join Front-Running)
* **Action:** An opportunist third player enters an active duel with 0.5s remaining on the 30s clock, placing a zero-risk or instant micro-scalp order to steal the win before incumbent duelists can react.
* **Adversarial Reaction:** Incumbent duelists who traded over 29 seconds are robbed by a joiner who bears zero time-risk, destroying competitive integrity.
* **Counteraction:** Dynamic Timer Extension Floor:
  When a third-party joins an ongoing duel, if `time_remaining_sec < 15.0`, the timer automatically extends to `15.0s` (capped at max 45s total duration). This guarantees incumbents at least 15 seconds of market ticks to respond to the third-party's positions.

### Scenario 2: Multi-Way Bounty Attribution & Kill Credit (Free-Rider Theft)
* **Action:** Player A and Player B trade heavily; Player B is pushed to the brink of bankruptcy (-$14,500). Player C third-parties at the last second, risks $50, and claims 100% of Player B's bounty and kill credit.
* **Adversarial Reaction:** Player A did 99% of the economic damage but receives no bounty or kill credit due to naive last-hitter logic.
* **Counteraction:** Performance-Based Spoils & Bounty Attribution:
  - Participants are ranked by total net profit in cents across the entire duel duration.
  - The participant with the highest positive net profit (Rank 1) is crowned Winner and claims the primary kill credit for any bankrupt opponent.
  - Losers with net negative profit pay a 25% cash bounty from their remaining liquid capital.
  - If multiple participants generate positive profits, bounties from bankrupt or net-losing players are allocated to the top trader (Rank 1).
  - Non-traders ($0 profit, $0 collateral) or net-negative traders cannot claim bounties or kill credits.

### Scenario 3: Cross-Sector / Multi-Duel Concurrency Race
* **Action:** A player attempts to third-party two duels simultaneously in adjacent sectors or joins a duel from outside the contested sector.
* **Adversarial Reaction:** Race condition allows a player to duplicate capital into multiple active duel order books, or participate without being physically present.
* **Counteraction:** Strict Sector and State Validation:
  - `third_party_duel` asserts `participant.status == ParticipantStatus.ALIVE`.
  - Asserts `participant.active_sector == duel.sector`.
  - Transitions participant to `ParticipantStatus.IN_DUEL` atomically.
  - Once `IN_DUEL`, the participant cannot move or join any other duel.

### Scenario 4: Triple Wipeout / Cascading Bankruptcy
* **Action:** High market volatility wipes out all 3 duelists simultaneously (e.g. 5x leverage positions liquidated by a 20% sector shock).
* **Adversarial Reaction:** Undefined winner, deadlock in elimination sequence, or corrupted player count.
* **Counteraction:** Deterministic Bankruptcy Waterfall:
  - If multiple participants bust (`equity <= 0`), they are eliminated in reverse order of net equity (lowest equity eliminated first).
  - Match `eliminated_count` increments for each busted trader.
  - Finish placements are attributed deterministically.
  - Duel records `is_draw = True` with `winner_id = None`.

---

## 3. Invariants & Negative Constraints
* **INV-1:** Third-party entry requires the participant to be in the exact same sector as the active duel and currently `ALIVE`.
* **INV-2:** Joining a duel extends `time_remaining_sec` to `max(time_remaining_sec, 15.0)` up to a hard cap of `45.0s`.
* **INV-3:** `DuelResolution` must accurately rank all $N \ge 3$ participants and distribute bounties without creating money from thin air.
* **INV-4:** Multiple bankruptcies in a single duel must award multi-kill credits (`kills += count`) to the winning trader.
