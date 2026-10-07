# Wargame ARC Simulation — Mission ROYALE-8

**Mission:** `ROYALE-8` — Market Sector Radar & Treemap Map with Storm Visualizer  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** `ROYALE-9` (Live Trading Duel Arena HUD) & `ROYALE-10` (Real-Time WebSocket Client & Match UI)  
**Applicable Flows:** `FLOW-ZONE-COLLAPSE`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **All Existing Tests Green** | `pnpm test` | 62 server + 1 client tests pass (100%) | ✅ Holds |
| **Monorepo Linting Clean** | `pnpm run lint` | 52 files clean | ✅ Holds |
| **Programmatic Blast Radius** | `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "..."` | Returns strict JSON array | ✅ Holds |
| **Client Test Runner** | `pnpm --filter client run test` | Vitest + JSDOM operational | ✅ Holds |
| **Vue & Styling Stack** | `packages/client/package.json` | Vue 3.4, UnoCSS, Naive UI, @vue/test-utils | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: High-DPI Display Canvas Blur & Hit-Test Coordinate Drift
* **Action:** Canvas renders on high-DPI (Retina) display; user resizes browser window or clicks on sector.
* **Adversarial Reaction:** Text, sector boundaries, and radar rings blur; mouse coordinate calculations drift from actual sector boundaries.
* **Counteraction:** Automatic DPI Scaling & Bounding Rect Normalization:
  - Scale internal buffer width/height by `window.devicePixelRatio` and context by `scale(dpr, dpr)`.
  - Hit testing normalizes client mouse coordinates via `canvas.getBoundingClientRect()` with relative scaling `(x - rect.left) * (canvas.width / rect.width / dpr)`.

### Scenario 2: Concentric 12-Sector Geometry Mismatch with Backend Topology
* **Action:** Frontend renders sectors in arbitrary order or positions conflicting with `topology.py`.
* **Adversarial Reaction:** Sector adjacency visualization displays invalid moves; player thinks sector B is adjacent to sector A when backend rejects it.
* **Counteraction:** Direct Port of Canonical Topology Structure:
  - Outer Tier (6 sectors, angle arcs $\pi/3$ each): `TECH_SEMIS`, `ENERGY_OIL`, `FINANCIALS_BANKS`, `HEALTHCARE_PHARMA`, `CONSUMER_RETAIL`, `INDUSTRIALS_AERO`.
  - Mid Tier (4 sectors, angle arcs $\pi/2$ each): `GROWTH_TECH`, `DEFENSIVE_UTILITIES`, `CRYPTO_FINTECH`, `GLOBAL_COMMODITIES`.
  - Inner Core (2 sectors, angle arcs $\pi$ each): `APEX_AI`, `FED_RESERVE_CASH`.
  - Adjacency paths rendered with tactical dashed vectors between adjacent valid sectors.

### Scenario 3: Storm Animation Frame Lag & CPU Starvation
* **Action:** Continuous 60 FPS canvas loop runs during background tabs or non-active matches, burning CPU.
* **Adversarial Reaction:** Performance degradation in browser, jerky chart updates in adjacent duel HUD.
* **Counteraction:** Lifecycle-Bound `requestAnimationFrame` with Visibility Check:
  - Pause animation loop when component is unmounted or document is hidden (`document.hidden`).
  - Smooth timestamp-based angle sweep for radar scan line and pulsing danger rings.

### Scenario 4: Overlapping Player Pins in High-Density Sectors
* **Action:** At match start, 40-60 players drop into popular sectors (e.g. `TECH_SEMIS`).
* **Adversarial Reaction:** Pin cluster obscures sector labels, loot stats, and duel indicators.
* **Counteraction:** Clustered Tactical Telemetry Badges:
  - Prominent distinct pin for the local user (`YOU` in neon cyan `#00f5d4`).
  - Aggregated opponent counter badge (`N traders` in amber `#ffd166`).
  - Distinct animated flashing duel badge (`⚔️ DUEL` in crimson `#ef476f`) when duels are in progress.

---

## 3. Invariants & Negative Constraints
* **INV-1 (Topology Fidelity):** Displayed sectors, tiers, and allowable rotations must match `topology.py` exactly.
* **INV-2 (Zero Float Currency Display):** Storm tick damage rates must be displayed formatted from integer cents (`$50/s`, not `$50.00000001`).
* **INV-3 (Football Manager Aesthetic):** Dark tactical aesthetic with high-contrast radar HUD, crisp monospace telemetry readouts, and clear sector state transitions (`SAFE`, `CLOSING`, `STORM`).
* **INV-4 (Reactivity & Accessibility):** Full props support for `currentSector`, `sectorStates`, `roundNumber`, `secondsRemaining`, `activeDuels`, and `playerDistribution`. Emits `@select-sector` and `@rotate-sector`.
