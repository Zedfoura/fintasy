# Wargame ARC Simulation — Mission ROYALE-3

**Mission:** `ROYALE-3` — High-Frequency Market Tick Generator & Sector Volatility Regimes  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** `ROYALE-4` (30-Second Micro-Trading Duel & Liquidation Mechanism)  
**Applicable Flows:** `FLOW-ROYALE-GOLDEN`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **ROYALE-1 & ROYALE-2 Engine** | `pytest packages/server/tests/royale/` | 13 tests pass in 0.30s | ✅ Holds |
| **Monorepo Pytest & Vitest** | `pnpm test` | 21 server tests + 1 client test pass | ✅ Holds |
| **Topology & Storm Integration** | `view_file packages/server/src/services/royale/topology.py` | 12 sectors with concentric tier classification active | ✅ Holds |
| **Format & Linting** | `pnpm run lint` | 42 files cleanly formatted, zero errors | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: High-Frequency Floating Point Precision Drift
* **Action:** 10 Hz price stream calculates Geometric Brownian Motion (GBM) continuously for 36 tickers over a 6-minute match (3,600 ticks $\times$ 36 tickers = 129,600 price states).
* **Adversarial Reaction:** Standard IEEE 754 floating-point arithmetic accumulates rounding errors across multiplications, leading to non-zero arbitrage desynchronization or sub-penny rounding drift between clients and server.
* **Counteraction:** Internal price calculation uses floating-point log-returns but rounds deterministically to integer cents (`price_cents: int`, minimum price floor = 1 cent) on each tick. Price broadcast frames and portfolio transactions operate strictly in integer cents.

### Scenario 2: Unbounded Price Collapse or Explosive Runaway
* **Action:** High-volatility inner-tier sectors (e.g. `MEME_ALPHA` with $\sigma = 0.85$ or `BIOTECH` with $\sigma = 0.65$) encounter consecutive stochastic negative or positive shocks.
* **Adversarial Reaction:** A stock price crashes to \$0.00 (divide-by-zero ruin) or skyrockets to \$1,000,000+, causing absurd trading gains that break match economy balance.
* **Counteraction:** Bounded Mean-Reverting Jump Diffusion (Ornstein-Uhlenbeck drift component towards historical anchor price) combined with a strict circuit breaker price corridor: price is clamped between $20\%$ of baseline (floor) and $500\%$ of baseline (ceiling).

### Scenario 3: Loot Ticker Hoarding / Contested Drop Starvation
* **Action:** 5 players drop into the same hot sector (`SEMIS_AI`), while 1 player drops alone into `MATERIALS`.
* **Adversarial Reaction:** Uncontested drops go unrewarded while congested drops create immediate loot starvation before duels even begin.
* **Counteraction:** Explicit Drop Loot Allocation Algorithm:
  * If a sector is **uncontested** (exactly 1 player present at the end of drop phase), that player is awarded the sector's prime Ticker Loot Card (e.g. `NVDA` for `SEMIS_AI`, `LIN` for `MATERIALS`) free of charge.
  * If a sector is **contested** ($\ge 2$ players), ticker loot is locked into the sector prize pool, contestable only via 30s trading duels (`ROYALE-4`).

### Scenario 4: External API Rate Limiting Interference
* **Action:** Server runs multiple 40-player matches concurrently while legacy paper-trading users place orders.
* **Adversarial Reaction:** If royale simulation makes external API calls to Alpaca Markets API, the server exceeds the Alpaca 200 req/min rate limit and crashes production.
* **Counteraction:** Zero External Dependencies. Stock Royale simulation is completely self-contained, mathematically generated in-memory via seeded GBM and stochastic volatility regimes. Real Alpaca API service is never touched by royale matches.

---

## 3. Invariants & Negative Constraints
* **INV-1:** Seed determinism: identical `seed` generates identical price tick sequences across all 36 tickers.
* **INV-2:** Monotonic tick sequences: every tick carries a strictly increasing `tick_sequence` integer and `timestamp_ms`.
* **INV-3:** Non-zero price floor: no ticker price may ever drop $\le 0$ cents.
* **INV-4:** Complete sector coverage: each of the 12 sectors carries a defined pool of at least 3 distinct tickers with calibrated volatility regimes.
