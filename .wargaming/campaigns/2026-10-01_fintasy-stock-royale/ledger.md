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

- [ ] **ROYALE-10. Real-Time WebSocket Client, Kill Feed Ticker & Post-Match Victory HUD** — Client composable useRoyaleMatch.ts connecting to the server WebSocket feed, feeding real-time events into KillFeed.vue (liquidations, storm tick warnings, sector closures), spectator view for fallen traders, and MatchVictoryModal.vue celebrating #1 Victory Royale with Rocket League rank badge animation and MMR gains. <!-- wargame-state: proposed; wargame-disposition: active -->
  - Depends on: ROYALE-7@canonical, ROYALE-9@activation
  - Required stage: ACTIVATION
  - Verifier/consumer: `packages/client/tests/RoyaleMatchFlow.test.ts` verifying WebSocket event handling, kill feed event rendering, and victory screen display
  - Preserves: Client state store and notification system
  - User flows: FLOW-ROYALE-GOLDEN, FLOW-TACTICAL-SPECTATE
  - Point of no return: none
  - Subagent lane: `lane_tactical_ui`

### Epic 5 — Live End-to-End Match Integration & Steam Readiness <!-- wargame-epic: e2e-verification; wargame-epic-priority: 5 -->

- [ ] **ROYALE-11. 60-Player Full Match Simulation & Regression Verification** — Full end-to-end automated test harness running a complete 60-player match from lobby fill -> drop selection -> storm collapse -> multiple concurrent 30s duels & third-parties -> final circle elimination -> winner coronation -> database persistence & MMR calculation, along with full regression verification of legacy Fintasy paper-trading endpoints. <!-- wargame-state: proposed; wargame-disposition: active -->
  - Depends on: ROYALE-10@activation
  - Required stage: OUTCOME
  - Verifier/consumer: `packages/server/tests/royale/test_e2e_match.py` producing a verifiable match receipt proving complete match lifecycle with 60 participants and zero unhandled exceptions
  - Preserves: 100% test pass on legacy unit tests (basic_test.py, quote_test.py, sessions_test.py, tournaments_test.py, transactions_test.py, user_test.py)
  - User flows: FLOW-ROYALE-GOLDEN
  - Point of no return: none
  - Subagent lane: `lane_engine`

- [ ] **ROYALE-12. Tauri Desktop Wrapper & Steamworks SDK Scaffolding** — Scaffolding of Tauri 2.0 configuration (src-tauri/) enabling one-command packaging of the web application into native Windows and Linux (Steam Deck) desktop executables with steamworks-rs bridge stubs for Steam Achievements and Rich Presence. <!-- wargame-state: proposed; wargame-disposition: active -->
  - Depends on: ROYALE-11@outcome
  - Required stage: ACTIVATION
  - Verifier/consumer: Desktop compilation and smoke check verifying web bundle rendering within native OS webview container
  - Preserves: Web browser deployment continues to function independently
  - User flows: not applicable (platform packaging)
  - Point of no return: none
  - Subagent lane: `lane_engine`
