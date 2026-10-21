# Battle Plan — Mission DESIGN-3: Stock Royale Arena & Combat HUD Action Horizon Polish

**Mission:** `DESIGN-3`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `docs/design-system/`  
**Assigned Parallel Lane:** `lane_combat_hud`  
**Target Files:**
- `packages/client/src/components/royale/TradingDuelArena.vue`
- `packages/client/src/components/royale/MarketRadarMap.vue`
- `packages/client/tests/TradingDuelArena.test.ts`
- `packages/client/tests/MarketRadarMap.test.ts`

---

## 1. Concrete Execution Steps

### 1.1 Refactor `packages/client/src/components/royale/TradingDuelArena.vue`
1. **4-Tier Surface Elevation:**
   - Container root: `bg-[#07090E] border border-white/10`.
   - Terminal panels (left & right): `bg-[#0E121B] border border-white/10`.
   - Active position card & Order entry card: `bg-[#151C2B] border border-white/10`.
   - Canvas wrapper: `bg-[#07090E] border border-white/10`.
2. **Action Horizon Countdown Clock & Progress Bar:**
   - Clock text classes:
     - $>10\text{s}$: `text-cyan-400 font-mono tabular-nums`
     - $\le 10\text{s}$ and $>3\text{s}$: `text-[#FF5522] animate-pulse font-mono tabular-nums`
     - $\le 3\text{s}$: `text-rose-500 animate-pulse font-mono tabular-nums`
   - Progress bar fill classes:
     - $>10\text{s}$: `bg-cyan-400`
     - $\le 10\text{s}$ and $>3\text{s}$: `bg-[#FF5522] animate-pulse`
     - $\le 3\text{s}$: `bg-rose-500 animate-pulse`
3. **Graduated Auto-Liquidation Margin Meter:**
   - Depletion percentage meter fill:
     - $0-50\%$: `bg-emerald-500`
     - $50-69\%$: `bg-amber-400`
     - $\ge 70\%$ and $<85\%$: `bg-[#FF5522] animate-pulse`
     - $\ge 85\%$: `bg-rose-500 animate-pulse`
   - Warning banner: `border border-[#FF5522] bg-[#FF5522]/15 text-[#FF5522]` with `data-test="liquidation-warning"`.
4. **Bracketed Leverage Selector Chips:**
   - Render each leverage button with `[ 1x ]`, `[ 2x ]`, `[ 5x ]` bracket notation.
   - Active state: `border border-cyan-400 bg-cyan-500 text-slate-950 font-black`.
   - Inactive state: `border border-white/10 bg-[#0E121B] text-slate-300 hover:bg-white/10`.
5. **Execution Action Buttons:**
   - BUY LONG: `border border-emerald-500/80 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300`.
   - SELL SHORT: `border border-rose-500/80 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300`.

### 1.2 Refactor `packages/client/src/components/royale/MarketRadarMap.vue`
1. **4-Tier Surface Elevation:**
   - Root container: `bg-[#07090E] border border-white/10`.
   - Canvas wrapper: `bg-[#07090E] border border-white/10`.
   - Sector quick grid cards: `bg-[#0E121B] border border-white/10`.
2. **Action Horizon Countdown:**
   - Timer countdown text: `text-cyan-400 font-mono tabular-nums` when $>10\text{s}$, `text-[#FF5522] animate-pulse font-mono tabular-nums` when $\le 10\text{s}$.
3. **Canvas Tactical Grid:**
   - Concentric rings: `rgba(255, 255, 255, 0.1)`.
   - Reticle crosshairs: `rgba(255, 255, 255, 0.1)`.

### 1.3 Update Assays & Verification
1. Run `npx vitest run tests/TradingDuelArena.test.ts tests/MarketRadarMap.test.ts` from `packages/client`.
2. Add dedicated test assertions verifying Action Horizon color transitions and bracketed leverage formatting.
3. Run full client suite (`npx vitest run tests`).
4. Run `npx vite build` from `packages/client`.
5. Run `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "packages/client/src/components/royale/TradingDuelArena.vue,packages/client/src/components/royale/MarketRadarMap.vue"`.

---

## 2. Falsifiable Verification Assays
1. Vitest tests for both components pass 100%.
2. Full test suite (all 18 test files) passes 100%.
3. Vite build exits 0.
4. Programmatic blast radius returns strictly `["client"]`.

---

## 3. Rollback Plan
- Restore previous component files via git checkout if any regression occurs.
