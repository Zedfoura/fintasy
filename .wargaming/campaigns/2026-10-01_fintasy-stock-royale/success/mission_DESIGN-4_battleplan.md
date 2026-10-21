# Battle Plan — Mission DESIGN-4: Atrium Decision Queue & Dashboard Telemetry Integration

**Mission:** `DESIGN-4`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `docs/design-system/`  
**Assigned Parallel Lane:** `lane_dashboard`  
**Target Files:**
- `packages/client/src/components/dashboard/DecisionQueue.vue` (New Atrium-style cognitive triage component)
- `packages/client/src/pages/dashboard/index.vue` (Dashboard layout integration)
- `packages/client/tests/DecisionQueue.test.ts` (Vitest unit test suite)

---

## 1. Concrete Execution Steps

### 1.1 Create `packages/client/src/components/dashboard/DecisionQueue.vue`
1. Define `DecisionQueueItem` interface:
   - `id: string`
   - `title: string`
   - `symbol?: string`
   - `category: 'DUEL' | 'MARGIN' | 'TOURNAMENT' | 'SYSTEM'`
   - `urgency: 'CRITICAL' | 'WARNING' | 'INFO'`
   - `badgeText: string`
   - `timestamp: string`
   - `actionPrimaryText: string`
   - `actionSecondaryText?: string`
   - `payload?: Record<string, any>`
2. Styling:
   - Container: `fn-surface-panel` (`bg-[#0E121B] border border-white/10 rounded-lg p-3 text-slate-100 font-mono`).
   - Header with active urgency counter badge in International Safety Orange (`#FF5522`):
     - `NEEDS YOUR DECISION [ 3 ]`
   - Action buttons:
     - Secondary button: hairline outline `fn-btn-secondary` (`border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10`).
     - Primary button: high-contrast filled button:
       - `CRITICAL` (Duel): Safety Orange `fn-btn-primary` (`bg-[#FF5522] border border-[#FF5522] text-white`).
       - `WARNING` (Margin): Amber filled button (`bg-amber-600 border border-amber-500 text-white`).
       - `INFO` (Tournament): Solvency Emerald filled button `fn-btn-emerald` (`bg-emerald-600 border border-emerald-500 text-white`).

### 1.2 Integrate into `packages/client/src/pages/dashboard/index.vue`
1. Import `DecisionQueue.vue` and render it above the split chart/history layout.
2. Provide realistic pending triage items (active 30s duel challenge from ScalperBot_1, margin alert on NVDA position approaching 75%, tournament invitation) with fallback to empty state when resolved.

### 1.3 Author `packages/client/tests/DecisionQueue.test.ts`
1. Assay A: Render component with default mock items, verify title and item count.
2. Assay B: Verify Safety Orange counter badge and item category chips.
3. Assay C: Verify empty state rendering when zero items are queued.
4. Assay D: Verify clicking Accept and Decline buttons emits respective events with item ID and payload.

---

## 2. Falsifiable Verification Assays
1. Vitest test `packages/client/tests/DecisionQueue.test.ts` passes 100%.
2. Full test suite (all 19 client test files) passes 100%.
3. Vite build exits 0.
4. Programmatic blast radius strictly returns `["client"]`.

---

## 3. Rollback Plan
- Delete `DecisionQueue.vue` and `DecisionQueue.test.ts`.
- Revert `packages/client/src/pages/dashboard/index.vue`.
