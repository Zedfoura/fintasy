# Battle Plan — Mission AUTH-1: Resilient Backend Session Engine & Local Guest Authentication

**Mission:** `AUTH-1`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_backend_auth`  
**Target Files:**
- `packages/server/src/services/database/database.py` (Fallback store initialization)
- `packages/server/src/services/database/mixins/sessions.py` (In-memory session fallback)
- `packages/server/src/services/database/mixins/users.py` (In-memory user fallback & guest provision)
- `packages/server/src/routes/api/v1/sessions.py` (Guest endpoint & error resilience)
- `packages/server/tests/test_sessions.py` (New Pytest verification suite)

---

## 1. Concrete Execution Specification

### 1.1 In-Memory Fallback State in Database (`database.py` & mixins)
- In `Database`: initialize `_fallback_users: dict[str, dict]` and `_fallback_sessions: dict[str, str]` (token -> owner_uuid).
- Ensure a default demo user (`guest_trader`, UUID `00000000-0000-4000-8000-000000000001`, initial coins `1,500,000` integer cents) is provisioned in the fallback registry.
- In `UsersMixin`:
  - `get_user_by_username`: if `self.connectionPool is None`, look up in `_fallback_users`.
  - `get_user_by_uuid`: if `self.connectionPool is None`, look up in `_fallback_users`.
  - `create_user`: if `self.connectionPool is None`, store in `_fallback_users`.
- In `SessionsMixin`:
  - `create_session`: if `self.connectionPool is None`, generate UUID4 token and store in `_fallback_sessions`.
  - `get_session`: if `self.connectionPool is None`, lookup token in `_fallback_sessions`.
  - `delete_session`: if `self.connectionPool is None`, pop token from `_fallback_sessions`.

### 1.2 Guest Authentication Endpoint (`sessions.py`)
- Add `POST /api/v1/sessions/guest`:
  - Allocates or retrieves guest trader entity.
  - Generates an active session token.
  - Returns `SessionResponse(code=200, message="Ok", data=SessionData(owner=guest_uuid, token=session_token))`.
- Update `create_session` and `delete_session` with explicit exception handling so unhandled internal errors do not leak stack traces.

### 1.3 Server Verification Suite (`packages/server/tests/test_sessions.py`)
- Assay A: Guest session endpoint returns valid token and owner UUID with HTTP 200.
- Assay B: Session token verification via `get_session` succeeds.
- Assay C: Session deletion clears token and subsequent authenticate calls return 401.
- Assay D: Credential login with valid username/password creates session in fallback mode.
- Assay E: Credential login with non-existent user returns HTTP 404.
- Assay F: Credential login with invalid password returns HTTP 403.

---

## 2. Falsifiable Verification Assays
1. `pytest packages/server/tests/test_sessions.py` passes 100% (6+ assays).
2. Monorepo test suite `pnpm test` passes 100% with zero regressions.
3. `pnpm run lint` passes with zero formatting errors.
4. Programmatic blast radius calculation via `wargame-metaharness/src/scripts/get-blast-radius.ts` confirms impact bounded strictly to `["server"]`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `CLEAN-4` completed at `4fc23e1`.
* **Rollback Plan:** `git checkout -- packages/server/src/routes/api/v1/sessions.py packages/server/src/services/database/`
* **Point of No Return:** None.
