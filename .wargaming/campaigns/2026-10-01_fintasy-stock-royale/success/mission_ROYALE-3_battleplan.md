# Battle Plan — Mission ROYALE-3: High-Frequency Market Tick Generator & Sector Volatility Regimes

**Mission:** `ROYALE-3`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md` (§1.2 Real-Time Match State Engine)  
**Assigned Parallel Lane:** `lane_market_sim`  
**Target Files:**
- `packages/server/src/services/royale/market_sim.py`
- `packages/server/src/services/royale/match_manager.py`
- `packages/server/src/services/royale/__init__.py`
- `packages/server/tests/royale/test_market_ticks.py`

---

## 1. Concrete Execution Specification

### 1.1 Sector Volatility & Ticker Pool Mapping (`market_sim.py`)
* **Ticker Metadata:**
  * 36 canonical tickers across 12 sectors (3 tickers per sector).
  * Volatility hierarchy:
    * `OUTER`: $\sigma = 0.08 - 0.14$ (Low volatility, stable growth)
    * `MID`: $\sigma = 0.16 - 0.28$ (Medium volatility)
    * `INNER`: $\sigma = 0.35 - 0.85$ (High beta, explosive volatility)
* **Mathematical Process:**
  * Geometric Brownian Motion with Mean Reversion:
    $$\Delta \ln(S_t) = \theta (\ln(S_0) - \ln(S_t)) \Delta t + \sigma \sqrt{\Delta t} Z_t$$
    where $\Delta t = 0.1\text{s}$ (10 Hz), $Z_t \sim \mathcal{N}(0, 1)$.
  * Macro Market Events (`MarketEvent`):
    * `FED_DECISION`, `EARNINGS_SURPRISE`, `SHORT_SQUEEZE`, `TECH_SELLOFF`
    * Periodic jump diffusion shock factor: $\pm 2\% - 10\%$ instant price jump across targeted sectors.
* **API Surface:**
  * `MarketTick`:
    * `symbol: str`
    * `sector: str`
    * `price_cents: int`
    * `timestamp_ms: int`
    * `tick_sequence: int`
    * `change_pct: float`
    * `volume: int`
  * `MarketSimEngine`:
    * `__init__(seed: int = 0)`
    * `step_tick() -> dict[str, MarketTick]`: Generates next 10 Hz price frame across all 36 tickers.
    * `get_price(symbol: str) -> int`
    * `get_ticker_history(symbol: str, count: int = 50) -> list[MarketTick]`
    * `trigger_event(event_type: str, sectors: list[str], multiplier: float)`
    * `get_sector_loot_tickers(sector: str) -> list[str]`

### 1.2 Match Manager Integration (`match_manager.py`)
* On `create_match(target_players, seed)`:
  * Initialize `market_sim = MarketSimEngine(seed=seed)`.
  * Store in `_market_sims: dict[str, MarketSimEngine]`.
* In `start_active_rounds(match_id)`:
  * Identify uncontested drops: sectors with exactly 1 participant.
  * Award that participant the primary loot ticker for that sector (`participant.held_tickers.append(ticker)`).
* In `tick_market(match_id) -> dict[str, MarketTick]`:
  * Advances market simulation by 1 tick (100ms) and returns the tick frame.
  * Allows querying active prices for order execution in duels.

---

## 2. Falsifiable Verification Assay (`packages/server/tests/royale/test_market_ticks.py`)

1. **Assay A (36 Tickers & Volatility Hierarchy):**
   * Verifies all 12 sectors have exactly 3 registered tickers with baseline prices.
   * Asserts inner-tier tickers exhibit higher empirical standard deviation than outer-tier tickers over 500 simulated ticks.
2. **Assay B (Seed Determinism & Replay Parity):**
   * Two separate `MarketSimEngine` instances initialized with identical `seed` generate identical prices down to the exact cent over 200 ticks.
3. **Assay C (Price Sanity & Circuit Breakers):**
   * Prices never fall $\le 0$ cents even under 500 ticks of heavy negative drift.
   * Prices are clamped within $[0.2 \times S_0, 5.0 \times S_0]$.
4. **Assay D (Uncontested Drop Loot Allocation):**
   * In a match where Player 1 drops alone in `SEMIS_AI` and Player 2 and 3 drop in `UTILITIES`:
   * Advancing to `ACTIVE_ROUNDS` awards Player 1 `NVDA` in `held_tickers`.
   * Players 2 and 3 in contested `UTILITIES` receive no free loot ticker card.
5. **Assay E (Macro Market Event Shock):**
   * Triggering an `EARNINGS_SURPRISE` shock immediately causes a discrete price jump on affected tickers.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** Python 3.12 environment active; clean git tree on `main`; ROYALE-2 tests passing.
* **Rollback Plan:** `git checkout -- packages/server/src/services/royale/`
* **Points of No Return:** None (all components are greenfield in-memory modules).
