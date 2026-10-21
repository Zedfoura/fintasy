# Battle Plan — Mission LANDING-REV-3: Interactive Media Showcase & Bento Grid Features (Elements 6-7)

**Mission:** `LANDING-REV-3`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `docs/design-system/07-LANDING-PAGE-V2-SPEC.md`, `.agents/skills/landing-page-guide-v2/SKILL.md`  
**Assigned Parallel Lane:** `lane_landing_media`  
**Target Files:**
- `packages/client/src/components/landing/LandingMediaSection.vue` (Element 6: Realistic 3D Tilt Tactical Combat Terminal, animated order book ticks, live sparkline, and sector radar)
- `packages/client/src/components/landing/LandingBenefits.vue` (Element 7: Asymmetric bento grid layout detailing the 4 core pillars with custom tactical badges)
- `packages/client/tests/LandingMediaV2.test.ts` (Vitest test suite verifying Elements 6-7)

---

## 1. Concrete Execution Steps

### 1.1 Implement `LandingMediaSection.vue` (Element 6)
- Section container id `arena-preview` with subtle dot-matrix background and radial ambient glow.
- Tactical HUD Chassis Header: `LIVE ARENA SURVEILLANCE • MATCH #9421 • FINAL CIRCLE`.
- 3D Tilt Perspective Card (`perspective: 1200px`, `transform: rotateX(2deg)`) with hairline border `border-[rgba(255,255,255,0.12)]` and deep shadow.
- Interactive live simulated state:
  - Ticker Stream: `NVDA` ($128.40, +4.8%), `TSLA` ($242.10, -2.1%), `AAPL` ($224.25, +1.4%), `BTC/USD` ($64,250, +5.7%) with monospace tabular figures.
  - Live 30-Second Micro-Duel Card:
    - Opponent: `ApexBot_7 [ MMR 2,410 ]`
    - Position: `5x LONG NVDA • Active P&L: +$1,840.50 (+12.3%)`
    - Interactive 1x, 2x, 5x leverage chips (`[ 1x ]`, `[ 2x ]`, `[ 5x ]`) that update simulated return live.
    - SVG Sparkline chart rendering realistic animated price action path.
    - Liquidity Storm countdown badge: `STORM COLLAPSE IN 0:18` (Action Horizon orange).
  - Sector Radar Map Widget:
    - Outer sectors closing: `Utilities [DRAINED]`, `Materials [DRAINED]`.
    - Safe zone: `AI Semiconductors [HOT ZONE • CONTESTED]`.
  - Tactical CTA button: `Deploy to Active Match →`.

### 1.2 Implement `LandingBenefits.vue` (Element 7)
- Section container id `gameplay-pillars` with clear taxonomy badge `[ 02 • CORE PLATFORM MECHANICS ]`.
- Asymmetric Bento Grid (2 large feature cards + 2 detailed cards):
  - **Card 1 (Span 2 col on md/lg): PVP Micro-Trading Duels**
    - High-stakes 30s duels, order book execution, leverage multipliers (1x-5x), bounty collection on liquidation.
    - Tactical crosshair graphic and live order ticket mock.
  - **Card 2 (Span 1 col): The Federal Reserve Liquidity Storm**
    - 5-round macro sector map collapse. Safe zones shrink inward to high-beta tech. Capital bleed damage outside the zone.
  - **Card 3 (Span 1 col): Rocket League Ranked Ladder**
    - 7 MMR tiers: Bronze I through Golden Trader Apex. Seasonal RP progression, placement duels, and rank decay.
  - **Card 4 (Span 2 col on md/lg): Institutional Simulation Engine**
    - 10 Hz deterministic tick engine, Geometric Brownian Motion, stochastic jump shocks, zero dollar capital risk.

### 1.3 Vitest Suite `packages/client/tests/LandingMediaV2.test.ts`
- Assay A: Verifies `LandingMediaSection.vue` renders Tactical Combat Terminal preview with match id, ticker tape, and sparkline.
- Assay B: Verifies leverage selector updates simulated P&L calculation interactively.
- Assay C: Verifies `LandingBenefits.vue` renders asymmetric bento grid with all 4 pillars and custom badges.
- Assay D: Verifies all financial values enforce monospace tabular digits (`font-mono tabular-nums`).

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/LandingMediaV2.test.ts` passes 100%.
2. Programmatic blast radius calculated strictly as `["client"]`.
