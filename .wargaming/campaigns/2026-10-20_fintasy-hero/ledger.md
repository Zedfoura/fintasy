# Mission Ledger — Fintasy Marketing Hero

**Goal:** Ship a distinctive, from-scratch hero section at `/` that recruiters remember: an editorial grotesk headline, intentional asymmetric spacing, and one framed visual drawn from Fintasy's own domain.
**Scope:** Hero only: the in-hero nav strip, headline, subtitle, visual, CTAs, and responsive and motion behavior. Deferred: every landing section below the hero, the app shell and dashboard theming, and deploy. Open decision D2 (legacy sections below) is recorded in `campaign.md`.
**Authority:** Planning artifacts only; execution requires user authority. Tier B (push to canon, deploy) always requires its own grant.
**State model:** proposed → planned → executing → mechanism_verified → canonical → activated → outcome_verified → retained
**Disposition:** active
**Legacy rule:** An unmarked legacy `[x]` means `planned` at most after its linked Battle Plan is validated; otherwise route it to `AUDIT/RESUME` without assigning an evidence state.
**Data model:** `.wargaming/DATA-MODEL-AUTHORITY.md` (sha256 `1807e0c9…f3207`). Run mode is `client-only / no-data-tier`; the §2.1 legacy endpoints are untouched.
**Base commit:** `511b80c9f5cfc5eac792084eeb322cbb1a5526da` on `feature/stock-royale-full-platform`.

## Verified facts (probed 2026-10-20)

- `/` is `packages/client/src/pages/index.vue` (86 lines). It uses `layout: home` and mounts 8 legacy `components/landing/*` sections.
- `layouts/home.vue` renders `<HomeNav />`, and `index.vue` also renders `<LandingHeader />`. Two navigation components are mounted on `/`, and the second nav may be visible. HERO-3 must probe this and resolve it, for example with a `none`-style layout for `/`.
- Fonts come from UnoCSS `presetWebFonts` (DM Sans / DM Serif Display / DM Mono) in `packages/client/unocss.config.ts`.
- Legacy hero tests exist and will break or orphan when the hero is replaced: `tests/LandingHero.test.ts`, `tests/LandingHeroV2.test.ts`, `tests/LandingPageIntegration.test.ts`, `tests/LandingConversionV2.test.ts`, `tests/ThemeToggleIntegration.test.ts`. They are debt that HERO-4 must reconcile. Silent deletion is not allowed; each one is either replaced or explicitly retired with a reason.
- Client scripts: `pnpm --filter client test` (vitest run), `pnpm --filter client build` (vite build), `pnpm --filter client dev` (port 3333).
- Debt finding (ROUTED, not this lane): `.wargaming/flows/inventory.json` sha256 is `d58ae396…` but the existing claims bind `6fb5b2c9…` (LANDING-1) and `6814e54d…` (AUTH-4). The inventory already drifted before this campaign. This campaign's claims bind the post-append hash.

- Debt finding (2026-10-20, HERO-1 run): `validate_flow_coverage.py` rejects `mission_HERO-1.json` with "root: kind must be wargame-flow-claim". The workspace inventory and every existing claim predate the schema-v2 contract (they have no `kind`, entry points, state cases, or matrix cases). The flow contract is therefore `UNVERIFIED` workspace-wide. ROUTED to HERO-3: before HERO-3 can claim ACTIVATION, migrate `inventory.json` + the HERO claims to schema v2 and get the validator to return VALID.

## Missions

### Epic 1 — From-Scratch Marketing Hero <!-- wargame-epic: marketing-hero; wargame-epic-priority: 1 -->

