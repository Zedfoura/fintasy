# Battle Plan — Mission THEME-4: 4-Pillar Showcase & Duel Simulator Dual-Theme Polish

## Mission Charter
- **Mission ID**: `THEME-4`
- **Objective**: Refactor `LandingGameplayPillars.vue` and `LandingDuelSimulator.vue` from static dark-mode components into adaptive dual-theme surfaces with crisp Stripe/Linear fintech styling in light mode and glowing cyberpunk styling in dark mode.
- **Required Stage**: CANONICAL
- **Upstream Dependency**: `THEME-3@canonical`
- **Subsystem**: `packages/client/src/components/landing/LandingGameplayPillars.vue`, `packages/client/src/components/landing/LandingDuelSimulator.vue`, `packages/client/tests/LandingPillars.test.ts`, `packages/client/tests/LandingDuelSimulator.test.ts`
- **Subagent Lane**: `lane_pillars_theme`

## Step-by-Step Implementation Sequence
1. **LandingGameplayPillars.vue Dual-Mode Overhaul**:
   - Section header: `text-slate-900 dark:text-white` title, `text-slate-600 dark:text-gray-400` subtitle.
   - Pillar cards: `border-slate-200 dark:border-[#1f2438] bg-white/95 dark:bg-[#0c0d14]/90 shadow-md dark:shadow-none hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(0,230,118,0.15)]`.
   - Card typography: `text-slate-900 dark:text-white` title, `text-slate-500 dark:text-gray-400` subtitle, `text-slate-600 dark:text-gray-300` description.
   - Metric box: `border-slate-200 dark:border-[#1f2438] bg-slate-50 dark:bg-[#121526]/80`.
   - Bullets list: `border-t border-slate-200 dark:border-[#1f2438] text-slate-600 dark:text-gray-400`.
2. **LandingDuelSimulator.vue Dual-Mode Overhaul**:
   - Section header: `text-slate-900 dark:text-white` title, `text-slate-600 dark:text-gray-400` description.
   - Arena card: `border-slate-200 dark:border-[#1f2438] bg-white/95 dark:bg-[#0c0d14]/95 shadow-xl dark:shadow-2xl`.
   - HUD banner: `border-b border-slate-200 dark:border-[#1f2438]`, `text-slate-900 dark:text-white` opponent name, `border-slate-200 dark:border-[#1f2438] bg-slate-50 dark:bg-[#121526]` ticker pill.
   - Sparkline chart container: `border-slate-200 dark:border-[#1f2438] bg-slate-50 dark:bg-[#08090f] shadow-inner`.
   - Position & P&L panel: `border-slate-200 dark:border-[#1f2438] bg-slate-50/90 dark:bg-[#121526]/80`, `border-y border-slate-200 dark:border-[#1f2438]` dividing rows.
   - Leverage buttons: dual-mode selected and unselected states.
   - Dynamic P&L text color class: `text-emerald-700 dark:text-[#00e676]` for gains, `text-rose-700 dark:text-[#ff1744]` for losses.
   - Victory outcome banner: adaptive dual-mode background and borders.
3. **Automated Verification**:
   - Run Vitest suites `LandingPillars.test.ts` and `LandingDuelSimulator.test.ts`.
   - Add dual-theme class assertions.
   - Verify programmatic blast radius: `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts`.
