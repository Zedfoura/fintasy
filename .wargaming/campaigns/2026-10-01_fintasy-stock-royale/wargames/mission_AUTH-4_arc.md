# Wargame ARC Specification — Mission AUTH-4: End-to-End Authentication & Onboarding Verification

**Mission ID:** `AUTH-4`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `OUTCOME`  
**Flow Coverage:** `FLOW-AUTH-LOGIN`  
**Lane:** `lane_qa_auth`  

---

## 1. Action (Proposed State Mutation)
- Perform comprehensive end-to-end verification of Epic 7 Authentication revamp (`AUTH-1` through `AUTH-3`):
  1. Offline/development guest session provisioning on FastAPI (`/api/v1/sessions/guest`).
  2. Credential-based login, user registration, and 401/403 session revocation handling.
  3. Client Pinia state hydration and reactivity (`isAuthenticated`, `isGuest`).
  4. Global navigation router guard enforcing authentication on protected dashboard routes while keeping marketing and documentation public.
  5. Tactical fintech/cyberpunk UI with 3 operation modes (Operator Sign In, Enlist Trader, Quick Play Demo), caps-lock warning, and integer cent starting capital (`$15,000.00` = `1,500,000` cents, `INV-1`).
- Execute full monorepo test suite `pnpm test` (100% passing across server pytest and client vitest).
- Execute full codebase linter `pnpm run lint` (0 errors, 0 warnings).
- Validate live development daemon (`task-2767`) server and client endpoints via live curl requests.
- Verify programmatic blast radius across all Epic 7 mutations using `get-blast-radius.ts`.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)
- **R-1 (Cross-package Regression):** Changes in client auth or server session handling could break existing Stock Royale match flow (`RoyaleMatchFlow.test.ts`), radar map (`MarketRadarMap.test.ts`), or legacy server API suites.
- **R-2 (Blast Radius Hallucination):** Static file matching might underestimate or overestimate impacted packages.
- **R-3 (Dev Daemon Interruption):** Subprocess execution might inadvertently terminate the running `pnpm dev` daemon (`task-2767`).

---

## 3. Counteraction (Hardened Mitigations & Guards)
- **C-1:** Monorepo test harness runs all 10 test files (80 server pytest assays + 62 client vitest assays = 142 total assays) to guarantee zero regressions.
- **C-2:** Programmatic blast radius calculated natively using Nx graph tool `get-blast-radius.ts`.
- **C-3:** Live daemon `task-2767` health verified via HTTP status probes on `http://localhost:3332` and `http://localhost:3333`.
