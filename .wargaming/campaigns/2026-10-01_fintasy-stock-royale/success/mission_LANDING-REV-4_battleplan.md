# Battle Plan — Mission LANDING-REV-4: Social Proof Testimonials, FAQ Accordion & Final Hero CTA (Elements 8-10)

**Mission:** `LANDING-REV-4`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `docs/design-system/07-LANDING-PAGE-V2-SPEC.md`, `.agents/skills/landing-page-guide-v2/SKILL.md`  
**Assigned Parallel Lane:** `lane_landing_conversion`  
**Target Files:**
- `packages/client/src/components/landing/LandingTestimonials.vue` (Element 8: Authentic competitive trader reviews with custom avatars and ratings)
- `packages/client/src/components/landing/LandingFAQ.vue` (Element 9: Interactive smooth accordion UI addressing 6 core player questions)
- `packages/client/src/components/landing/LandingFinalCTA.vue` (Element 10: Dramatic full-width hero conversion section with tournament countdown)
- `packages/client/tests/LandingConversionV2.test.ts` (Vitest test suite verifying Elements 8-10)

---

## 1. Concrete Execution Steps

### 1.1 Implement `LandingTestimonials.vue` (Element 8)
- Section container id `trader-reviews` with taxonomy chip `[ 03 • COMPETITIVE DEBRIEFINGS ]`.
- Title: *"Battle-Tested by Elite Traders."*
- 4 authentic trader cards in a 2x2 grid:
  1. **Marcus Vance (@vance_trades)** — Golden Trader Tier #14 • 78.4% Win Rate
  2. **Elena Rostova (@quant_elena)** — Apex MMR 2,840 • 82.1% Win Rate
  3. **David Chen (@macro_chen)** — Diamond II Division • 69.5% Win Rate
  4. **Sarah Jenkins (@alpha_sarah)** — Platinum III • 71.0% Win Rate (Univ. Club President)
- Card elevation: Obsidian `#0E121B` with hairline border `rgba(255,255,255,0.08)`, subtle hover lift, custom glowing star rating, and verbatim trader praise.

### 1.2 Implement `LandingFAQ.vue` (Element 9)
- Section container id `faq-section` with taxonomy chip `[ 04 • FREQUENTLY ASKED QUESTIONS ]`.
- Title: *"Frequently Asked Questions."*
- Accordion component with state management (`openIndex: ref<number | null>(0)`):
  - 6 questions covering capital risk, liquidity storm dynamics, match duration, MMR ranking, multi-platform support, and price engine fidelity.
  - Smooth CSS height/opacity transitions and rotating chevron icons.

### 1.3 Implement `LandingFinalCTA.vue` (Element 10)
- Full-width dramatic hero section with deep midnight backdrop and Action Horizon border glow (`#FF5522/25`).
- Headline: *"The Arena is Live. Claim Your $15,000 Starting Stake."*
- Subtitle: *"Join 48,000+ traders competing in daily ranked tournaments. Deploy instantly in your browser."*
- Live tournament countdown badge: `NEXT GLOBAL TOURNAMENT DROPS IN 04:32`.
- Massive Action Horizon CTA button: `Deploy to Stock Royale Now →` routing to `/dashboard/royale`.
- Trust badges strip: `No credit card required • Instant browser play • Steam Deck verified`.

### 1.4 Vitest Suite `packages/client/tests/LandingConversionV2.test.ts`
- Assay A: Verifies `LandingTestimonials.vue` renders all 4 authentic trader cards with names, ranks, and quotes.
- Assay B: Verifies `LandingFAQ.vue` toggles accordion answers on click.
- Assay C: Verifies `LandingFinalCTA.vue` renders tournament timer, $15,000 starting equity, and deploy CTA button.
- Assay D: Verifies final CTA click triggers router navigation to `/dashboard/royale`.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/LandingConversionV2.test.ts` passes 100%.
2. Programmatic blast radius calculated strictly as `["client"]`.
