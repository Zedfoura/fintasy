# Fintasy Architecture & System Design

This document details the architectural decisions, design goals, and component topology powering the **Fintasy** platform.

---

## 1. Monorepo Architecture

Fintasy is structured as an integrated monorepo managed with `pnpm workspaces`. Storing both client and server applications in a single repository provides several key benefits:

- **Unified Development Lifecycle:** Coordinated changes across client UI components, API contracts, and server match mechanics can be authored, tested, and validated in atomic commits.
- **Shared Type Definitions & Schemas:** Client models closely mirror server Pydantic schemas and OpenAPI definitions, reducing schema drift.
- **Consistent Tooling:** Centralized linting, Git hooks, and automated testing run through root scripts.

The repository is partitioned into the following primary workspaces:

- `packages/client/`: Modern Vue 3 / Vite single-page application with PWA and desktop capabilities.
- `packages/server/`: High-performance Python FastAPI service with an in-memory battle royale match engine.
- `src-tauri/`: Tauri 2.0 native packaging layer providing desktop and Steam Deck execution.
- `docs/`: Architecture specifications and Jekyll static documentation site.

---

## 2. Frontend Architecture (`packages/client`)

The frontend delivers an ultra-responsive, zero-latency user experience suitable for both traditional financial analysis and fast-paced esports trading duels.

### 2.1 Design Goals

1. **Low Latency & High Responsiveness:** Real-time updates at up to 10 Hz without UI stutter or memory leaks.
2. **Multi-Form Factor Portability:** Seamless operation across desktop browsers, mobile devices, and handheld consoles (such as Steam Deck).
3. **Modularity & Reusability:** Clean component boundaries separating UI presentation from matchmaking and tick streaming state.
4. **Offline Resilience:** PWA service workers caching core static assets for rapid subsequent loading.

### 2.2 Framework & Tooling Selection

- **Vue 3 (Composition API & `<script setup>`):** Offers fine-grained reactivity and minimal runtime overhead compared to virtual DOM diffing heavy alternatives.
- **TypeScript:** Enforces strict compile-time types for financial balances, match state transitions, and trading order payloads.
- **Vite:** Delivers sub-second Hot Module Replacement (HMR) and optimized Rollup tree-shaken production bundles.
- **Naive UI:** A comprehensive Vue 3 component library built with performance in mind, providing accessible dark-mode UI elements.
- **UnoCSS:** An instant, atomic CSS engine providing lightweight styling with zero unused CSS bloat.
- **Pinia:** Centralized reactive state store managing user authentication, portfolio balances, and active session tokens.

### 2.3 Directory Structure

```
packages/client/src/
├── components/          # Reusable UI components (HUD, Arena, Radar Map, Modals)
├── composables/         # Stateful game hooks (useRoyaleMatch, useMarketTickStream)
├── layouts/             # Master layout wrappers (dashboard, default, auth)
├── modules/             # Auto-installed plugins (Pinia, i18n, router)
├── pages/               # File-based routing (Dashboard, Royale, Trade, Help)
└── styles/              # Global styles and UnoCSS presets
```

---

## 3. Backend Architecture (`packages/server`)

The backend coordinates persistent user accounts, paper trading tournaments, and the high-frequency in-memory battle royale simulation.

### 3.1 Design Goals

1. **Concurrent High-Throughput Processing:** Non-blocking async I/O handling multiple concurrent WebSocket streams and REST requests.
2. **Exact Financial Precision:** Strict integer-cent arithmetic eliminates floating-point drift across all cash accounts, buy/sell orders, and storm tick damage.
3. **Sub-100ms Lobby Orchestration:** Dynamic matchmaking capable of filling and transitioning 60-trader lobbies near instantaneously.
4. **Deterministic Simulation:** Seeded tick generation for consistent testing and auditability.

### 3.2 Framework & Language Selection

- **Python 3.11+:** Selected for its mature scientific computing ecosystem, rapid development speed, and modern asynchronous features (`asyncio`).
- **FastAPI:** Built on Starlette and Pydantic, FastAPI provides native asynchronous request processing, automatic OpenAPI/Swagger documentation generation, and high serialization throughput.
- **Uvicorn:** Production-grade ASGI web server running the asynchronous event loop.

### 3.3 Core In-Memory Engines

- **`MatchManager` Service:** In-memory state machine orchestrating 60-trader lobbies, round timers, and active player registries without disk I/O bottlenecks.
- **10 Hz Market Tick Simulator:** Generates synthetic stock price feeds using Geometric Brownian Motion with sector correlation matrices and volatility regimes.
- **Zone Collapse Engine:** Enforces sector adjacency graphs and applies continuous storm tick damage ($/second) to players caught outside safe zones.
- **30-Second Duel Engine:** Resolves head-to-head trading battles with 1x–5x leverage and a strict 90% auto-liquidation margin safeguard.

