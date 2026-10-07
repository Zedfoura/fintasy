# Battle Plan — Mission AUTH-2: Client Authentication Store, Guest Session & Route Guards

**Mission:** `AUTH-2`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_client_auth`  
**Target Files:**
- `packages/client/src/composables/api.ts` (Guest API endpoint, token management, 401/403 revocation)
- `packages/client/src/stores/state.ts` (Reactive auth getters, guest login, integer cent pot, logout teardown)
- `packages/client/src/modules/auth.ts` (New global router guard module)
- `packages/client/src/pages/login.vue` (Target path retention on login)
- `packages/client/tests/AuthStore.test.ts` (New Vitest verification suite)

---

## 1. Concrete Execution Specification

### 1.1 API Composable Enhancements (`packages/client/src/composables/api.ts`)
- Add `POST_SESSION_GUEST` to `API_QUERY` enum and `API_RESPONSE` map.
- Implement `loginAsGuest(): Promise<API_RESPONSE[API_QUERY.POST_SESSION_GUEST]>` hitting `${API_BASE}/sessions/guest`.
- Expose `sessionToken`, `clearToken()`, and `setToken(token: string)` helpers.
- Expand `handleAuthErrors` to catch HTTP 403 Forbidden in addition to 401 and 405.
- Update `handleErrors` to revoke token when status is 401 or 403.

### 1.2 Pinia State Store Integration (`packages/client/src/stores/state.ts`)
- Expand `UserState` interface with `isGuest?: boolean`.
- Add reactive getters: `isAuthenticated` and `isGuest`.
- Add `loginAsGuest()` action updating `user.value` with guest UUID, `1500000` integer cents, and triggering `refreshAll()`.
- Add `logout()` action calling `fintasy.logout()` and resetting user and portfolio state.
- Add watcher on `fintasy.authenticated` resetting store user state when authentication lapses.

### 1.3 Route Guard Module (`packages/client/src/modules/auth.ts`)
- Export `isPublicRoute(path: string): boolean`:
  - Returns `true` for `/`, `/login`, and `/dashboard/help*`.
  - Returns `true` for non-dashboard paths.
  - Returns `false` for protected dashboard routes.
- Export `setupAuthGuard(router: Router)` and `install: UserModule`:
  - If unauthenticated user navigates to protected route -> redirect to `/login?redirect=<fullPath>`.
  - If authenticated user navigates to `/login` -> redirect to query redirect destination or `/dashboard`.

### 1.4 Login Route Redirection (`packages/client/src/pages/login.vue`)
- Retrieve `route = useRoute()`.
- Update watcher redirecting on authentication to navigate to `(route.query.redirect as string) || '/dashboard'`.

### 1.5 Vitest Verification Suite (`packages/client/tests/AuthStore.test.ts`)
- 7 comprehensive assays covering token hydration, guest login, 401/403 revocation, protected route guards, public route bypass, authenticated redirect, and explicit logout.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/AuthStore.test.ts` passes 100% across all assays.
2. Full test suite `pnpm test` passes 100% (130+ tests across server and client).
3. `pnpm run lint` passes with 0 errors and 0 warnings.
4. Programmatic blast radius calculation via `wargame-metaharness/src/scripts/get-blast-radius.ts` confirms impact bounded strictly to `["client"]`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `AUTH-1` completed at `d745a0f`.
* **Rollback Plan:** `git checkout -- packages/client/src/composables/api.ts packages/client/src/stores/state.ts packages/client/src/pages/login.vue && rm -f packages/client/src/modules/auth.ts packages/client/tests/AuthStore.test.ts`
* **Point of No Return:** None.
