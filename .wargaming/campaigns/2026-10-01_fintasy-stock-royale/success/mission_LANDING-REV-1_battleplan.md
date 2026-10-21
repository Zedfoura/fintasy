# Battle Plan — Mission LANDING-REV-1: Aesthetic Direction, Tri-Font Typography & Design System Specification

**Mission:** `LANDING-REV-1`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `docs/design-system/`, `.agents/skills/landing-page-guide-v2/SKILL.md`  
**Assigned Parallel Lane:** `lane_landing_spec`  
**Target Files:**
- `docs/design-system/07-LANDING-PAGE-V2-SPEC.md` (Authoritative aesthetic & copy architecture spec)
- `packages/client/src/styles/design-tokens.css` (Confirm token registry & extend any required landing tokens)
- `packages/client/unocss.config.ts` (Confirm font families, display typography, and landing shortcuts)

---

## 1. Concrete Execution Steps

### 1.1 Aesthetic & Conversion Direction
- **Chosen Direction:** High-Tech Tactical Luxury / Minimalist & Refined Monospace Editorial
- **Philosophy:** Fusing Dieter Rams' 10 Principles (*"Weniger, aber besser"*) with DESIGNNAS's 11 Essential Elements Framework.
- **Rules of Engagement:**
  1. **Zero Legacy Copy:** Replace all previous generic battle royale copy ("The 60-Player Stock Market Battle Royale...", "Drop into real-time S&P 500 sectors...", etc.) with fresh, high-conviction, professional financial warfare terminology.
  2. **Zero AI Cliches:** No purple gradients on white backgrounds, no generic line icons, no default yellow star ratings, no cookie-cutter 3-column feature grids, no stock photos.
  3. **11 Essential Elements Guaranteed:**
     - Element 1: URL with Keywords & SEO Metadata (OpenGraph, description, titles)
     - Element 2: Company Logo & Sticky Navigation Header (`LandingHeader.vue`)
     - Element 3: SEO-Optimized Title and Subtitle with MASSIVE display typography (`Instrument Serif` / `Space Grotesk`)
     - Element 4: Primary CTA with micro-interactions and Action Horizon Safety Orange (`#FF5522`)
     - Element 5: Social Proof with verified numbers ($142M+ simulated capital, 48,200+ traders, 100ms match loop, 4.92/5 rating)
     - Element 6: Realistic 3D Tilt Tactical Combat Terminal & live tick sparkline preview
     - Element 7: Core Benefits in an asymmetric bento grid layout
     - Element 8: Customer Testimonials with authentic trader profiles, MMR ranks, and ratings
     - Element 9: FAQ Section with smooth interactive accordion UI
     - Element 10: Final Hero CTA full-width section with tournament countdown and risk-free badges
     - Element 11: Multi-column authoritative footer with legal, community, and system telemetry

### 1.2 Tri-Font Typography & Visual Palette Contract
- **Typography:**
  - Display Hero Headlines: `Instrument Serif` (editorial elegance, 4.5rem - 6.5rem desktop)
  - Telemetry & Numbers: `Geist Mono` (`tabular-nums font-mono`)
  - Primary UI & Body: `Geist` / `DM Sans`
- **Color Palette:**
  - Chassis Canvas: `--fn-surface-canvas: #07090E;`
  - Panels: `--fn-surface-panel: #0E121B;`
  - Cards: `--fn-surface-card: #151C2B;`
  - Action Horizon: `--fn-accent-orange: #FF5522;`
  - Telemetry Emerald: `--fn-accent-emerald: #10B981;`
  - Telemetry Cyan: `--fn-accent-cyan: #06B6D4;`
  - Telemetry Rose: `--fn-accent-crimson: #F43F5E;`

---

## 2. Falsifiable Verification Assays
1. Authoritative specification document `docs/design-system/07-LANDING-PAGE-V2-SPEC.md` written and validated.
2. UnoCSS configuration and `design-tokens.css` verified ready for landing components.
3. Programmatic blast radius calculated strictly `["client"]`.
