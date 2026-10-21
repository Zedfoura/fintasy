# Execution receipt — HYPE-4 Integration, Page Retention Guard & Live Scroll Verification

- **Run:** hype-4-exec-20261021 (session a4a10a71-8f49-47f0-ac4f-8ec743402514)
- **Grant:** `grant-2026-10-21-hype-4-exec`. User: "Authorized: execute HYPE-4 per the battle plan on feature/hype-section (local commits only; no push/PR/merge)."
- **Data model:** DATA-MODEL-AUTHORITY.md sha256 `1807e0c9…f3207`, client-only / no-data-tier.
- **Stage reached:** `activated`, with the retention guard in the suite and all its falsifiers run red. `outcome_verified` and `retained` wait on the user's review of the finished page (2026-10-21 note: outcome deferred until the page is complete).

## Bindings
| Item | Value |
|---|---|
| Base | `refs/heads/feature/hype-section` @ `1998168` (plan commit on top of `1539a2a`) |
| Commit | `d6bb429 feat(hype): HYPE-4 mount live vignettes in the hype section and add the page retention guard`, 2 files, +125 / −2 |
| Files | `src/components/page/FintasyPage.vue` (fills the 4 slots), `tests/PageRetention.test.ts` (new, 6 tests) |
| Push / PR / merge | none |

## Preflight step 1 (the jsdom risk from PLAN)
- HeroSection, HeroRetention, ThemeToggleIntegration and HypeSection pass **35/35** with the real vignettes mounted.
- Stderr matches the run without the change line for line: 3× canvas `getContext` "not implemented" (from the existing HeroVisual mounts), 2× `usehead` injection, 2× input `size` prop.
- **Decision:** no stubs were added to the existing tests. The UNVERIFIED item is cleared.

## Mechanism
`vitest run tests/PageRetention.test.ts` → **6 passed (6)**. Falsifiers, each applied by script, run, then restored (`git diff -- src` afterwards shows only FintasyPage):
```
F1 remove a beat:       exit=1 ['Tests  2 failed | 4 passed (6)']  x four locked beats; x vignette wiring
F2 12 sectors:          exit=1 ['Tests  1 failed | 5 passed (6)']  x fact rule
F3 /login link:         exit=1 ['Tests  1 failed | 5 passed (6)']  x outbound-only links (D4)
F4 drop one vignette:   exit=1 ['Tests  1 failed | 5 passed (6)']  x vignette wiring
F5 swap drop/storm:     exit=1 ['Tests  1 failed | 5 passed (6)']  x vignette wiring
```

## Canonical
```
$ npx vitest run
 FAIL  tests/DesignTokens.test.ts > … > assay A: design-tokens.css defines 4-tier surface elevation system
 FAIL  tests/DesignTokens.test.ts > … > assay B: design-tokens.css defines functional chromatic telemetry tokens
 Test Files  1 failed | 22 passed (23)
      Tests  2 failed | 173 passed (175)
$ npx vite build                 → exit 0
$ pnpm build:hero                → exit 0 (dist-hero/assets/index-Dd_mZZ_R.js 76.57 kB; was 69.66 kB)
$ bundlecheck.sh dist-hero       → bundle clean (exit 0)
$ bundlecheck.sh dist-falsifier  → LEAK: RouterView (exit 1)
$ bundlecheck.sh                 → NO BUNDLE in /assets (exit 2)
$ pnpm dlx knip                  → Unused files (7), Unused exported types (7): same as 1539a2a, nothing in hype/, page/ or the new test
```

## Activation (browser pane, 2026-10-21)
**Draw probe:** `CanvasRenderingContext2D.prototype.{setTransform, clearRect, fillRect}` was patched in the page to count calls per canvas over 1 s windows.

**Dev `:3333`, 1440×900:** 5 canvases (hero plus 4 in `#match`), 0 fallbacks.
```
top          hero 900 · drop 0 · duel 0 · storm 0 · lobby 0
duel centred hero 0 · drop 780 (73% visible) · duel 120 (100%) · storm 840 (73%) · lobby 0 (0%)
page bottom  hero 0 · drop 0 · duel 0 · storm 840 (100%) · lobby 120 (100%)
```
- **Falsifier 6 (positive control):** at scroll top, forced `clearRect` calls on the off-screen lobby canvas were counted (20 of 30 injected), so the probe is not blind to off-screen canvases.
- **768×1024:** sweep every 500 px, with draw/visibility consistent at every stop; CLS 0; scrollWidth 768.
- **375×812:**
  - sweep every 400 px; at most 2 canvases drawing at once;
  - CLS 0; scrollWidth 375; `/#match` lands at top 0.
  - The sweep flagged one stop: drop at 6% visible drawing 0. That is the ≥10% threshold working, not a fault. A threshold probe on drop confirmed it in both directions: 6% → 0 draws and 20% → 624 entering; 20% → 624, 6% → 0 and 0% → 0 leaving.
- **1440 `/#match`:** top 0, CLS 0 through a full scroll.

**Standalone `vite preview` `:4173`:**
- 200, 1 nav, 1 h1, 4 articles, 4 canvases, 0 fallbacks; links are the 2 outbound only; **console errors 0** at 1440 and at 375.
- 1440 sweep every 300 px, all consistent except a 1 px boundary: the hero draws at scroll 900 while its bottom edge sits exactly at the viewport top. IntersectionObserver treats an edge-adjacent target as intersecting. Probe: 899 → 495 draws, 900 → 330, 901 → 0, 905 → 0.
- 375: `/#match` top 0, scrollWidth 375.
- **CLS:** 0.0011 on the first load of the freshly started preview server, with no source captured. Four later loads with a full scroll (one in the tab, three cold iframes) measured CLS **0, 0, 0, 0** with no shift entries. Recorded as not reproduced.

## Open items (honest)
- **Dev-server console:** one `net::ERR_CONNECTION_REFUSED` on `localhost:3333`. Every resource-timing entry on the page is a `localhost:3333` 200, and no service worker is registered. The source is **UNATTRIBUTED**. It does **not** occur in the standalone build, which is the artifact going to the portfolio.
- **Reduced motion live:** **UNVERIFIED (not emulable in the pane).** It is proven by unit tests: HypeVignettes asserts reduced motion gives 0 rAF and ≥1 draw.
- **Hidden-tab pause live:** **UNVERIFIED.** It is proven by unit tests (`visibilitychange`).
- **Flow claim:** the per-row matrix stays at PLAN (campaign precedent). The claim `stage` records `activated` with this receipt.
