# Battle Plan — Mission ROYALE-8: Market Sector Radar & Treemap Map with Storm Visualizer

**Mission:** `ROYALE-8`  
**Required Evidence Stage:** `ACTIVATION`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md` & `topology.py`  
**Assigned Parallel Lane:** `lane_tactical_ui`  
**Target Files:**
- `packages/client/src/types/royale.ts`
- `packages/client/src/components/royale/MarketRadarMap.vue`
- `packages/client/tests/MarketRadarMap.test.ts`

---

## 1. Concrete Execution Specification

### 1.1 Type Definitions (`packages/client/src/types/royale.ts`)
* Export `MarketSectorId` enum / union of 12 sectors:
  * Outer Tier: `TECH_SEMIS`, `ENERGY_OIL`, `FINANCIALS_BANKS`, `HEALTHCARE_PHARMA`, `CONSUMER_RETAIL`, `INDUSTRIALS_AERO`
  * Mid Tier: `GROWTH_TECH`, `DEFENSIVE_UTILITIES`, `CRYPTO_FINTECH`, `GLOBAL_COMMODITIES`
  * Inner Tier: `APEX_AI`, `FED_RESERVE_CASH`
* Export `SectorTier`: `'OUTER' | 'MID' | 'INNER'`
* Export `SectorStatus`: `'SAFE' | 'CLOSING' | 'STORM'`
* Export `StormPhase`: `'WARNING' | 'CLOSING' | 'FINAL'`
* Export `SECTOR_DEFINITIONS`: Dictionary mapping each sector to name, tier, tickers, angle span, and canonical adjacent sectors matching `topology.py`.
* Export `StormState`: Round, phase, seconds remaining, damage rate in cents/sec.

### 1.2 Interactive Canvas Radar Component (`packages/client/src/components/royale/MarketRadarMap.vue`)
* **Component Architecture:**
  * Root container styled with Football Manager dark tactical HUD theme (`bg-[#0a0f18]`, `border-[#1f293d]`, `font-mono`).
  * Top Tactical Telemetry Bar:
    * Round indicator: `ROUND 02 / 05`
    * Phase status badge: `SAFE` (emerald), `WARNING: CLOSING SOON` (pulsing amber), `STORM ENGULFING` (pulsing crimson).
    * Countdown Timer: Large monospace display `01:45`.
    * Hazard Drain: `-$100/sec POT DRAIN` when outside the circle.
    * Alive Traders counter: `38 / 40 TRADERS REMAINING`.
  * Main HTML5 Canvas Radar:
    * High-DPI canvas buffer scaling (`devicePixelRatio`).
    * 3 concentric rings (Outer $r \in [0.66R, R]$, Mid $r \in [0.33R, 0.66R]$, Inner core $r \in [0, 0.33R]$).
    * Dynamic sweeping radar beam (360° rotation) providing authentic tactical sonar aesthetic.
    * Wedge fills according to sector status:
      * `SAFE`: Dark slate with emerald boundary.
      * `CLOSING`: Warning amber hazard hash with pulsing warning perimeter.
      * `STORM`: Deep hazard purple/crimson with low opacity veil.
    * Ticker symbol badges & sector name rendered cleanly in each wedge.
    * Local user location marker: Pulsing neon cyan beacon (`YOU`).
    * Opponent counts: Tactical badge `+N` in populated sectors.
    * Active combat duel marker: Pulsing crossed swords icon `⚔️ ACTIVE DUEL` with third-party eligibility alert.
    * Adjacency vectors: Highlighting legal moves from current sector with dashed green tactical vectors.
  * Interactive Canvas Hit-Testing:
    * Mouse move: Tooltip overlay with sector details (loot tier, tickers, player presence, movement feasibility).
    * Mouse click: Validates adjacency; emits `@select-sector(sectorId)` and `@rotate-sector(fromSector, toSector)`.
  * Tactical Sector Quick-List / Mini-Grid for accessibility & fast keyboard/touch selection.

---

## 2. Falsifiable Verification Assay (`packages/client/tests/MarketRadarMap.test.ts`)

1. **Assay A (Topology & 12-Sector Representation):**
   * Verifies all 12 sectors across Outer, Mid, and Inner tiers are registered and defined.
2. **Assay B (Component Mounting & Canvas Initialization):**
   * Mounts `MarketRadarMap.vue` in JSDOM, verifies canvas element and tactical telemetry HUD render.
3. **Assay C (Storm Countdown & State Reactivity):**
   * Updates `stormState` prop, tests reactive update of countdown time and phase badge text (`WARNING`, `CLOSING`, `FINAL`).
4. **Assay D (Currency & Hazard Damage Formatting):**
   * Verifies storm damage rate is displayed correctly in whole dollars from integer cents (e.g., `10000` cents -> `$100/sec`).
5. **Assay E (Sector Selection & Adjacency Rotation Emits):**
   * Simulates clicking an adjacent sector; verifies `@rotate-sector` and `@select-sector` events are emitted with correct arguments.
6. **Assay F (Combat Duel & Player Count Indicators):**
   * Passes `activeDuels` and `playerDistribution`; verifies tactical badges render correctly.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** Python and client test suites passing (62 server + 1 client tests); clean git tree at `4f7328e`.
* **Rollback Plan:** `git checkout -- packages/client/`
* **Points of No Return:** None (additive Vue component and types).
