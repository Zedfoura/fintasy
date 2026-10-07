# Mission Ledger — Fintasy Stock Royale (Battle-Royale Trading Simulator)

**Goal:** Transform Fintasy into a battle-royale inspired trading simulator where 30-60 players drop into market sectors, loot tickers, fight 30-second trading duels, escape shrinking storm zones, third-party fights, and climb from Bronze to Golden Trader in Rocket League/Apex Legends style ranked seasons, built web-first with a frictionless packaging path to Steam.  
**Scope:** Full vertical implementation: game-theoretic economy design, in-memory fast match state machine, bot AI lobby fill, sector map with storm collapse, 10 Hz market tick generator, 30s micro-trading duels, third-party battle escalation, Rocket League/Apex Legends MMR ranked progression, PostgreSQL persistence, Football Manager (FM) tactical command center UI with interactive treemap radar, duel arena with HTML5 Canvas charting, real-time WebSockets with uvloop, and Tauri 2.0 desktop packaging for Steam. Legacy paper-trading features remain 100% preserved.  
**Authority:** Planning artifacts only; execution requires user authority.  
**State model:** proposed → planned → executing → mechanism_verified → canonical → activated → outcome_verified → retained  
**Disposition:** active  
**Legacy rule:** An unmarked legacy `[x]` means `planned` at most after its linked Battle Plan is validated; otherwise route it to `AUDIT/RESUME` without assigning an evidence state.  

---

## Missions

### Epic 1 — Core Stock Royale Match Engine & Simulation Loop <!-- wargame-epic: core-match-engine; wargame-epic-priority: 1 -->

- [ ] **ROYALE-0. Game-Theoretic Economy, Spatial Pacing & Stack Architecture Specification** — Rigorous mathematical balance model establishing Poisson encounter pacing curves, 6-minute 5-round storm schedule, $15,000 starting pot behavioral sizing (Prospect Theory/House Money effect), 5x leverage caps, Apex Legends scaled RP entry fee and placement/liquidation multiplier matrix, and Tauri/Canvas web-to-Steam portability. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: none
  - Required stage: CANONICAL
  - Verifier/consumer: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/research_game_theory.md` and `research_stack_architecture.md` with verified URL sources consumed by ROYALE-1, ROYALE-2, ROYALE-4, ROYALE-6
  - Preserves: Mathematical equilibrium prevents camping/turtling and bot-farming inflation
  - User flows: not applicable (economy/balance foundation)
  - Point of no return: none
  - Subagent lane: `lane_research`

- [ ] **ROYALE-1. Match State Machine & 30-60 Player Lobby Orchestrator** — Fast in-memory match manager supporting match creation, state progression (LOBBY -> DROP_SELECTION -> ACTIVE_ROUNDS -> FINAL_CIRCLE -> MATCH_OVER), player joining, and automated bot fill for 30-60 player lobbies with configurable risk styles (Scalper, Swing, Degenerate). <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: ROYALE-0@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-1_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-1/execution.md`
  - Verifier/consumer: `packages/server/tests/royale/test_match_engine.py` verifying 60-player lobby transition with 59 bots in <100ms
  - Preserves: Existing tournament and user routes unaffected
  - User flows: FLOW-LOBBY-BOTFILL
  - Point of no return: none
  - Subagent lane: `lane_engine`

