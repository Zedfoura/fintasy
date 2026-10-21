# ARC / Battle Plan — HERO-3 Hero Composition on `/` (campaign 2026-10-20_fintasy-hero)

## Claim frame
- **Outcome:** A visitor to `http://localhost:3333/` sees only the new hero: top bar, statement band, caption strip, and a framed visual slot. The slot shows a static fallback until HERO-4 mounts `<HeroVisual>`. Behaviour that must hold:
  - exactly one `<nav>` on the page;
  - `h1` reads "Sixty traders. One market. Last one solvent.";
  - "Enter a match" goes to `/dashboard/royale`, which redirects to `/login?redirect=/dashboard/royale` when signed out;
  - "Sign in" goes to `/login`;
  - `[Source]` opens the GitHub repo in a new tab;
  - no horizontal scroll at 375, 768 or 1440 widths;
  - the legacy landing sections are unmounted (D2).
- **Required stage:** ACTIVATION, meaning it is rendered and interactive on `/` in the live dev server, read from the real DOM.
- **Authority needed to EXECUTE:** an explicit user grant to edit `packages/client`. None exists yet: the 2026-10-20 instruction was "Write the HERO-2 and HERO-3 battle plans first; don't edit packages/ yet."
- **Source/ref:** `feature/stock-royale-full-platform` @ `511b80c9f5cfc5eac792084eeb322cbb1a5526da`; `packages/` clean (0 changed files).
- **Spec inputs (read-only):** `tokens.json`, `hero-direction.md`, and section A of the prototype.
- **Dependencies:** HERO-1@outcome_verified ✅.
- **Invariants:**
  - `/login`, `/dashboard/**` and the auth guard behave as before;
  - the `dashboard`, `default` and `home` layouts are unchanged (`home` stays on disk with HomeNav for any other route that uses it);
  - global `--c-*` tokens and the DM font stack stay untouched outside `.hero`;
  - legacy `components/landing/*` files stay on disk (D2).
- **Falsifiers:**
  - (1) Temporarily mounting `<LandingHeader>` next to the hero must make the nav-count assertion fail. Recorded once as a mutation run.
  - (2) Changing the primary CTA `to` must make the CTA-target test fail.
  - (3) The overflow check must report `scrollWidth > innerWidth` when a `width: 120vw` test element is injected. That proves the check can fail.
- **Flows:** FLOW-HERO-FIRST-IMPRESSION @ ACTIVATION; FLOW-LANDING-CONVERSION (CTA leg only).

## Grounding probes (2026-10-20)
| Probe | Result |
|---|---|
| Double nav on `/` | ✅ confirmed by reading the code: `layouts/home.vue` renders `<HomeNav/>`, and `pages/index.vue` adds `<LandingHeader/>` while declaring `layout: home` |
| Nav-free layout | ✅ `layouts/none.vue` = `<RouterView/>` only; `App.vue` = `<Provider><RouterView/></Provider>` (no global chrome). So `layout: none` on `/` leaves only `HeroNav` |
| Auth guard | ✅ `modules/auth.ts:17` `isPublicRoute`: `/`, `/login`, `/dashboard/help*` are public. Signed-out `/dashboard/royale` → `{ path: '/login', query: { redirect } }` |
| Nav targets | ✅ `/dashboard/royale.vue`, `/dashboard/help/index.md` exist; `github.com/Zedfoura/fintasy` HTTP 200. No ranked route, so `[Ranked]` stays dropped |
| Fonts | ⚠️ fonts load through `WebfontDownload([...css2 URLs])` in `vite.config.ts:148`, not only through UnoCSS. Archivo (wdth+wght axes) and JetBrains Mono must be **added there**. So the owned file changes from `unocss.config.ts` (in the ledger) to `vite.config.ts`. Whether the plugin handles the `wdth` axis URL is `UNVERIFIED` until the first build |
| Tests that depend on the page | ⚠️ `LandingHeroV2`, `LandingHero`, `ThemeToggleIntegration` and `LandingPageIntegration` import landing components or the page. Unmounting the sections is expected to break `LandingPageIntegration` (and possibly `ThemeToggleIntegration`). The exact failing set gets measured and listed in the receipt and ROUTED to HERO-4. It is never silently skipped |
| Flow-contract validator | ❌ the workspace `inventory.json` and all claims fail schema v2 (`kind` missing). ✅ positive control: the skill fixture `fixtures/frontend-flow/inventory.json` validates `VALID (schema v2)`, so the instrument works |

## Design
1. **`components/hero/HeroSection.vue`**, the page body. Root `<section class="hero">` defines every `--hero-*` CSS variable from `tokens.json`. Contents:
   - `<HeroNav/>`;
   - the statement band (`h1` plus paragraph plus CTAs as `RouterLink`);
   - the caption strip (`aria-live="off"`) driven by props `round`, `storm`, `alive` (defaults 1, `holding`, 60);
   - a framed slot `<slot name="visual">`. Its fallback is a static, `aria-hidden` CSS rendering of the ring geometry: three nested hairline rectangles in tile colours, no JS.
   - It exposes `onVisualUpdate(e)` so HERO-4 can wire `<HeroVisual @update>` to the strip.
2. **`components/hero/HeroNav.vue`**: wordmark + `S01`, bracketed mono links, and the credit line. Below 760px the links are hidden (matching the prototype). Each link's state is recorded in the receipt.
3. **`pages/index.vue`** is rewritten:
   - route meta `layout: none`;
   - `useHead` with the title and description from `hero-direction.md`;
   - renders `<HeroSection/>` only (D2);
   - `min-height: 100svh`, ink background.
