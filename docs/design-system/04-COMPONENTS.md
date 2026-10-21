# 04. Component Architecture & Patterns

> **Principle:** _Every component must clearly separate actionable decisions from background telemetry. Visual hierarchy dictates cognitive speed._

---

## 1. The Decision Queue Pattern (The Atrium Model)

In complex platforms, users are overwhelmed when high-urgency notifications are mixed into passive activity logs. Inspired by the _Atrium_ property management dashboard, Fintasy implements a dedicated **Decision Queue** component:

```
+----------------------------------------------------------------------------------------------------+
| NEEDS YOUR DECISION (3) • Sorted by urgency. Nothing executes until approved.          [ View All > ] |
+----------------------------------------------------------------------------------------------------+
| [NVDA]  30-Sec Duel Challenge from 'ScalperBot_1'    [• HIGH STAKES 5x]    12s left   [Decline] [ACCEPT] |
| [MARGIN] NVDA Position approaching 75% margin cap    [• MARGIN ALERT]      2m ago     [Dismiss] [INSPECT]|
| [TOURNEY] Apex Grandmaster Qualifier starting soon   [• INVITATION]        15m ago    [Ignore]  [ENTER]  |
+----------------------------------------------------------------------------------------------------+
```

### Component Anatomy & Rules:

1. **Urgency Count Badge:** Header displays an active badge counter (`3`) in Safety Orange (`#FF5522`) when items require immediate action.
2. **Metadata Badges:** Each item features an uppercase mono badge (`[• HIGH STAKES 5x]`) with a color-coded status dot.
3. **Action Button Differentiation:**
   - **Secondary Action ("Decline", "Dismiss"):** Subtle hairline outline (`border-white/10 bg-white/5 text-slate-300 hover:bg-white/10`).
   - **Primary Action ("Accept", "Inspect", "Enter"):** High-contrast filled button (Safety Orange `#FF5522` for duels, Solvency Emerald `#10B981` for safe actions, or Cyber Cyan `#06B6D4` for system entries).

---

## 2. Radial Telemetry Gauges & Metric Meters

For circular data (such as auto-liquidation margin depletion, portfolio win rates, and zone time elapsed), Fintasy employs concentric radial SVG rings:

```
       .-''''-.
     .'  90%   '.   <- Ring Stroke Gradient: Emerald (0%) -> Amber (50%) -> Crimson (90%)
    /   MARGIN   \
   |  DEPLETION   |  <- Tabular Monospace Percentage Center Display
    \            /
     '.        .'
       '-....-'
```

### Technical Requirements:

- **Zero Layout Shift:** The diameter, stroke width, and center typography must remain fixed during real-time value changes.
- **Semantic Gradient Strokes:**
  - Margin Meter: Transitions from `#10B981` (0%–50%) to `#F59E0B` (50%–70%) to `#F43F5E` (70%–90% auto-liquidation danger).
  - Safe Zone Timer: Transitions from `#06B6D4` (Active) to `#FF5522` (Closing in 10s).

---

## 3. Stock Royale Combat Arena HUD

The Trading Duel Arena split-screen terminal represents the highest-intensity surface in the platform.

```
+---------------------------------------------------------------------------------------------+
| [SECTOR: SEMIS_AI]   [NVDA: $128.40 (10 Hz)]   [BOUNTY POT: $3,750]   [CLOCK EXPIRY: 00:08] |
| [====================================== PROGRESS BAR ===============================] (PULSE)|
+---------------------------------------------------------------------------------------------+
| ⚠️ THIRD-PARTY ESCALATION: 3-WAY BATTLE ACTIVE!                            [CLOCK EXTENDED]  |
+--------------------------------------------------------------+------------------------------+
| LEFT PANE: PLAYER EXECUTION TERMINAL (7 COLS)                | RIGHT PANE: OPPONENTS (5 COLS)|
| - Live 10 Hz Geometric Brownian Motion Canvas Chart         | - Opponent 1: ScalperBot_1   |
| - Active Position Card (LONG 5x @ $128.10 | P&L: +$140.00)   |   ROI: +1.8% | Equity: $15.2k|
| - 90% Margin Depletion Gauge Meter                           | - Opponent 2: MomentumBot_2  |
| - Order Entry Leverage Pills: [ 1x ] [ 2x ] [ 5x ]           |   ROI: -0.4% | Equity: $14.9k|
| - Action Triggers: [ BUY LONG ] (Emerald) | [ SELL SHORT ] (Rose)                           |
+--------------------------------------------------------------+------------------------------+
```

### Key UI Invariants:

- **The Countdown Bar:** A 6px linear meter spanning the top of the duel. When `secondsRemaining <= 10`, the bar transitions from Cyan (`#06B6D4`) to flashing Safety Orange/Crimson (`#FF5522` / `#F43F5E`) with an active CSS pulse animation.
- **Auto-Liquidation Warning:** If margin depletion reaches `70%`, a pulsing warning banner appears:
  `⚠️ CRITICAL MARGIN DANGER: 90% AUTO-LIQUIDATION IMMINENT`.
- **Zero Floating-Point Fidelity:** Every dollar value displayed in this component is converted from exact integer cents using `formatCentsToUsd(cents)`.

---

## 4. Numbered Taxonomy Badges & Bracket Chips

Used across the platform to tag modules, sectors, and metadata:

### Code Patterns (UnoCSS):

```vue
<!-- Numbered Taxonomy Badge (from Geist Mono specimen) -->
<div class="inline-flex items-center gap-1.5 border border-[#FF5522]/30 bg-[#FF5522]/10 px-2 py-0.5 rounded-sm">
  <span class="font-mono text-[10px] font-black text-[#FF5522]">02</span>
  <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-200">SECONDARY FONT</span>
</div>

<!-- Bracketed Telemetry Chip (from Blackalgo HUD) -->
<div class="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-cyan-400">
  <span class="text-slate-500">[</span>
  <span>10 Hz GBM • TICK STREAM</span>
  <span class="text-slate-500">]</span>
</div>

<!-- Active Leverage Pill Group -->
<div class="flex items-center gap-1">
  <button class="px-2.5 py-0.5 font-mono text-xs font-black rounded-sm border border-cyan-400 bg-cyan-500 text-slate-950">
    1x
  </button>
  <button class="px-2.5 py-0.5 font-mono text-xs font-bold rounded-sm border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
    2x
  </button>
  <button class="px-2.5 py-0.5 font-mono text-xs font-bold rounded-sm border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
    5x
  </button>
</div>
```

---

## 5. Global Command Bar (`⌘K` / `Ctrl+K`)

Inspired by modern developer tooling and the Atrium search bar, the Fintasy Command Bar provides instant access to any stock, tournament, duel arena, or help guide:

- **Trigger:** Keyboard shortcut `⌘K` (Mac) or `Ctrl+K` (PC/Deck), or clicking the header search input.
- **Backdrop:** Full-screen elevation Level 3 backdrop blur (`backdrop-blur-md bg-black/60`).
- **Input Field:** Large monospaced input with search icon, live ticker filter, and instant arrow-key navigation.
- **Instant Ticker Jump:** Typing `NVDA` jumps directly to the live chart or launches an instant 30-second AI duel.
