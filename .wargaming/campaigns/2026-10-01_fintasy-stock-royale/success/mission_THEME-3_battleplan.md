# Battle Plan — Mission THEME-3: Landing Hero, Status Chips & Ticker Tape Dual-Theme Overhaul

## Mission Charter
- **Mission ID**: `THEME-3`
- **Objective**: Overhaul `packages/client/src/pages/index.vue` hero section, status chips, ticker tape, and tactical preview teaser card to provide WCAG AAA high-contrast typography and clean fintech cards in light mode while preserving cyberpunk neon terminal aesthetics in dark mode.
- **Required Stage**: CANONICAL
- **Upstream Dependency**: `THEME-1@canonical`, `THEME-2@canonical`
- **Subsystem**: `packages/client/src/pages/index.vue`, `packages/client/tests/LandingHero.test.ts`
- **Subagent Lane**: `lane_hero_theme`

## Step-by-Step Implementation Sequence
1. **Adaptive Headline & Subtitle Typography**:
   - Headline: `from-emerald-700 via-teal-700 to-cyan-800 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-gradient-to-r bg-clip-text text-transparent`.
   - Subtitle: `text-slate-600 dark:text-gray-300`.
2. **Dual-Mode Live Status Chips**:
   - Season chip: `border-emerald-300 dark:border-emerald-500/30 bg-emerald-100/80 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400`.
   - Other chips: `border-slate-200 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/40 text-slate-700 dark:text-gray-300`.
3. **CTA Group Light-Mode Polish**:
   - Deploy button: deep emerald primary button with responsive shadow.
   - Login button: `border-slate-300 dark:border-gray-700 bg-white dark:bg-transparent text-slate-800 dark:text-white`.
   - Paper trading text button: `text-slate-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400`.
4. **Adaptive Ticker Stream Tape**:
   - Container: `border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 shadow-sm`.
   - Symbols & Prices: `text-slate-900 dark:text-gray-200`, `text-slate-600 dark:text-gray-400`.
   - Green changes: `text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10`.
   - Red changes: `text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10`.
5. **Adaptive Tactical Arena Teaser Card**:
   - Outer card: `border-slate-200 dark:border-gray-700/60 bg-white/95 dark:from-gray-900/90 dark:to-gray-950/90 dark:bg-gradient-to-b shadow-xl dark:shadow-2xl`.
   - Left side copy: `text-slate-900 dark:text-gray-100` title, `text-slate-600 dark:text-gray-400` body, `bg-slate-100 dark:bg-gray-800/80 text-slate-700 dark:text-gray-300` tags.
   - Right side simulator teaser: `border-emerald-500/30 dark:border-emerald-500/20 bg-slate-50 dark:bg-gray-900/90`.
6. **Automated Verification**:
   - Update `packages/client/tests/LandingHero.test.ts` with assay F asserting dual-theme classes.
   - Run Vitest suite `pnpm --filter client test tests/LandingHero.test.ts`.
   - Run programmatic blast radius verification: `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts`.
