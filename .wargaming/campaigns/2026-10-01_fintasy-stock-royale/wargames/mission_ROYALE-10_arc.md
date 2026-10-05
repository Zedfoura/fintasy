# Wargame ARC Simulation — Mission ROYALE-10

**Mission:** `ROYALE-10` — Real-Time WebSocket Client, Kill Feed Ticker & Post-Match Victory HUD  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** `ROYALE-11` (60-Player Full Match Simulation & Regression Verification)  
**Applicable Flows:** `FLOW-ROYALE-GOLDEN`, `FLOW-TACTICAL-SPECTATE`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **All Existing Tests Green** | `pnpm test` | 62 server + 18 client tests pass (100%) | ✅ Holds |
| **Monorepo Linting Clean** | `pnpm run lint` | All server & client files cleanly formatted | ✅ Holds |
| **Programmatic Blast Radius** | `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "..."` | Verified functioning | ✅ Holds |
| **Client Test Runner** | `pnpm --filter client run test` | Vitest + JSDOM operational | ✅ Holds |
| **Royale Types Available** | `packages/client/src/types/royale.ts` | 12 sectors, radar & duel models exported | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: WebSocket Disconnection During Critical Storm Collapse or Duel
* **Action:** Network drops or WebSocket server closes abruptly during mid-game storm collapse or high-stakes duel.
* **Adversarial Reaction:** Composable enters unrecoverable error state, crashing client UI, losing local match state, or spamming reconnection attempts endlessly.
* **Counteraction:** Exponential Backoff & State Rehydration:
  - `useRoyaleMatch.ts` maintains an explicit connection state machine (`DISCONNECTED`, `CONNECTING`, `CONNECTED`, `RECONNECTING`, `ERROR`).
  - Exponential backoff retry with jitter (capped at 5 attempts, max 10s delay).
  - Preserves local cached state during reconnection; upon re-establishment, requests authoritative full-state snapshot.
  - Allows injecting mock or custom socket factories for reliable automated testing in headless environments.

### Scenario 2: Kill Feed Event Flooding & Memory Exhaustion
* **Action:** During mass storm collapse (e.g. 15 players liquidated within 2 seconds), server broadcasts burst of liquidation and storm tick events.
* **Adversarial Reaction:** DOM is flooded with dozens of animated cards, causing layout thrashing, frame drops, and visual overlap on top of radar map.
* **Counteraction:** Fixed-Capacity FIFO Queue & Smooth Pruning:
  - `KillFeed.vue` bounds visible events to `maxItems` (default 6).
  - Older events automatically pruned when queue overflows.
  - Configurable auto-dismiss timer (e.g. 5-7 seconds) per event.
  - Grouping or high-priority badge tagging ensures critical local events (e.g. "You were eliminated" or "Bounty claimed") are never obscured by generic bot ticks.

### Scenario 3: Spectator Mode Desynchronization Upon Liquidation
* **Action:** Local trader goes bankrupt (`BUSTED`) while 20 other traders remain alive.
* **Adversarial Reaction:** Client displays blank or broken screen, unable to transition into spectating living participants.
* **Counteraction:** First-Class Spectator State Machine (`FLOW-TACTICAL-SPECTATE`):
  - When local participant status transitions to `BUSTED`, composable automatically switches `isSpectating` to `true`.
  - Aggregates list of surviving players (`survivingPlayers`) and selects nearest or top-ranked surviving trader as initial spectator focus.
  - Exposes `switchSpectatorTarget('next' | 'prev' | uuid)` allowing client HUD to cycle through live trader perspectives.
  - Spectator retains access to live radar map, kill feed, and leaderboard until final circle concludes.

### Scenario 4: Rocket League MMR Progression Animation & Integer-Cent Integrity
* **Action:** Match concludes; client renders #1 Victory Royale modal and displays MMR/RP deltas and financial P&L.
* **Adversarial Reaction:** Floats introduce rounding anomalies in RP/P&L calculations, and tier promotions fail to display celebratory animations.
* **Counteraction:** Zero Floating-Point Money & Tier Progression Engine:
  - All currency calculations and display formatters strictly use integer cents.
  - `MatchVictoryModal.vue` renders Rocket League tier badge (Bronze through Supersonic Legend), division roman numerals (I, II, III), and animated RP progress bar.
  - Displays explicit breakdown of MMR rewards (Placement RP, Kill RP, Alpha Bonus RP).
  - Highlights `PROMOTION` banner when `isPromotion` flag is true.

---

## 3. Invariants & Negative Constraints
* **INV-1 (Integer-Cent Financial Fidelity):** All bounties, equity, and P&L deltas displayed in KillFeed and Victory HUD are derived strictly from integer cents.
* **INV-2 (Headless Testing Resilience):** Composable supports dependency-injected mock WebSocket sockets, enabling 100% deterministic unit testing in Vitest/JSDOM.
* **INV-3 (Spectator Transition):** Player bankruptcy (`status === 'BUSTED'`) immediately provides a coherent spectator view without throwing null errors.
* **INV-4 (Bounded Event Buffer):** Kill feed never exceeds maximum queue bounds, preventing DOM explosion under high-frequency liquidation cascades.
