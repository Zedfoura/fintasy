# Wargame ARC Specification — Mission DESIGN-1: Token Contract, Tri-Font Engine & UnoCSS Utility Shortcuts

**Mission ID:** `DESIGN-1`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `CANONICAL`  
**Flow Coverage:** `FLOW-THEME-NAVBAR`, `FLOW-ROYALE-GOLDEN`  
**Lane:** `lane_tokens`  

---

## 1. Action (Proposed State Mutation)

1. **Create `packages/client/src/styles/design-tokens.css`:**
   - Define CSS custom properties:
     - 4-Tier Surface Elevation: `--fn-surface-canvas` (`#07090E`), `--fn-surface-panel` (`#0E121B`), `--fn-surface-card` (`#151C2B`), `--fn-surface-float` (`#1D263B`), `--fn-surface-hover` (`#232E47`).
     - Hairline Boundaries: `--fn-border-subtle`, `--fn-border-default`, `--fn-border-focus`.
     - Chromatic Semantics: `--fn-accent-orange` (`#FF5522`), `--fn-accent-emerald` (`#10B981`), `--fn-accent-crimson` (`#F43F5E`), `--fn-accent-cyan` (`#06B6D4`), `--fn-accent-indigo` (`#6366F1`).
     - Typography Contrast: `--fn-text-primary` (`#F8FAFC`), `--fn-text-secondary` (`#94A3B8`), `--fn-text-muted` (`#64748B`).
2. **Update `packages/client/unocss.config.ts`:**
   - Web Fonts Preset: Add `Geist:400,500,600,700`, `Geist Mono:400,600,700,900`, and `Instrument Serif:400,400i`, keeping `DM Sans`, `DM Mono`, `DM Serif Display` as graceful fallbacks.
   - Shortcuts:
     - Surface containers: `fn-surface-canvas`, `fn-surface-panel`, `fn-surface-card`, `fn-surface-float`.
     - Drafting geometry: `fn-dot-matrix`, `fn-border-hairline`.
     - Typography & Chips: `fn-mono-tabular`, `fn-chip-mono`, `fn-badge-numbered`.
     - Action Buttons: `fn-btn-primary`, `fn-btn-secondary`, `fn-btn-emerald`, `fn-btn-crimson`.
     - Telemetry Hazard Pulses: `fn-pulse-hazard`, `fn-pulse-warning`.
     - Retain legacy shortcuts (`fn-icon-btn`, `fn-link`, `fn-outline`, `fn-hover`).
3. **Import `design-tokens.css` into `packages/client/src/main.ts`:**
   - Add `import './styles/design-tokens.css'` after CSS resets.
4. **Create Vitest test suite `packages/client/tests/DesignTokens.test.ts`:**
   - Verify that CSS custom properties load and resolve.
   - Verify that UnoCSS shortcuts compile expected utility rules.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)

- **R-1 (Webfont Loading Latency / FOUT):** If `Geist` or `Instrument Serif` fail to load from CDN in offline/test environments, tests or local dev could fail or flash font unstyled.
  - *Counteraction:* Include robust local system fallbacks (`ui-sans-serif, system-ui, -apple-system` for sans; `ui-monospace, SFMono-Regular, monospace` for mono; `Georgia, serif` for serif).
- **R-2 (UnoCSS Shortcut Name Collisions):** New shortcuts could collide with existing classes or break existing tests.
  - *Counteraction:* All new design system shortcuts use the strict `fn-` prefix namespace. No legacy shortcuts are modified or removed.
- **R-3 (Existing Test Suite Regression):** All 16 existing test suites (96 tests) must remain 100% green.
  - *Counteraction:* Run `pnpm --filter client test` before and after changes.

---

## 3. Counteraction & Gate Checks

- **C-1:** Zero breaking changes to legacy `--c-*` variables in `App.vue`.
- **C-2:** Programmatic blast radius check strictly outputs `["client"]`.
- **C-3:** Production client build (`pnpm --filter client build`) completes with exit code 0.
