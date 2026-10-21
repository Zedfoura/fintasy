# ARC / Battle Plan — HYPE-3 Hype Section Composition & Shared Page (campaign 2026-10-20_fintasy-hero)

## Claim frame
- **Outcome:** on `/` (dev server) and in the standalone build (`vite preview` of dist-hero), scrolling past the hero shows the locked Match-timeline section:
  - `<section id="match" aria-labelledby="hype-title">` with the h2, intro, four `<article>` beats (aria-hidden ordinal, h3, body, a 16:9 vignette slot with a static fallback) and the stats strip, all in the locked copy;
  - a direct load of `/#match` lands on the section;
  - both entry points render **one** shared page component, so the composition is no longer duplicated;
  - `HeroVisual`'s screen-reader text says **11** market sectors.
- **Required stage:** ACTIVATION.
- **Authority needed to EXECUTE:** an explicit grant to edit `packages/client`. None yet: the 2026-10-21 instruction was "Write the HYPE-2 and HYPE-3 battle plans first; don't edit packages/ yet."
- **Ref:** `refs/heads/feature/hype-section` @ `d46b06a` (upstream unset); 0 changed files under `packages/`.
- **Spec inputs (read-only):** `hype-direction.md` (copy table, anatomy, slot contract, accessibility); `tokens.json#hype` (type, layout, contrast); prototype `wargames/hype-directions/index.html?h=h1`.
- **Data model:** `.wargaming/DATA-MODEL-AUTHORITY.md` (sha256 `1807e0c9…f3207`), client-only / no-data-tier.
- **Invariants:**
  - FLOW-HERO-FIRST-IMPRESSION: `HeroSection.test.ts` 14/14, `HeroRetention.test.ts` 4/4, `ThemeToggleIntegration.test.ts` 4/4, still exactly one `nav` and one `h1`.
  - D4 outbound-only links: the section adds **no** links.
  - The standalone bundle check stays clean (no RouterView, auth token, `/api/v1`, pinia or naive-ui).
  - The `/login` and `/dashboard/**` routes are untouched.
- **Falsifiers:**
  1. Adding a `RouterLink` or `<a href="/…">` inside HypeSection must fail the no-internal-links test.
  2. Changing a beat number to one outside the allowlist (e.g. "12 sectors") or adding "Play now" must fail the fact test.
  3. The original HeroVisual alt text ("12 market sectors") must fail the fact test before the fix and pass after it.
  4. The standalone bundle check must flag a deliberately imported `vue-router`, as it did in HERO-6.
- **Flows:** FLOW-HYPE-SECTION @ ACTIVATION; FLOW-HERO-FIRST-IMPRESSION as regression only.

## Grounding probes (2026-10-21)
| Probe | Result |
|---|---|
| Duplicate composition | ✅ `pages/index.vue:28-31` and `hero-standalone/StandaloneHero.vue` both hard-code `<HeroSection ref><template #visual><HeroVisual @update…/></template></HeroSection>` |
| Router hash scrolling | ❌ `src/main.ts:21` `createRouter({...})` has no `scrollBehavior`, so `/#match` on first load would not scroll (the section renders after the browser tries the anchor). **Decision:** the shared page component scrolls to `location.hash` in `onMounted` (`scrollIntoView({ block: 'start' })`, instant when motion is reduced). This is local to the page and also works in the router-less standalone build. `main.ts` is not touched. |
| Tests that mount `/` | ✅ `HeroSection.test.ts:154-161`, `HeroRetention.test.ts:30`, `ThemeToggleIntegration.test.ts:151` all mount `pages/index.vue`. They use `findComponent(HeroSection)` and a `HeroVisual` stub by name, both of which keep working if `index.vue` renders the shared page and it imports `HeroVisual`. Re-run all three as regression. |
| Sector-count defect | ✅ `HeroVisual.vue:308` says "12 market sectors"; the fact gate flags it (HYPE-1 receipt). DMA §1.2 = 11. |
| Flow inventory | EP-hype-deeplink is `conditional` pending an anchor; the anchor is now locked (`#match`), so it flips to `required` and the HYPE claims are rebound to the new hash |

## Design
1. **`src/components/page/FintasyPage.vue`**, the single composition.
   - Renders `<HeroSection ref="hero">` with `#visual → <HeroVisual @update="hero?.onVisualUpdate($event)">`, then `<HypeSection>`.
   - On `onMounted`, if `location.hash === '#match'`, it scrolls the section into view.
   - No router, store or API imports (the standalone bundle depends on this).
2. **`src/pages/index.vue`** keeps `useHead` and `layout: none`, and renders `<FintasyPage/>` only. **`hero-standalone/StandaloneHero.vue`** renders `<FintasyPage/>` only.
3. **`src/components/hype/hypeBeats.ts`**: typed beat data (id, ordinal, h3, body, vignette id, caption) and the section copy (kicker, h2 lines, intro, stats), word for word from hype-direction.md. Also `FACT_ALLOWLIST` and `BANNED_PHRASES`, mirroring `wargames/hype-directions/fact-gate.mjs`, with a comment naming the source.
4. **`src/components/hype/HypeSection.vue`**:
   - `.hype` scope with `--hype-*` variables from `tokens.json#hype`; the colors reuse the hero values.
   - Header grid, four beats and the stats strip, all from `hypeBeats.ts`.
   - Named slots `vignette-drop|duel|storm|lobby`, each inside a 16:9 frame with a hairline border and a caption. Each fallback is an aria-hidden static three-ring frame in tile colors.
   - Mobile: below 760px every span becomes `1 / -1`, **the kicker included** (the HYPE-1 implicit-grid bug).
