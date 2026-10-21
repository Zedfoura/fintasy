# ARC / Battle Plan — CLOSE-2 FAQ & Final CTA Sections on `/` and the Standalone Build (campaign 2026-10-20_fintasy-hero)

## Claim frame
- **Outcome:** on `/` (dev server) and in the standalone build (`vite preview` of dist-hero), after the Match-timeline section:
  - **FAQ:** `<section id="faq" aria-labelledby="faq-title">`, the locked C1 FAQ. Six questions; each is an `<h3><button aria-expanded aria-controls>` with an answer region; item 01 starts open.
  - **CTA:** `<section id="cta" aria-labelledby="cta-title">`, the locked C1 closing: "That's the match." over the static rings, with the hero's two links.
  - Both render inside the shared `FintasyPage`, so `/` and the standalone build stay identical. Copy is word for word from `close-direction.md`, and the styles use `tokens.json#close`.
- **Required stage:** ACTIVATION.
- **Authority needed to EXECUTE:** an explicit grant to edit `packages/client`. None yet: the 2026-10-21 instruction was "…Then write the CLOSE-2 battle plan."
- **Ref:** `refs/heads/feature/closing-sections` @ `d4acd02`, which includes the hype overflow fix `c95d4bb`. Local only, not pushed; it stacks on PR #4.
- **Spec inputs (read-only):**
  - `close-direction.md` (anatomy, copy, disclosure contract, accessibility, build notes);
  - `tokens.json#close`;
  - prototype `wargames/close-directions/page/?c=c1`, with CSS in `close.css` (`.cl`, `.c1-*`).
- **Data model:** `.wargaming/DATA-MODEL-AUTHORITY.md` (sha256 `1807e0c9…f3207`), client-only / no-data-tier.
- **Rulings:**
  - **D4:** no live game, outbound links only.
  - **D7:** CTA = `SOURCE_URL` + `CASE_STUDY_URL`.
  - **D8:** the FAQ 03 wording is the user's; do not change it.
- **Invariants:**
  - These must stay green: HeroSection 14, HeroRetention 4, HypeSection 13, HypeVignettes 29, PageRetention 6, ThemeToggleIntegration 4, HeroVisual 11.
  - One `nav` and one `h1`; zero internal links; `/#match` still lands at top 0.
  - The full suite keeps exactly the 2 known DesignTokens failures.
  - The standalone bundle check stays clean (no RouterView, auth token, `/api/v1`, pinia or naive-ui).
  - **Zero overflowing elements** by the per-element rect check (not `scrollWidth`) at 1440/768/375.
- **Falsifiers (each recorded red, then reverted):**
  1. A `/login` href in the CTA → the CloseSections link test fails.
  2. "Play now" in an answer → the fact test fails.
  3. An out-of-allowlist number ("100,000 traders") in an answer → the fact test fails.
  4. Removing `aria-expanded` from a question button → the disclosure test fails.
  5. Clicking a question does not toggle (the handler is a no-op) → the disclosure test fails.
  6. Removing `box-sizing: border-box` from a section root → the live rect check reports overflow at 1440.
- **Flows:**
  - FLOW-CLOSE-SECTIONS @ ACTIVATION. This is a new inventory row, added in this PLAN.
  - FLOW-HERO-FIRST-IMPRESSION and FLOW-HYPE-SECTION as regression.