- [ ] **ROYALE-2. Market Sector Graph Topology & Storm Collapse Engine** — Adjacency graph representing market sectors (Outer: Utilities, Materials, Industrials, Real Estate; Mid: Healthcare, Financials, Energy, Consumer; Inner: Big Tech, AI Semiconductors, High-Beta). Zone collapse scheduler progressively closes outer sectors over 5 rounds and applies capital tick damage ($/sec deducted from each player's $15k pot) to any player remaining in the storm. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: ROYALE-0@canonical, ROYALE-1@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-2_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-2/execution.md`
  - Verifier/consumer: `packages/server/tests/royale/test_zone_collapse.py` verifying sector adjacency traversal, safe zone shrinkage, and exact storm tick damage deductions over time
  - Preserves: In-memory match loop timing and stability
  - User flows: FLOW-ZONE-COLLAPSE
  - Point of no return: none
  - Subagent lane: `lane_engine`

- [ ] **ROYALE-3. High-Frequency Market Tick Generator & Sector Volatility Regimes** — Deterministic seeded 10 Hz price tick simulation using Geometric Brownian Motion with sector correlations, sudden volatility bursts (e.g. Fed announcement, earnings breakout), and loot ticker distribution per sector (e.g. uncontested drop instantly awards sector ticker loot). <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: ROYALE-2@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-3_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-3/execution.md`
  - Verifier/consumer: `packages/server/tests/royale/test_market_ticks.py` validating 10 Hz tick stream generation, seed reproducibility, volatility regimes, and uncontested ticker loot allocation
  - Preserves: Real Alpaca API service remains available for non-royale portfolio trading without rate-limit interference
  - User flows: FLOW-ROYALE-GOLDEN
  - Point of no return: none
  - Subagent lane: `lane_market_sim`

### Epic 2 — Trading Duel Arena & Third-Party Battle Protocol <!-- wargame-epic: trading-duels; wargame-epic-priority: 2 -->

- [ ] **ROYALE-4. 30-Second Micro-Trading Duel & Liquidation Mechanism** — Dueling engine executing 30s-60s head-to-head trading battles when 2 players contest a drop or encounter in a sector. Micro-orders (Long/Short, leverage 1x-5x, market execution) run against the active tick stream. At duel timer expiry, the player with higher net profit / % ROI wins: collects profits, steals opponent's ticker loot, and takes a cash bounty. If a player's equity reaches $0, they are eliminated (BUSTED). <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: ROYALE-0@canonical, ROYALE-3@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-4_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-4/execution.md`
  - Verifier/consumer: `packages/server/tests/royale/test_duels.py` simulating 2-player 30s duel, order execution, winner profit allocation, ticker loot transfer, and bankruptcy liquidation
  - Preserves: Fast in-memory state transactions without locking or race conditions
  - User flows: FLOW-COMBAT-DUEL
  - Point of no return: none
  - Subagent lane: `lane_combat`

- [ ] **ROYALE-5. Sector Contestation & Third-Party Battle Protocol** — Multi-participant combat escalation allowing a third (or fourth) player entering an occupied active duel sector to "Third-Party" the duel, joining the active trading ticket. Multi-way P&L calculation determines spoils distribution, split bounties, and multi-kill feed credit. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: ROYALE-4@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-5_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-5/execution.md`
  - Verifier/consumer: `packages/server/tests/royale/test_third_party.py` validating 3-way duel entry, dynamic order book sharing, and 3-way outcome resolution
  - Preserves: Duel state integrity and combat lock-in timeouts
  - User flows: FLOW-COMBAT-THIRDPARTY
  - Point of no return: none
  - Subagent lane: `lane_combat`

### Epic 3 — Competitive Ranked System & Rocket League MMR Progression <!-- wargame-epic: ranked-progression; wargame-epic-priority: 3 -->

- [ ] **ROYALE-6. Rocket League Tiered MMR & Rating System Engine** — Competitive rating engine implementing Rocket League style progression (Bronze I-III through Golden Trader apex tier) with Apex Legends RP mechanics (entry costs 15-100 RP, placement + liquidation multiplier matrix). Dynamic post-match MMR adjustment calculating placement score (1st-40th/60th), duel liquidations, net profit generated, and opponent average MMR. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: ROYALE-0@canonical, ROYALE-4@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-6_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-6/execution.md`
  - Verifier/consumer: `packages/server/tests/royale/test_mmr.py` verifying ranking tier thresholds, division promotions/demotions, placement weightings, and Golden Trader cutoff
  - Preserves: Standard user coins and profile attributes
  - User flows: FLOW-RANKED-PROGRESS
  - Point of no return: none
  - Subagent lane: `lane_ranked`

- [ ] **ROYALE-7. PostgreSQL Database Migrations & Match Persistence Layer** — Database migration adding tables (ranked_seasons, user_ranks, matches, match_participants, match_duels), CRUD mixins in services/database/mixins/royale.py, and API endpoints for seasonal leaderboards, user rank profile, and match history. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: ROYALE-6@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-7_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-7/execution.md`
  - Verifier/consumer: `packages/server/tests/royale/test_db_royale.py` verifying table creation, match saving, leaderboard queries, and user rank updates
  - Preserves: Existing tables (users, portfolios, transactions, tournaments, sessions) unmodified
  - User flows: FLOW-RANKED-PROGRESS
  - Point of no return: PostgreSQL schema migration (reversible via drop table if needed)
  - Subagent lane: `lane_ranked`

### Epic 4 — Tactical Command Center & Football Manager (FM) UI <!-- wargame-epic: tactical-ui; wargame-epic-priority: 4 -->

- [ ] **ROYALE-8. Market Sector Radar & Treemap Map with Storm Visualizer** — Vue component MarketRadarMap.vue rendering an interactive HTML5 Canvas sector treemap (Outer to Inner sectors) with safe zone boundary, storm collapse countdown animation, player sector pins, and contested battle indicators, styled in a crisp Football Manager tactical theme. <!-- wargame-state: activation; wargame-disposition: active -->
  - Depends on: ROYALE-2@canonical
  - Required stage: ACTIVATION
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-8_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-8/execution.md`
  - Verifier/consumer: `packages/client/tests/MarketRadarMap.test.ts` and dev server DOM assertion validating sector rendering, player location pins, and storm ring styling
  - Preserves: Existing dashboard layout and navigation sidebar
  - User flows: FLOW-ZONE-COLLAPSE
  - Point of no return: none
  - Subagent lane: `lane_tactical_ui`

- [ ] **ROYALE-9. Live Trading Duel Arena HUD & Split-Screen Combat Terminal** — Dedicated Vue component TradingDuelArena.vue providing a split-screen micro-trading interface during 30s duels: real-time HTML5 Canvas Lightweight Charts, 30s countdown bar, Long/Short quick execution buttons, 1x-5x leverage selector, opponent P&L progress bar, and "Third-Party Join" alert banner. <!-- wargame-state: activation; wargame-disposition: active -->
  - Depends on: ROYALE-5@canonical, ROYALE-8@activation
  - Required stage: ACTIVATION
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-9_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-9/execution.md`
  - Verifier/consumer: `packages/client/tests/TradingDuelArena.test.ts` and live DOM assertions verifying order placement, P&L delta display, and timer countdown
  - Preserves: Responsive design and UnoCSS color system
  - User flows: FLOW-COMBAT-DUEL, FLOW-COMBAT-THIRDPARTY
  - Point of no return: none
  - Subagent lane: `lane_tactical_ui`

- [ ] **ROYALE-10. Real-Time WebSocket Client, Kill Feed Ticker & Post-Match Victory HUD** — Client composable useRoyaleMatch.ts connecting to the server WebSocket feed, feeding real-time events into KillFeed.vue (liquidations, storm tick warnings, sector closures), spectator view for fallen traders, and MatchVictoryModal.vue celebrating #1 Victory Royale with Rocket League rank badge animation and MMR gains. <!-- wargame-state: activation; wargame-disposition: active -->
  - Depends on: ROYALE-7@canonical, ROYALE-9@activation
  - Required stage: ACTIVATION
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-10_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-10/execution.md`
  - Verifier/consumer: `packages/client/tests/RoyaleMatchFlow.test.ts` verifying WebSocket event handling, kill feed event rendering, and victory screen display
  - Preserves: Client state store and notification system
  - User flows: FLOW-ROYALE-GOLDEN, FLOW-TACTICAL-SPECTATE
  - Point of no return: none
  - Subagent lane: `lane_tactical_ui`

### Epic 5 — Live End-to-End Match Integration & Steam Readiness <!-- wargame-epic: e2e-verification; wargame-epic-priority: 5 -->

- [ ] **ROYALE-11. 60-Player Full Match Simulation & Regression Verification** — Full end-to-end automated test harness running a complete 60-player match from lobby fill -> drop selection -> storm collapse -> multiple concurrent 30s duels & third-parties -> final circle elimination -> winner coronation -> database persistence & MMR calculation, along with full regression verification of legacy Fintasy paper-trading endpoints. <!-- wargame-state: outcome; wargame-disposition: active -->
  - Depends on: ROYALE-10@activation
  - Required stage: OUTCOME
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-11_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-11/execution.md`
  - Verifier/consumer: `packages/server/tests/royale/test_e2e_match.py` producing a verifiable match receipt proving complete match lifecycle with 60 participants and zero unhandled exceptions
  - Preserves: 100% test pass on legacy unit tests (basic_test.py, quote_test.py, sessions_test.py, tournaments_test.py, transactions_test.py, user_test.py)
  - User flows: FLOW-ROYALE-GOLDEN
  - Point of no return: none
  - Subagent lane: `lane_engine`

- [ ] **ROYALE-12. Tauri Desktop Wrapper & Steamworks SDK Scaffolding** — Scaffolding of Tauri 2.0 configuration (src-tauri/) enabling one-command packaging of the web application into native Windows and Linux (Steam Deck) desktop executables with steamworks-rs bridge stubs for Steam Achievements and Rich Presence. <!-- wargame-state: activation; wargame-disposition: active -->
  - Depends on: ROYALE-11@outcome
  - Required stage: ACTIVATION
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_ROYALE-12_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_ROYALE-12/execution.md`
  - Verifier/consumer: Desktop compilation and smoke check verifying web bundle rendering within native OS webview container
  - Preserves: Web browser deployment continues to function independently
  - User flows: not applicable (platform packaging)
  - Point of no return: none
  - Subagent lane: `lane_engine`

### Epic 6 — Codebase Cleanup, Platform Navigation & Comprehensive Documentation <!-- wargame-epic: codebase-cleanup-docs; wargame-epic-priority: 6 -->

- [ ] **CLEAN-1. Dead Code Elimination & Test Suite Hygiene** — Safely remove orphan server mocks (`src/helpers/quote.py`, `sessions.py`, `transactions.py`), obsolete non-executed legacy tests (`tests/legacy/`), and boilerplate placeholder READMEs across client/server component, module, store, layout, and service directories (including `components/README.md` that was contaminating Vite component registry), and update `pytest.ini`. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: ROYALE-12@activation
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_CLEAN-1_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_CLEAN-1/execution.md`
  - Verifier/consumer: `pnpm test` (all 110 tests pass, zero missing import errors), `pnpm run lint` (zero formatting/lint errors), and file deletion presence checks
  - Preserves: Active validation helpers (`User`, `Portfolio`, `Tournament`), all passing test suites, and legacy paper-trading REST endpoints
  - User flows: not applicable (repository refactoring)
  - Point of no return: File deletions (tracked in Git)
  - Subagent lane: `lane_cleanup`

- [ ] **CLEAN-2. Stock Royale Client Route & Navigation Integration** — Mount the Stock Royale battle-royale mode into the client web app by implementing a dedicated page `packages/client/src/pages/dashboard/royale.vue` connecting `MarketRadarMap.vue`, `TradingDuelArena.vue`, `KillFeed.vue`, `MatchVictoryModal.vue`, and `useRoyaleMatch.ts` with matchmaking and lobby controls. Add a first-class navigation link and icon to `SideBar.vue`. <!-- wargame-state: activation; wargame-disposition: active -->
  - Depends on: CLEAN-1@canonical
  - Required stage: ACTIVATION
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_CLEAN-2_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_CLEAN-2/execution.md`
  - Verifier/consumer: Client integration test suite asserting route mounting, component rendering, and navigation click
  - Preserves: Existing dashboard routes (`/dashboard`, `/dashboard/trade`, `/dashboard/tournaments`, `/dashboard/settings`)
  - User flows: FLOW-LOBBY-BOTFILL, FLOW-ZONE-COLLAPSE, FLOW-COMBAT-DUEL, FLOW-ROYALE-GOLDEN
  - Point of no return: none
  - Subagent lane: `lane_tactical_ui`

- [ ] **CLEAN-3. Comprehensive In-App Game Manual & Interactive Help Overhaul** — Transform the placeholder template files in `packages/client/src/pages/dashboard/help/` (`index.md` and `faq.md`) into an authoritative, beautifully formatted Stock Royale Game Manual and Trading Guide explaining 12-sector topology, storm damage schedules, 30s duel leverage mechanics, Rocket League rank tiers, and FAQ. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: CLEAN-2@activation
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_CLEAN-3_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_CLEAN-3/execution.md`
  - Verifier/consumer: Client build pass (`pnpm --filter client build`) and unit test asserting rendered help sections and FAQ answers
  - Preserves: Dashboard layout (`dashboard-md`) and markdown rendering
  - User flows: not applicable (documentation)
  - Point of no return: none
  - Subagent lane: `lane_tactical_ui`

- [ ] **CLEAN-4. Root README & Technical Architecture Documentation Overhaul** — Completely rewrite root `README.md` and `docs/index.md` to reflect the complete Stock Royale platform: high-level architecture diagram, quick-start guide (`pnpm install`, `pnpm dev`, `pnpm test`), Tauri 2.0 / Steam Deck packaging commands (`pnpm desktop:dev`, `pnpm desktop:build`), environment variable guide (`.env.example`), interactive Swagger/OpenAPI documentation reference, and contribution guidelines. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: CLEAN-1@canonical, CLEAN-3@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_CLEAN-4_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_CLEAN-4/execution.md`
  - Verifier/consumer: Markdown link and command consistency checks, programmatic blast radius check, and zero lint warnings
  - Preserves: Repository license and canonical package manifests
  - User flows: not applicable (documentation)
  - Point of no return: none
  - Subagent lane: `lane_docs`

### Epic 7 — Authentication & Login Flow Overhaul <!-- wargame-epic: auth-login-revamp; wargame-epic-priority: 7 -->

- [ ] **AUTH-1. Resilient Backend Session Engine & Local Guest Authentication** — Implement fallback in-memory/guest session provisioning on the FastAPI backend when PostgreSQL is uninitialized or in offline development mode, alongside an authenticated `/api/v1/sessions/guest` endpoint and robust error handling for password/user lookup without 500 crashes. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: CLEAN-4@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_AUTH-1_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_AUTH-1/execution.md`
  - Verifier/consumer: `packages/server/tests/test_sessions.py` asserting guest session creation, credentials verification, and offline fallback
  - Preserves: Existing password hashing and `/api/v1/sessions` contract
  - User flows: FLOW-AUTH-LOGIN
  - Point of no return: none
  - Subagent lane: `lane_backend_auth`

- [ ] **AUTH-2. Client Authentication Store, Guest Session & Route Guards** — Upgrade `useAPI` and Pinia auth state (`state.user`) to support persistent token hydration, reactive authentication state, instant guest login (`fintasy.loginAsGuest()`), automatic token clearance on 401/403, and global router guards redirecting unauthenticated users to `/login` with target path retention. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: AUTH-1@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_AUTH-2_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_AUTH-2/execution.md`
  - Verifier/consumer: `packages/client/tests/AuthStore.test.ts` asserting token storage, guest login, and route guard redirects
  - Preserves: Existing `useAPI` method contracts and Pinia state layout
  - User flows: FLOW-AUTH-LOGIN
  - Point of no return: none
  - Subagent lane: `lane_client_auth`

- [ ] **AUTH-3. Tactical Fintech/Cyberpunk Login UI & Form UX Overhaul** — Completely redesign `packages/client/src/pages/login.vue` using Naive UI components (`<NCard>`, `<NTabs>`, `<NForm>`, `<NInput>`, `<NButton>`) with a high-fidelity cyberpunk/fintech aesthetic matching Stock Royale: tabbed Sign In / Register / Guest Demo modes, real-time input validation, password reveal toggles, caps-lock indicators, and loading spin states. <!-- wargame-state: activation; wargame-disposition: active -->
  - Depends on: AUTH-2@canonical
  - Required stage: ACTIVATION
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_AUTH-3_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_AUTH-3/execution.md`
  - Verifier/consumer: `packages/client/tests/LoginView.test.ts` asserting tab switching, input validation, and component rendering, plus `pnpm --filter client build`
  - Preserves: UnoCSS theming and dark mode styles
  - User flows: FLOW-AUTH-LOGIN
  - Point of no return: none
  - Subagent lane: `lane_tactical_ui`

- [ ] **AUTH-4. End-to-End Authentication & Onboarding Verification** — Verify full end-to-end user onboarding across normal credential authentication, guest quick-play, session logout, and route protection with zero lint errors and 100% test pass rate across the monorepo. <!-- wargame-state: outcome; wargame-disposition: active -->
  - Depends on: AUTH-3@activation
  - Required stage: OUTCOME
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_AUTH-4_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_AUTH-4/execution.md`
  - Verifier/consumer: Monorepo test suite `pnpm test` and programmatic blast radius check verifying zero cross-package regressions
  - Preserves: All existing paper trading and Stock Royale game loops
  - User flows: FLOW-AUTH-LOGIN
  - Point of no return: none
  - Subagent lane: `lane_qa_auth`

### Epic 8 — Marketing Landing Page Revamp & Visual Conversion Funnel <!-- wargame-epic: marketing-landing-revamp; wargame-epic-priority: 8 -->

- [ ] **LANDING-1. Hero Arena, Value Proposition & Dual Conversion CTAs** — High-impact Stock Royale hero section on `/` displaying bold battle-royale headline ("The 60-Player Stock Market Battle Royale"), live status chips ("Season 1: Liquidity Drain Active", "60 Traders Per Match", "100ms Tick Engine"), animated financial ticker tape, and dual high-visibility conversion CTAs ("Deploy to Stock Royale" -> `/dashboard/royale`, "Sign In / Register" -> `/login`), plus updated `HomeNav.vue` header with a prominent "Play Royale" action button. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: CLEAN-4@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_LANDING-1_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_LANDING-1/execution.md`
  - Verifier/consumer: `packages/client/tests/LandingHero.test.ts` mounting `index.vue` and `HomeNav.vue`, asserting headline copy, live chips, CTA navigation routes, and UnoCSS styling classes
  - Preserves: Existing layout header (`HomeNav.vue`), theme switcher, language selector, and router navigation
  - User flows: FLOW-LANDING-CONVERSION
  - Point of no return: none
  - Subagent lane: `lane_landing_ui`
  - Contract charter: Git base `e3e92a606bfdea046e878e11beb9df476887a5e1`, exclude `packages/server/`, worktree `wt/landing_hero`, subsystem `packages/client/src/pages/index.vue` + `packages/client/src/components/navigation/HomeNav.vue` + `packages/client/tests/LandingHero.test.ts`

- [ ] **LANDING-2. 4-Pillar Gameplay Loop Showcase & Tactical Sector Teaser** — Responsive UnoCSS component `LandingGameplayPillars.vue` showcasing the 4 core pillars of Stock Royale with dark-mode glassmorphic cards: (1) 30-60 Player Lobbies & Bot Fill, (2) Dynamic S&P 500 Sector Map & Liquidity Storm, (3) 30-Second Micro-Trading Duels & Loot Stealing, (4) Rocket League Ranked MMR Progression, including interactive pillar tab exploration. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: LANDING-1@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_LANDING-2_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_LANDING-2/execution.md`
  - Verifier/consumer: `packages/client/tests/LandingPillars.test.ts` asserting 4 pillar cards, interactive tab switching, descriptive text, and icon rendering
  - Preserves: UnoCSS design tokens and responsive grid layout across mobile/desktop
  - User flows: FLOW-LANDING-CONVERSION
  - Point of no return: none
  - Subagent lane: `lane_landing_ui`
  - Contract charter: Git base `e3e92a606bfdea046e878e11beb9df476887a5e1`, exclude `packages/server/`, worktree `wt/landing_pillars`, subsystem `packages/client/src/components/landing/LandingGameplayPillars.vue` + `packages/client/tests/LandingPillars.test.ts`

- [ ] **LANDING-3. Interactive Client-Side 30-Second Duel Mini-Simulator Widget** — Embedded interactive micro-simulator widget `LandingDuelSimulator.vue` directly on the landing page allowing visitors to test the core 30-second duel mechanic without authentication: 10 Hz simulated price tick sparkline, interactive Long/Short buttons, 1x-5x leverage selector, real-time P&L delta counter, and 15-second demo timer triggering an instant victory popup with CTA to `/dashboard/royale`. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: LANDING-2@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_LANDING-3_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_LANDING-3/execution.md`
  - Verifier/consumer: `packages/client/tests/LandingDuelSimulator.test.ts` asserting interactive button clicks, simulated price updates, P&L delta calculations, timer countdown, and victory CTA popup
  - Preserves: Deterministic tick generation logic consistent with `MarketTickEngine` specifications
  - User flows: FLOW-LANDING-CONVERSION, FLOW-COMBAT-DUEL
  - Point of no return: none
  - Subagent lane: `lane_simulator_ui`
  - Contract charter: Git base `e3e92a606bfdea046e878e11beb9df476887a5e1`, exclude `packages/server/`, worktree `wt/landing_simulator`, subsystem `packages/client/src/components/landing/LandingDuelSimulator.vue` + `packages/client/tests/LandingDuelSimulator.test.ts`

- [ ] **LANDING-4. Social Proof Stats, Golden Trader Apex Leaderboard Preview & FAQ** — Conversion-reinforcing sections: live platform stats counter (60 max traders, $15,000 starting pot, 100ms engine), Golden Trader Apex Leaderboard preview table showing top 5 simulated/live seasonal rank leaders with MMR and liquidations, interactive FAQ accordion, and modern platform footer with Steam Deck / Desktop readiness badges and navigation links. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: LANDING-2@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_LANDING-4_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_LANDING-4/execution.md`
  - Verifier/consumer: `packages/client/tests/LandingSocialProof.test.ts` validating stats counter, leaderboard preview table items, FAQ expand/collapse behavior, and footer router links
  - Preserves: Existing dashboard help links and external URL security attributes (`rel="noopener noreferrer"`)
  - User flows: FLOW-LANDING-CONVERSION, FLOW-RANKED-PROGRESS
  - Point of no return: none
  - Subagent lane: `lane_social_proof`
  - Contract charter: Git base `e3e92a606bfdea046e878e11beb9df476887a5e1`, exclude `packages/server/`, worktree `wt/landing_social_proof`, subsystem `packages/client/src/components/landing/LandingSocialProof.vue` + `packages/client/src/components/landing/LandingFooter.vue` + `packages/client/tests/LandingSocialProof.test.ts`

- [ ] **LANDING-5. Full Landing Page Assembly, i18n Localization & Vitest/Vite Verification** — Cohesive assembly of all landing modules into `packages/client/src/pages/index.vue`, localized copy in `packages/client/locales/en.yml` (with fallback protection), smooth scroll navigation, mobile responsiveness, full Vitest suite execution, and Vite production bundle build (`pnpm --filter client build`) exiting 0 with zero TypeScript errors. Blast radius analysis confirms strictly `["client"]`. <!-- wargame-state: outcome; wargame-disposition: active -->
  - Depends on: LANDING-1@canonical, LANDING-3@canonical, LANDING-4@canonical
  - Required stage: OUTCOME
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_LANDING-5_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_LANDING-5/execution.md`
  - Verifier/consumer: `pnpm --filter client test` (all test suites pass 100%), `pnpm --filter client build` (exits 0, dist artifacts generated), and `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts` returning strictly `["client"]`
  - Preserves: 100% backward compatibility of all existing routes, navigation bars, and passing test suites
  - User flows: FLOW-LANDING-CONVERSION
  - Point of no return: none
  - Subagent lane: `lane_integration`
  - Contract charter: Git base `e3e92a606bfdea046e878e11beb9df476887a5e1`, exclude `packages/server/`, worktree `wt/landing_assembly`, subsystem complete landing surface + build verification

### Epic 9 — Light Mode Systemic Theming, Cyberpunk Navbar & Visual Polish Overhaul <!-- wargame-epic: light-mode-navbar-revamp; wargame-epic-priority: 9 -->

- [x] **THEME-1. Sticky Glassmorphic Navbar & Brand Identity Revamp** — Overhaul `packages/client/src/components/navigation/HomeNav.vue` into a sticky, backdrop-blurred frosted glass header (`backdrop-blur-xl bg-white/85 dark:bg-[#0c0d14]/85 border-b border-slate-200/80 dark:border-[#1f2438]`), sleek logo typography with glowing crosshair icon, interactive pill navigation links with hover micro-interactions, high-contrast dual-theme "Play Royale" CTA button (solid deep emerald in light mode, glowing neon in dark mode), and streamlined theme/locale switches. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: LANDING-5@outcome
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_THEME-1_battleplan.md`
  - Verifier/consumer: `packages/client/tests/LandingHero.test.ts` and `packages/client/tests/NavBarTheme.test.ts` asserting sticky header classes, contrast ratios, and CTA button rendering across light and dark modes
  - Preserves: Existing route paths (`/`, `/dashboard`, `/dashboard/royale`) and i18n language toggle functionality
  - User flows: FLOW-THEME-NAVBAR, FLOW-LANDING-CONVERSION
  - Point of no return: none
  - Subagent lane: `lane_navbar_ui`
  - Contract charter: Git base `d3fe405`, exclude `packages/server/`, worktree `wt/navbar_theme`, subsystem `packages/client/src/components/navigation/HomeNav.vue` + `packages/client/tests/NavBarTheme.test.ts`

- [x] **THEME-2. Dual-Theme Authentication Portal & High-Contrast Tab Overhaul** — Completely resolve the detached floating black card on white background in `packages/client/src/pages/login.vue` by introducing adaptive dual-theme container styling (subtle ambient grid / radial depth), dual-mode card tokens (`bg-white dark:bg-[#0c0d14] border-slate-200 dark:border-[#1f2438] shadow-2xl`), high-contrast readable segment tabs in both modes (`text-slate-700 font-bold dark:text-gray-300`), and crisp form inputs with distinct focus rings. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: THEME-1@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_THEME-2_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_THEME-2/execution.md`
  - Verifier/consumer: `packages/client/tests/LoginView.test.ts` asserting light and dark mode classes, active/inactive tab contrast, and guest quick-play functionality
  - Preserves: `useAPI` authentication contracts, guest demo login, caps-lock warnings, and redirect query handling
  - User flows: FLOW-THEME-NAVBAR, FLOW-AUTH-LOGIN
  - Point of no return: none
  - Subagent lane: `lane_auth_ui`
  - Contract charter: Git base `d3fe405`, exclude `packages/server/`, worktree `wt/login_theme`, subsystem `packages/client/src/pages/login.vue` + `packages/client/tests/LoginView.test.ts`

- [x] **THEME-3. Landing Hero, Status Chips & Ticker Tape Dual-Theme Overhaul** — Upgrade `packages/client/src/pages/index.vue` hero section for pristine light-mode legibility and contrast: replace washed-out neon text and lime smudges with adaptive gradient typography (`from-emerald-700 via-teal-600 to-cyan-700 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400`), WCAG AAA subtitle (`text-slate-600 dark:text-gray-300`), crisp dual-mode status chips (`bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400`), high-contrast dual CTAs, and adaptive ticker tape & tactical preview card backgrounds. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: THEME-1@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_THEME-3_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_THEME-3/execution.md`
  - Verifier/consumer: `packages/client/tests/LandingHero.test.ts` asserting adaptive theme classes, status chip contrast, and CTA navigation
  - Preserves: $15,000 starting pot invariant (`INV-1`), 60-player lobby copy, and ticker stream data
  - User flows: FLOW-THEME-NAVBAR, FLOW-LANDING-CONVERSION
  - Point of no return: none
  - Subagent lane: `lane_hero_theme`
  - Contract charter: Git base `d3fe405`, exclude `packages/server/`, worktree `wt/hero_theme`, subsystem `packages/client/src/pages/index.vue` + `packages/client/tests/LandingHero.test.ts`

- [x] **THEME-4. 4-Pillar Showcase & Duel Simulator Dual-Theme Polish** — Refactor `LandingGameplayPillars.vue` and `LandingDuelSimulator.vue` from hardcoded dark-only colors to responsive dual-mode fintech aesthetics: pillar cards with `bg-white/95 dark:bg-[#0c0d14]/90 border-slate-200 dark:border-[#1f2438] shadow-lg`, high-contrast filter tabs, dual-theme duel simulator arena card, adaptive sparkline chart container (`bg-slate-100 dark:bg-[#08090f]`), and crisp leverage controls. <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: THEME-3@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_THEME-4_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_THEME-4/execution.md`
  - Verifier/consumer: `packages/client/tests/LandingPillars.test.ts` and `packages/client/tests/LandingDuelSimulator.test.ts` verifying rendering, tab toggling, leverage controls, and P&L calculation in both light and dark modes
  - Preserves: 10 Hz price sparkline mathematics, leverage multiplier logic, and victory CTA popup
  - User flows: FLOW-THEME-NAVBAR, FLOW-LANDING-CONVERSION
  - Point of no return: none
  - Subagent lane: `lane_pillars_theme`
  - Contract charter: Git base `d3fe405`, exclude `packages/server/`, worktree `wt/pillars_theme`, subsystem `packages/client/src/components/landing/LandingGameplayPillars.vue` + `packages/client/src/components/landing/LandingDuelSimulator.vue`

- [x] **THEME-5. Social Proof, Leaderboard, FAQ & Footer Dual-Theme Polish** — Upgrade `LandingSocialProof.vue` and `LandingFooter.vue` with dual-mode surfaces: stats cards with `bg-white/90 dark:bg-[#0c0d14]/80 border-slate-200 dark:border-[#1f2438]`, Apex Leaderboard table with crisp alternating light-mode rows and dark slate headers, FAQ accordion with clean white question cards and high-contrast typography, and adaptive platform footer (`bg-slate-100 dark:bg-[#07080d] border-t border-slate-200 dark:border-[#1f2438]`). <!-- wargame-state: canonical; wargame-disposition: active -->
  - Depends on: THEME-4@canonical
  - Required stage: CANONICAL
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_THEME-5_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_THEME-5/execution.md`
  - Verifier/consumer: `packages/client/tests/LandingSocialProof.test.ts` verifying stats counters, leaderboard rows, FAQ expansion, and footer links
  - Preserves: Top 5 leaderboard entries, Steam Deck ready badge, and external repository links
  - User flows: FLOW-THEME-NAVBAR, FLOW-LANDING-CONVERSION
  - Point of no return: none
  - Subagent lane: `lane_footer_theme`
  - Contract charter: Git base `d3fe405`, exclude `packages/server/`, worktree `wt/footer_theme`, subsystem `packages/client/src/components/landing/LandingSocialProof.vue` + `packages/client/src/components/landing/LandingFooter.vue`

- [x] **THEME-6. Full Monorepo Build, Theme Toggle E2E Verification & Blast Radius Gate** — End-to-end theme switching integration test `ThemeToggleIntegration.test.ts` verifying seamless live toggling between light and dark modes across navbar, login, and all landing modules without contrast loss, CSS layout shifts, or console warnings. Full monorepo test suite pass (`pnpm test`), production build (`pnpm --filter client build`), and programmatic blast radius verification strictly confirming `["client"]`. <!-- wargame-state: outcome; wargame-disposition: active -->
  - Depends on: THEME-2@canonical, THEME-3@canonical, THEME-4@canonical, THEME-5@canonical
  - Required stage: OUTCOME
  - Battle Plan: `.wargaming/campaigns/2026-10-01_fintasy-stock-royale/success/mission_THEME-6_battleplan.md`
  - Execution Receipt: `.wargaming/receipts/mission_THEME-6/execution.md`
  - Verifier/consumer: `packages/client/tests/ThemeToggleIntegration.test.ts` + `pnpm test` (all 176 monorepo tests pass 100%) + `pnpm --filter client build` (code 0) + `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts` strictly returning `["client"]`
  - Preserves: 100% backward compatibility of all existing routes, navigation bars, and passing test suites
  - User flows: FLOW-THEME-NAVBAR, FLOW-LANDING-CONVERSION, FLOW-AUTH-LOGIN
  - Point of no return: none
  - Subagent lane: `lane_theme_integration`
  - Contract charter: Git base `d3fe405`, exclude `packages/server/`, worktree `wt/theme_integration`, subsystem complete theme tokens + client build verification

