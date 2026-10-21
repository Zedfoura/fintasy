# Wargame ARC Specification — Mission DESIGN-4: Atrium Decision Queue & Dashboard Telemetry Integration

**Mission ID:** `DESIGN-4`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `CANONICAL`  
**Flow Coverage:** `FLOW-ROYALE-GOLDEN`, `FLOW-RANKED-PROGRESS`  
**Lane:** `lane_dashboard`  

---

## 1. Action (Proposed State Mutation)

1. **Create `packages/client/src/components/dashboard/DecisionQueue.vue`:**
   - Implement the Atrium Decision Queue cognitive triage pattern (from `docs/design-system/04-COMPONENTS.md` §1):
     - Header: "NEEDS YOUR DECISION (`N`)" with urgency counter badge in International Safety Orange (`#FF5522`) when items exist.
     - Subtitle: "Sorted by urgency. Nothing executes until approved."
     - Items triage list:
       - Duels / high-stakes challenges: Safety Orange badge (`[• HIGH STAKES 5x]`), countdown chip, Secondary Action ("Decline" - hairline outline), Primary Action ("ACCEPT" - filled Safety Orange CTA).
       - Margin alerts: Warning badge (`[• MARGIN ALERT]`), time ago, Secondary Action ("Dismiss"), Primary Action ("INSPECT" - filled Amber/Orange CTA).
       - Tournament invitations: Solvency/System badge (`[• INVITATION]`), Secondary Action ("Ignore"), Primary Action ("ENTER" - filled Emerald CTA).
     - Empty state: Clean quiet state "ALL DECISION QUEUES CLEAR • 0 PENDING ACTIONS" with emerald status indicator adhering to Dieter Rams' unobtrusive principle.
   - Enforce 4-tier Deep Midnight HUD elevation (`fn-surface-panel` / `bg-[#0E121B] border border-white/10`).

2. **Integrate into `packages/client/src/pages/dashboard/index.vue`:**
   - Embed `<DecisionQueue />` prominently at the top of the dashboard above `<PortfolioChart>` and `<PortfolioAssets>`.
   - Connect active decision actions with reactive state / route navigation to arena and tournament modules.

3. **Author Vitest Unit Test `packages/client/tests/DecisionQueue.test.ts`:**
   - Assay A: Verifies component rendering, title, and empty state.
   - Assay B: Verifies urgency badge count in Safety Orange when items are pending.
   - Assay C: Verifies item metadata, countdown chip, and action button differentiation (hairline secondary vs high-contrast primary).
   - Assay D: Verifies event emission (`acceptDecision`, `declineDecision`) upon button click.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)

- **R-1 (Layout Shift on Dashboard):** Adding the decision queue at the top of the dashboard could compress the portfolio equity chart and asset table on medium viewports.
  - *Counteraction:* Use collapsible or responsive flex layout with bounded vertical height so the chart remains fully legible on all viewports.
- **R-2 (Event Propagation & Bubble Conflicts):** Clicking "Decline" or "Accept" within a decision card might trigger card-level router navigation if click handlers are not stopped.
  - *Counteraction:* Use `@click.stop` on all action buttons and emit explicit events with item payload.
- **R-3 (Test Isolation & Mocking):** Dashboard test might depend on Pinia state or i18n context.
  - *Counteraction:* Keep `DecisionQueue.vue` pure and self-contained with props/defaults and clear event emissions, easily unit-tested with `@vue/test-utils`.

---

## 3. Counteraction & Gate Checks

- **C-1:** `npx vitest run tests/DecisionQueue.test.ts` passes 100%.
- **C-2:** Full client test suite (`npx vitest run tests`) passes 100% across all 19 test files.
- **C-3:** Production client build (`npx vite build`) completes with exit code 0.
- **C-4:** Programmatic blast radius calculation strictly confirms `["client"]`.