## Grounding probes (2026-10-21, at `d4acd02`)
| Probe | Result |
|---|---|
| Composition point | ✅ `FintasyPage.vue:41-55` renders `<HypeSection>` with its four vignette slot fills, then `</main>`. The new sections go after it, inside `main`. |
| Page tests that pin the composition | ❌ `HypeSection.test.ts:152` asserts `main > section` classes equal `['hero', 'hype']`, so adding sections fails it. **Decision:** update the assertion to `['hero', 'hype', 'close-faq', 'close-cta']`. This is an intended contract change, recorded in the receipt with the before/after run. |
| Whole-page fact rule | ❌ `hypeBeats.ts:79` `FACT_ALLOWLIST` has ordinals 01–04 only. `PageRetention.test.ts:76` runs `factViolations` over the whole page text, so the FAQ's aria-hidden ordinals `05` and `06` (still in `textContent`) would fail it. **Decision:** add `'05'` and `'06'` to `FACT_ALLOWLIST`, with a comment that they are ordinals. Also add `/create (an )?account/i` and `/deploy to/i` to `BANNED_PHRASES`, mirroring the close fact gate. |
| Link assertions | ✅ `PageRetention.test.ts:84` expects the page's href set to equal `{SOURCE_URL, CASE_STUDY_URL}`. The CTA reuses exactly those two, so the set is unchanged and the test stays valid. |
| Reduced motion | ⚠️ No CSS animation exists today, so neither section has a `prefers-reduced-motion` rule. The FAQ icon's 0.2s rotate needs `@media (prefers-reduced-motion: reduce) { transition: none }`. A unit test can't observe this (jsdom has no CSS), so it is verified live via computed style. |
| Overflow instrument | ✅ Fixed in CLOSE-1: a per-element rect check over `main *`, excluding visually hidden ≤1 px elements. `scrollWidth` is blind under `main`'s `overflow-x: clip`. |
| Box sizing | ✅ Known trap (DEF-HYPE-OVERFLOW): section roots must set `box-sizing: border-box` themselves. |

## Design
1. **`src/components/close/closeCopy.ts`**, typed data copied word for word from `close-direction.md`:
   - `CLOSE_FAQ` holds `{ id, ordinal: '01'…'06', question, answer }[]`;
   - `FAQ_KICKER`, `FAQ_TITLE_LINES`, `FAQ_INTRO`;
   - `CTA_KICKER`, `CTA_TITLE`, `CTA_BODY`.
   - A header comment names the source per answer, including the D8 note on 03.
2. **`src/components/close/CloseFaq.vue`:**
   - `<section id="faq" class="close-faq" aria-labelledby="faq-title">` with `--close-*` variables and `box-sizing: border-box` on the root;
   - a header grid like the hype header (kicker `1 / -1`);
   - the list renders `CLOSE_FAQ`. Each item is `<h3><button type="button" :aria-expanded :aria-controls :id>`, holding the aria-hidden ordinal, the question and the aria-hidden icon, plus `<div role="region" :aria-labelledby :id :hidden>`;
   - open state is a reactive `Set` initialised to `{'01'}`, with independent toggles;
   - focus-visible is a 2px violet outline;
   - the icon transition is disabled under reduced motion;
   - below 760 px every span becomes `1 / -1`, using the mobile grid from the tokens.
3. **`src/components/close/CloseCta.vue`:**
   - `<section id="cta" class="close-cta" aria-labelledby="cta-title">` with `box-sizing: border-box`;
   - three aria-hidden rings;
   - kicker, `h2`, body;
   - links import `SOURCE_URL` / `CASE_STUDY_URL` from `heroLinks.ts`. Primary: `target="_blank" rel="noopener noreferrer"`; secondary: same tab. Styles mirror `.hero-btn` / `.hero-link`.
4. **`FintasyPage.vue`:** render `<CloseFaq />` and `<CloseCta />` after `</HypeSection>`. No router, store or API imports.
5. **`hypeBeats.ts`:** the allowlist and banned-phrase additions from the probes. This is the only edit in a HYPE file.
6. **`tests/CloseSections.test.ts`** (new):
   - **Structure:** one `#faq` labelled by its h2 with the locked two lines; six `h3 > button` in locked order (hard-coded, not read from `closeCopy.ts`); one `#cta` with h2 "That's the match.".
   - **Disclosure:** 01 starts `aria-expanded="true"` with its region visible, the others start false/hidden. A click toggles both `aria-expanded` and `hidden`. `aria-controls` points to an existing region id, and each region's `aria-labelledby` points back to its button. Opening one leaves the others unchanged.
   - **Facts:** `factViolations` over `#faq` and `#cta` text returns no offenders and no banned phrases.
   - **Links:** the CTA hrefs equal `[SOURCE_URL, CASE_STUDY_URL]` in that order; the primary has `target="_blank"` and `rel="noopener noreferrer"`; zero `a[href^="/"]` across the page.
   - **Page:** `FintasyPage` order is hero → hype → faq → cta; exactly 1 `nav` and 1 `h1`; `StandaloneHero` renders identical `#faq` and `#cta` HTML.
