# Battle Plan — Mission CLEAN-4: Root README & Technical Architecture Documentation Overhaul

**Mission:** `CLEAN-4`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_docs`  
**Target Files:**
- `README.md` (Complete Rewrite)
- `docs/index.md` (Complete Rewrite)

---

## 1. Concrete Execution Specification

### 1.1 Root README (`README.md`)
* Complete rewrite reflecting the full dual-mode platform:
  1. **Hero Title & Badges:** Fintasy — Competitive Paper Trading & Stock Royale Battle Platform. Badges for TypeScript, Vue 3, FastAPI, Python 3.11+, Tauri 2.0, Vite, pnpm.
  2. **Platform Highlights:**
     - Traditional Paper Trading: Portfolio tracking, watchlists, Alpaca API integration, simulated stock transactions.
     - Stock Royale Mode: 60-trader battle royale, 12 concentric market sectors, collapsing storm zones, 30s micro-trading duels, 1x–5x leverage, 90% auto-liquidation buffer, Rocket League MMR progression.
     - Dual Distribution: Modern PWA Web App and Native Desktop / Steam Deck (Tauri 2.0 with steamworks-rs bridge).
  3. **Architecture Overview:** High-level ASCII / Mermaid system diagram mapping Client (Vue 3, Naive UI, UnoCSS, Pinia), Server (FastAPI, in-memory match engine, 10 Hz tick generator, SQLite/PostgreSQL), and Desktop Bridge.
  4. **Quickstart & Setup:**
     - Prerequisites: Node.js 20+, pnpm 9+, Python 3.11+ (or Docker Dev Containers).
     - Environment setup (`.env.example` -> `.env.development`, `.env.production`).
     - Installation (`pnpm install`, server venv / dependencies).
     - Running the dev environment (`pnpm dev`, client at `http://localhost:3333`, server at `http://localhost:3332`).
  5. **Verification & Testing:**
     - Monorepo tests (`pnpm test` running Pytest + Vitest).
     - Linting and typechecks (`pnpm run lint`, `pnpm run typecheck`).
  6. **Native Desktop / Steam Deck:**
     - Dev mode (`pnpm desktop:dev`).
     - Release build (`pnpm desktop:build`).
  7. **API Documentation:** Interactive OpenAPI/Swagger reference at `http://localhost:3332/docs` and static docs at `docs/swagger.html`.
  8. **License & Contributing.**

### 1.2 Jekyll Architecture Docs (`docs/index.md`)
* Complete rewrite eliminating all `// todo` placeholders:
  1. Monorepo design and organization (`packages/client`, `packages/server`, `src-tauri`).
  2. Frontend Architecture: Vue 3, Vite, TypeScript, Naive UI, UnoCSS, PWA service worker, Pinia store management.
  3. Backend Architecture: FastAPI, asynchronous event loop, in-memory match engine (`MatchManager`), deterministic 10 Hz tick generator (GBM), and integer-cent currency precision model.
  4. Database & Storage Architecture: Dual SQL model (PostgreSQL for production persistence, SQLite/in-memory for development and tests).
  5. API Design: RESTful endpoints with OpenAPI schemas, WebSocket streaming for real-time market ticks and match state events.

---

## 2. Falsifiable Verification Assays
1. Programmatic blast radius calculation via `wargame-metaharness/src/scripts/get-blast-radius.ts`.
2. Linter & Prettier validation (`pnpm run lint`) returns 0 errors.
3. Test suite (`pnpm test`) continues to pass 100% (117+ tests).
4. Content inspection confirming zero `// todo` occurrences in `docs/index.md`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `CLEAN-3` completed at `9cd89f7`.
* **Rollback Plan:** `git checkout -- README.md docs/index.md`
* **Point of No Return:** None.
