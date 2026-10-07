# Battle Plan — Mission AUTH-3: Tactical Fintech/Cyberpunk Login UI & Form UX Overhaul

**Mission:** `AUTH-3`  
**Required Evidence Stage:** `ACTIVATION`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_tactical_ui`  
**Target Files:**
- `packages/client/src/pages/login.vue` (Cyberpunk Naive UI overhaul, 3-tab layout, caps-lock warning, loading states)
- `packages/client/locales/en.yml` (Any new localization strings if needed)
- `packages/client/tests/LoginView.test.ts` (New Vitest test suite)

---

## 1. Concrete Execution Specification

### 1.1 Tactical Login UI (`packages/client/src/pages/login.vue`)
- Wrap in high-contrast cyberpunk dark card with terminal branding:
  - Header: "STOCK ROYALE // TERMINAL ACCESS" with status badge.
  - Naive UI `<n-tabs>` with 3 tabs:
    - `login`: "OPERATOR SIGN IN"
    - `register`: "ENLIST TRADER"
    - `guest`: "QUICK PLAY DEMO"
- Form fields with Naive UI components:
  - Username / Email inputs with icons and inline status.
  - Password inputs with `show-password-on="click"` toggle and caps-lock detection on `@keydown` / `@keyup`.
  - Caps-lock warning banner when active.
  - Clear error alerts (`<n-alert type="error">`).
  - Loading buttons (`<n-button :loading="loading" ...>`) preventing duplicate clicks.
- Quick Play Guest Mode:
  - Feature banner explaining offline/guest session with starting capital: "$15,000 Starting Pot".
  - One-click "DEPLOY AS GUEST TRADER" button triggering `state.loginAsGuest()`.
- Route query target retention:
  - On auth success, redirects to `(route.query.redirect as string) || '/dashboard'`.

### 1.2 Verification Suite (`packages/client/tests/LoginView.test.ts`)
- Assay A: Mounts login page rendering branding header and all 3 tabs (Sign In, Register, Quick Play Demo).
- Assay B: Switching tabs updates active form view and renders respective fields.
- Assay C: Caps-lock detection triggers warning alert on caps-lock key event.
- Assay D: Guest quick-play button triggers guest login and redirects.
- Assay E: Form validation prevents submission when required credentials are missing.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/LoginView.test.ts` passes 100%.
2. Monorepo test suite `pnpm test` passes 100%.
3. `pnpm run lint` passes with 0 errors.
4. `pnpm --filter client build` passes with code 0.
5. Programmatic blast radius calculation confirms strictly `["client"]`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `AUTH-2` completed at `e87df74`.
* **Rollback Plan:** `git checkout -- packages/client/src/pages/login.vue && rm -f packages/client/tests/LoginView.test.ts`
* **Point of No Return:** None.