5. **`HeroVisual.vue:308`:** "12 market sectors" → "11 market sectors". This is the only line touched in that file; it's a HERO-2 file, and the edit is authorized by the HYPE-1 lock.
6. **`tests/HypeSection.test.ts`:**
   - Structure: one section `#match` labelled by its h2; 4 articles; 4 h3s in order Drop/Duel/Storm/Last one solvent; ordinals aria-hidden; the stats strip text.
   - Slots: the fallback renders when empty, and a slotted node replaces it.
   - Links: no `a` elements inside the section.
   - Fact test: every number in the rendered section text **and** in `HeroVisual.vue`'s alt text is in `FACT_ALLOWLIST`, and no `BANNED_PHRASES` match.
   - Page: `FintasyPage` renders HeroSection then HypeSection; exactly 1 `nav` and 1 `h1`; the hash handler scrolls when `location.hash === '#match'` (stubbed `scrollIntoView` is called) and doesn't when it isn't.
7. **Flows:** update the campaign inventory (EP-hype-deeplink → `required`, with the anchor evidence) and rebind the HYPE-1..4 claims to the new hash. The validator must report VALID for the inventory and all four claims.

## ARC rows
| Action | Reaction (risk) | Counteraction |
|---|---|---|
| Refactor `index.vue` to a shared page | Hero tests or retention guard break | Re-run `HeroSection`, `HeroRetention` and `ThemeToggleIntegration`; any red is a blocker, not a re-baseline |
| Page grows below the fold | Hero `100svh` composition shifts; CLS | HypeSection sits below the hero in normal flow; measure CLS = 0 on load and while scrolling (HYPE-4) |
| Hash handling | Fights the browser or scroll restoration on refresh | Act only when `location.hash === '#match'`, once, after mount; refresh mid-page relies on native restoration (EP-hype-reentry check) |
| Section copy drift | Untrue numbers or a "playable" tone creep in during build | Fact test in the suite, so it runs in CI, not only by script |
| Standalone build | HypeSection pulls in app-shell code | Bundle-content check on the rebuilt `dist-hero`, plus its falsifier |
| Parallel lane with HYPE-2 | Stash or commit collision | Lane works in `wt/hype_layout`; **commits only when the parent says so**, never at the same time as HYPE-2 |

## Lane charter (DEEP-1/6/7/8)
- Lane `hype_layout`; worktree `wt/hype_layout` on a lane branch cut from `feature/hype-section` @ `d46b06a`.
- **Owns:**
  - `packages/client/src/components/page/FintasyPage.vue`;
  - `packages/client/src/components/hype/HypeSection.vue` and `hypeBeats.ts`;
  - `packages/client/src/pages/index.vue` and `packages/client/hero-standalone/StandaloneHero.vue`;
  - `packages/client/tests/HypeSection.test.ts`;
  - **line 308 only** of `packages/client/src/components/hero/HeroVisual.vue`;
  - the campaign `flows/inventory.json` and `.wargaming/flows/claims/mission_HYPE-*.json` (in the main checkout, written by the parent from the lane's report).
- **Excludes:** `components/hype/vignettes/**`, `heroSim.ts`, `HeroSection.vue`, `HeroNav.vue`, `heroLinks.ts`, all existing test files (run them, don't edit them), `main.ts`, `vite*.config.ts`.
- **Peer:** `hype_visuals` (HYPE-2). The shared contract is the slot names; HYPE-4 mounts the vignette components into the slots.
- **Digest for the subagent** (< 50 lines): Claim frame, Design, Lane charter, the hype-direction.md copy table and anatomy, `tokens.json#hype`.

## Transitions and evidence
1. `planned → executing`: grant recorded; worktree HEAD = `d46b06a`; baseline `HeroSection`/`HeroRetention`/`ThemeToggleIntegration` counts recorded.
2. `→ mechanism_verified`:
   - `vitest run tests/HypeSection.test.ts` raw summary;
   - falsifiers 1–3 failing as expected, raw output;
   - the three hero test files still green.
3. `→ canonical`:
   - lane commit, then merge into `feature/hype-section`, with `git show --stat`;
   - full suite `N of M` (only the 2 known DesignTokens failures, named);
   - `vite build` and `build:hero` exit 0;
   - knip diff.
4. `→ activated`:
   - dev `/` returns HTTP 200;
   - DOM: 1 nav, 1 h1, `#match` with 4 articles, zero internal links;
   - no overflow at 375/768/1440 (innerWidth stays at the emulated width);
   - `/#match` direct load scrolls to the section;
   - `vite preview` of dist-hero shows the section;
   - bundle check clean, and its falsifier flagged;
   - flow validator VALID.

## Rollback / point of no return
Revert the lane merge. No point of no return; no push (Tier B).
