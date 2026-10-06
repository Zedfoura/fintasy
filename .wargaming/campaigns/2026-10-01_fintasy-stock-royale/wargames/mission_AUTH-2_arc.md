# Wargame ARC Specification — Mission AUTH-2: Client Authentication Store, Guest Session & Route Guards

**Mission ID:** `AUTH-2`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `CANONICAL`  
**Flow Coverage:** `FLOW-AUTH-LOGIN`  
**Lane:** `lane_client_auth`  

---

## 1. Action (Proposed State Mutation)
- Upgrade `packages/client/src/composables/api.ts` with `POST_SESSION_GUEST` query, `loginAsGuest()` method, token management utilities (`clearToken`, `setToken`), and 401/403 auto-token revocation.
- Upgrade `packages/client/src/stores/state.ts` with reactive authentication getters (`isAuthenticated`, `isGuest`), `loginAsGuest()` hydration preserving integer cent pot (`1,500,000` cents), `logout()` session teardown, and watcher syncing auth state with `useAPI`.
- Create `packages/client/src/modules/auth.ts` establishing global router navigation guards: redirecting unauthenticated traffic destined for `/dashboard/*` to `/login?redirect=...`, while allowing public access to `/`, `/login`, and `/dashboard/help/*`.
- Update `packages/client/src/pages/login.vue` to respect `route.query.redirect` on successful authentication.
- Implement exhaustive Vitest verification suite `packages/client/tests/AuthStore.test.ts`.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)
- **R-1 (Stale Token Zombie State):** If local storage retains an expired or revoked UUID session token, unhandled 401/403 responses could cause infinite redirect loops or uncaught exceptions during route transitions.
- **R-2 (Public Route Accidental Interception):** Overly aggressive `/dashboard` pattern matching could inadvertently block public documentation routes like `/dashboard/help` or `/dashboard/help/faq`.
- **R-3 (Integer Cent Invariant Violation):** If guest session provisioning in client state initializes default balances with floating-point dollars (e.g. `15000.00` instead of `1500000`), financial invariant `INV-1` would fail downstream.
- **R-4 (Vitest Environment Clashes):** Direct manipulation of `localStorage` or `useStorage` in Vitest tests could bleed token state across independent test cases.

---

## 3. Counteraction (Hardened Mitigations & Guards)
- **C-1:** `handleAuthErrors` and `handleErrors` in `useAPI` actively wipe `sessionToken.value = ''` upon encountering HTTP 401 or HTTP 403, triggering Pinia reactive state reset and cleanly dropping route guards back to public login.
- **C-2:** `isPublicRoute` explicitly whitelists `/`, `/login`, and paths beginning with `/dashboard/help` before applying `/dashboard` route protection.
- **C-3:** `state.loginAsGuest()` strictly initializes coins to `1500000` integer cents, mirroring the server's fallback guest trader account.
- **C-4:** Test suite initializes clean Pinia and VueUse storage fixtures per test case with `beforeEach` isolation.
