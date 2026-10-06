# Fintasy

<p align="center">
  <a href="https://github.com/Zedfoura/fintasy">
    <img src="docs/assets/logo.png" alt="Fintasy Logo" height="192">
  </a>
</p>

<h3 align="center"><strong>A Competitive Paper Trading & Stock Royale Battle Platform</strong></h3>

<p align="center">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white">
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat&logo=vuedotjs&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11%2B-3776AB?style=flat&logo=python&logoColor=white">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-2.0-FFC131?style=flat&logo=tauri&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5.3-646CFF?style=flat&logo=vite&logoColor=white">
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-9.4-F69220?style=flat&logo=pnpm&logoColor=white">
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quickstart">Quickstart</a> •
  <a href="#testing--verification">Testing</a> •
  <a href="#desktop--steam-deck">Desktop & Steam Deck</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#monorepo-structure">Monorepo Structure</a>
</p>

---

## Overview

**Fintasy** blends realistic financial market simulation with high-intensity esports mechanics. It functions both as an educational, zero-risk **Paper Trading Platform** (integrated with real market quotes via Alpaca Markets) and as **Stock Royale**, a 60-trader battle royale where players duel over high-frequency price feeds, flee shrinking market sector storms, and compete for top Rocket League-style MMR rankings.

All currency transactions adhere to a strict **integer-cent accounting invariant** ($15,000.00 starting pot represented internally as `1,500,000` cents) guaranteeing exact, drift-free financial balances across all games and simulations.

---

## Features

### ⚔️ Stock Royale Mode

- **60-Trader Matchmaking:** Rapid in-memory lobbies with sub-100ms transitions and automated archetype bot filling (Momentum, Mean Reversion, Breakout, Scalper).
- **12-Sector Concentric Topography:** Sector rings (Outer: Utilities, Materials, Industrials, Real Estate; Mid: Healthcare, Financials, Energy, Consumer; Inner: Big Tech, AI Semiconductors, High-Beta).
- **Collapsing Storm Zones:** 5-round storm progression with progressive tick damage deductions ($50/s up to $1,000/s in the Final Circle).
- **30-Second Micro-Trading Duels:** Contested sector drop battles with 1x, 2x, and 5x leverage options, real-time tick streaming, and third-party battle escalation.
- **Auto-Liquidation Engine:** Strict 90% drawdown margin liquidation buffer preventing debt creation.
- **Ranked MMR Progression:** Rocket League-style MMR tiers from Unranked and Bronze up to Master and Apex Grandmaster, paired with Apex Legends RP scoring.

### 📈 Traditional Paper Trading

- **Live & Historical Market Quotes:** Integration with Alpaca Markets data streams.
- **Portfolio & Watchlist Management:** Real-time equity charts, profit/loss breakdown, and transaction logging.
- **Simulated Trading Competitions:** Host and join multi-user paper trading tournaments with custom start pots and duration parameters.

### 🎮 Dual Web & Native Desktop Delivery

- **Responsive Web & PWA:** Built with Vue 3, Vite, Naive UI, and UnoCSS with offline service worker caching.
- **Native Desktop & Steam Deck Packaging:** Packaged with Tauri 2.0 and Rust `steamworks-rs` bridge stubs for Steam achievements and gamepads.

---

## Architecture

```
                      ┌───────────────────────────────────────────────┐
                      │              Client Interface                 │
                      │  Vue 3 + Vite + TypeScript + Naive UI + UnoCSS│
                      │   - Radar Map       - Trading Duel Arena      │
                      │   - Kill Feed       - Match Victory Modal     │
                      └───────────────────────┬───────────────────────┘
                                              │ HTTP / WebSocket / IPC
                       ┌──────────────────────┴──────────────────────┐
                       │                                             │
                       ▼                                             ▼
        ┌─────────────────────────────┐               ┌─────────────────────────────┐
        │        FastAPI Server       │               │      Tauri 2.0 Desktop      │
        │ - Match Engine (Lobbies)    │               │ - Native Window Container   │
        │ - 10 Hz Market Simulator    │               │ - Steamworks SDK Bridge     │
        │ - Zone Collapse Scheduler   │               │ - Steam Deck Gamepad Input  │
        │ - 30s Trading Duel Engine   │               └─────────────────────────────┘
        │ - REST API (Portfolios)     │
        └──────────────┬──────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
  ┌──────────────┐            ┌──────────────┐
  │  PostgreSQL  │            │  Alpaca API  │
  │  (User Data) │            │ (Live Feeds) │
  └──────────────┘            └──────────────┘
```

