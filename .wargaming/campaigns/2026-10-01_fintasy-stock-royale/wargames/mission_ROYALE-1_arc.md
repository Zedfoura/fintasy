# Wargame ARC Simulation — Mission ROYALE-1

**Mission:** `ROYALE-1` — Match State Machine & 30-60 Player Lobby Orchestrator  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts only (`wargames/`, `success/`, ledger metadata)  
**Consumer:** `ROYALE-2` (Sector Map Topology & Storm Collapse Engine)  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **Python Toolchain** | `python3 --version` | Python 3.12.8 installed | ✅ Holds |
| **Server Dependencies** | `view_file packages/server/requirements.txt` | FastAPI, Uvicorn, Pydantic, psycopg2 available | ✅ Holds |
| **Directory Isolation** | `ls packages/server/src/services/` | `alpaca/`, `database/` exist; `royale/` is greenfield | ✅ Holds |
| **Legacy Tests Pass** | `python3 -m unittest discover packages/server/tests/` | Basic unittest tests execute cleanly | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: Sudden Concurrency Burst (Lobby Fill Shock)
* **Action:** 40 human and bot participants join the match within a 5-second window.
* **Adversarial Reaction:** Thread contention or GIL blocking in Python if lock contention occurs on the shared match dictionary; race conditions during participant list mutation.
* **Counteraction:** Single-threaded asynchronous in-memory state engine using Python `asyncio` without blocking system calls. State transitions are atomic within the event loop cycle. Participant dictionary mutations are synchronous pure memory operations.

### Scenario 2: Incomplete Human Lobby (Starvation)
* **Action:** Only 1 to 3 human players queue in Ranked matchmaking.
* **Adversarial Reaction:** Match fails to launch or players experience a 10-minute wait, causing immediate user abandonment.
* **Counteraction:** Strict 10-second Queue SLA. The orchestrator triggers `auto_fill_bots()` at $T=10\text{s}$, dynamically spawning realistic trading bots up to the 40-player ceiling with distinct trading styles (Scalper, Swing, Degen) and Rocket League / Apex skill ratings matching the lobby MMR average.

### Scenario 3: State Desynchronization During Phase Transitions
* **Action:** State machine advances from `LOBBY` $\rightarrow$ `DROP_SELECTION` while a late join request arrives.
* **Adversarial Reaction:** Stale player placed into wrong match state or orphaned in lobby.
* **Counteraction:** Strict transition guard: Once `state != MatchStatus.LOBBY`, `join_player` immediately returns `409 Conflict: Match already in progress`, prompting client to route to spectator or queue next lobby.

---

## 3. Invariants & Negative Constraints
* **INV-1:** Legacy endpoints (`/api/v1/portfolios`, `/api/v1/users`, etc.) must not be mutated or impaired.
* **INV-2:** Bot generation and lobby fill must take $<50\text{ms}$ total CPU time.
* **INV-3:** Memory footprint per active match instance must remain $<500\text{ KB}$.
* **INV-4:** Randomness must accept an optional deterministic seed (`match_seed`) for exact replay verification.
