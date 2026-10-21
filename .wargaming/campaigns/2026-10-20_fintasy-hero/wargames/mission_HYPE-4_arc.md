# ARC / Battle Plan — HYPE-4 Integration, Page Retention Guard & Live Scroll Verification (campaign 2026-10-20_fintasy-hero)

## Claim frame
- **Outcome:** on `/` (dev server) and in the standalone build, each beat frame of the Match-timeline section holds its live vignette (drop, duel, storm, lobby) in place of the static fallback.
  - Scrolling from hero into section at 1440/768/375:
    - the hero canvas stops drawing once it leaves the viewport;
    - each vignette draws only while it is at least 10% visible;
    - CLS stays 0, with no console errors and no horizontal overflow.
  - A page-level retention guard (`tests/PageRetention.test.ts`) fails if any of the following regress: the section, its four beats, the vignette wiring, the facts, the outbound-only link rule (D4), or the hero above it.
- **Required stage:** RETENTION, meaning the guard is in the suite and each of its falsifiers has been run red once.
- **Authority needed to EXECUTE:** an explicit grant to edit `packages/client`. None yet: the 2026-10-21 instruction was "Write the HYPE-4 battle plan first; don't edit packages/ yet."
- **Ref:** `refs/heads/feature/hype-section` @ `1539a2a` (local only, upstream unset).
- **Upstream evidence:**
  - HYPE-2 is `canonical` (`receipts/mission_HYPE-2/execution.md`).
  - HYPE-3 is `activated` (`receipts/mission_HYPE-3/execution.md`).
  - Suite baseline at `1539a2a` is 167/169; the 2 failures are the known DesignTokens assays A and B.
- **Spec inputs (read-only):** `hype-direction.md` § Vignettes / Slot contract; `tokens.json#hype.vignettes`.
- **Data model:** `.wargaming/DATA-MODEL-AUTHORITY.md` (sha256 `1807e0c9…f3207`), client-only / no-data-tier.
- **Invariants:**
  - Everything HYPE-3 preserved:
    - HeroSection 14/14, HeroRetention 4/4, ThemeToggleIntegration 4/4, HypeSection 13/13, HypeVignettes 29/29, HeroVisual 11/11;
    - one `nav` and one `h1`;
    - zero internal links;
    - `/#match` lands at top 0.
  - HERO-6's standalone contract: relative asset paths, self-hosted fonts, and a clean bundle check (no RouterView, auth token, `/api/v1`, pinia or naive-ui).
  - `heroSim.ts` and the vignette engines are unchanged. HYPE-4 composes them and does not modify them.
- **Falsifiers (each recorded as a red run, then reverted):**
  1. Remove one beat from `HYPE_BEATS` → PageRetention fails.
  2. Change a beat's number to one outside the allowlist ("12 sectors") → PageRetention fails.
  3. Add `<a href="/login">` to HypeSection → PageRetention fails.
  4. Drop one vignette from the page's slot fills (that frame falls back to the static rings) → PageRetention's wiring test fails.
  5. Swap two vignettes (drop ↔ storm) → the wiring test fails. This proves it checks the mapping, not just a count.
  6. Live control: force one vignette's IntersectionObserver to "visible" at scroll top (patch in page) → the offscreen-draw probe must report non-zero, proving the probe can see a draw.
- **Flows:** FLOW-HYPE-SECTION @ RETENTION; FLOW-HERO-FIRST-IMPRESSION as regression.

## Grounding probes (2026-10-21, at `1539a2a`)
| Probe | Result |
|---|---|
| Where the vignettes mount | ✅ `FintasyPage.vue` renders `<HypeSection />` with no slot fills; `HypeSection.vue:36` exposes `vignette-${beat.vignette}` slots with aria-hidden fallbacks. **Decision:** FintasyPage fills the four slots. HypeSection stays as is and its fallback tests stay valid. Both entry points get the vignettes through the one shared page. |
| Vignette props / sizing | ✅ Each `Vignette*.vue` takes an optional `seed` and draws into a canvas that fills its parent (`.hype-vignette > :slotted(*)`, `HypeSection.vue:179`) |
| Vignette loop in jsdom | ⚠️ `useVignetteLoop.ts`: in jsdom `clientWidth` is 0, so `paint` returns before `getContext` (no "not implemented" noise). With no IntersectionObserver and no `matchMedia`, it still calls `schedule()`, so an rAF loop runs until unmount. Three existing test files mount `/` (`HeroSection.test.ts:156`, `HeroRetention.test.ts:30`, `ThemeToggleIntegration.test.ts:151`) and will start four such loops. **UNVERIFIED** whether that causes failures or teardown noise. Clearing probe: EXECUTE preflight step 1. |
| Hero canvas offscreen pause | ✅ in code: `HeroVisual.vue:274-287` IntersectionObserver plus `visibilitychange`. Never measured live with the section below it; that is HYPE-4's live check. |
| Reduced motion live | ❌ The browser pane can emulate color scheme but not `prefers-reduced-motion`. Reduced motion stays proven by unit tests only (HypeVignettes: 0 rAF, ≥1 draw). The live run records this as **UNVERIFIED (not emulable)** rather than claiming it. |
| Exports for the guard | ✅ `hypeBeats.ts` exports `HYPE_BEATS`, `HYPE_TITLE_LINES`, `HYPE_ANCHOR` and `factViolations`; `heroLinks.ts` exports `SOURCE_URL` and `CASE_STUDY_URL` |
| HYPE-4 flow claim | ⚠️ `retention_guard.location` points at `HeroSection.test.ts` (copied from HERO-3) and `battle_plan` is null. Both are corrected in this PLAN. |

