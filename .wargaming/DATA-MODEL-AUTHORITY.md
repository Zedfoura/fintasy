# DATA MODEL AUTHORITY — Fintasy Stock Royale Architecture

**Status:** Authoritative Binding Contract  
**Run Mode:** `PostgreSQL + In-Memory Fast Match State Machine + WebSocket Event Stream`  
**Governing Authority:** User / Tinatsei Chingaya (`Zedfoura`)  

---

## 1. Domain Entities & Persistence Separation

Fintasy operates on two distinct temporal tiers of data to support high-throughput battle royale action without database I/O bottlenecks:

### 1.1 Persistent Tier (PostgreSQL)
Preserves cold/warm relational records, durable user progression, and historical auditability:
- **`users`**: Core user credentials, wallet coins, timestamps.
- **`user_ranks`**: User MMR, competitive tier (`COPPER` through `GOLDEN_TRADER`), division (I-III), total kills/liquidations, match wins, seasonal win rate.
- **`ranked_seasons`**: Season identifier, active status, start/end dates.
- **`matches`**: Completed match records, seed, winner UUID, total duration, final leaderboard summary.
- **`match_participants`**: Final placement (1-60), equity, kills, MMR delta per player.
- **`match_duels`**: Audit records of key combat encounters, tickers traded, net P&L stolen.
- **`portfolios` / `transactions`**: Existing standard paper trading accounts and tournament structures (preserved known-good invariants).

### 1.2 Real-Time Match State Engine (In-Memory / Fast Loop)
Encapsulated inside `packages/server/src/services/royale/`:
- **`MatchInstance`**: Authoritative game loop ticking at 10 Hz (100 ms).
  - Match phase: `LOBBY` -> `DROP_SELECTION` -> `ACTIVE_ROUNDS` -> `FINAL_CIRCLE` -> `MATCH_OVER`.
  - Alive player count (30-60 participants: human + AI bots).
  - Safe circle geometry: active sector nodes, collapsing sectors, storm boundary, tick damage rate.
- **`SectorGraph`**: Graph adjacency model of market sectors (Outer: Utilities, Real Estate, Materials, Industrials; Mid: Healthcare, Financials, Energy, Consumer; Inner: Big Tech, AI Semiconductors, Meme/High-Beta).
- **`MarketTickEngine`**: Synthetic high-frequency micro-tick generator executing Geometric Brownian Motion with sector correlation and event shocks.
- **`DuelArena`**: Active 30s-60s micro-trading battles between 2+ players with instant P&L computation, order execution, leverage, and third-party entry hooks.
- **`WebSocket Broadcast`**: Fast binary/JSON event streaming (`/ws/royale/matches/{match_id}`) emitting state deltas to client subscribers.

---

## 2. Invariant Preservation Contract

1. **Legacy Compatibility**: Existing endpoints (`/api/v1/users`, `/api/v1/portfolios`, `/api/v1/tournaments`, `/api/v1/quotes`, `/api/v1/transactions`) must retain 100% backward compatibility and passing unit test suites.
2. **Alpaca API Protection**: Live Alpaca market data requests remain cached (`CACHE` max size 500, 15-minute window) for static lookup; in-match high-speed 10 Hz trading duels run via the dedicated deterministic `MarketTickEngine` to prevent Alpaca rate-limit exhaustion during intense 60-player games.
3. **Deterministic Verification**: Every match is seeded (`match_seed`), allowing complete deterministic replay of market tick generation and AI bot behaviors for forensic testing and cheat detection.
