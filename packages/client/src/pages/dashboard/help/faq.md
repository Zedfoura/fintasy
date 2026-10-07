<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Stock Royale & Fintasy Platform Frequently Asked Questions (FAQ)
-->

# Frequently Asked Questions (FAQ)

---

### What is Stock Royale?

Stock Royale is a 60-player battle royale trading simulator. Traders drop into 12 market sectors, trade high-frequency price ticks in 30-second duels, evade progressive storm closures that burn capital, and fight to survive as the last trader standing.

---

### How much money do I start with in Stock Royale?

Every participant begins each match with **\$15,000.00** (stored and computed strictly as **1,500,000 integer cents**). This closed-system financial model preserves strict conservation of money across all trading duels and storm burns.

---

### How does storm damage work?

As the 6-minute match progresses through 5 rounds, outer sectors sequentially collapse. If you remain inside a collapsed sector outside the safe zone, you take continuous capital tick damage ranging from **\$10.00/sec in Round 1** up to **\$250.00/sec in the Final Circle**.

---

### What happens if my equity reaches $0?

If your pot drops to \$0.00—whether due to storm hazard damage or losing trading duels—you are **BUSTED** and eliminated. Defeated players automatically transition to **Spectator Mode**, where they can follow the remaining surviving traders in real time.

---

### How does leverage work in duels and when do I get liquidated?

You can select **1x, 2x, or 5x leverage** for rapid scalping during a 30-second duel. Leverage multiplies your profit or loss relative to price movement. To protect your portfolio, our **90% Margin Risk Circuit Breaker** will auto-liquidate your position if unrealized losses exceed 90% of your collateral.

---

### What is a "Third-Party" battle?

Just like in traditional battle royales, if an active duel is underway in a sector and another trader rotates into that sector, they can **Third-Party** the duel. When a third party joins, the combat timer floor dynamically extends to **15.0 seconds** so all participants have reaction and hedging time. The trader with the highest % ROI takes the spoils!

---

### How does the Ranked MMR system work?

Stock Royale uses a **Rocket League-style tier system** (Bronze I through Golden Trader) paired with **Apex Legends Ranked Points (RP)**. You pay a tier-based entry fee to queue into a match, and you earn RP through final placement, liquidations (kills), and total net trading profits.

---

### Can I play against AI bots?

Yes! If a lobby is waiting for players or you want an instant game, the lobby orchestrator automatically fills remaining slots with intelligent trading bots configured across realistic archetypes:

- **Scalpers (40%):** Ultra-fast micro-order traders.
- **Swings (35%):** Methodical trend followers.
- **Degens (25%):** High-beta 5x leverage gamblers.

---

### Can I run Stock Royale on Steam Deck or as a desktop app?

Yes! The repository includes a production **Tauri 2.0** desktop bundle (`src-tauri/`) configured specifically for the Steam Deck (1280x800 native 16:10 resolution) with Steamworks SDK scaffolding for Rich Presence and Steam Achievements. Run `pnpm desktop:dev` to launch desktop mode.

---

### Does Stock Royale exhaust real API rate limits?

No! Stock Royale high-frequency in-match trading duels are powered by our deterministic in-memory **10 Hz Geometric Brownian Motion Market Engine**. The external Alpaca Markets API is reserved for non-royale paper-trading portfolio lookups with a 15-minute LRU cache.

---

<I18nTitle title="pages.dashboard.help.faq.title" />

<route lang="yaml">
meta:
  layout: dashboard-md
</route>