---

## Quickstart

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.4.0
- **Python** >= 3.11 with `pip` and `virtualenv`
- _(Optional for desktop builds)_ **Rust** >= 1.75 with `cargo`
- _(Optional)_ **Docker Desktop** (for VS Code Dev Containers)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Zedfoura/fintasy.git
cd fintasy

# Install frontend and workspace tools
pnpm install

# Setup Python virtual environment for the server
cd packages/server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ../..
```

### 2. Configure Environment Variables

Copy the template configuration files:

```bash
cp .env.example .env.development
cp .env.example .env.production
```

Default settings in `.env.example`:

- `VITE_API_BASE`: `http://localhost:3332/api/v1`
- `SERVER_API_HOST`: `localhost`
- `SERVER_API_PORT`: `3332`
- `SERVER_API_CORS_ORIGINS`: `*`

### 3. Run Development Servers

From the root directory, launch both the client and server concurrently:

```bash
pnpm dev
```

- **Web App:** [http://localhost:3333](http://localhost:3333)
- **FastAPI Server:** [http://localhost:3332](http://localhost:3332)
- **Interactive Swagger Docs:** [http://localhost:3332/docs](http://localhost:3332/docs)

---

## Testing & Verification

The repository enforces automated unit, integration, and invariant testing across both workspace packages:

```bash
# Run all server and client test suites concurrently
pnpm test

# Run frontend tests only (Vitest)
pnpm --filter client test

# Run backend tests only (Pytest)
pnpm --filter server test

# Check code formatting & linting
pnpm run lint

# Automatically fix linting and formatting issues
pnpm run lint:fix

# Run TypeScript typechecks
pnpm run typecheck
```

---

## Desktop & Steam Deck

Fintasy can be packaged into a native lightweight desktop binary using Tauri 2.0:

```bash
# Run native desktop client in development mode
pnpm desktop:dev

# Build release desktop executable (Linux / Windows / macOS)
pnpm desktop:build
```

On Linux / Steam Deck:

- Supports standard 1280x800 resolution and 16:10 aspect ratio.
- Integrates gamepad hotkeys (D-Pad sector navigation, triggers for buy/short execution).
- Scaffolding in `src-tauri/` includes bridge hooks for Steam Achievements and Rich Presence.

---

## API Documentation

- **Interactive OpenAPI / Swagger UI:** Available when running the backend at `http://localhost:3332/docs`
- **ReDoc UI:** Available at `http://localhost:3332/redoc`
- **Static Specification:** Inspect `docs/swagger.html` and `docs/assets/swagger.yaml` for offline schema exploration.

---

## Monorepo Structure

```
fintasy/
├── packages/
│   ├── client/                  # Vue 3 Single Page Application & PWA
│   │   ├── src/
│   │   │   ├── components/      # UI components (Radar Map, Duel Arena, Kill Feed)
│   │   │   ├── composables/     # Game state (useRoyaleMatch, useMarketTickStream)
│   │   │   ├── pages/           # Pages (Dashboard, Royale, Trade, Help)
│   │   │   └── modules/         # Pinia, Vue Router, i18n, Naive UI plugins
│   │   └── tests/               # Vitest client test suites
│   └── server/                  # Python FastAPI Backend
│       ├── src/
│       │   ├── models/          # SQLAlchemy & Pydantic models
│       │   ├── routes/          # REST endpoints (Royale, Portfolios, Quotes)
│       │   ├── services/        # In-memory MatchManager, Zone Collapse, Bot Engine
│       │   └── helpers/         # Request validation & financial helpers
│       └── tests/               # Pytest test suites
├── src-tauri/                   # Tauri 2.0 native desktop configuration & Rust crate
├── docs/                        # Project architecture documentation & Jekyll site
├── wargame-metaharness/         # Programmatic verification & blast radius tooling
└── .wargaming/                  # Mission ledgers, ARC proofs, and execution receipts
```

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.
