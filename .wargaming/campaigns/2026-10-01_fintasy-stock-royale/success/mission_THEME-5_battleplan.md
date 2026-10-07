# Battle Plan — Mission THEME-5: Social Proof, Leaderboard, FAQ & Footer Dual-Theme Polish

## Mission Charter
- **Mission ID**: `THEME-5`
- **Objective**: Overhaul `LandingSocialProof.vue` and `LandingFooter.vue` into adaptive dual-theme surfaces with crisp Stripe/Linear fintech styling in light mode and cyberpunk dark mode.
- **Required Stage**: CANONICAL
- **Upstream Dependency**: `THEME-4@canonical`
- **Subsystem**: `packages/client/src/components/landing/LandingSocialProof.vue`, `packages/client/src/components/landing/LandingFooter.vue`, `packages/client/tests/LandingSocialProof.test.ts`
- **Subagent Lane**: `lane_footer_theme`

## Step-by-Step Implementation Sequence
1. **LandingSocialProof.vue Overhaul**:
   - Stats grid: `border-slate-200 dark:border-[#1f2438] bg-white/90 dark:bg-[#0c0d14]/80 shadow-sm`.
   - Stats labels: `text-slate-700 dark:text-gray-300`, desc `text-slate-500 dark:text-gray-400`.
   - Apex Leaderboard: `border-slate-200 dark:border-[#1f2438] bg-white/95 dark:bg-[#0c0d14]/90 shadow-xl dark:shadow-2xl`.
   - Table headers: `border-b border-slate-200 dark:border-[#1f2438] text-slate-500 dark:text-gray-400`.
   - Table body: `divide-slate-100 dark:divide-[#1f2438]/50`, rows `hover:bg-slate-50/80 dark:hover:bg-gray-800/20`.
   - Leaderboard typography: `text-slate-900 dark:text-white` names, `text-cyan-700 dark:text-[#00e5ff]` MMR, `text-emerald-700 dark:text-emerald-400` win rates.
   - FAQ accordion: `border-slate-200 dark:border-[#1f2438] bg-white/90 dark:bg-[#0c0d14]/80 shadow-xs`.
   - FAQ text: `text-slate-800 dark:text-gray-200` question, `text-slate-600 dark:text-gray-400` answer.
2. **LandingFooter.vue Overhaul**:
   - Footer shell: `border-t border-slate-200 dark:border-[#1f2438] bg-slate-100/90 dark:bg-[#07080d] text-slate-600 dark:text-gray-400`.
   - Brand typography: `text-slate-900 dark:text-white` name, `text-emerald-700 dark:text-emerald-400` badge.
   - Navigation links: `text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white`.
   - Bottom status line: `border-t border-slate-200 dark:border-[#1f2438]/50 text-slate-500 dark:text-gray-600`.
3. **Automated Verification**:
   - Update `packages/client/tests/LandingSocialProof.test.ts` with assay F verifying dual-theme classes.
   - Run Vitest suite: `pnpm --filter client test tests/LandingSocialProof.test.ts`.
   - Programmatically compute blast radius: `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts`.
