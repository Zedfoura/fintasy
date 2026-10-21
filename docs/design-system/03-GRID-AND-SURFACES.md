# 03. Grid, Blueprint Surfaces & Geometry

> **Principle:** _Containers are not decorative boxes. They are precision instrument chassis with calibrated physical coordinates._

---

## 1. The Drafting-Room Physical Metaphor

Traditional software UI relies heavily on fuzzy drop-shadows and pillowy borders to separate layers. In aerospace telemetry, trading floors, and competitive arenas, instruments are held in rigid metal chassis with physical alignment pins and calibrated boundary rules.

In Fintasy, every card, modal, and terminal pane is treated as a **blueprint coordinate frame**:

- **Hairline Boundary Rules:** Layer boundaries use 1px hairlines at `rgba(255, 255, 255, 0.08)`—delivering razor-sharp delineation on HiDPI and Steam Deck screens without obscuring content.
- **Coordinate Crosshairs (`+`):** Positioned at grid junctions and container corners to indicate calibrated spatial positioning.
- **Atmospheric Dot-Matrix Texture:** Empty canvas areas and chart backdrops feature an understated 24px dot-matrix grid to provide tactile spatial depth.

---

## 2. The Spacing & Layout Scale (4px / 8px Base)

All margin, padding, and dimensional sizing in Fintasy adheres strictly to an 8px grid (with a 4px sub-step for compact micro-telemetry):

| Token / Spacing        | Value  | Primary Application                                                             |
| :--------------------- | :----- | :------------------------------------------------------------------------------ |
| `space-1` (`0.25rem`)  | `4px`  | Micro-gap between icons and labels, inner badge padding, countdown bar height.  |
| `space-2` (`0.50rem`)  | `8px`  | Gap between filter pills, leverage buttons, compact table row padding.          |
| `space-3` (`0.75rem`)  | `12px` | Standard card internal padding for dense HUD widgets, input field padding.      |
| `space-4` (`1.00rem`)  | `16px` | Standard card and modal padding, column gaps in split-screen duel terminals.    |
| `space-6` (`1.50rem`)  | `24px` | Section margins, spacing between major dashboard modules, dot-matrix grid step. |
| `space-8` (`2.00rem`)  | `32px` | Layout gutter between primary navigation and content viewports.                 |
| `space-12` (`3.00rem`) | `48px` | Major landing page section padding and modal vertical margins.                  |

---

## 3. Blueprint Geometry Elements

### 3.1 The Coordinate Crosshair (`+`)

Crosshairs originate from technical drafting and radar reticles. They are placed at the intersections of structural panels (e.g. top-left, top-right, or quadrant intersections in the Radar Map and Duel Terminal):

```
+-----------------------------------------------------------+
| + [ NVDA • LIVE 10 Hz ]                                 + |
|                                                           |
|                     [ CHART VIEWPORT ]                    |
|                                                           |
| + [ LEVERAGE: 5x ]                      [ MARGIN: 12% ] + |
+-----------------------------------------------------------+
```

- **Visual Style:** Monospaced `+` character or SVG reticle, sized at `10px - 12px`, with `text-slate-600` or `text-cyan-500/40` opacity.
- **Placement:** Positioned absolutely at `top-0 left-0`, `top-0 right-0`, `bottom-0 left-0`, `bottom-0 right-0` within relative container wrappers.

### 3.2 Technical Corner Brackets (`[ ... ]` & Framing Ticks)

For high-density widgets that must not feel boxed in by heavy opaque walls, corner brackets provide boundary definition with zero visual weight:

```css
/* Example UnoCSS corner bracket utility */
.fn-frame-brackets {
  position: relative;
}
.fn-frame-brackets::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  width: 8px;
  height: 8px;
  border-top: 1px solid var(--fn-accent-cyan);
  border-left: 1px solid var(--fn-accent-cyan);
}
.fn-frame-brackets::after {
  content: '';
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-bottom: 1px solid var(--fn-accent-cyan);
  border-right: 1px solid var(--fn-accent-cyan);
}
```

### 3.3 Atmospheric Dot-Matrix Background

To eliminate visual emptiness without distracting from real-time data, backdrops apply a geometric micro-dot matrix:

```css
.fn-dot-matrix {
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.07) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}
```

---

## 4. Corner Radii Hierarchy

Corner curvature signals the functional tier of a component:

| Radii                     | CSS Class                     | Application & Rationale                                                                                                      |
| :------------------------ | :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Sharp (`0px - 2px`)**   | `rounded-none` / `rounded-xs` | **Technical HUD Frames:** Canvas charts, orderbook depth ladders, terminal viewports. Preserves rigid engineering precision. |
| **Compact (`4px - 6px`)** | `rounded` / `rounded-md`      | **Operational Controls:** Form inputs, modal containers, leverage buttons, card panels. Provides comfortable affordance.     |
| **Pill (`9999px`)**       | `rounded-full`                | **Status Indicators & Triage Pills:** Sector tags, taxonomy badges (`[ SEMIS_AI ]`), countdown progress bars, user avatars.  |

---

## 5. Responsive Grid & Handheld / Steam Deck Standards

Fintasy runs in desktop browsers, PWAs on mobile devices, and natively on the **Steam Deck (1280 × 800 at 16:10)**. Layouts must adapt gracefully:

```
DESKTOP (12-Column Grid):
[ SIDEBAR (2 Cols) ] [ MAIN TERMINAL / DUEL ARENA (7 Cols) ] [ TELEMETRY / ORDERBOOK (3 Cols) ]

STEAM DECK / TABLET (1280 × 800 - 16:10 Split):
[ COMPACT COLLAPSIBLE NAV ] [ SPLIT-SCREEN ARENA: LEFT PLAYER (50%) | RIGHT OPPONENT (50%) ]

MOBILE (Single-Column Vertical Stack):
[ TOP HUD BAR: P&L + CLOCK ] -> [ LIVE CHART ] -> [ EXECUTION CONTROLS ] -> [ DUEL OPPONENT ]
```

- **Steam Deck Invariant:** Key combat actions ("LONG", "SHORT", "CLOSE") must have a minimum touch/click hit target of **44 × 44px**, with explicit D-Pad and Gamepad trigger mappings (`L2` for Short, `R2` for Long).