### 3.4 Directory Structure

```
packages/server/src/
├── database/            # Database engine configuration and schema migrations
├── helpers/             # Business rule validators (user, portfolio, tournament)
├── models/              # SQLAlchemy ORM entities and Pydantic validation schemas
├── routes/              # FastAPI APIRouter endpoints (royale, quotes, users)
├── services/            # MatchManager, MarketSimulation, ZoneCollapse, Duels
└── main.py              # Application entrypoint and middleware orchestration
```

---

## 4. Database & Storage Architecture

### 4.1 Persistence Model

Fintasy employs a hybrid persistence model tailored to distinct operational workloads:

1. **Relational Database (PostgreSQL / SQLite):**

   - **Production:** PostgreSQL provides ACID compliance, strong transaction isolation, and robust concurrent connection pooling for user credentials, historical portfolios, and completed tournament records.
   - **Local Development & Testing:** Fast SQLite configuration allowing instantaneous test suite startup and isolated in-memory testing.

2. **Ephemeral In-Memory Match State:**
   - Active Stock Royale lobbies, real-time tick histories, player coordinates, and 30-second duel states reside entirely in memory for the duration of the match, guaranteeing microsecond state lookups.

### 4.2 Financial Integrity & Integer Cent Invariant (`INV-1`)

Floating-point arithmetic is explicitly forbidden for all monetary balances and prices. All currency fields are stored as 64-bit integer cents:

- `$15,000.00` starting pot = `1,500,000` integer cents.
- Storm tick damage of `$50.00/s` = `5,000` integer cents per second.
  This prevents precision loss or rounding discrepancies during high-frequency trading calculations.

---

## 5. API Design & OpenAPI Integration

- **Stateless RESTful Endpoints:** Standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) with JSON payloads and RFC-7807 error responses.
- **Interactive Documentation:** FastAPI automatically compiles and serves interactive OpenAPI specs at:
  - Swagger UI: `http://localhost:3332/docs`
  - ReDoc: `http://localhost:3332/redoc`
- **Static Schema:** Offline documentation is available in `docs/swagger.html` and `docs/assets/swagger.yaml`.
- **WebSocket Streaming:** Real-time bi-directional streaming for 10 Hz market ticks, storm phase notifications, kill-feed events, and duel orders.

---

## 6. Native Desktop & Steam Deck Runtime (`src-tauri`)

To bring Fintasy to desktop gamers and handheld console users, the application integrates Tauri 2.0:

- **Lightweight Binary Footprint:** Utilizes the host OS webview rather than embedding a bulky Chromium distribution.
- **Rust Backend:** The Tauri Core in `src-tauri/` manages window chrome, native file system caching, and gamepad events.
- **Steamworks SDK Bridge:** Prepared integration hooks for Steam Achievements, Steam Cloud Saves, and Steam Rich Presence via `steamworks-rs`.
- **Controller Friendly:** Designed for Steam Deck's 1280x800 resolution with full gamepad navigation.

---

## 7. Design System & Visual Foundations

The visual language of Fintasy is documented in the **[Fintasy Design System Guide](design-system/README.md)**. Grounded in blueprint drafting physics, financial telemetry invariants, and cognitive triage, the system ensures all interfaces remain readable and purposeful:

- **[00. The 10 Principles of Dieter Rams](design-system/00-DIETER-RAMS-PRINCIPLES.md):** The core philosophical rubric: _Weniger, aber besser_ (Less, but better) applied to financial simulation, 10 Hz telemetry, and Stock Royale combat.
- **[01. Foundations & Chromatic Semantics](design-system/01-FOUNDATIONS.md):** Deep Midnight HUD (`#07090E`), surface elevation tiers, and strict semantic color mapping (Safety Orange for action horizons, Emerald for solvency, Crimson for storm damage).
- **[02. Typography & The Tabular Law](design-system/02-TYPOGRAPHY.md):** `Geist Mono` tabular numerical engine, `Geist Sans` UI structure, and `Instrument Serif` editorial gravity.
- **[03. Grid, Blueprint Surfaces & Geometry](design-system/03-GRID-AND-SURFACES.md):** Reticle crosshairs (`+`), bracket chips (`[ ... ]`), hairline boundaries, and tactile dot-matrix canvas.
- **[04. Component Architecture & Patterns](design-system/04-COMPONENTS.md):** The Atrium decision queue model, radial telemetry gauges, and split-screen combat arena HUD.
- **[05. Visual Telemetry & State Dynamics](design-system/05-TELEMETRY-AND-STATE.md):** Silent, luminescent feedback, warning pulse escalations, and 10 Hz stream health indicators.
- **[06. Code Implementation & UnoCSS Tokens](design-system/06-CODE-INTEGRATION.md):** Engineering guide, UnoCSS utility shortcuts, and CSS custom property contracts.
