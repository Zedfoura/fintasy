# Wargame ARC Specification — Mission LANDING-2: 4-Pillar Gameplay Loop Showcase & Tactical Sector Teaser

**Mission ID:** `LANDING-2`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `CANONICAL`  
**Flow Coverage:** `FLOW-LANDING-CONVERSION`  
**Lane:** `lane_landing_ui`  

---

## 1. Action (Proposed State Mutation)
- Author `packages/client/src/components/landing/LandingGameplayPillars.vue`:
  - Showcase the 4 core gameplay pillars of Stock Royale with high-fidelity cyberpunk dark glassmorphic cards:
    1. **30–60 Player Lobbies & Tactical Bot Fill:** Instant matchmaking with algorithmic AI traders (`ApexBot`), $15,000 starting pot (`INV-1`), and 100ms fast tick engine.
    2. **Dynamic S&P 500 Sector Map & Liquidity Storm:** 12 concentric sector topology (Outer -> Mid -> Inner), Federal Reserve liquidity drain storm collapse schedules, and safe circle rotations.
    3. **30-Second Micro-Trading Duels & Loot Stealing:** 1x–5x leverage duels, real-time P&L delta calculation, 90% auto-liquidation, and third-party battle interceptions.
    4. **Rocket League Ranked MMR Progression:** Tiered ranks (Copper, Bronze, Silver, Gold, Platinum, Diamond, Master, Apex Grandmaster, Golden Trader), MMR rating adjustments, and seasonal climb.
  - Interactive exploration: tab selector and individual cards with icons, metrics, and key takeaway bullets.
- Mount component into `packages/client/src/pages/index.vue` below the hero section.
- Author unit test suite `packages/client/tests/LandingPillars.test.ts`.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)
- **R-1 (Responsive Grid Breakage):** On mobile viewports (<640px), 4 horizontal columns could overflow or crunch text.
- **R-2 (UnoCSS Class Linter Warning):** Custom classes or unparsed utilities might trigger lint or formatting errors.
- **R-3 (Test Stubbing / Missing Icons):** `@vicons/tabler` icon components might require mock stubs in Vitest.

---

## 3. Counteraction (Hardened Mitigations & Guards)
- **C-1:** Responsive grid uses `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`, ensuring clean single-column stacking on mobile.
- **C-2:** Enforce standard UnoCSS utilities and run `pnpm run lint` with 0 warnings.
- **C-3:** `LandingPillars.test.ts` renders icons with fallback slot stubs and asserts presence of all 4 pillars and interactive tab toggles.
