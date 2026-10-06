<!--
  @author: Tinatsei Chingaya (Zedfoura), Antigravity
  @description: Stock Royale Official Field Manual & Paper Trading Game Guide
-->

# Stock Royale — Official Field Manual

Welcome to **Stock Royale**, a competitive 60-trader stock market battle royale built directly into Fintasy. This manual covers core game mechanics, sector topology, 30-second trading duels, storm collapse rules, and the Rocket League ranked rating system.

---

## 1. Match Overview & Objective

Every Stock Royale match is an intense, fast-paced trading simulation where 60 traders compete to be the last participant standing or hold the highest portfolio equity when the final circle closes.

- **Lobby Sizing:** 60 Traders (Human participants + dynamic AI bots across Scalper, Swing, and Degen archetypes).
- **Initial Capital Endowment:** **\$15,000.00** (1,500,000 integer cents). Zero floating-point rounding is enforced throughout the financial engine.
- **Match Pacing:** **6 minutes total** divided into **5 progressive storm contraction rounds**.
- **Market Engine:** Deterministic high-frequency **10 Hz (100 ms)** price tick simulation powered by correlated Geometric Brownian Motion with macroeconomic event shocks.

---

## 2. Market Sector Map & Storm Topology

The game map represents the financial markets divided into 12 concentric sector zones:

```
[OUTER SECTORS]      -> Utilities, Real Estate, Materials, Industrials
[MID-TIER SECTORS]   -> Healthcare, Financials, Energy, Consumer
[INNER HIGH-BETA]    -> Big Tech, AI Semiconductors, Biotech, Meme Alpha
```

### Storm Contraction & Capital Burn

As the match progresses, the outer sectors close sequentially:

1. **Drop Phase (0:00 - 0:20):** Select your initial drop sector. Uncontested drop sectors award free initial ticker loot cards!
2. **Safe Zones:** Indicated by the pulsing green radar rings on the Football Manager tactical radar.
3. **Collapsing Sectors:** Marked in amber with a countdown timer. When the timer hits 0:00, the sector collapses.
4. **Storm Hazard (Capital Burn):** Remaining inside a collapsed sector deals direct **Capital Damage** deducted in integer cents every second:
   - **Round 1:** \$10.00 / sec
   - **Round 2:** \$25.00 / sec
   - **Round 3:** \$50.00 / sec
   - **Round 4:** \$100.00 / sec
   - **Final Circle:** \$250.00 / sec

Traders whose equity drops to \$0.00 are **BUSTED** and eliminated from the match.

---

## 3. Micro-Trading Duels & Combat Protocol

When two or more traders encounter each other in a contested market sector or contest a high-value ticker drop, combat initiates!

- **30-Second Combat Clock:** You have 30 seconds to trade the active sector's ticker.
- **Order Execution:** Place instantaneous Long or Short market orders.
- **Leverage Tiers:** Select **1x**, **2x**, or **5x leverage** to amplify returns.
- **90% Margin Risk Gauge:** If your unrealized losses exceed 90% of your collateral, an **Auto-Liquidation Margin Call** immediately terminates the position to prevent debt.
- **Third-Party Battle Escalation:**
  - If a 3rd or 4th trader rotates into the sector during an ongoing duel, they can **Third-Party** the fight!
  - When a third party enters, the combat timer floor automatically extends to **15.0 seconds** to give all traders fair reaction and hedging time.
- **Victory Spoils:**
  - The trader with the highest % ROI when the timer expires wins the duel!
  - Victor collects their trading profits.
  - Victor steals **25% cash bounty** from each defeated participant's total pot.
  - Victor claims the loser's held ticker loot cards.

---

## 4. Competitive Ranked Progression (Rocket League MMR)

Stock Royale features a competitive ranked ladder inspired by _Rocket League_ and _Apex Legends_:

### Tier Hierarchy

1. **Bronze** (Divisions I, II, III) — 0 to 1,499 RP
2. **Silver** (Divisions I, II, III) — 1,500 to 2,999 RP
3. **Gold** (Divisions I, II, III) — 3,000 to 4,999 RP
4. **Platinum** (Divisions I, II, III) — 5,000 to 7,499 RP
5. **Diamond** (Divisions I, II, III) — 7,500 to 10,499 RP
6. **Champion** (Divisions I, II, III) — 10,500 to 13,999 RP
7. **Grand Champion** (Divisions I, II, III) — 14,000 to 15,999 RP
8. **Golden Trader** (Apex Tier) — **16,000+ RP**

### Match RP Calculation

Your post-match RP delta is determined by:
$$\Delta\text{RP} = \text{Placement Points} + (\text{Liquidations} \times \text{Multiplier}) + \text{Profit Bonus} - \text{Entry Fee}$$

- **Entry Cost:** Scaled by tier (15 RP for Bronze, up to 100+ RP for Golden Trader).
- **Placement Points:** Up to **+140 RP** for #1 Victory Royale.
- **Liquidation Multiplier:** Higher placements multiply liquidation scores. Diminishing returns apply after 3 and 6 kills to deter bot-farming inflation.
- **Demotion Protection:** Traders enjoy 3 matches of demotion grace after promotion, plus an absolute **0 RP floor** preventing negative debt traps.

---

## 5. Classic Paper Trading

Outside of Stock Royale, Fintasy retains its complete non-combat paper-trading suite:

- **Portfolios:** Create dedicated portfolios with custom starting balances.
- **Stock Quotes:** Real-time stock prices powered by the Alpaca Markets API.
- **Tournaments:** Compete in long-horizon trading tournaments with private leaderboards.

---

<I18nTitle title="pages.dashboard.help.title" />

<route lang="yaml">
meta:
  layout: dashboard-md
</route>
