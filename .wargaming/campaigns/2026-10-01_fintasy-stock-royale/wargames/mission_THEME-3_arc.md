# Wargame ARC Probe — Mission THEME-3
## Landing Hero, Status Chips & Ticker Tape Dual-Theme Overhaul

### 1. Grounded Action (Planned Action)
Overhaul the hero section, live status chips row, ticker stream tape, and tactical preview teaser card in `packages/client/src/pages/index.vue` to eliminate washed-out light mode contrast issues. Establish high-contrast dual-theme typography (`from-emerald-700 via-teal-700 to-cyan-800 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400`), crisp dual-mode status chips with proper contrast ratios (> 4.5:1), and clean white fintech card shells with slate borders in light mode while preserving dark cyberpunk aesthetics.

### 2. Anticipated Reaction & Probes
- **Failure Mode 1: Headline gradient unreadable in light mode.**
  - *Risk*: Using neon greens or teals without dark equivalents washes out on white/light gray background `#ededed`.
  - *Probe*: Apply deep emerald (`emerald-700`), deep teal (`teal-700`), and cyan (`cyan-800`) in light mode, switching to neon `emerald-400`, `teal-300`, `cyan-400` under `.dark`.
- **Failure Mode 2: Ticker tape and teaser cards looking like floating black cutouts.**
  - *Risk*: Static dark background classes (`bg-gray-900/60`, `bg-gray-950`) creating visual jarring against light backgrounds.
  - *Probe*: Use `bg-white/90 dark:bg-gray-900/60 border-slate-200 dark:border-gray-800` to produce clean Linear/Stripe fintech surfaces in light mode.
- **Failure Mode 3: Breakage of existing Hero unit tests.**
  - *Risk*: Changing component classes or DOM structure breaks assertions in `packages/client/tests/LandingHero.test.ts`.
  - *Probe*: Maintain all existing class selectors (`.landing-hero-headline`, `.landing-hero-subtitle`, `.deploy-cta-btn`, `.login-cta-btn`, `.play-royale-nav-btn`) and add new assay F verifying dual-theme classes.

### 3. Counteraction & Safety Invariants
- Maintain 100% preservation of all CTA routing targets (`/dashboard/royale`, `/login`, `/dashboard`).
- Preserve invariant starting pot copy `$15,000 Starting Pot` and 60-player format.
- Blast radius strictly restricted to `packages/client`.
