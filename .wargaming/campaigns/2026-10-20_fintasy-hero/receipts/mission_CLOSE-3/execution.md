# Execution receipt — CLOSE-3 Page Retention Extension & Final Review

- **Run:** close-3-exec-20261021 (session a4a10a71-8f49-47f0-ac4f-8ec743402514). The run was interrupted by a usage-limit pause after the falsifier run and resumed afterwards; no work was lost (the tree was verified clean apart from the test file).
- **Grant:** `grant-2026-10-21-close-3-exec`. User: "Authorized: plan and execute CLOSE-3 on feature/closing-sections (extend PageRetention for the FAQ and CTA, rebuild the standalone page), then start the preview so I can review the finished page. Local commits only; no push/PR/merge."
- **Data model:** DATA-MODEL-AUTHORITY.md sha256 `1807e0c9…f3207`, client-only / no-data-tier.
- **Stage:** `activated`, with the guard in the suite and every new check run red once. Outcome and retention await your review of the page now open on `vite preview`.

## Bindings
| Item | Value |
|---|---|
| Base | `refs/heads/feature/closing-sections` @ `7162ec2` |
| Commit | `bdafc84 test(close): CLOSE-3 page retention guard covers the FAQ and final CTA` (PageRetention plus the CLOSE-3 battle plan) |
| Source changes | none (test only) |

## Mechanism
`PageRetention.test.ts` now has 9 cases: the 6 existing ones (the standalone case now also compares `#faq` and `#cta`) and 3 new ones (page order; six locked FAQ questions wired to their regions; CTA heading and its two links). Result: **9 passed (9)**; eslint clean.

Each falsifier was applied to source, run, then restored:
```
G1 CTA removed from page:                exit=1 Tests 3 failed | 6 passed (9)  x CTA links · x page order · x standalone parity
G2 CTA above FAQ:                        exit=1 Tests 1 failed | 8 passed (9)  x page order
G3 a question dropped:                   exit=1 Tests 1 failed | 8 passed (9)  x six locked FAQ questions
G4 case-study link -> /dashboard/royale: exit=1 Tests 2 failed | 7 passed (9)  x CTA links · x links only outbound (D4)
G5 CTA heading changed:                  exit=1 Tests 1 failed | 8 passed (9)  x CTA heading/links
```

## Canonical
```
$ npx vitest run
 FAIL  tests/DesignTokens.test.ts > … > assay A: design-tokens.css defines 4-tier surface elevation system
 FAIL  tests/DesignTokens.test.ts > … > assay B: design-tokens.css defines functional chromatic telemetry tokens
 Test Files  1 failed | 23 passed (24)
      Tests  2 failed | 186 passed (188)
$ pnpm build:hero   → exit 0 (index-u_fCTaRx.js 80.70 kB, index-B4c4iSqw.css 15.78 kB; same hashes as CLOSE-2, since only tests changed)
$ bundlecheck.sh dist-hero → clean (exit 0); leak control exit 1; empty-input control exit 2
```

## Activation
`vite preview --config vite.hero.config.ts` on :4173 serves the rebuilt page.
- HTTP 200; sections hero, match, faq, cta;
- 6 FAQ questions; CTA h2 "That's the match.";
- script `index-u_fCTaRx.js`.

The server is left running for your review.

## Review fix (2026-10-21): CTA copy escaped the storm box
- **User:** "In certain viewports, the body of the Final CTA looks off as it escapes the colored portion of the container." A screenshot showed the body line wider than the dashed box, with ring edges crossing the text.
- **Cause:** `.close-ring-storm` was sized `min(760px, 70vw)` × 56% of the section, independently of the copy, and the inner ring sat behind the text.
- **Instrument:** for each width from 320 to 1680 px in 40 px steps (35 widths), every child of the CTA body must be inside the storm box.
  - **Before** (build `index-u_fCTaRx.js`): escaping at **19 of 35** widths. At 320–480 the h2, body and links escape; at 520–680 the body; at 1360–1680 the h2.
- **Fix:**
  - The storm box is now the content container itself (`.close-cta-box`: dashed border and fill, `width: fit-content; max-width: 100%`, padding `clamp(32px, 6vw, 64px) clamp(20px, 5vw, 72px)`).
  - The body is capped at `46ch` with `text-wrap: balance`.
  - The inner ring is removed; the outer ring is inset `clamp(40px, 8vh, 96px)` by half a gutter.
- **After** (build `index-E_cUJzYg.js`): escaping box **0 of 35**; box outside outer ring 0 of 35; CTA elements past the viewport 0 of 35.
- **Checks:** CloseSections and PageRetention 19/19; eslint clean; build:hero exit 0 (JS 80.62 kB, CSS 15.73 kB); bundle clean.
- **Screenshots:** at 1280 and 375 the copy wraps inside the box (at 375 the h2 is on two lines and the links stack).
- **Spec:** `close-direction.md` anatomy item 5 revised to match.

## Outcome (2026-10-21, user)
- **Reviewed artifact:** standalone build `dist-hero` (`assets/index-E_cUJzYg.js`, `index-BmzFa6hZ.css`) on `vite preview :4173`, at `refs/heads/feature/closing-sections` @ `ea7e478`. This is the full page: hero, Match timeline, FAQ, closing CTA.
- **Change made during review:** the CTA storm box now wraps its content (`ea7e478`).
- **User confirmation:** "Reviewed the finished page: looks good. Record the outcome as confirmed, then stop the preview server."
- **Retention guard in force:** `PageRetention.test.ts` (9 cases; G1–G5 recorded red) plus `CloseSections.test.ts` (10 cases; F1–F5 recorded red).
- **Cleanup:** preview server stopped; ports 3333 and 4173 confirmed clear.
