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
