# Battle Plan — Mission CLEAN-2: Stock Royale Client Route & Navigation Integration

**Mission:** `CLEAN-2`  
**Required Evidence Stage:** `ACTIVATION`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_tactical_ui`  
**Target Files:**
- `packages/client/src/pages/dashboard/royale.vue` (New)
- `packages/client/src/components/navigation/SideBar.vue` (Modify)
- `packages/client/tests/RoyaleRouteIntegration.test.ts` (New)

---

## 1. Concrete Execution Specification

### 1.1 Stock Royale Dashboard Page (`packages/client/src/pages/dashboard/royale.vue`)
* Layout: `dashboard`.
* States:
  * `NOT_IN_MATCH`: Lobby launcher card with "Deploy Stock Royale" quick match button, bot-fill toggle, MMR rank badge preview, starting cash info ($15,000 / 1,500,000 cents), and 12-sector preview.
  * `IN_MATCH`: Full tactical layout:
    * Left/Main pane: `MarketRadarMap` (concentric sector treemap canvas, storm timer countdown, safe zone indicator).
    * Right pane: `KillFeed` (real-time liquidations) + active participant count.
    * Active combat modal/split-view: `TradingDuelArena` when engaged in a duel or third-party fight.
    * Post-match: `MatchVictoryModal` when match concludes.
* Interactivity:
  * Drop sector selection.
  * Sector rotation click.
  * Start duel / join third-party triggers.
  * Spectator view toggle.

### 1.2 Sidebar Navigation Update (`packages/client/src/components/navigation/SideBar.vue`)
* Import `Crosshair as RoyaleIcon` from `@vicons/tabler`.
* Add `{ label: 'Stock Royale', key: '/dashboard/royale', icon: renderIcon(RoyaleIcon) }` to `menuOptions1` immediately after Dashboard.

### 1.3 Client Route Integration Assays (`packages/client/tests/RoyaleRouteIntegration.test.ts`)
* **Assay A (Lobby Launch & Initial View):** Verifies `royale.vue` mounts with lobby controls, starting endowment badge ($15,000.00), and Deploy button.
* **Assay B (Tactical HUD & Radar Integration):** Verifies that launching or entering a match mounts `MarketRadarMap` and `KillFeed`.
* **Assay C (Combat Duel Escalation View):** Verifies that active duel state mounts `TradingDuelArena`.
* **Assay D (Victory Modal Trigger):** Verifies match conclusion triggers `MatchVictoryModal`.
* **Assay E (Sidebar Navigation Entry):** Verifies `SideBar.vue` renders the Stock Royale menu entry pointing to `/dashboard/royale`.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/RoyaleRouteIntegration.test.ts` passes 100%.
2. Full test suite `pnpm test` passes 100% (72 server + all client tests).
3. Monorepo linting `pnpm run lint` passes with 0 errors and 0 warnings.
4. Programmatic blast radius calculated and verified.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `CLEAN-1` completed at `8d11f84`.
* **Rollback Plan:** `git checkout -- packages/client/`
* **Point of No Return:** None (isolated client UI).
