# Wargame ARC Simulation — Mission ROYALE-2

**Mission:** `ROYALE-2` — Market Sector Graph Topology & Storm Collapse Engine  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** `ROYALE-3` (High-Frequency Market Tick Generator) & `ROYALE-4` (30s Micro-Trading Duels)  
**Applicable Flows:** `FLOW-ZONE-COLLAPSE`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **ROYALE-1 In-Memory Engine** | `pytest packages/server/tests/royale/` | 4 tests pass in 0.015s | ✅ Holds |
| **Pytest Infrastructure** | `pnpm --filter server run test` | 12 tests pass in 0.72s with zero warnings | ✅ Holds |
| **Domain Models Ready** | `view_file packages/server/src/services/royale/models.py` | `MatchState`, `Participant`, `MatchPhase` defined with `ConfigDict` | ✅ Holds |
| **Client Vitest Ready** | `pnpm --filter client run test` | 1 test passes in 3.40s | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: Teleportation / Sector Hopping Bypass
* **Action:** A player attempts to rotate directly from an outer sector (`UTILITIES`) to an inner high-volatility sector (`SEMIS_AI`) across non-adjacent nodes.
* **Adversarial Reaction:** Player circumvents choke points, evades hostile encounters, and reaches high-beta loot without contested risk.
* **Counteraction:** Strict adjacency graph validation in `SectorTopology.can_transition(from_sector, to_sector)`. Any non-adjacent move is rejected with an explicit validation error. Movement transitions require adjacency traversal.

### Scenario 2: High-Roller Turtling in Collapsed Sectors
* **Action:** A trader with a large early lead camps inside a collapsed outer sector, willing to absorb flat damage to evade duels.
* **Adversarial Reaction:** Passive non-engagement strategy undermines Poisson encounter pacing and game-theoretic tension.
* **Counteraction:** Round-escalating capital tick damage:
  * Round 1: \$50/sec (5,000 cents/sec)
  * Round 2: \$75/sec (7,500 cents/sec)
  * Round 3: \$100/sec (10,000 cents/sec)
  * Round 4: \$150/sec (15,000 cents/sec)
  * Round 5: \$200/sec (20,000 cents/sec)
  A \$15,000 starting portfolio bleeds to \$0 in under 75 seconds in late rounds. When equity reaches \$0, player status transitions to `BUSTED` with immediate liquidation.

### Scenario 3: Topological Disconnection (Stranded Islands)
* **Action:** Random collapse algorithm closes sectors each round based on the match seed.
* **Adversarial Reaction:** Unconstrained random selection could close bottleneck nodes, isolating safe sectors and trapping players with no traversable path to the final safe circle.
* **Counteraction:** Topologically constrained concentric collapse. The 12 sectors are partitioned into 3 concentric tiers: Outer (4), Mid (4), Inner (4). Collapse orders strictly progress from Outer to Mid to Inner, guaranteeing every remaining safe sector retains an unbroken path to the designated Final Circle epicenter.

### Scenario 4: Simultaneous Storm Liquidation Ordering
* **Action:** Multiple players in the storm drop below \$0 equity within the same 1-second tick cycle.
* **Adversarial Reaction:** Non-deterministic placement attribution or tie-breaking errors.
* **Counteraction:** Deterministic elimination ordering during the storm tick: participants are sorted by pre-damage equity; lowest equity liquidates first and receives lower placement, breaking exact ties by player UUID.

---

## 3. Invariants & Negative Constraints
* **INV-1:** Adjacency graph must be symmetric (undirected edges: if $A \rightarrow B$ is valid, then $B \rightarrow A$ is valid).
* **INV-2:** Sector transition checks must execute in $\mathcal{O}(1)$ time.
* **INV-3:** Storm tick damage must deduct atomically in integer cents without floating-point precision drift.
* **INV-4:** Seed reproducibility: identical `seed` must produce identical 5-round collapse sequences.
