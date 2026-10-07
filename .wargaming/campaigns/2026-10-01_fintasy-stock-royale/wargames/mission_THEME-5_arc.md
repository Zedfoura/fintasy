# Wargame ARC Probe — Mission THEME-5
## Social Proof, Leaderboard, FAQ & Footer Dual-Theme Polish

### 1. Grounded Action (Planned Action)
Refactor `LandingSocialProof.vue` and `LandingFooter.vue` to eliminate hardcoded dark styling, establishing clean, high-contrast fintech aesthetic in light mode while maintaining cyberpunk dark mode:
- Stats cards: `border-slate-200 dark:border-[#1f2438] bg-white/90 dark:bg-[#0c0d14]/80`.
- Apex Leaderboard: `border-slate-200 dark:border-[#1f2438] bg-white/95 dark:bg-[#0c0d14]/90`, with high-contrast text (`text-slate-900 dark:text-white` names, `text-cyan-700 dark:text-[#00e5ff]` MMR, `text-emerald-700 dark:text-emerald-400` win rates) and clean alternating rows in light mode.
- FAQ accordion: clean white cards `border-slate-200 dark:border-[#1f2438] bg-white/90 dark:bg-[#0c0d14]/80` with readable answers `text-slate-600 dark:text-gray-400`.
- Platform footer: `border-slate-200 dark:border-[#1f2438] bg-slate-100/90 dark:bg-[#07080d]` with slate brand typography and navigation links.

### 2. Anticipated Reaction & Probes
- **Failure Mode 1: Table text contrast failure in light mode.**
  - *Risk*: `text-gray-300`, `text-gray-400`, or `text-white` on white table rows.
  - *Probe*: Apply dual-mode tokens across all table cells (`text-slate-900 dark:text-white`, `text-slate-600 dark:text-gray-300`).
- **Failure Mode 2: Footer disappearing or clashing.**
  - *Risk*: Footer hardcoded to `#07080d` creates a jarring pitch-black bar at the bottom of an otherwise clean light-mode landing page.
  - *Probe*: Use `bg-slate-100/90 dark:bg-[#07080d] border-t border-slate-200 dark:border-[#1f2438]`.
- **Failure Mode 3: Test regression on existing Social Proof or Footer assertions.**
  - *Probe*: Run `LandingSocialProof.test.ts` asserting all existing assays pass, plus add assay F for dual-theme verification.

### 3. Counteraction & Safety Invariants
- Retain $15,000.00 starting pot invariant (`INV-1`), 60 traders, 100ms engine, 12 sectors.
- Maintain top 5 leaderboard roster and FAQ toggle mechanics.
- Blast radius strictly restricted to `packages/client`.
