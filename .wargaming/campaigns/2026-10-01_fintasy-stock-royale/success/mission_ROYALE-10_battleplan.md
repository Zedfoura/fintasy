# Battle Plan — Mission ROYALE-10: Real-Time WebSocket Client, Kill Feed Ticker & Post-Match Victory HUD

**Mission:** `ROYALE-10`  
**Required Evidence Stage:** `ACTIVATION`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `mmr_engine.py`, & `match_manager.py`  
**Assigned Parallel Lane:** `lane_tactical_ui`  
**Target Files:**
- `packages/client/src/types/royale.ts`
- `packages/client/src/composables/useRoyaleMatch.ts`
- `packages/client/src/components/royale/KillFeed.vue`
- `packages/client/src/components/royale/MatchVictoryModal.vue`
- `packages/client/tests/RoyaleMatchFlow.test.ts`

---

## 1. Concrete Execution Specification

### 1.1 Type Additions (`packages/client/src/types/royale.ts`)
* Export `RoyaleEventType`:
  `'MATCH_STATE' | 'LIQUIDATION' | 'STORM_TICK' | 'SECTOR_CLOSURE' | 'DUEL_START' | 'MATCH_OVER' | 'ERROR'`
* Export `LiquidationReason`:
  `'STORM' | 'MARGIN_CALL' | 'DUEL_LOSS' | 'TIMEOUT'`
* Export `LiquidationEventPayload`:
  * `victimUuid`: string
  * `victimUsername`: string
  * `killerUuid`?: string
  * `killerUsername`?: string
  * `reason`: LiquidationReason
  * `bountyCents`: number
  * `sector`: string
  * `placement`: number
* Export `StormTickEventPayload`:
  * `roundNumber`: number
  * `damageRateCentsPerSec`: number
  * `damagedPlayerUuids`: string[]
  * `affectedSectors`: string[]
* Export `SectorClosureEventPayload`:
  * `roundNumber`: number
  * `collapsedSector`: string
  * `remainingSafeSectors`: string[]
* Export `MatchOverEventPayload`:
  * `matchId`: string
  * `winnerUuid`: string
  * `winnerUsername`: string
  * `finalPlacements`: Array<{ uuid: string, username: string, placement: number, kills: number, netProfitCents: number }>
  * `userResult`?: MatchRankResult
* Export `RankTier`:
  `'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'CHAMPION' | 'GRAND_CHAMPION' | 'SUPERSONIC_LEGEND'`
* Export `RankDivision`: `'I' | 'II' | 'III'`
* Export `MatchRankResult`:
  * `oldRankTier`: RankTier
  * `oldDivision`: RankDivision
  * `oldRp`: number
  * `newRankTier`: RankTier
  * `newDivision`: RankDivision
  * `newRp`: number
  * `rpDelta`: number
  * `placement`: number
  * `placementBonusRp`: number
  * `kills`: number
  * `killBonusRp`: number
  * `netProfitCents`: number
  * `profitBonusRp`: number
  * `isPromotion`: boolean
  * `isDemotion`: boolean
* Export `KillFeedItem`:
  * `id`: string
  * `type`: RoyaleEventType
  * `title`: string
  * `description`: string
  * `timestamp`: number
  * `severity`: `'info' | 'warning' | 'danger' | 'gold'`
  * `metadata`?: Record<string, unknown>
* Export `SpectatorTarget`:
  * `uuid`: string
  * `username`: string
  * `sector`: string
  * `equityCents`: number
  * `kills`: number
  * `status`: string

### 1.2 Real-Time Match Composable (`packages/client/src/composables/useRoyaleMatch.ts`)
* **Connection Lifecycle:** Manages `connectionStatus` (`'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR'`).
* **Socket Factory Support:** Accepts an optional socket factory parameter for test mocking.
* **Event Dispatcher:** Parses incoming JSON messages and updates reactive state:
  * `MATCH_STATE`: Updates `matchState` and `localPlayer`.
  * `LIQUIDATION`: Adds formatted entry to `killFeed`. If victim is local user, switches to spectator mode.
  * `STORM_TICK`: Adds warning to `killFeed` if local player is damaged.
  * `SECTOR_CLOSURE`: Adds sector collapse warning to `killFeed`.
  * `MATCH_OVER`: Populates `matchResult` and opens `isVictoryModalOpen`.
