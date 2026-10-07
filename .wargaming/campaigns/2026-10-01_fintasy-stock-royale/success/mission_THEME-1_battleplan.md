# Battle Plan — Mission THEME-1: Sticky Glassmorphic Navbar & Brand Identity Revamp

**Mission:** `THEME-1`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_navbar_ui`  
**Target Files:**
- `packages/client/src/components/navigation/HomeNav.vue` (Overhauled sticky glassmorphic navigation header)
- `packages/client/tests/NavBarTheme.test.ts` (Vitest test suite)

---

## 1. Concrete Execution Specification

### 1.1 Sticky Glassmorphic Navigation Component (`HomeNav.vue`)
- Structure:
  - Header Wrapper: `sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 dark:bg-[#0c0d14]/85 border-b border-slate-200/80 dark:border-[#1f2438] transition-colors duration-200 shadow-sm dark:shadow-none`.
  - Inner Navigation Container: `mx-auto max-w-7xl flex items-center justify-between px-4 py-3 sm:px-6`.
  - Left Section (Brand):
    - RouterLink to `/`
    - High-tech logo badge with Crosshair icon (`h-9 w-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center`).
    - Logo Typography: `font-mono font-black text-xl tracking-tight text-slate-900 dark:text-white`.
    - Season Badge: `BETA S1` (`hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#121526] text-slate-600 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/20`).
  - Middle / Right Navigation Links:
    - `Home` (`/`) and `Dashboard` (`/dashboard`) links styled with pill hover effects (`px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/50 transition-all`).
  - High-Contrast Dual-Theme "Play Royale" Button:
    - Class: `.play-royale-nav-btn`.
    - Light mode: Deep emerald background (`bg-emerald-600 text-white font-mono font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700`).
    - Dark mode: Neon emerald background (`dark:bg-[#00e676] dark:text-black dark:font-black dark:shadow-[0_0_20px_rgba(0,230,118,0.35)] dark:hover:bg-[#00c853]`).
    - Route: Navigates to `/dashboard/royale`.
  - Controls Container:
    - Rounded pill housing `LanguageSwitch` and `ThemeSwitch`.

### 1.2 Vitest Test Suite (`NavBarTheme.test.ts`)
- Assay A: Mounts `HomeNav.vue`, asserting sticky glassmorphic container classes and brand identity elements (`Fintasy`, `BETA S1`).
- Assay B: Verifies navigation links for Home and Dashboard point to `/` and `/dashboard`.
- Assay C: Verifies `.play-royale-nav-btn` CTA button renders with dual-theme classes and triggers router push to `/dashboard/royale`.
- Assay D: Verifies theme switch and language switch components are present.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/NavBarTheme.test.ts` passes 100%.
2. Existing test suite `packages/client/tests/LandingHero.test.ts` passes 100% without regressions.
3. Full test suite `pnpm --filter client test` passes 100%.
4. Programmatic blast radius check confirms strictly `["client"]`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `LANDING-5` at `outcome`.
* **Rollback Plan:** `git checkout -- packages/client/src/components/navigation/HomeNav.vue && rm -f packages/client/tests/NavBarTheme.test.ts`
* **Point of No Return:** None.
