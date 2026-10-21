# Battle Plan — Mission LANDING-REV-2: Navigation Header & Hero Combat Terminal (Elements 1-5)

**Mission:** `LANDING-REV-2`  
**Required Evidence Stage:** `CANONICAL`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md`, `docs/design-system/07-LANDING-PAGE-V2-SPEC.md`, `.agents/skills/landing-page-guide-v2/SKILL.md`  
**Assigned Parallel Lane:** `lane_landing_hero`  
**Target Files:**
- `packages/client/src/components/landing/LandingHeader.vue` (Element 2: Company Logo, live telemetry dot, navigation links, and launch button)
- `packages/client/src/components/landing/LandingHero.vue` (Elements 3-5: Massive display typography, primary and secondary CTAs, social proof telemetry counters)
- `packages/client/tests/LandingHeroV2.test.ts` (Vitest test suite verifying Elements 1-5)

---

## 1. Concrete Execution Steps

### 1.1 Implement `LandingHeader.vue` (Element 2)
- Sticky top navigation bar with subtle backdrop blur: `bg-[#07090E]/85 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)]`.
- Logo mark with tactical brand identity: `FINTASY` with bracketed taxonomy chip `[ COMBAT TERMINAL ]`.
- Live 10 Hz system status dot: `● 10 Hz MATCH ENGINE • LIVE`.
- Navigation links: `Arena`, `Pillars`, `Intelligence`, `FAQ`.
- Quick launch CTA button: `Deploy to Royale` linking to `/dashboard/royale`.
- Secondary actions: `Sign In` linking to `/login`, and `Dashboard` linking to `/dashboard`.

### 1.2 Implement `LandingHero.vue` (Elements 3, 4, 5)
- **Element 3 (SEO Headline & Subtitle):**
  - Season 1 indicator badge with subtle ping dot: `[ SEASON 01 • S&P 500 LIQUIDITY WARFARE ]`.
  - Headline: Display font `font-serif` (`Instrument Serif`) at `text-5xl sm:text-6xl lg:text-7xl xl:text-8xl`, reading:
    *"High-Stakes Capital Warfare."* with editorial gradient accent *"Where Wall Street Meets Battle Royale."*
  - Subtitle: Crisp sans typography at `text-lg sm:text-xl text-slate-300 max-w-3xl`, reading:
    *"Trade the tape in ultra-fast 30-second duels. Navigate collapsing sector liquidity, hunt over-leveraged traders, and battle from Bronze to Golden Trader on zero financial risk."*
- **Element 4 (Primary CTA):**
  - High-impact Action Horizon Safety Orange (`#FF5522`) primary button: `Enter Live Combat Arena →` with hover scale (`hover:scale-105`), click navigation to `/dashboard/royale`, and tactical hint `[ Press Enter ↵ ]`.
  - Secondary button: `Explore Duel Mechanics` scrolling smoothly to the bento pillars or media demo.
  - Tertiary subtle link: `Paper Trading Portfolio` linking to `/dashboard`.
- **Element 5 (Social Proof Counters):**
  - High-visibility monospace telemetry statistics grid:
    1. `$142M+` Monitored Simulation Capital (`font-mono tabular-nums text-2xl font-bold text-white`)
    2. `48,200+` Active Competitive Traders
    3. `100ms` Execution Loop Speed
    4. `4.92 / 5.0` Trader Satisfaction Rating (custom stars)
    5. `$0.00` Personal Capital Risk (100% Simulated)

### 1.3 Vitest Suite `packages/client/tests/LandingHeroV2.test.ts`
- Assay A: Verifies `LandingHeader.vue` renders brand identity, live status dot, and navigation links.
- Assay B: Verifies header CTAs trigger router navigation to `/dashboard/royale` and `/login`.
- Assay C: Verifies `LandingHero.vue` renders new headline, editorial serif styling, and fresh subtitle with zero legacy copy.
- Assay D: Verifies primary Action Horizon CTA triggers router push to `/dashboard/royale`.
- Assay E: Verifies all 5 social proof telemetry metrics render with monospace tabular numbers.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/LandingHeroV2.test.ts` passes 100%.
2. Programmatic blast radius calculated strictly as `["client"]`.