* **Spectator Controller (`FLOW-TACTICAL-SPECTATE`):**
  * Auto-activates when local player is `BUSTED`.
  * `survivingPlayers`: Computed list of alive participants.
  * `switchSpectatorTarget(directionOrUuid)`: Allows cycling or jumping to specific player.

### 1.3 Tactical Kill Feed Ticker (`packages/client/src/components/royale/KillFeed.vue`)
* **Visual Theme:** FM Dark Tactical command center floating widget (`bg-[#090d16]/90`, `border-[#1e293b]`, `font-mono`).
* **Display Elements:**
  * Liquidation card: `💥 [Killer] eliminated [Victim] (+$[Bounty])` or `☠️ [Victim] eliminated by Storm`.
  * Sector collapse card: `⚠️ [Sector] collapsed! Storm advancing!`.
  * Storm damage card: `⚡ [Player] taking $[Damage]/s storm damage`.
* **Behaviors:**
  * Auto-pruning to `maxItems` (default 6).
  * Auto-dismiss timers (default 6s).
  * Manual dismiss trigger.

### 1.4 Post-Match Victory & Rank Progression Modal (`packages/client/src/components/royale/MatchVictoryModal.vue`)
* **Celebration Banner:**
  * `#1 VICTORY ROYALE` golden crest when user placed 1st.
  * `DEFEAT / PLACEMENT #[N]` header when eliminated early.
* **Rocket League Ranked Progression Widget:**
  * Tier badge with rank name and division numeral (e.g. `GOLD II`).
  * Promotion glow banner when `isPromotion` is true.
  * Animated RP progress bar with `+XX RP` delta chip.
  * Point Breakdown table: Placement RP, Kill RP, Alpha Bonus RP.
* **Match Recap Grid:**
  * Placement, Kills, Net P&L (strictly from integer cents), Survival duration.
* **User Flow Actions:**
  * `playAgain`: Emits event to enter new matchmaking lobby.
  * `spectateMatch`: Emits event to return to spectator HUD if match is still running.
  * `exitMatch`: Emits event to return to dashboard.

---

## 2. Falsifiable Verification Assay (`packages/client/tests/RoyaleMatchFlow.test.ts`)

1. **Assay A (Composable Connection Lifecycle):** Connects with mock socket, validates state transitions (`CONNECTING -> CONNECTED -> DISCONNECTED`).
2. **Assay B (Match State Synchronization):** Dispatches `MATCH_STATE` message, verifies reactive properties updated.
3. **Assay C (Kill Feed Dispatching & Formatting):** Dispatches `LIQUIDATION` and `SECTOR_CLOSURE` events, validates kill feed item creation with integer-cent formatting.
4. **Assay D (Spectator Mode Activation):** Triggers local player liquidation; validates `isSpectating` toggles to `true` and initial spectator target is chosen.
5. **Assay E (Spectator Target Cycling):** Cycles spectator target via `switchSpectatorTarget('next')` and verifies active focus shifts.
6. **Assay F (KillFeed Component Mounting & Pruning):** Mounts `KillFeed.vue`, verifies rendering of events, severity badges, and auto-dismiss/max-items limits.
7. **Assay G (Match Over & Victory Modal Trigger):** Dispatches `MATCH_OVER` event, verifies victory modal opens and data is bound.
8. **Assay H (Victory Royale #1 Rendering):** Mounts `MatchVictoryModal.vue` with 1st place data; verifies golden Victory Royale banner and celebratory header.
9. **Assay I (Rocket League Ranked Progression Display):** Verifies rank badge, division roman numeral, RP progress bar, and point breakdown.
10. **Assay J (Rank Promotion Badge):** Passes `isPromotion = true`; verifies promotion badge and celebration text render.
11. **Assay K (Modal User Action Emits):** Verifies clicks on `playAgain`, `spectateMatch`, and `exitMatch` emit expected Vue events.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** All 80 monorepo tests pass (62 server + 18 client); git working directory clean at `218b166`.
* **Rollback Plan:** `git checkout -- packages/client/`
* **Points of No Return:** None (additive Vue components, composable, and types).
