# Wargame ARC Probe — Mission THEME-2
## Dual-Theme Authentication Portal & High-Contrast Tab Overhaul

### 1. Grounded Action (Planned Action)
Refactor `packages/client/src/pages/login.vue` from a hardcoded dark cyberpunk card floating disconnectedly on light backgrounds into an adaptive dual-theme authentication portal. In light mode, provide a pristine Stripe/Linear-grade fintech aesthetic with a clean white/slate frosted card, high-contrast segment tabs (contrast ratio > 4.5:1), and crisp slate typography. In dark mode, preserve glowing cyberpunk terminal aesthetics.

### 2. Anticipated Reaction & Probes
- **Failure Mode 1: CSS specificity conflicts with Naive UI segment tabs rail and capsule.**
  - *Risk*: Naive UI internally applies inline or scoped styles to `.n-tabs-rail` and `.n-tabs-tab`.
  - *Probe*: Use scoped `:deep()` with `:global(.dark)` selectors and explicit `!important` overrides for rail background and tab text colors.
- **Failure Mode 2: Missing dark mode toggle propagation.**
  - *Risk*: Vue test or SSR environment might not have `.dark` class on root HTML.
  - *Probe*: Ensure light mode is the base CSS rule (`:deep(.n-tabs-rail) { background-color: #f1f5f9 !important; }`), and dark mode overrides via `:global(.dark) :deep(...)`.
- **Failure Mode 3: Regressions in existing Auth and Login form interactions.**
  - *Risk*: Changing template structure or class names breaks existing test selectors in `tests/LoginView.test.ts`.
  - *Probe*: Keep all `data-tab`, `data-type`, `@click`, `@keydown`, and input structure intact. Ensure all 5 existing assays pass, plus add assay F for dual-theme verification.

### 3. Counteraction & Safety Invariants
- Maintain 100% backward compatibility of `fintasy.login`, `fintasy.createUser`, and `state.loginAsGuest`.
- Preserve `$15,000.00 STARTING POT` tag invariant (`INV-1`).
- Blast radius strictly restricted to `packages/client`.
