# 05. Visual Telemetry, Animation & State Dynamics

> **Rule:** _Fintasy is an entirely silent, visual-first platform. All urgency, state transitions, and environmental threats are conveyed through precision visual telemetry, rhythmic pulses, and luminescence—never audio distraction._

---

## 1. Silent Operation Axiom

Trading and competitive esports require absolute cognitive immersion. Extraneous audio alerts, beeps, and soundscapes cause distraction and fatigue in noisy trading environments or during competitive voice calls.

By design decision, **Fintasy emits zero system audio**. All environmental feedback is delivered through:

1. **Luminescent Horizons:** Dynamic edge glows and ambient aura shaders.
2. **Harmonic Rhythmic Pulses:** Calibrated CSS keyframe pulses for time-critical states.
3. **Linear & Radial Meters:** Fluid CSS width and SVG stroke transitions.
4. **Micro-Typography Status Glyphs:** Explicit alphanumeric state tags (`⚠️`, `⚡`, `● LIVE`).

---

## 2. Visual Pulse & Urgency Graduations

When a state demands user attention, the visual tempo escalates in three distinct phases:

```
[ PHASE 1: NOMINAL AMBIENT ] (Normal Operation)
- Static hairline borders: rgba(255, 255, 255, 0.08)
- Stable Cyan/Emerald text: #06B6D4 / #10B981
- Steady 10 Hz price updates

[ PHASE 2: WARNING & ELEVATION ] (e.g. Clock <= 10s, Margin >= 70%)
- Color shift to International Safety Orange: #FF5522
- Slow pulse cycle (1.5s period): opacity shifts between 0.75 and 1.0
- Glowing border aura: box-shadow: 0 0 12px rgba(255, 85, 34, 0.25)

[ PHASE 3: CRITICAL DANGER / IMMINENT BUST ] (e.g. Clock <= 3s, Margin >= 85%)
- Color shift to Storm Crimson: #F43F5E
- Rapid heartbeat pulse (0.6s period): animate-pulse with scale micro-bounce
- High-visibility banner alert: text-rose-300 with flashing warning glyphs
```

### CSS Animation Tokens:

```css
/* Standard Warning Pulse */
@keyframes fn-pulse-warning {
  0%,
  100% {
    opacity: 1;
    border-color: rgba(255, 85, 34, 0.8);
    box-shadow: 0 0 12px rgba(255, 85, 34, 0.3);
  }
  50% {
    opacity: 0.6;
    border-color: rgba(255, 85, 34, 0.3);
    box-shadow: 0 0 4px rgba(255, 85, 34, 0.1);
  }
}

/* Critical Danger Heartbeat */
@keyframes fn-pulse-critical {
  0%,
  100% {
    transform: scale(1);
    background-color: rgba(244, 63, 94, 0.25);
    border-color: #f43f5e;
  }
  50% {
    transform: scale(1.015);
    background-color: rgba(244, 63, 94, 0.45);
    border-color: #fb7185;
    box-shadow: 0 0 20px rgba(244, 63, 94, 0.5);
  }
}
```

---

## 3. Network & Simulation Telemetry (10 Hz Indicators)

Traders must always know the operational health of real-time feeds without checking developer tools. Fintasy embeds persistent telemetry chips into the header and duel arena:

```
+-----------------------------------------------------------+
| ● 10 Hz TICK STREAM (GBM)   •   LATENCY: 14ms   •   FPS: 60 |
+-----------------------------------------------------------+
```

- **Live Status Dot (`●`):**
  - Green (`#10B981`): WebSocket connected, tick interval `< 120ms`.
  - Amber (`#F59E0B`): Degradation detected, tick interval `120ms – 500ms`.
  - Flashing Red (`#F43F5E`): Reconnecting, tick feed paused.

---

## 4. Kill Feed & Storm Damage Visual Toasts

In Stock Royale, player liquidations, duel victories, and storm deductions appear in a dedicated top-right **Combat Telemetry Feed**:

```
+-------------------------------------------------------------------------+
| [SECTOR STORM]  3 Traders liquidated in Outer Materials Ring (-$50/s)   |
| [DUEL VICTORY]  You eliminated 'ScalperBot_1' (+$3,750 Bounty Claimed)  |
| [3RD PARTY]     'MomentumBot_2' contested active duel on NVDA           |
+-------------------------------------------------------------------------+
```

- **Duration:** Toasts persist for exactly `4.0 seconds` before fading smoothly via `transition-opacity duration-300`.
- **Stacking:** Maximum 4 visible toasts simultaneously. Older entries are discarded without layout jumping.
- **Styling:** Semi-translucent Level 2 surface (`#151C2B` at 90% opacity) with a 1px left accent border color-coded to the event type.
