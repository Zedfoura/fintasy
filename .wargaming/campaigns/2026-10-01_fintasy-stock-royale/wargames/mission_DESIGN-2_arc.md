# Wargame ARC Specification — Mission DESIGN-2: Global Shell & 4-Tier Midnight HUD Elevation Refactor

**Mission ID:** `DESIGN-2`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `CANONICAL`  
**Flow Coverage:** `FLOW-THEME-NAVBAR`, `FLOW-AUTH-LOGIN`  
**Lane:** `lane_shell`  

---

## 1. Action (Proposed State Mutation)

1. **Refactor `packages/client/src/App.vue`:**
   - Update baseline root CSS variables to map directly to the 4-tier elevation system:
     - `--c-bg: var(--fn-surface-canvas, #07090E);`
     - `--c-fg: var(--fn-surface-panel, #0E121B);`
     - `--c-text: var(--fn-text-primary, #F8FAFC);`
     - `--c-inverse: #ededed;`
     - `--c-accent: var(--fn-accent-emerald, #10B981);`
   - Dark theme variables map to `#07090E` (canvas) and `#0E121B` (panels) to guarantee unified deep midnight aesthetic.
2. **Refactor `packages/client/src/components/navigation/NavBar.vue`:**
   - Apply hairline border `border-b border-white/10` and elevation background `bg-[#0E121B]/95 backdrop-blur-md`.
   - Add live 10 Hz telemetry status dot (`● 10 Hz | 14ms`) with emerald indicator.
   - Refactor balance badge to enforce tabular numbers (`fn-mono-tabular font-mono`).
3. **Refactor `packages/client/src/components/navigation/SideBar.vue`:**
   - Apply hairline border `border-r border-white/10` and elevation background `bg-[#0E121B]`.
   - Add reticle crosshair (`+`) and crisp uppercase mono section labels.
4. **Update `packages/client/tests/NavBarTheme.test.ts` & create `ShellElevation.test.ts`:**
   - Verify that `NavBar.vue` renders the live 10 Hz telemetry status badge and tabular balance.
   - Verify that `App.vue` root variables bind to the Deep Midnight elevation tokens.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)

- **R-1 (Naive UI Theme Inversion Conflict):** Naive UI uses its own internal theme vars (`n-layout-header`, `n-layout-sider`). If these clash with `--c-bg`, unintended white backgrounds or borders could appear.
  - *Counteraction:* Target classes explicitly with `fn-surface-panel` and hairline borders on the layout wrappers.
- **R-2 (Mobile / Narrow Viewport Overflow):** Adding the 10 Hz telemetry dot could crowd breadcrumbs or user profile on mobile screens.
  - *Counteraction:* Wrap the 10 Hz telemetry chip in `hidden lg:flex`, keeping mobile layout clean.
- **R-3 (Test Regressions in `NavBarTheme.test.ts`):** `NavBarTheme.test.ts` checks for navigation links and language/theme switch.
  - *Counteraction:* Retain all existing test IDs, classes, and slot structures.

---

## 3. Counteraction & Gate Checks

- **C-1:** `npx vitest run packages/client/tests` passes 100% (all 17+ test files).
- **C-2:** `npx vite build` in `packages/client` completes with exit code 0.
- **C-3:** Programmatic blast radius check strictly confirms `["client"]`.
