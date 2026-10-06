# Battle Plan — Mission AUTH-4: End-to-End Authentication & Onboarding Verification

**Mission:** `AUTH-4`  
**Required Evidence Stage:** `OUTCOME`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_qa_auth`  
**Target Verification Surfaces:**
- Server Session Engine (`packages/server/tests/test_sessions.py`)
- Client Auth Store & Router Guards (`packages/client/tests/AuthStore.test.ts`)
- Tactical Cyberpunk Login UI (`packages/client/tests/LoginView.test.ts`)
- Full Monorepo Regression Assays (`pnpm test`)
- Code Quality & Types (`pnpm run lint` & `pnpm --filter client build`)
- Live Runtime Probes (`http://localhost:3332/api/v1/sessions/guest`, `http://localhost:3333/`)

---

## 1. Concrete Execution Specification

### 1.1 Complete Monorepo Regression Run
- Execute `pnpm test` verifying 142 falsifiable assays:
  - 80 server unit tests in `packages/server/tests` (including sessions, quotes, users, transactions, tournaments, royale).
  - 62 client tests in `packages/client/tests` (including `AuthStore.test.ts`, `LoginView.test.ts`, `LandingHero.test.ts`, `RoyaleMatchFlow.test.ts`, `TradingDuelArena.test.ts`, `MarketRadarMap.test.ts`, `RoyaleRouteIntegration.test.ts`, `SteamDesktopBridge.test.ts`, `HelpGuideContent.test.ts`, `basic.test.ts`).

### 1.2 Monorepo Linter Validation
- Execute `pnpm run lint` ensuring 0 formatting, import, and lint errors across server (Ruff) and client (ESLint/UnoCSS).

### 1.3 Production Client Bundle Build
- Execute `pnpm --filter client build` asserting exit code 0 and valid PWA service worker and distribution chunk generation.

### 1.4 Live Daemon Verification
- Probe FastAPI backend on port 3332 (`POST /api/v1/sessions/guest`) confirming active guest session token allocation with owner UUID `00000000-0000-4000-8000-000000000001`.
- Probe Vite frontend on port 3333 (`GET /`) confirming HTTP 200 OK.

### 1.5 Blast Radius & Invariant Guarantees
- Confirm blast radius across entire Epic 7 mutations using `get-blast-radius.ts`.
- Verify financial invariant `INV-1`: 64-bit integer cents pot ($15,000 = `1,500,000` cents).

---

## 2. Falsifiable Verification Assays
1. 100% test pass rate across monorepo (`pnpm test`).
2. 0 lint errors (`pnpm run lint`).
3. 0 TypeScript build errors (`pnpm --filter client build`).
4. Live curl tests return HTTP 200 with valid payload.
5. Blast radius strictly bounded.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `AUTH-3` completed at `b521703`.
* **Rollback Plan:** `git checkout -- .wargaming/`
* **Point of No Return:** None.
