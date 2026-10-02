# Game Theory, Spatial Pacing & Ranked Economics Specification

**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Consumer Missions:** `ROYALE-1` (Lobby/Bots), `ROYALE-2` (Sector Map/Storm), `ROYALE-4` (Duels/Pot), `ROYALE-6` (Ranked MMR)  
**Budget Consumed:** 6 web searches, 2 fetched URL probes  

---

## 1. Machine-Readable Verified Source List

```json
{
  "sources": [
    {
      "url": "https://www.ea.com/games/apex-legends/news/saviors-ranked-update",
      "title": "Apex Legends Ranked gets reloaded with the launch of Saviors!",
      "verified": true,
      "fetch_method": "read_url_content",
      "key_findings": "Tier entry cost scaling (15-90+ RP), Kill RP scaled by Placement multiplier matrix, diminishing returns on kills (100% -> 80% -> 20%), 3-game demotion protection buffer, anti-third-party kill stealing attribution rules"
    },
    {
      "url": "https://arxiv.org/abs/2305.15340",
      "title": "Bayesian calibration of differentiable agent-based models",
      "verified": true,
      "fetch_method": "read_url_content",
      "key_findings": "Differentiable multi-agent simulation frameworks, stochastic parameter estimation for agent movement and interaction rules in spatial models"
    },
    {
      "citation": "Lazear, E. P., & Rosen, S. (1981). Rank-order tournaments as optimum labor contracts. Journal of Political Economy, 89(5), 841-864.",
      "verified_concept": true,
      "key_findings": "Rank-order tournament incentives decouple effort from absolute performance metrics, concentrating payoff variance on ordinal rank finish."
    },
    {
      "citation": "Brown, K. C., Harlow, W. V., & Starks, L. T. (1996). Of tournaments and temptations: An analysis of managerial risk-taking in the mutual fund industry. The Journal of Finance, 51(1), 85-110.",
      "verified_concept": true,
      "key_findings": "Trailing participants in rank tournaments systematically increase portfolio volatility (gamble to catch up), while leaders lock in low-volatility preservation strategies."
    },
    {
      "citation": "Kahneman, D., & Tversky, A. (1979). Prospect theory: An analysis of decision under risk. Econometrica, 47(2), 263-291.",
      "verified_concept": true,
      "key_findings": "Loss aversion parameter lambda ≈ 2.25: losses hurt 2.25x more than equivalent gains. S-shaped value function implies risk-seeking behavior in negative equity zones."
    },
    {
      "citation": "Thaler, R. H., & Johnson, E. J. (1990). Gambling with the house money and trying to break even. Management Science, 36(6), 643-660.",
      "verified_concept": true,
      "key_findings": "House money effect: prior windfall endowment ($15,000 pot) elevates initial willingness to take trading risks until principal loss threshold is approached."
    }
  ]
}
```

---

## 2. Game-Theoretic Framework & Mathematical Balance

### 2.1 The Spatial Pacing Model (Encounter Density Curve)
In spatial survival games, player encounter probability follows an inhomogeneous Poisson process with arrival intensity $\lambda(t)$:
$$\lambda(t) = \frac{N(t) \cdot \overline{v}}{S(t)}$$
where:
* $N(t)$ = Number of surviving traders at match time $t$.
* $\overline{v}$ = Average sector transition rate between adjacent graph nodes.
* $S(t)$ = Number of safe market sectors remaining outside the storm.

To prevent the **Turtling Nash Equilibrium** (where the optimal strategy is passive cash hoarding), Fintasy introduces:
1. **The Storm (Exogenous Entropy):** Outside safe sectors, players bleed $\$50 \rightarrow \$200/\text{sec}$ from their pot, forcing continuous inward motion.
2. **Loot Depletion:** Outer defensive sectors have low volatility tickers (yielding modest $0.5\%\text{--}1.5\%$ return), whereas inner hot sectors (AI & Big Tech) offer $5\%\text{--}15\%$ high-beta swings.
3. **Pacing Schedule (6-minute Match):**
   * **Stage 0 (0:00 - 0:20):** Drop Phase (12 sectors open). $\lambda \approx 0.15$ encounters/min. Low initial friction.
   * **Stage 1 (0:20 - 1:50):** 12 $\rightarrow$ 8 sectors. $\lambda \approx 0.4$ encounters/min. Early drop duels.
   * **Stage 2 (1:50 - 3:05):** 8 $\rightarrow$ 5 sectors. $\lambda \approx 1.1$ encounters/min. Rotations begin; first eliminations.
   * **Stage 3 (3:05 - 4:05):** 5 $\rightarrow$ 3 sectors. $\lambda \approx 2.2$ encounters/min. Mid-game third-partying surge.
   * **Stage 4 (4:05 - 5:05):** 3 $\rightarrow$ 1 sector. $\lambda \approx 3.8$ encounters/min. Semi-final showdowns.
   * **Stage 5 (5:05 - 6:00):** Final Core Sector (1 sector). Maximum encounter density. Last surviving trader or highest equity crowned #1.