- [x] **HERO-1. Direction Lock: Identity, Palette, Type & Copy, Chosen From Rendered Prototypes** — The user opens 2–3 rendered static hero directions in the browser and picks one. Each direction is a real 1440px and 375px composition built from the three references: grotesk display headline, right-displaced or asymmetric typography, framed visual, mono captions. The pick is written as `hero-direction.md` plus `tokens.json`: palette with contrast ratios, type scale, spacing grid, and final copy for the headline, subtitle, CTAs, and captions. <!-- wargame-state: retained; wargame-disposition: active -->
  - Depends on: none
  - Required stage: OUTCOME (consumer = the user's explicit selection)
  - Verifier/consumer: the user, choosing in chat. Instrument: WCAG contrast computed per token pair in `tokens.json`. Any text/background pair below 4.5:1 (body) or 3:1 (display) fails the gate.
  - Preserves: no edits to `packages/client/**`. Prototypes live in the campaign `wargames/` dir or as private artifacts.
  - User flows: FLOW-HERO-FIRST-IMPRESSION (critical-secondary) at PLAN
  - Point of no return: none
  - Lane: `hero_direction`. Action-bias cap (DEEP-3) is two turns, then the direction locks on the user's pick or on the recommended default.

- [ ] **HERO-2. Generative Domain Visual (the "image")** — A self-contained `HeroVisual.vue` renders a live, seeded canvas or SVG visual drawn from Fintasy's domain, per the HERO-1 pick. Example: the 12-sector map collapsing inward under a tick field. It fills a framed region (ref 3) and paints its first frame within 100 ms of mount. With `prefers-reduced-motion` it renders a static frame. It pauses offscreen via IntersectionObserver. <!-- wargame-state: activated; wargame-disposition: active -->
  - Depends on: HERO-1@outcome
  - Required stage: CANONICAL (component merged and covered by tests; activation happens in HERO-4)
  - Verifier/consumer: `tests/HeroVisual.test.ts`, which asserts canvas/SVG presence, the reduced-motion static branch, and determinism (same seed gives the same first-frame path data; a different seed must give a different hash, otherwise the test is vacuous). Also a live dev-server render with a screenshot.
  - Preserves: no new runtime dependency unless it is justified in the receipt; no network fetch; no change to royale components.
  - User flows: FLOW-HERO-FIRST-IMPRESSION at MECHANISM
  - Point of no return: none
  - Battle plan: `success/mission_HERO-2_battleplan.md`
  - Lane: `hero_visual`. Owns only `packages/client/src/components/hero/HeroVisual.vue`, `components/hero/heroSim.ts` (added at PLAN: jsdom has no canvas, so the engine is split out for testability), `tests/HeroVisual.test.ts`. Excludes `pages/**`, `layouts/**`, `unocss.config.ts`, `components/landing/**`. Worktree `wt/hero_visual` @ base SHA above.

- [ ] **HERO-3. Hero Composition, Type System, Copy & Nav Strip on `/`** — A visitor to `http://localhost:3333/` sees the new hero: in-hero nav strip (wordmark plus 3–4 links, as in refs 1 and 3), display headline, subtitle, mono captions, and primary and secondary CTAs to `/dashboard/royale` and `/login`. The layout follows the locked asymmetric grid and has a named `visual` slot sized for HERO-2. Exactly one nav renders, which resolves the double-nav finding. The hero has no horizontal scroll at 375 / 768 / 1440 widths. The new palette and fonts are scoped to the hero through CSS variables from `tokens.json`. <!-- wargame-state: activated; wargame-disposition: active -->
  - Depends on: HERO-1@outcome
  - Required stage: ACTIVATION (rendered on `/` in the live dev server)
  - Verifier/consumer: dev server returns HTTP 200 on `/` (Anti-Ghost, DEEP-9). Rendered-DOM assertions: exactly 1 `nav`, 1 `h1` containing the locked headline, CTA `href`s are `/dashboard/royale` and `/login`, and `document.documentElement.scrollWidth <= innerWidth` at 375px. `tests/HeroSection.test.ts`. Counter-input: mounting the legacy `LandingHeader` again must make the nav-count assertion fail.
  - Preserves: `/login` and `/dashboard/royale` routes and their tests; other layouts (`dashboard`, `default`) unaffected; global tokens unchanged outside the hero scope.
  - User flows: FLOW-HERO-FIRST-IMPRESSION at ACTIVATION; FLOW-LANDING-CONVERSION (CTA leg only)
  - Point of no return: none
  - **D4 (2026-10-20):** activated as built, but the in-app links (`[Match]`, `[How it plays]`, "Enter a match", "Sign in") are superseded. HERO-5 removes them; HERO-3's evidence still stands for what it built.
  - Battle plan: `success/mission_HERO-3_battleplan.md`
  - Lane: `hero_layout`. Owns `components/hero/HeroSection.vue`, `components/hero/HeroNav.vue`, `pages/index.vue`, `vite.config.ts` (WebfontDownload list only; replaces `unocss.config.ts` after a PLAN probe found fonts load via vite-plugin-webfont-dl), `tests/HeroSection.test.ts`, campaign `flows/**` (schema-v2 migration). Excludes `components/hero/HeroVisual*.vue`. Worktree `wt/hero_layout`. **Parallel-safe with HERO-2** because their file sets are disjoint.

- [ ] **HERO-5. Marketing-Only Links: Remove Game CTAs, Point to Source & Case Study** — The visitor on `/` finds no link into the app. Nav shows only `[Source]`; the primary button is "View the source →" (GitHub, new tab, `rel="noopener noreferrer"`); "Read the case study" → `https://www.tinatseichingaya.com/projects/fintasy` (user-provided 2026-10-20, probed 200; renders only when `CASE_STUDY_URL` is set). No element implies the game is playable or "coming soon". <!-- wargame-state: activated; wargame-disposition: active -->
  - Depends on: HERO-3@activated
  - Required stage: ACTIVATION (live on `/` in the dev server)
  - Verifier/consumer: rendered DOM on `/`: `document.querySelectorAll('a[href^="/"]').length === 0` (no internal links), the primary CTA href is the GitHub URL, nav link count is 1; `tests/HeroSection.test.ts` updated. Counter-inputs: re-adding a `RouterLink to="/login"` must fail the no-internal-links test; setting `CASE_STUDY_URL` must render the second link and an empty value must hide it (both branches asserted).
  - Preserves: hero copy, visual slot, layout tokens, single-nav, D2 (legacy sections unmounted); `/login` and `/dashboard/**` routes still exist in the app but are not linked from `/`.
  - User flows: FLOW-HERO-FIRST-IMPRESSION (terminal step changes from "navigate into the app" to "open source / case study"; the campaign inventory is re-hashed and claims rebound)
  - Point of no return: none
  - Lane: parent (small, single owner). Owns `components/hero/HeroSection.vue`, `components/hero/HeroNav.vue`, `tests/HeroSection.test.ts`, campaign `flows/**`.

- [x] **HERO-4. Integration, Legacy-Test Reconciliation & Live First-Impression Verification** — HERO-2's visual is mounted in HERO-3's slot on `/`. The golden first-impression flow passes live: load `/`, the hero paints with the visual animating, then clicking the primary CTA lands on `/dashboard/royale` (or the `/login` redirect when unauthenticated). The legacy hero tests are each replaced or retired with a reason. The full client suite and production build pass. Blast radius is reported from the Nx script, or recorded as `UNVERIFIED` when NX_UNAVAILABLE persists. A retention guard test fails if the hero headline, CTA targets, or visual mount regress. <!-- wargame-state: retained; wargame-disposition: active -->
  - Depends on: HERO-2@canonical, HERO-3@activation, HERO-5@activated
  - Required stage: RETENTION
  - Verifier/consumer: browser-pane click-through on the live dev server; `pnpm --filter client test` reported as `N passed of M files` (not "PASS"); `pnpm --filter client build` exit 0; screenshots at 375/768/1440 in dark mode with reduced motion on and off; CLS of 0 on hero load measured with a PerformanceObserver. Retention guard `tests/HeroRetention.test.ts`. Counter-inputs: changing the source href, or adding any internal (`/…`) link, must make it fail; the receipt records both failures.
  - Preserves: all non-landing client tests stay green, with counts compared before and after; the `/login` auth flow and royale route keep working inside the app (just unlinked from `/`).
  - User flows: FLOW-HERO-FIRST-IMPRESSION at RETENTION; FLOW-LANDING-CONVERSION re-verified for the CTA leg
  - Point of no return: none locally. Pushing or deploying the result is Tier B and out of this campaign's grant.
  - Lane: parent/integrator (main session). Merges `wt/hero_visual` and `wt/hero_layout`.

### Epic 2 — Portfolio Placement <!-- wargame-epic: portfolio-placement; wargame-epic-priority: 2 -->

- [ ] **HERO-6. Standalone Static Build of the Hero Page for the Portfolio Case Study** — A self-contained static output (one HTML entry plus hashed assets, no auth module, no app shell, no API calls) renders the hero identically to `/`, opened from the filesystem or any static host, and can be linked or embedded from the portfolio case study. <!-- wargame-state: activated; wargame-disposition: active -->
  - Depends on: HERO-4@outcome_verified
  - Required stage: OUTCOME (the user opens the built page and confirms it is the page they will link)
  - Verifier/consumer: a separate Vite entry/build target; `npx serve dist-hero` (or file://) → HTTP 200, DOM parity with `/` (h1, single nav, outbound links, canvas present), 0 network requests to `/api`, Lighthouse-style CLS 0 and first-frame timing recorded. Counter-input: importing the auth module into the entry must fail a bundle-content check.
  - Preserves: the main app build and `/` route unchanged.
  - User flows: FLOW-HERO-FIRST-IMPRESSION (standalone entry point)
  - Point of no return: **publishing or hosting the build is Tier B** (needs an explicit hosting grant: where, which domain). Building locally is Tier A.
  - Status: proposed until the user confirms this epic's priority (goal-growth rule).
  - **2026-10-21 note:** the user deferred outcome confirmation until the whole page is complete, and they will move it into their portfolio repo themselves. HYPE-3 and HYPE-4 rebuild `dist-hero` with the hype section. This is a note, not a dependency edge, because an Epic 2 → Epic 3 edge would be a tier inversion.

### Epic 3 — Hype Section: Solution & Value Proposition × Key Benefits & Features <!-- wargame-epic: hype-section; wargame-epic-priority: 3 -->

> Goal growth (user, 2026-10-21): "create the Solution & Value Proposition section … more of a hype section … a combination with the Key Benefits & Features section." Ruling D6 is in campaign.md.
> Routing note: this epic is listed third, but it is the next actionable work. Epic 1 has no dependency-ready mission left (HERO-4 retained; HERO-2/3/5 activated and covered by the HERO-4 retention guard). Epic 2's HERO-6 waits on the user's confirmation, which they deferred until the page is complete (2026-10-20).
> Base for execution: a new branch cut from `origin/main` `d46b06a` (probed 2026-10-21). The hero is already merged there.
> Lane rule (learned in the HERO-2/3 incident): lint-staged's pre-commit hook uses the shared git stash. Parallel lanes therefore never commit concurrently; each lane commits only after the parent says so, one at a time.

- [ ] **HYPE-1. Hype Direction Lock: Rendered Section Prototypes Under the Locked Hero** — You open 2–3 rendered directions for the section, each sitting directly below the real direction-A hero at 1440 and 375, and pick one. Candidate directions to prototype: *Match timeline* (Drop → Duel → Storm → Last one solvent as scroll-paced beats with one sticky visual); *Loadout grid* (bento of mechanic cards, each with a live micro-vignette and a stat numeral); *Patch notes / spec sheet* (editorial, numbers-forward mechanic list that also shows off the engineering). The pick is written to `hype-direction.md` (beats, copy, anchor id or none, vignette list) and a `hype` block in `tokens.json`. <!-- wargame-state: outcome_verified; wargame-disposition: active -->
  - Depends on: HERO-1@outcome_verified (locked palette, type and tokens)
  - Required stage: OUTCOME (consumer = your explicit selection)
  - Verifier/consumer: you, choosing in chat. Instruments: (a) the `contrast.mjs` gate extended to every new text/background pair, failing below 4.5:1, with the known-bad control still flagged; (b) a **fact gate**. Every number and mechanic claim in the section copy must map to `.wargaming/DATA-MODEL-AUTHORITY.md` §1–2 or to an earlier locked fact (60 traders, 12 sectors in 3 rings, 10 Hz ticks, 30–60 s duels, 1x–5x leverage, $15,000 pot, 5 rounds, third-party joins, AI bot fill, seeded deterministic replay, Copper → Golden Trader ranks). Counter-input: injecting "100,000 players" or "play now" into the copy must make the gate fail.
  - Preserves: zero diff under `packages/` (prototypes live in `wargames/hype-directions/`); D4, so no playable, "coming soon" or in-app claims.
  - User flows: FLOW-HYPE-SECTION (critical_secondary) at PLAN
  - Point of no return: none
  - Lane: parent (`hype_direction`). Action-bias cap of two turns, then lock on your pick.
  - **Locked 2026-10-21:** direction 1 "Match timeline" → `hype-direction.md`, `tokens.json#hype`, anchor `#match`. Receipt: `receipts/mission_HYPE-1/execution.md`.

- [ ] **HYPE-2. Mechanic Vignettes (only those the locked direction calls for)** — Each vignette the direction names (for example a duel P&L race, the storm closing on the ring map, a 60-dot lobby filling, a rank ladder climb) renders seeded and deterministic inside its slot. Each shows a static frame under reduced motion, pauses offscreen, and is decorative (`aria-hidden`) with a text equivalent in the section copy. Where a beat is about the match, it reuses `heroSim.ts` rather than forking it. <!-- wargame-state: executing; wargame-disposition: active -->
  - Depends on: HYPE-1@outcome_verified ✅. Scope is fixed by the lock: exactly 4 vignettes (`drop`, `duel`, `storm`, `lobby`), as specified in hype-direction.md § Vignettes.
  - Required stage: CANONICAL (committed, tests green, merged on the execution branch)
  - Verifier/consumer: `tests/HypeVignettes.test.ts`. Same seed gives the same snapshot and a different seed a different one; reduced motion means 0 rAF calls and at least 1 draw; IO hidden cancels rAF; unmount disconnects observers. Mutation falsifier: break one vignette's reduced-motion branch and the test must fail.
  - Preserves: `HeroVisual.vue` / `heroSim.ts` public behaviour (HeroVisual.test.ts 11/11 and the parity seed 2026 → 14 alive at 700 steps stay green).
  - User flows: FLOW-HYPE-SECTION at MECHANISM
  - Point of no return: none
  - Battle plan: `success/mission_HYPE-2_battleplan.md`
  - Lane: `hype_visuals` (worktree `wt/hype_visuals` @ `d46b06a`). Owns `packages/client/src/components/hype/vignettes/**` (vignetteSim.ts, useVignetteLoop.ts, four Vignette*.vue) and `packages/client/tests/HypeVignettes.test.ts`. Also owns re-adding the `export` keyword on `stormAt` (and `ringRects` if needed) in `heroSim.ts`, since the PLAN probe found them made private by HERO-2's knip cleanup; HeroVisual.test 11/11 and parity 14 alive must hold. **Parallel-safe with HYPE-3; commits sequential.**

- [ ] **HYPE-3. Hype Section Composition, Copy & Shared Page on `/` and the Standalone Build** — Scrolling past the hero on `/` and in the standalone build shows the locked hype section: one `<section>` labelled by its h2, an h3 per beat, the locked copy, vignette slots with static fallbacks, and the anchor if locked. Both entry points render the same page from one shared composition component, so `index.vue` and `StandaloneHero.vue` stop duplicating it. <!-- wargame-state: executing; wargame-disposition: active -->
  - Depends on: HYPE-1@outcome_verified ✅
  - Required stage: ACTIVATION (live in the dev server and in `vite preview` of dist-hero)
  - Also owns (from the HYPE-1 lock): (a) change `HeroVisual.vue:308` screen-reader text from "12" to "11 market sectors", with the fact gate run on it as the check (a parent-approved one-line edit in a HERO-2 file); (b) section anchor `#match`, which flips inventory EP-hype-deeplink to `required` and rebinds the HYPE claims to the new inventory hash.
  - Verifier/consumer:
    - Dev server `/` returns HTTP 200.
    - Rendered DOM: still exactly 1 `nav` and 1 `h1`; the section h2 is present; the beat count equals the locked list; `document.querySelectorAll('a[href^="/"]').length === 0`; no "coming soon", "play now" or "sign in" text; no horizontal overflow at 375/768/1440 (signal: innerWidth stays at the emulated width).
    - `tests/HypeSection.test.ts` plus the fact gate as a unit test.
    - Counter-inputs: adding a `RouterLink` or a "Play now" string must fail the tests.
    - `dist-hero` rebuilt and served: the section is present, and the bundle check (no RouterView, auth token, `/api/v1`, pinia or naive-ui) passes, with its falsifier still flagging.
  - Preserves: FLOW-HERO-FIRST-IMPRESSION (HeroRetention.test.ts 4/4 and HeroSection.test.ts 14/14); D4 outbound-only links; the hero canvas still pauses when scrolled offscreen.
  - User flows: FLOW-HYPE-SECTION at ACTIVATION; FLOW-HERO-FIRST-IMPRESSION as regression only
  - Point of no return: none
  - Battle plan: `success/mission_HYPE-3_battleplan.md`. PLAN probe: the router has no `scrollBehavior`, so FintasyPage handles `#match` in `onMounted`; `main.ts` stays untouched.
  - Lane: `hype_layout` (worktree `wt/hype_layout` @ `d46b06a`). Owns `packages/client/src/components/hype/HypeSection.vue`, `packages/client/src/components/hype/hypeBeats.ts`, the shared page component (`packages/client/src/components/page/FintasyPage.vue`), `packages/client/src/pages/index.vue`, `packages/client/hero-standalone/StandaloneHero.vue`, `packages/client/tests/HypeSection.test.ts`, campaign `flows/**`, and the HYPE claim files. Excludes `components/hype/vignettes/**`, `components/hero/**` and all hero tests.

- [ ] **HYPE-4. Integration, Page Retention Guard & Live Scroll Verification** — The vignettes are mounted in the section on `/` and in the standalone build. Live, the full scroll from hero into section works at 1440/768/375: the hero canvas pauses when offscreen, each vignette animates only while visible, CLS is 0 and there are no console errors. A page-level retention guard fails if the section, its beats, its facts or the outbound-only rule regress. <!-- wargame-state: proposed; wargame-disposition: active -->
  - Depends on: HYPE-2@canonical (or HYPE-2 `withdrawn_by_user`), HYPE-3@activated
  - Required stage: RETENTION
  - Verifier/consumer:
    - `tests/PageRetention.test.ts`: the section's h2 and beat count, the fact allowlist, zero internal links, and the hero guard still present.
    - Counter-inputs, each recorded as a failing run: remove a beat; change a fact to a number not in the allowlist; add "/login".
    - Full client suite reported as `N passed of M`. The only accepted failures are the 2 pre-existing DesignTokens ones, by name.
    - `vite build` and `build:hero` both exit 0; knip is diffed against the merged-hero baseline.
    - Live: the browser pane on dev and on the dist-hero preview.
  - Preserves: everything listed for HYPE-3, plus HERO-6's standalone contract (relative paths, self-hosted fonts, a clean bundle).
  - User flows: FLOW-HYPE-SECTION at RETENTION; FLOW-HERO-FIRST-IMPRESSION as regression
  - Point of no return: none locally. **Push, PR and merge to `main` are Tier B and need their own explicit go-ahead.** Merging `main` also triggers `deploy-images.yml`, which publishes the ghcr images.
  - Lane: parent (integrator), committing on the execution branch.

## Parallel-safe sets

- Set A (after HERO-1@outcome): **HERO-2 ∥ HERO-3**.
- Set B (after HYPE-1@outcome_verified): **HYPE-2 ∥ HYPE-3** (disjoint files; the vignette slot contract is fixed in hype-direction.md). HYPE-4 serializes after both. Commits are sequential (lint-staged/shared-stash rule). Disjoint files; the only shared contract is the `visual` slot dimensions in `tokens.json`, which HERO-1 locks.
- HERO-4 serializes after both, since it is the integration point.
