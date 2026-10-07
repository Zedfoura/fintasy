# Wargame ARC Specification — Mission LANDING-4: Social Proof Stats, Golden Trader Apex Leaderboard Preview & FAQ

**Mission ID:** `LANDING-4`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `CANONICAL`  
**Flow Coverage:** `FLOW-LANDING-CONVERSION`, `FLOW-RANKED-PROGRESS`  
**Lane:** `lane_social_proof`  

---

## 1. Action (Proposed State Mutation)
- Author `packages/client/src/components/landing/LandingSocialProof.vue`:
  - **Live Platform Stats Grid:**
    - `60 MAX TRADERS` per competitive match.
    - `$15,000.00 STARTING POT` per player (`INV-1` invariant).
    - `100ms FAST TICK ENGINE` state synchronization frequency.
    - `12 CONCENTRIC SECTORS` across S&P 500 topologies.
  - **Golden Trader Apex Leaderboard Preview:**
    - Top 5 ranked seasonal traders table with Rank (`#1` to `#5`), Callout/Badge (Golden Trader, Apex Master), Trader Name (e.g. `QuantumBull`, `MomentumKing`, `HFT_Viper`, `AlphaSeeker`, `DeltaNeutral`), Tier Icon, MMR Rating (e.g. `2,840 MMR`, `2,790 MMR`, etc.), Win Rate, and Total Liquidations.
    - Direct CTA button (`View Full Ranked Ladder`) navigating to `/dashboard/royale`.
  - **Interactive FAQ Accordion:**
    - Collapsible Q&A items answering critical visitor questions:
      1. *What is Stock Royale?* (60-player real-time trading battle royale).
      2. *Do I need real money or brokerage credentials?* (100% risk-free simulated capital with $15,000 starting equity).
      3. *How does the sector storm collapse work?* (Dynamic Fed liquidity drain forcing inward rotations).
      4. *How does leverage work in 30-second duels?* (1x to 5x multipliers with 90% liquidation cutoff).
      5. *Can I play on Steam Deck or Linux?* (Fully supported via native Tauri 2.0 desktop builds).
- Author `packages/client/src/components/landing/LandingFooter.vue`:
  - Cyberpunk platform footer with logo, description, Steam Deck / Desktop readiness badges (`STEAM DECK VERIFIED • TAURI 2.0`), quick links (`Play Royale`, `Paper Trading`, `Documentation`, `Leaderboard`), copyright watermark, and system status indicator.
- Author Vitest test suite `packages/client/tests/LandingSocialProof.test.ts`.
- Mount both components in `packages/client/src/pages/index.vue`.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)
- **R-1 (FAQ Accordion State Leak / Accessibility):** Multiple FAQ items toggling without proper reactive expansion tracking or broken aria attributes.
- **R-2 (Table Overflow on Mobile):** The 5-column leaderboard table could exceed viewport width and clip on mobile screens (<400px).
- **R-3 (Broken External / Internal Links):** Navigation links without proper router push or external links missing security attributes (`rel="noopener noreferrer"`).

---

## 3. Counteraction (Hardened Mitigations & Guards)
- **C-1:** Implement reactive `openFaqIndex` ref with clean toggle function, enabling intuitive expand/collapse with transition indicators (+/-).
- **C-2:** Use horizontal scroll wrapper `overflow-x-auto` with clean scrollbar hiding, plus compact cell typography for mobile viewports.
- **C-3:** Internal links route via `router.push()`, external links include `target="_blank"` and `rel="noopener noreferrer"`.