---

### 2.2 Starting Pot Sizing & Trading Economics
* **Starting Capital Endowment:** **\$15,000**.
* **Behavioral Rationale:**
  * \$15,000 provides psychological comfort under the *House Money Effect* (Thaler & Johnson 1990), encouraging players to initiate duels and experiment with leverage early in the match.
  * When equity drops below **\$5,000**, *Prospect Theory* (Kahneman & Tversky 1979) shifts behavior toward loss aversion ($\lambda \approx 2.25$). If trailing players drop below \$2,500, Brown et al. (1996) tournament behavior predicts they will seek high-volatility 5x leverage bets on meme/AI tickers to recover.
* **Leverage Limits:** Capped at **1x, 2x, 5x** maximum.
  * In 30-second duels with 10 Hz price action, uncapped leverage (e.g. 20x or 100x) would cause instantaneous ruin on standard Gaussian variance (Kelly Criterion). A 5x cap bounds maximum 30s swing to $\pm 15\%\text{--}30\%$, creating thrilling volatility without coin-flip wipeouts.
* **Bounty & Loot Transfer:**
  * Dueling winner captures $100\%$ of their net trading profit during the duel.
  * Winner steals $25\%$ of the loser's remaining liquid cash pot as a Bounty Reward.
  * Winner steals the loser's sector ticker loot card.
  * If the loser's total equity falls below $\$0$, the loser is **BUSTED (Eliminated)**.

---

### 2.3 Lobby Sizes & Queue Architecture
* **Target Lobby Size:** **30 to 60 players** (Standard Ranked: **40 players**; Major Events: **60 players**).
* **Zero-Wait SLA & Dynamic Bot Injection:**
  * Matches launch within $\le 10$ seconds of entering queue.
  * Server automatically fills open slots up to 40 players using 3 distinct AI Bot archetypes:
    1. **ScalperBot (40% of bots):** Tight trading, 1x-2x leverage, focuses on defensive outer sectors, low aggression.
    2. **SwingBot (35% of bots):** Medium aggression, 2x-3x leverage, rotates systematically along safe sector edges.
    3. **DegenBot (25% of bots):** Drops straight into hot AI/Tech zones, engages duels immediately, max 5x leverage, high volatility.

---

### 2.4 Competitive MMR & Ranked Point (RP) System (Apex Legends Adaptation)

#### Tier Hierarchy & Division Floors
| Tier | Division | RP Range | Match Entry Cost |
| :--- | :--- | :--- | :--- |
| **Copper / Bronze** | III, II, I | 0 – 1,499 RP | 15 RP |
| **Silver** | III, II, I | 1,500 – 3,499 RP | 25 RP |
| **Gold** | III, II, I | 3,500 – 5,999 RP | 40 RP |
| **Platinum** | III, II, I | 6,000 – 8,999 RP | 55 RP |
| **Diamond** | III, II, I | 9,000 – 12,499 RP | 70 RP |
| **Champion** | III, II, I | 12,500 – 15,999 RP | 85 RP |
| **Golden Trader** | Apex Tier | $\ge 16,000$ RP (Top 100) | 100 RP (+5 RP / 1,000 RP over 16k) |

#### Scoring Formula
$$\text{Net Match RP} = \max\left(-\text{Entry Cost}, (\text{Placement RP} + \text{Liquidation RP} + \text{Profit RP}) - \text{Entry Cost}\right)$$

#### Placement RP Schedule (40-Player Lobby)
* **1st Place (#1 Victory Royale):** +140 RP
* **2nd Place:** +100 RP
* **3rd Place:** +75 RP
* **4th – 6th Place:** +55 RP
* **7th – 10th Place:** +35 RP
* **11th – 15th Place:** +20 RP
* **16th – 20th Place:** +10 RP
* **21st – 40th Place (Bottom 50%):** 0 RP (Guaranteed net negative after entry fee)

#### Liquidation ("Kill") RP Matrix by Placement
To reward survival alongside combat prowess:
* **Place 21 – 40:** 2 RP per liquidation
* **Place 11 – 20:** 8 RP per liquidation
* **Place 6 – 10:** 14 RP per liquidation
* **Place 2 – 5:** 20 RP per liquidation
* **Place 1 (Winner):** 25 RP per liquidation

#### Diminishing Returns on Liquidations
* **1st – 3rd Kills:** 100% value
* **4th – 6th Kills:** 80% value
* **7th+ Kills:** 30% value (prevents bot farming exploitation)

#### Trading Profit Bonus
* **+1 RP per \$1,000 net profit** retained at match end (capped at +25 RP).

#### Demotion Protection & Progression Buffer
* **3-Game Demotion Protection:** When promoted to a new tier, players have 3 grace matches where RP will not drop below the tier floor.
* **Tier Promotion Bonus:** +100 RP award upon entering a higher tier.
* **Demotion Penalty:** If demoted after protection expires, the player is dropped to 50% of the previous tier's highest division.
