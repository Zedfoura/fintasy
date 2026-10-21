# Battle Plan — Mission LANDING-REV-5: Multi-Column Footer, Full Monorepo Build, E2E Vitest Suite & Programmatic Blast Radius Gate (Element 11 & Gate)

**Mission:** `LANDING-REV-5`  
**Required Evidence Stage:** `OUTCOME`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `docs/design-system/07-LANDING-PAGE-V2-SPEC.md`, `.agents/skills/landing-page-guide-v2/SKILL.md`  
**Assigned Parallel Lane:** `lane_landing_gate`  
**Target Files:**
- `packages/client/src/components/landing/LandingFooter.vue` (Element 11: Multi-column comprehensive footer)
- `packages/client/src/pages/index.vue` (Complete assembly of all 11 elements with zero legacy copy and zero AI cliches)
- `packages/client/tests/LandingPageIntegration.test.ts` (Full E2E integration test suite for assembled surface)
- Legacy landing test suites aligned to brand-new components

---

## 1. Concrete Execution Steps

### 1.1 Implement `LandingFooter.vue` (Element 11)
- 4-column multi-category layout:
  - Column 1: Brand mark, mission, and live engine status (`● 10 Hz MATCH ENGINE • ALL SYSTEMS NOMINAL`).
  - Column 2: Platform Architecture (`Trading Arena`, `Market Sector Radar`, `Ranked Seasons`, `Simulation Engine`).
  - Column 3: Resources & Community (`GitHub Repository`, `Discord Community`, `Documentation Guide`, `Steam Deck Packaging`).
  - Column 4: Legal & Fair Play (`Terms of Service`, `Privacy Policy`, `Fair Play Rules`, `Simulated Capital Notice`).
- Separator line and bottom bar with copyright `© 2026 Fintasy Inc.` and commit hash watermark.

### 1.2 Re-assemble `packages/client/src/pages/index.vue`
- Incorporate Element 1 (SEO metadata & descriptive OpenGraph title in `useHead`).
- Assemble Elements 2 through 11 in sequence:
  `<LandingHeader />` -> `<LandingHero />` -> `<LandingMediaSection />` -> `<LandingBenefits />` -> `<LandingTestimonials />` -> `<LandingFAQ />` -> `<LandingFinalCTA />` -> `<LandingFooter />`.
- Enforce Dieter Rams & Grounded in Reason HUD chassis: `#07090E` low-emissions canvas with 24px blueprint dot-matrix texture (`fn-dot-matrix`).

### 1.3 Update Integration Tests
- Update `LandingPageIntegration.test.ts` to mount the full assembled page and verify all 11 elements, router clicks, $15,000 pot invariant (`INV-1`), and interactive widgets.
- Ensure all other test files in `packages/client/tests/` remain 100% green.

### 1.4 Production Build & Programmatic Blast Radius Gate
- Run `npx vite build` to ensure zero compilation or asset errors.
- Run `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "..."` to prove strictly `["client"]`.

---

## 2. Falsifiable Verification Assays
1. All client tests pass (100% green across all test files).
2. Production build (`npx vite build`) exits with code 0.
3. Programmatic blast radius strictly outputs `["client"]`.
