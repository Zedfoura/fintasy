# Execution receipt — HYPE-3 Hype Section Composition & Shared Page

- **Run:** hype-3-exec-20261021 (session a4a10a71-8f49-47f0-ac4f-8ec743402514)
- **Grant:** `grant-2026-10-21-hype-2-3-exec` (local only; no push, PR or merge to main).
- **Data model:** DATA-MODEL-AUTHORITY.md sha256 `1807e0c9…f3207`, client-only / no-data-tier.
- **Stage reached:** `activated` (the required stage).

## Bindings
| Item | Value |
|---|---|
| Lane | `hype_layout`, worktree `wt/hype_layout`, branch `hype/hype_layout` |
| Lane base | `32ccff0` |
| Lane commit | `2d2b80c feat(hype): HYPE-3 Match-timeline hype section and shared FintasyPage for / and the standalone build`, 7 files, +617 / −51 |
| Merge | `e2d1ef3 merge(hype): HYPE-3 hype section and shared page` |
| Integration fixes | `104546e fix(hype): align HeroVisual alt-text assertion with the 11-sector correction`; `cb4221c` (knip, see HYPE-2) |
| Ref | `refs/heads/feature/hype-section` (local only; not pushed) |

## Mechanism (lane, re-run by parent before commit)
- HypeSection 13, HeroSection 14, HeroRetention 4 and ThemeToggleIntegration 4: **35 passed / 35**.
- Every falsifier failed as expected:
  1. a `RouterLink` or `<a href="/…">` in the section fails the no-links test;
  2. "12 sectors" fails the fact test, and so does "Play now";
  3. the old HeroVisual alt text ("12 market sectors") fails the fact test.

## Integration defect found at merge
`tests/HeroVisual.test.ts:247` asserted `'60 traders across 12 market sectors'`. HYPE-3 corrected `HeroVisual.vue:308` to 11 (DMA §1.2), and its regression set did not include `HeroVisual.test.ts`. The HYPE-2 lane ran that file without the correction, so each lane was green alone and the merge was red. The assertion was moved to 11 in `104546e`; the old test pinned a false fact. The full suite was then 167/169, with only the 2 known DesignTokens failures.

## Canonical
```
$ npx vite build              → exit 0
$ pnpm build:hero             → exit 0 (dist-hero/assets/index-D1ejxJvq.js 69.66 kB)
$ bundlecheck.sh dist-hero    → bundle clean: no router, auth token, API path, pinia or naive-ui (exit 0)
$ bundlecheck.sh dist-falsifier → LEAK: RouterView (exit 1)          # falsifier 4
$ bundlecheck.sh               → NO BUNDLE in /assets (exit 2)        # empty-input control
```
The bundle check used to report "clean" when given no directory (every grep failed silently), so that "clean" was vacuous. It now exits 2 when there is no bundle.

The banned-phrase scan of `dist-hero` found 0 hits for coming soon, play now, sign in/up, join the beta, pre-order, wishlist and download. A positive control (the locked copy) does appear in the same bundle: "How a match is won" 1, "Last one solvent" 2, "Stay solvent" 1.

## Activation (live, browser pane, 2026-10-21)
**Dev server `http://localhost:3333/`** (`vite --port 3333`):
```
status 200 · nav 1 · h1 1 · #match aria-labelledby=hype-title · articles 4 · frames 4
h3 = [Drop, Duel, Storm, Last one solvent] · links in section 0 · internal links 0
all links = [github.com/Zedfoura/fintasy, tinatseichingaya.com/projects/fintasy]
alt = "60 traders across 11 market sectors" · stats = "60 traders 11 sectors 30 s duels 10 Hz ticks 5 rounds"
375×812  /#match: innerWidth 375, scrollWidth 375, overflowing elements [], #match top 0
768×1024 /: innerWidth 768, scrollWidth 768, CLS 0 (full scroll)
1440×900 /#match: innerWidth 1440, scrollWidth 1440, #match top 0, CLS 0
```
**Standalone build** (`vite preview --config vite.hero.config.ts`, `http://localhost:4173/#match`):
```
status 200 · nav 1 · h1 1 · articles 4 · h3 as above · links = the 2 outbound only
#match top 0 · one script (assets/index-D1ejxJvq.js) · console errors 0
```
Screenshots at 375 and 1440 match the hype-direction.md anatomy (mobile stack; 12-column desktop). Both servers were stopped afterwards.

## Flows
- Inventory: EP-hype-deeplink went from `conditional` to `required`, with location `/#match` and the live evidence above. New inventory hash: `sha256:bfa29855…2162c`.
- Claims rebound to that hash: HYPE-1, HYPE-2, HYPE-3, HYPE-4 and HERO-3 all report `WARGAME FLOW CONTRACT: VALID`. HYPE-2, HYPE-3 and HYPE-4 also report CLAIM INCOMPLETE, because their per-row matrices are still at PLAN (same as HERO-3).
- Stale text copied from HERO-3 into the HYPE claims was corrected: the CTA/login oracles, the `stock-royale-full-platform` ref, and the `hero_layout` scope basis.
- **Finding, not fixed:** `flows/claims/mission_HERO-5.json` is INVALID at HEAD before any edit here (`root: kind must be wargame-flow-inventory or wargame-flow-claim`). It is a legacy non-v2 file and is left for its owner.

## Not proven here
- Mounting the vignettes, the hero canvas pausing when offscreen, per-vignette visibility, and the page-level retention guard are HYPE-4.
- A live keyboard pass was not run. The section has no focus targets by design, and the unit test asserts it has 0 links.

## Correction (2026-10-21, found during CLOSE-1)
The "no overflow at 375/768/1440" result above used `scrollWidth == innerWidth`. That signal is blind on this page: `main.fintasy-page` has `overflow-x: clip`, so overflowing content is clipped, not scrolled. A per-element rect check shows **`section.hype` is 1596 px wide at a 1440 px viewport**, because `.hype` is `width: 100%` plus padding without `box-sizing: border-box` (HypeSection.vue). The right gutter is lost. The overflow claim is withdrawn; see `receipts/mission_CLOSE-1/execution.md` § DEF-HYPE-OVERFLOW. The fix is not applied yet (it needs packages/ authority).