## Design
1. **`src/components/page/FintasyPage.vue`** (the only source edit):
   - import the four vignettes;
   - fill `#vignette-drop|duel|storm|lobby` with `<VignetteDrop/>`, `<VignetteDuel/>`, `<VignetteStorm/>` and `<VignetteLobby/>`, using default seeds;
   - no router, store or API imports.
2. **`tests/PageRetention.test.ts`** (new). It mounts `pages/index.vue` with `HeroVisual` and the four `Vignette*` stubbed by name; each stub renders `data-test="vignette-<id>"`.
   - **Section:** `section#match` labelled by `hype-title`; the h2 is the locked two lines; 4 `article`s with h3 order Drop / Duel / Storm / Last one solvent.
   - **Wiring:** in each `hype-frame-<beat>`, exactly the matching `vignette-<id>` stub is present and its `hype-fallback-<beat>` is absent.
   - **Facts:** `factViolations(section text)` and `factViolations(page text)` both return no offenders and no banned phrases.
   - **Links (D4):** zero `a[href^="/"]`; the set of hrefs equals `{SOURCE_URL, CASE_STUDY_URL}`.
   - **Hero still first:** `h1#hero-title` exists and precedes `section#match` in document order; exactly 1 `nav` and 1 `h1`.
   - **One composition:** `StandaloneHero.vue`, mounted with the same stubs, renders the same `section#match` HTML as `/`.
3. **Existing page tests:** run them unchanged first. Only if preflight step 1 shows failures or teardown noise caused by the real vignettes, add the same name stubs to the `/`-mounting tests. Record that as a decision with the raw before/after output.
4. **Flows:** HYPE-4 claim gets `retention_guard.location = packages/client/tests/PageRetention.test.ts` and owner HYPE-4; stage advances only with receipts.

## Live verification method (browser pane)
- **Dev `:3333` and dist-hero preview `:4173`:** HTTP 200 and the same DOM checks as HYPE-3; in addition, 4 canvases inside `#match` and no `.hype-fallback` rendered.
- **Draw probe:**
  - Patch `CanvasRenderingContext2D.prototype.{setTransform, clearRect, fillRect}` in the page to count calls per canvas over a 1 s window.
  - Measure at 3 scroll positions per width:
    - **top:** hero only, so the hero should be drawing and every vignette count should be 0;
    - **beat 2 centred:** the duel, plus at most its neighbours above the 10% threshold;
    - **page bottom:** hero count 0 and lobby drawing.
  - Expected: no canvas draws while below the threshold. Falsifier 6 proves the probe can detect a draw.
- **Other checks:**
  - CLS through a full scroll (PerformanceObserver `layout-shift`, buffered) is 0;
  - `scrollWidth === innerWidth` at 375/768/1440;
  - zero console errors;
  - a screenshot per width with the vignettes visible.
- **Tab hidden:** `visibilitychange` pause is unit-proven. Live it is UNVERIFIED (the pane cannot hide its own tab reliably), so it is recorded rather than claimed.

## ARC rows
| Action | Reaction (risk) | Counteraction |
|---|---|---|
| Mount 4 canvases plus the hero canvas on one page | Several animating canvases jank the scroll or drain CPU | Visibility gating (≥10%) and the offscreen hero pause, measured live by the draw probe; at most ~2 vignettes plus 0 hero should draw at once mid-section |
| Real vignettes in tests that mount `/` | rAF loops in jsdom cause flaky or hanging tests | Preflight step 1 measures before deciding; stubs by name only if needed |
| Bundle growth in dist-hero | App-shell leakage or a size blow-up | Bundle check (with its empty-input and leak controls); record the JS size before and after (69.66 kB baseline) |
| Canvas sizing in the 16:9 frame | Layout shift as canvases size after mount | Frames already reserve `aspect-ratio: 16/9`; CLS is measured |
| Guard that can't fail | A retention test that passes on regressions | Falsifiers 1–5 run red before acceptance |
| Probe that can't see | A "0 offscreen draws" result from a broken counter | Falsifier 6 positive control |

## Transitions and evidence
1. `planned → executing`: grant recorded; HEAD = `1539a2a`; baseline suite 167/169 recorded.
2. **Preflight step 1:** mount the vignettes in FintasyPage, then run HeroSection, HeroRetention, ThemeToggleIntegration and HypeSection. Record raw output and any teardown warnings, and decide on stubs.
3. `→ mechanism_verified`:
   - PageRetention green;
   - falsifiers 1–5 red, with raw output;
   - all existing hero and hype test files green.
4. `→ canonical`:
   - commit on `feature/hype-section`;
   - full suite `N of M` (only the 2 DesignTokens failures, named);
   - `vite build` and `build:hero` exit 0;
   - bundle check clean with both controls;
   - knip shows 0 new findings vs `1539a2a`.
5. `→ activated`: live checks above on dev and dist-hero, with falsifier 6.
6. `→ retained`: the PageRetention guard is in the suite on the committed branch and its falsifiers are recorded. Epic 3 outcome is then reported to the user, who confirms it when reviewing the page, as with HERO-6.

## Lane
Parent (integrator). It's a single small edit plus one new test, so no worktree. Commits are sequential on `feature/hype-section`.
- **Owns:** `FintasyPage.vue`, `tests/PageRetention.test.ts`, and, only if preflight requires it, vignette name stubs in the three `/`-mounting test files.
- **Excludes:** `heroSim.ts`, `components/hype/vignettes/**`, `HypeSection.vue`, `hypeBeats.ts`, `main.ts`, `vite*.config.ts`.

## Rollback / point of no return
Revert the HYPE-4 commit(s). There is no local point of no return. **Push, PR and merge to `main` are Tier B and each needs its own go-ahead.** Merging `main` triggers `deploy-images.yml`.
