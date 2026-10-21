# Fintasy Design System: Grounded in Reason

> **"If an element does not explain, quantify, or afford an action, it has no place on the canvas."**

Welcome to the **Fintasy Design System**. This guide provides the philosophical foundations, mathematical rules, typographic hierarchy, chromatic semantics, and component specifications that govern the user experience across all Fintasy surfaces—from traditional Alpaca paper trading to high-frequency Stock Royale battle royale matches.

---

## 1. System Manifesto

Fintasy occupies a unique intersection in software design: it combines **institutional financial simulation** with **competitive esports combat**. Most financial platforms are dry, visually stagnant tables; most esports interfaces are noisy, chaotic, and ungrounded.

Our design system rejects both extremes. We design from **first principles**:

1. **Physical & Functional Grounding:** Every line, crosshair, and border originates from blueprint drafting and aerospace telemetry. Visual elements indicate boundaries, coordinates, and system state—not arbitrary decoration.
2. **The Tabular Law of Financial Invariants:** Money is never an approximation. In code, currency is strictly integer cents ($15,000.00 = `1500000` cents). In UI, financial digits **must never jitter laterally**. All numerical figures must adhere to tabular monospace discipline.
3. **Cognitive Triage (The Atrium Model):** In volatile markets and battle royale duels, human attention is the scarcest asset. Interfaces are strictly divided into **Active Decision Queues** (high contrast, high urgency) and **Ambient Telemetry** (muted, non-distracting continuous feeds).
4. **Deliberate Chromatic Semantics:** Color is functional status. Safety Orange is reserved exclusively for volatile risk and critical execution; Solvency Emerald signals profit and safe zones; Storm Crimson marks damage and auto-liquidation.

---

## 2. Document Map

This design guide is modularized into seven authoritative chapters:

- **[00. The 10 Principles of Dieter Rams](./00-DIETER-RAMS-PRINCIPLES.md):** The philosophical rubric: _Weniger, aber besser_ (Less, but better) applied to financial simulation, 10 Hz telemetry, and Stock Royale combat.
- **[01. Foundations & Chromatic Semantics](./01-FOUNDATIONS.md):** The core philosophy, color palette tokens, semantic color mappings, surface elevation layers, and dual-surface architecture.
- **[02. Typography & The Tabular Law](./02-TYPOGRAPHY.md):** The tri-font stack (`Geist Mono`, `Geist Sans`, `Editorial Serif`), tabular numeric alignment, typographic scales, and casing rules.
- **[03. Grid, Blueprint Surfaces & Geometry](./03-GRID-AND-SURFACES.md):** The drafting-room coordinate system, crosshairs (`+`), bracket chips (`[ ... ]`), hairline borders, and tactile dot-matrix canvas.
- **[04. Component Architecture & Patterns](./04-COMPONENTS.md):** Decision queues, radial telemetry gauges, sparklines, ticker chips, Stock Royale combat arena HUD, and modal dialogs.
- **[05. Visual Telemetry & State Dynamics](./05-TELEMETRY-AND-STATE.md):** Silent operation, luminescent feedback, warning pulse escalations, and 10 Hz stream health indicators.
- **[06. Code Implementation & UnoCSS Tokens](./06-CODE-INTEGRATION.md):** Engineering guide, CSS custom property definitions, UnoCSS shortcuts, and Naive UI theme integration.

---

## 3. High-Level Visual Reference Matrix

| Experience Layer                 | Primary Archetype          | Dominant Palette                                                    | Key Typography                     | Reference Inspiration |
| :------------------------------- | :------------------------- | :------------------------------------------------------------------ | :--------------------------------- | :-------------------- |
| **Stock Royale Match & Duels**   | Tactical Telemetry HUD     | Midnight Navy (`#07090E`), Cyber Cyan, Safety Orange, Storm Crimson | `Geist Mono` (Tabular)             | _Blackalgo_ HUD       |
| **Portfolio & Tournaments**      | Executive Decision Hub     | Deep Slate (`#0E121B`), Indigo, Solvency Emerald                    | `Geist Sans` + `Geist Mono`        | _Atrium_ Intelligence |
| **Numeric & Formulaic Display**  | High-Precision Ledger      | High-contrast Monospace, Tabular Figures                            | `Geist Mono`                       | _Geist Mono_ Specimen |
| **Marketing, Landing & Debrief** | Modernist Blueprint Canvas | Dot-Matrix Canvas, Sand/Slate contrast, International Safety Orange | High-Contrast Serif + `Geist Mono` | _Technical Editorial_ |

---

## 4. Governance & Contributions

When introducing or modifying a component in `packages/client`:

1. Check the component against the **Core Tenets** in [01-FOUNDATIONS.md](./01-FOUNDATIONS.md).
2. Ensure all monetary and real-time values employ the **Tabular Law** in [02-TYPOGRAPHY.md](./02-TYPOGRAPHY.md).
3. Verify that borders and spacing align with the **Blueprint Grid** in [03-GRID-AND-SURFACES.md](./03-GRID-AND-SURFACES.md).
4. Run the programmatic blast radius check before committing changes:
   ```bash
   npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "relative/path/to/component.vue"
   ```
