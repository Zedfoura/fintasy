# Campaign: Fintasy Stock Royale (Battle-Royale Trading Simulator)

- **Slug:** `2026-10-01_fintasy-stock-royale`
- **Goal:** Level up Fintasy into a 30-60 player battle-royale paper trading simulator with sector drop zones, circle collapses, 30-second trading duels, third-party combat, Football Manager tactical broker UI, and Rocket League inspired ranked MMR progression.
- **Scope:** 
  - Complete vertical slices:
    - Real-time match engine and 30-60 player lobby with AI bots.
    - Market sector graph map with zone collapse and capital tick damage.
    - Deterministic high-frequency market simulation and loot/ticker inventory.
    - Micro-trading duel mechanics (30s battles, profit scoring, loot stealing, liquidation) and third-party battle joining.
    - Rocket League ranked tier system (Bronze to Golden Trader) with PostgreSQL persistence.
    - Football Manager (FM) tactical command center UI with radar heatmap, duel HUD, kill feed, and spectator mode.
    - Codebase cleanup, dead mock code elimination, in-app platform navigation, and comprehensive documentation overhaul.
    - Marketing landing page revamp at `/`, conversion funnel, interactive 30s duel mini-simulator widget, 4 gameplay pillars showcase, Golden Trader leaderboard preview, and modern responsive footer.
- **Authority:** Planning artifacts only; execution requires explicit user authorization.
- **Disposition:** active
- **Run Mode:** `PostgreSQL + In-Memory Fast Match State Machine + WebSocket Event Stream`
- **Data Model Authority:** Cited `.wargaming/DATA-MODEL-AUTHORITY.md`
