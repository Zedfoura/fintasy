# Wargame ARC Probe — Mission THEME-4
## 4-Pillar Showcase & Duel Simulator Dual-Theme Polish

### 1. Grounded Action (Planned Action)
Refactor `packages/client/src/components/landing/LandingGameplayPillars.vue` and `packages/client/src/components/landing/LandingDuelSimulator.vue` from hardcoded dark-only colors to responsive dual-mode fintech aesthetics:
- Pillar cards: `border-slate-200 dark:border-[#1f2438] bg-white/95 dark:bg-[#0c0d14]/90 shadow-lg dark:shadow-none`.
- High-contrast typography: `text-slate-900 dark:text-white` titles, `text-slate-600 dark:text-gray-300` descriptions, `text-slate-500 dark:text-gray-400` metadata.
- Duel simulator card: `border-slate-200 dark:border-[#1f2438] bg-white/95 dark:bg-[#0c0d14]/95 shadow-xl dark:shadow-2xl`.
- Sparkline and HUD panels: `border-slate-200 dark:border-[#1f2438] bg-slate-50/90 dark:bg-[#08090f]`.
- Leverage selector buttons: adaptive light and dark contrast states.
- Victory banner: adaptive dual-mode gradient.

### 2. Anticipated Reaction & Probes
- **Failure Mode 1: CSS selector or attribute breaks during NCard or button class changes.**
  - *Risk*: Modifying classes might break `.pillar-card`, `[data-tab]`, `[data-leverage]`, `[data-action]`, or `[data-metric="pnl"]`.
  - *Probe*: Preserve all test data attributes and base class names (`pillar-card`, `pillar-tab`, `victory-banner`).
- **Failure Mode 2: Inadvertent color loss in sparkline SVG.**
  - *Risk*: SVG polyline strokes or gradient definitions fail in light mode.
  - *Probe*: Keep `#00e5ff` or high-visibility cyan for sparkline, compatible with both light and dark card backgrounds.
- **Failure Mode 3: Regressions in simulation math or timers.**
  - *Risk*: Changing script logic disrupts P&L computation or timer lifecycle.
  - *Probe*: Leave simulation tick math (`unrealizedPnl`, `stepPrice`, `enterPosition`, `setLeverage`) unchanged. Add dual-theme class verification assays.

### 3. Counteraction & Safety Invariants
- Retain $15,000 starting capital copy invariant (`INV-1`).
- Preserve all 4 pillars and 1x to 5x leverage multiplier support.
- Blast radius strictly restricted to `packages/client`.
