# Battle Plan — Mission LANDING-1: Hero Arena, Value Proposition & Dual Conversion CTAs

**Mission:** `LANDING-1`  
**Required Evidence Stage:** `CANONICAL` (Floor: `ACTIVATION`)  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`  
**Assigned Parallel Lane:** `lane_landing_ui`  
**Target Files:**
- `packages/client/src/pages/index.vue` (Modify/Overhaul)
- `packages/client/src/components/navigation/HomeNav.vue` (Modify)
- `packages/client/locales/en.yml` (Modify)
- `packages/client/tests/LandingHero.test.ts` (New)

---

## 1. Concrete Execution Specification

### 1.1 Landing Page Hero Section (`packages/client/src/pages/index.vue`)
* Layout: `home`.
* Hero Visual Elements:
  * Top live-status badges:
    * `Season 1: Liquidity Drain Active` (Pulsing emerald/gold badge)
    * `60 Traders Per Match`
    * `100ms Fast Match Engine`
  * Hero Title & Subtitle:
    * Headline: **The 60-Player Stock Market Battle Royale**
    * Subtitle: *Drop into real-time S&P 500 market sectors, loot high-volatility tickers, fight 30-second trading duels, escape the Federal Reserve liquidity drain storm, and climb to Golden Trader rank.*
  * Dual Conversion Action Buttons:
    * Primary CTA: **Deploy to Stock Royale** (large glowing button with `Crosshair` icon, clicking navigates to `/dashboard/royale`).
    * Secondary CTA: **Sign In / Register** (sleek outline button, clicking navigates to `/login`).
    * Quick Guest Play / Practice mode link.
  * Live Simulated Market Ticker:
    * Scrolling/animated ticker bar showing simulated tickers (`NVDA +4.2%`, `TSLA -2.1%`, `AAPL +1.8%`, `MSFT +0.9%`, `SPY -0.4%`, `BTC +5.7%`).
  * Tactical Preview Teaser Graphic:
    * Visual mock card showing the 12-sector radar map and 30s duel terminal.

### 1.2 Home Header Action Button (`packages/client/src/components/navigation/HomeNav.vue`)
* Add prominent "Play Royale" action button (`<n-button type="primary">`) adjacent to dashboard link.
* Preserves language switcher and theme switchers.
* Responsive collapse on narrow viewports.

### 1.3 Localization Update (`packages/client/locales/en.yml`)
* Add dedicated keys under `pages.landing.hero`:
  * `headline`, `subheadline`, `season-badge`, `cta-deploy`, `cta-login`, `cta-guest`, `fast-engine-badge`, `traders-badge`.

### 1.4 Automated Verification Assays (`packages/client/tests/LandingHero.test.ts`)
* **Assay A (Hero Heading & Copy):** Asserts hero title and battle-royale value proposition render.
* **Assay B (Live Status Badges):** Asserts presence of season badge and match engine stats chips.
* **Assay C (Dual Conversion CTAs):** Asserts primary CTA navigates to `/dashboard/royale` and secondary CTA navigates to `/login`.
* **Assay D (HomeNav Play Royale Button):** Asserts `HomeNav.vue` renders the Play Royale button.
* **Assay E (Responsive UnoCSS Layout Classes):** Asserts responsive container classes prevent overflow.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/LandingHero.test.ts` passes 100%.
2. Full test suite `pnpm test` passes 100%.
3. Monorepo linting `pnpm run lint` passes with 0 errors and 0 warnings.
4. Programmatic blast radius calculated: confirms strictly `["client"]`.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** `CLEAN-4` completed at `e3e92a606bfdea046e878e11beb9df476887a5e1`.
* **Rollback Plan:** `git checkout -- packages/client/`
* **Point of No Return:** None (isolated client UI).
