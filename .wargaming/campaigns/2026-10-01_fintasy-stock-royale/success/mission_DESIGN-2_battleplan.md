# Battle Plan — Mission DESIGN-2: Global Shell & 4-Tier Midnight HUD Elevation Refactor

**Mission:** `DESIGN-2`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `docs/design-system/`  
**Assigned Parallel Lane:** `lane_shell`  
**Target Files:**
- `packages/client/src/App.vue` (Global root theme variables and elevation bindings)
- `packages/client/src/components/navigation/NavBar.vue` (Deep Midnight header, hairline border, 10 Hz telemetry status dot)
- `packages/client/src/components/navigation/SideBar.vue` (Hairline boundary, Deep Midnight panel elevation)
- `packages/client/tests/ShellElevation.test.ts` (Vitest test suite verifying shell elevation and telemetry dot)

---

## 1. Concrete Execution Steps

### 1.1 Refactor `packages/client/src/App.vue`
- Update `<style>` block:
  - Bind root and dark CSS variables to `--fn-surface-canvas` (`#07090E`), `--fn-surface-panel` (`#0E121B`), `--fn-text-primary` (`#F8FAFC`), and `--fn-accent-emerald` (`#10B981`).
  - Maintain backward compatibility for `--c-bg`, `--c-fg`, `--c-text`, `--c-inverse`, `--c-accent`.

### 1.2 Refactor `packages/client/src/components/navigation/NavBar.vue`
- Add hairline boundary and panel elevation:
  - Header: `border-b border-white/10 bg-[#0E121B]/95 backdrop-blur-md`.
- Add 10 Hz telemetry status chip (`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 font-mono text-[10px] font-bold`).
- Ensure balance badge applies `font-mono tracking-tight tabular-nums`.

### 1.3 Refactor `packages/client/src/components/navigation/SideBar.vue`
- Update sider wrapper with `border-r border-white/10 bg-[#0E121B]`.

### 1.4 Author `packages/client/tests/ShellElevation.test.ts`
- Assay A: Verifies `App.vue` exports Deep Midnight canvas tokens.
- Assay B: Verifies `NavBar.vue` renders the 10 Hz telemetry status dot.
- Assay C: Verifies `NavBar.vue` displays portfolio balance with tabular monospace formatting.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/ShellElevation.test.ts` passes 100%.
2. Existing suite `packages/client/tests/NavBarTheme.test.ts` passes 100%.
3. Full test suite `npx vitest run packages/client/tests` passes 100% (all 18 test files).
4. Production build `npx vite build` in `packages/client` succeeds with exit code 0.
5. Programmatic blast radius check confirms strictly `["client"]`.

---

## 3. Rollback Plan
- Revert `App.vue`, `NavBar.vue`, and `SideBar.vue` via `git checkout`.
- Remove `packages/client/tests/ShellElevation.test.ts`.
