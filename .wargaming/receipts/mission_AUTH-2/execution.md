# Execution Receipt — Mission AUTH-2: Client Authentication Store, Guest Session & Route Guards

**Mission:** `AUTH-2`  
**Required Evidence Stage:** `CANONICAL`  
**Actual Proven Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Lane:** `lane_client_auth`  
**Timestamp:** 2026-10-05T23:59:45-05:00  

---

## 1. Concrete Execution Actions

### 1.1 Composable Session & Token Engine (`packages/client/src/composables/api.ts`)
- Added `POST_SESSION_GUEST` to `API_QUERY` enum and `API_RESPONSE` mapping.
- Implemented `loginAsGuest(): Promise<API_RESPONSE[API_QUERY.POST_SESSION_GUEST]>` hitting `${API_BASE}/sessions/guest`.
- Exposed reactive `sessionToken`, `clearToken()`, and `setToken(token: string)` helpers.
- Enhanced `handleAuthErrors` to catch HTTP 403 Forbidden alongside 401 Unauthorized and 405 Method Not Allowed, clearing `sessionToken.value = ''`.
- Enhanced `handleErrors` to revoke token when status is 401 or 403.
- Removed unused dead functions to satisfy ESLint.

### 1.2 Reactive Pinia State Store Integration (`packages/client/src/stores/state.ts`)
- Augmented `UserState` interface with `isGuest?: boolean`.
- Added reactive authentication getters: `isAuthenticated` (requiring both token and user UUID) and `isGuest`.
- Added `loginAsGuest()` action invoking `fintasy.loginAsGuest()`, initializing `user.value.coins` strictly to `1,500,000` integer cents ($15,000 pot per `INV-1`), and executing `refreshAll()`.
- Added `logout()` action calling `fintasy.logout()` and purging user/portfolio state.
- Attached reactive watcher on `fintasy.authenticated` resetting store state upon token clearance.

### 1.3 Global Router Guard Module (`packages/client/src/modules/auth.ts`)
- Created `packages/client/src/modules/auth.ts` exporting:
  - `isPublicRoute(path: string): boolean`: whitelists `/`, `/login`, `/dashboard/help`, `/dashboard/help/*`, and non-dashboard routes.
  - `setupAuthGuard(router: Router)`: intercepts unauthenticated navigation targeting protected dashboard paths (`/dashboard`, `/dashboard/royale`, `/dashboard/trade`, `/dashboard/settings`, `/dashboard/tournaments`) and redirects to `/login?redirect=<fullPath>`.
  - Automatically redirects authenticated users away from `/login` to `/dashboard` or query target.
  - `install: UserModule`: automatically registered by `main.ts` module loader.

### 1.4 Target Path Retention in Login (`packages/client/src/pages/login.vue`)
- Updated authentication watcher to redirect to `(route.query.redirect as string) || '/dashboard'` rather than hardcoded `/dashboard`.

### 1.5 Exhaustive Vitest Verification Suite (`packages/client/tests/AuthStore.test.ts`)
Authored 7 falsifiable assays:
- **Assay A:** Persistent token hydration & reactive authentication state.
- **Assay B:** Instant guest login provisions session and $15,000 integer cent pot (`INV-1`).
- **Assay C:** Automatic token revocation and store teardown on 401/403 responses.
- **Assay D:** Public route classifier correctly identifies open vs protected paths.
- **Assay E:** Router guard intercepts unauthenticated users and preserves destination query.
- **Assay F:** Router guard permits authenticated navigation and redirects away from `/login`.
- **Assay G:** Explicit logout revokes token and wipes state.

---

## 2. Invariant & Blast Radius Verification

### 2.1 Programmatic Blast Radius Check
```bash
npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "packages/client/src/composables/api.ts,packages/client/src/stores/state.ts,packages/client/src/modules/auth.ts,packages/client/src/pages/login.vue,packages/client/tests/AuthStore.test.ts"
```
**Output:**
```json
["client"]
```

### 2.2 Financial Pot Invariant (`INV-1`)
- Checked integer cent representation: `state.user.coins === 1500000` ($15,000.00 starting capital).
- Verified `Number.isInteger(state.user.coins) === true`.

---

## 3. Cryptographic & Terminal Verification Proofs

### 3.1 Live Dev Server Curl Proof
```bash
curl -s -X POST http://localhost:3332/api/v1/sessions/guest
```
**Output:**
```json
{"code":200,"message":"Ok","data":{"owner":"00000000-0000-4000-8000-000000000001","token":"ce4abfcc-6982-4b8c-bb0d-6c459c465551"}}
```

### 3.2 Vitest Suite (`pnpm --filter client test tests/AuthStore.test.ts`)
```
✓ tests/AuthStore.test.ts (7 tests)
  ✓ assay A: persistent token hydration & reactive authentication state
  ✓ assay B: instant guest login provisions session and $15,000 integer cent pot (INV-1)
  ✓ assay C: automatic token revocation and store teardown on 401/403 responses
  ✓ assay D: public route classifier correctly identifies open vs protected paths
  ✓ assay E: router guard intercepts unauthenticated users and preserves destination query
  ✓ assay F: router guard permits authenticated navigation and redirects away from /login
  ✓ assay G: explicit logout revokes token and wipes state

Test Files  1 passed (1)
Tests       7 passed (7)
```

### 3.3 Full Monorepo Test Suite (`pnpm test`)
```
Test Files  9 passed (9)
Tests       57 passed (57) vitest + 80 passed pytest = 137 passed
```

### 3.4 Linter & Production Build
- `pnpm run lint`: 0 errors, 0 warnings.
- `pnpm --filter client build`: Built in 39.37s with exit code 0.
