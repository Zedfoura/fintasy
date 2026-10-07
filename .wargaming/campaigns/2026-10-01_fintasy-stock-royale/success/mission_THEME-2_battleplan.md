# Battle Plan — Mission THEME-2: Dual-Theme Authentication Portal & High-Contrast Tab Overhaul

## Mission Charter
- **Mission ID**: `THEME-2`
- **Objective**: Overhaul `packages/client/src/pages/login.vue` into a responsive, dual-theme authentication portal with high-contrast tab controls, adaptive card background, readable form labels, and ambient depth in both light and dark modes.
- **Required Stage**: CANONICAL
- **Upstream Dependency**: `THEME-1@canonical`
- **Subsystem**: `packages/client/src/pages/login.vue`, `packages/client/tests/LoginView.test.ts`
- **Subagent Lane**: `lane_auth_ui`

## Step-by-Step Implementation Sequence
1. **Adaptive Container & Ambient Backgrounds**:
   - Wrap login viewport in a relative container with subtle dual-mode ambient glows (`bg-emerald-500/5 dark:bg-[#00e676]/10` and `bg-cyan-500/5 dark:bg-[#00e5ff]/5`).
2. **Dual-Mode NCard Shell**:
   - Update `NCard` class with adaptive tokens: `border-slate-200 dark:border-[#1f2438] bg-white/95 dark:bg-[#0c0d14]/95 shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl rounded-2xl`.
3. **High-Contrast Typography & HUD**:
   - Title: `text-slate-900 dark:text-white`.
   - Subtitle: `text-emerald-600 dark:text-[#00e5ff]`.
   - Labels & helper copy: `text-slate-600 dark:text-gray-400`.
4. **Segment Tabs Theming**:
   - Rail background: `#f1f5f9` in light mode, `#121526` in dark mode.
   - Inactive tabs: `#475569` (slate-600) in light mode, `#94a3b8` (slate-400) in dark mode.
   - Active tab capsule: pure white card with subtle shadow in light mode, `#1c2236` in dark mode.
   - Active tab text: `#0f172a` (slate-900) in light mode, `#00e676` in dark mode.
5. **Guest Quick-Play Box**:
   - High-contrast text: `text-slate-900 dark:text-white` for title, `text-slate-600 dark:text-gray-400` for description.
6. **Automated Verification**:
   - Update `packages/client/tests/LoginView.test.ts` with assay F verifying adaptive dual-theme classes.
   - Run Vitest suite `pnpm --filter client test tests/LoginView.test.ts`.
   - Programmatically compute blast radius via `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts`.
