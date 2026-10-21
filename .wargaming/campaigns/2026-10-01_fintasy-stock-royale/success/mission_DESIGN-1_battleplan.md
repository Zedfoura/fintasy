# Battle Plan — Mission DESIGN-1: Token Contract, Tri-Font Engine & UnoCSS Utility Shortcuts

**Mission:** `DESIGN-1`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `docs/design-system/`  
**Assigned Parallel Lane:** `lane_tokens`  
**Target Files:**
- `packages/client/src/styles/design-tokens.css` (Global CSS custom properties contract)
- `packages/client/unocss.config.ts` (UnoCSS font families and functional shortcuts)
- `packages/client/src/main.ts` (Import tokens stylesheet)
- `packages/client/tests/DesignTokens.test.ts` (Vitest test suite)

---

## 1. Concrete Execution Steps

### 1.1 Create `packages/client/src/styles/design-tokens.css`
- Codify the 4-tier surface elevation system:
  - `--fn-surface-canvas: #07090E;`
  - `--fn-surface-panel: #0E121B;`
  - `--fn-surface-card: #151C2B;`
  - `--fn-surface-float: #1D263B;`
  - `--fn-surface-hover: #232E47;`
- Codify hairline drafting boundary borders:
  - `--fn-border-subtle: rgba(255, 255, 255, 0.06);`
  - `--fn-border-default: rgba(255, 255, 255, 0.10);`
  - `--fn-border-focus: rgba(255, 255, 255, 0.28);`
- Codify functional telemetry accents:
  - `--fn-accent-orange: #FF5522;` (Action Horizon)
  - `--fn-accent-emerald: #10B981;` (Solvency / Safe Zone)
  - `--fn-accent-crimson: #F43F5E;` (Hazard / Storm Damage / Bust)
  - `--fn-accent-cyan: #06B6D4;` (10 Hz Telemetry)
  - `--fn-accent-indigo: #6366F1;` (Governance / Tournaments)

### 1.2 Update `packages/client/unocss.config.ts`
- WebFonts preset additions:
  - `sans`: `'Geist', 'DM Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - `mono`: `'Geist Mono', 'DM Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  - `serif`: `'Instrument Serif', 'DM Serif Display', Georgia, Cambria, 'Times New Roman', serif`
- Add functional shortcuts:
  - Surface containers: `fn-surface-canvas`, `fn-surface-panel`, `fn-surface-card`, `fn-surface-float`
  - Geometry: `fn-dot-matrix`, `fn-border-hairline`
  - Numeric invariants: `fn-mono-tabular`, `fn-chip-mono`, `fn-badge-numbered`
  - Action buttons: `fn-btn-primary`, `fn-btn-secondary`, `fn-btn-emerald`, `fn-btn-crimson`
  - Telemetry pulses: `fn-pulse-hazard`, `fn-pulse-warning`

### 1.3 Update `packages/client/src/main.ts`
- Add `import './styles/design-tokens.css'` immediately after UnoCSS reset.

### 1.4 Author `packages/client/tests/DesignTokens.test.ts`
- Assay A: Verifies `design-tokens.css` contains all 4-tier surface elevation variables and functional accent colors.
- Assay B: Verifies UnoCSS shortcuts generate the expected atomic utility classes.
- Assay C: Verifies typography rules enforce tabular numbers on `fn-mono-tabular`.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/DesignTokens.test.ts` passes 100%.
2. All 16 existing test suites pass (`pnpm --filter client test`).
3. Production client build succeeds (`pnpm --filter client build`).
4. Programmatic blast radius check confirms strictly `["client"]`.

---

## 3. Rollback Plan
- Revert `packages/client/unocss.config.ts` and `packages/client/src/main.ts` via `git checkout`.
- Remove `packages/client/src/styles/design-tokens.css` and `packages/client/tests/DesignTokens.test.ts`.
