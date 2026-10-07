# Wargame ARC Specification — Mission AUTH-3: Tactical Fintech/Cyberpunk Login UI & Form UX Overhaul

**Mission ID:** `AUTH-3`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `ACTIVATION`  
**Flow Coverage:** `FLOW-AUTH-LOGIN`  
**Lane:** `lane_tactical_ui`  

---

## 1. Action (Proposed State Mutation)
- Redesign `packages/client/src/pages/login.vue` with a tactical fintech/cyberpunk aesthetic matching Stock Royale:
  - Naive UI layout using `<n-card>`, `<n-tabs>`, `<n-tab-pane>`, `<n-form>`, `<n-input>`, `<n-button>`, `<n-alert>`, `<n-checkbox>`, `<n-tag>`.
  - Three dedicated operation modes:
    1. `login`: Standard trader credentials authentication with remember-me.
    2. `register`: New recruit account registration with live inline validation and password match checking.
    3. `guest`: Quick-play guest access deploying directly into trading with $15,000 starting pot (`INV-1`).
  - UX enhancers:
    - Real-time password reveal toggle (`show-password-on="click"`).
    - Caps-lock indicator detection and alert warning on keyboard events.
    - Reactive loading indicators on action buttons during async dispatch.
    - Target path retention preserving redirect query destinations.
- Author unit test suite `packages/client/tests/LoginView.test.ts`.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)
- **R-1 (Vite SSR/Hydration Issues with Naive UI):** In Vitest tests, Naive UI form components might require proper stubs or theme providers to avoid injection warnings or DOM mount crashes.
- **R-2 (Caps-lock State Desync):** Key event handlers might retain stale caps-lock warnings after navigation or blur.
- **R-3 (Double Submission):** Rapid clicking on submit buttons before async response arrives could initiate multiple concurrent session creation calls.

---

## 3. Counteraction (Hardened Mitigations & Guards)
- **C-1:** `LoginView.test.ts` mounts `login.vue` with robust stubs for Naive UI and router mocks, testing user interaction logic deterministically.
- **C-2:** Caps-lock state tracks native `KeyboardEvent.getModifierState('CapsLock')` on `keyup` and `keydown`, and clears on `blur`.
- **C-3:** Submission handlers enforce `loading.value` guards preventing duplicate dispatches.