4. **`vite.config.ts`**: append two `WebfontDownload` URLs (Archivo `wdth,wght@62..125,100..900`; JetBrains Mono `wght@400;500`). No other edit to this file.
5. **`tests/HeroSection.test.ts`**, using the `vue-router` mock pattern from `LandingHeroV2.test.ts`. Asserts:
   - one `nav`;
   - the `h1` text;
   - CTA targets;
   - `[Source]` has `target="_blank"` and `rel` containing `noopener`;
   - the caption strip has `aria-live="off"` and reflects its props (`37 / 60`, `Round 3 / 5`, `Storm closing`);
   - the fallback renders when no `visual` slot is given, and the slot replaces it when given;
   - `index.vue` renders `HeroSection` and none of the 8 legacy components.
6. **Flow-contract migration (debt routed from HERO-1):**
   - Write a **campaign-scoped** schema-v2 inventory at `.wargaming/campaigns/2026-10-20_fintasy-hero/flows/inventory.json` (`kind: wargame-flow-inventory`). It holds FLOW-HERO-FIRST-IMPRESSION, modelled on the passing fixture: actor, entry point `/`, target bindings, state cases, accessibility capabilities, matrix cases, transitions.
   - Bind HERO-1..4 claims to its hash (`kind: wargame-flow-claim`).
   - The shared workspace inventory is **not** rewritten. That would mean rebinding another campaign's flows, which is out of scope. That drift stays a ROUTED finding for the Stock Royale campaign.
   - Gate: the validator prints VALID for the inventory and for `mission_HERO-3` (without `--require-complete`).

## ARC rows
| Action | Reaction (risk) | Counteraction |
|---|---|---|
| Switch `/` to `layout: none` | Some other route silently depended on `/` using `home` | `home.vue` is untouched. Probe: `grep -rn "layout: home"` before and after; only `index.vue` may change |
| Unmount legacy sections | Legacy tests turn red, which reads as a regression | Measure the before and after suite and name every newly failing file in the receipt. Each one is ROUTED to HERO-4 (replace or retire with a reason). No `skip`, no deletion in this lane |
| Hero-scoped fonts | Archivo leaks into the dashboard, or the DM stack breaks | Font families are applied only under `.hero`. A DOM check reads computed `font-family` on a dashboard element after login: it must still be the DM/Geist stack |
| `wdth` axis URL in WebfontDownload | Build fails, or the wordmark falls back to the default width | First build is a checkpoint. On failure, fall back to Archivo static weights from the Google `css2` URL without `wdth` and record the deviation |
| Display type at 375px | Overflow or orphan words | Use the token `clamp()`. Live overflow check with the falsifier (3). Screenshots at 375, 768 and 1440 |
| CTA into a protected route | Signed-out visitor hits a dead end | Live click-through while signed out must land on `/login?redirect=%2Fdashboard%2Froyale`. Verified in the browser pane, not assumed |
| External `[Source]` link | Tabnabbing | `rel="noopener noreferrer"`, asserted in the test |
| Lane collision with HERO-2 | Shared `components/hero/` dir | HERO-3 owns only the files listed below. `git diff --name-only` before commit must match the list exactly |

## Lane charter (DEEP-1/6/7/8)
- Lane `hero_layout`, worktree `wt/hero_layout` from base SHA `511b80c`.
- **Owns:** `packages/client/src/components/hero/HeroSection.vue`, `packages/client/src/components/hero/HeroNav.vue`, `packages/client/src/pages/index.vue`, `packages/client/vite.config.ts` (WebfontDownload list only), `packages/client/tests/HeroSection.test.ts`, `.wargaming/campaigns/2026-10-20_fintasy-hero/flows/**`, and the HERO claim files.
- **Excludes:** `components/hero/HeroVisual.vue`, `components/hero/heroSim.ts`, `tests/HeroVisual.test.ts`, `layouts/**`, `modules/**`, `unocss.config.ts`, `components/landing/**` (on disk, unmounted), every legacy test file (HERO-4 owns those), and `.wargaming/flows/inventory.json` (the shared one).
- **Peer:** `hero_visual` (HERO-2). The slot contract is `tokens.json.visualSlot` and the `update` event shape `{round, storm, alive}`.
- **Digest for the subagent** (< 50 lines): Claim frame, Design and Lane charter plus `tokens.json` and the copy table from `hero-direction.md`.

## Execution transitions & evidence
1. `planned → executing`: grant recorded; worktree HEAD = `511b80c…`; baseline `pnpm --filter client test` counts recorded before any edit.
2. `→ mechanism_verified`: `vitest run tests/HeroSection.test.ts` raw output (`N passed / M`); falsifier runs (1) and (2) failing as expected; `pnpm --filter client build` exit 0 (font checkpoint).
3. `→ canonical`: full suite counts before and after, with newly failing files named and ROUTED; knip result or `UNVERIFIED`; lane commit, then a local merge, with `git show --stat`.
4. `→ activated`:
   - `pnpm --filter client dev` (port 3333) and `curl -s -o /dev/null -w '%{http_code}' localhost:3333/` = 200;
   - browser-pane DOM assertions: `document.querySelectorAll('nav').length === 1`, `h1` text, `scrollWidth <= innerWidth` at 375, 768 and 1440, falsifier (3);
   - signed-out click on "Enter a match" lands on the `/login` redirect URL;
   - screenshots at 3 widths, plus the dashboard font check after a guest login.
   - Flow validator: VALID for the campaign inventory and the HERO-3 claim.

## Rollback / point of no return
Rollback is `git revert` of the lane merge, which restores `index.vue` and the legacy mount with no data effect. There is no point of no return; push and deploy are out of scope (Tier B).

## Open decisions
- None blocking. The ledger row's owned files change (`unocss.config.ts` becomes `vite.config.ts`, and campaign `flows/**` is added). That is recorded here and in the ledger.