7. **`HypeSection.test.ts:152`:** the composition assertion update from the probes.
8. **Flows:** the new inventory row FLOW-CLOSE-SECTIONS (entry points: scroll, deep link `/#faq`, reentry) and claims for CLOSE-2/3. Every existing claim is rebound to the new inventory hash; the validator must report VALID for all of them.

## ARC rows
| Action | Reaction (risk) | Counteraction |
|---|---|---|
| Add two sections to the shared page | Existing page tests that pin the composition break | Planned update to `HypeSection.test.ts:152` only; every other existing test must pass unedited |
| Allowlist `05`/`06` | Loosens the fact rule (a "05" in body copy would pass) | They are 2-digit, zero-padded ordinals only; falsifier 3 still proves real numbers are caught |
| Accordion state | Region and button drift (`aria-expanded` true but `hidden` still set) | Unit test asserts both attributes change together; falsifiers 4 and 5 |
| Section roots | Repeat of DEF-HYPE-OVERFLOW | `border-box` on both roots; live rect check at 3 widths plus falsifier 6 |
| CTA links | Hard-coded URLs drift from the hero | Import from `heroLinks.ts`; link test compares against the same constants |
| Standalone bundle | New components pull in app-shell code | Bundle check with its leak and empty-input controls; JS size recorded before and after (76.58 kB) |
| Copy drift | D8 wording or the CTA line "corrected" during build | `closeCopy.ts` copied verbatim; test hard-codes the six questions; receipt diffs the copy against `close-direction.md` |
| Commits | lint-staged shared stash | Single lane (parent), sequential commits, no worktrees |

## Transitions and evidence
1. **`planned → executing`:** grant recorded; HEAD = `d4acd02`; baseline suite count recorded (expected 175 with 2 DesignTokens failures).
2. **`→ mechanism_verified`:**
   - CloseSections green;
   - falsifiers 1–5 red, with raw output;
   - all existing hero, hype and page test files green, with only the planned `HypeSection.test.ts:152` change, shown failing before and passing after.
3. **`→ canonical`:**
   - commit on `feature/closing-sections`;
   - full suite `N of M` (only the 2 DesignTokens failures, named);
   - `vite build` and `build:hero` exit 0;
   - bundle check clean with both controls;
   - knip shows 0 new findings.
4. **`→ activated`:**
   - live on dev `:3333` and `vite preview` `:4173`: HTTP 200; DOM order hero → match → faq → cta; 1 nav, 1 h1, 0 internal links;
   - rect check 0 overflowing at 1440/768/375, plus falsifier 6;
   - keyboard: Tab reaches each question, Enter and Space toggle;
   - reduced-motion computed `transition` on the icon (where emulable; otherwise UNVERIFIED);
   - CLS 0; 0 console errors on the standalone build;
   - flow validator VALID.

## Lane
Parent (integrator), single lane, committing on `feature/closing-sections`.
- **Owns:**
  - `src/components/close/**`;
  - `src/components/page/FintasyPage.vue`;
  - `src/components/hype/hypeBeats.ts` (allowlist and banned-phrase lines only);
  - `tests/CloseSections.test.ts`;
  - `tests/HypeSection.test.ts` (line 152 only);
  - the campaign `flows/inventory.json` and `.wargaming/flows/claims/mission_CLOSE-*.json`.
- **Excludes:** `heroSim.ts`, `components/hype/vignettes/**`, `HypeSection.vue`, `HeroSection.vue`, `HeroVisual.vue`, `heroLinks.ts`, `main.ts`, `vite*.config.ts`.

## Rollback / point of no return
Revert the CLOSE-2 commit(s). There is no local point of no return. **Push and PR are Tier B and each needs its own go-ahead;** merging `main` triggers `deploy-images.yml`.
