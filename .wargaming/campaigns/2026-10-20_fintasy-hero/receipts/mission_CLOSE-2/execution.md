# Execution receipt — CLOSE-2 FAQ & Final CTA Sections on `/` and the Standalone Build

- **Run:** close-2-exec-20261021 (session a4a10a71-8f49-47f0-ac4f-8ec743402514)
- **Grant:** `grant-2026-10-21-close-2-exec`. User: "Authorized: execute CLOSE-2 per the battle plan on feature/closing-sections (local commits only; no push/PR/merge)."
- **Data model:** DATA-MODEL-AUTHORITY.md sha256 `1807e0c9…f3207`, client-only / no-data-tier.
- **Rulings:** D4, D7 and D8. The FAQ 03 answer is the user's wording, copied verbatim.
- **Stage reached:** `activated` (the required stage).

## Bindings
| Item | Value |
|---|---|
| Base | `refs/heads/feature/closing-sections` @ `b1066f6` (includes the hype overflow fix `c95d4bb` via `d4acd02`) |
| Commit | `ef3034b feat(close): CLOSE-2 FAQ and final CTA sections on the marketing page`, 7 files, +617 / −2 |
| New | `src/components/close/{closeCopy.ts, CloseFaq.vue, CloseCta.vue}`, `tests/CloseSections.test.ts` (10 tests) |
| Edited | `FintasyPage.vue` (+2 sections, 2 imports, doc line); `hypeBeats.ts` (+`05`/`06` ordinals, +2 banned phrases); `HypeSection.test.ts:152` (composition) |
| Push / PR | none (local only) |

## Planned contract changes, shown red then green
```
# FintasyPage wired, before the allowlist change:
FAIL tests/PageRetention.test.ts > … > passes the fact rule over the section and the whole page
AssertionError: expected { offenders: [ '05', '06' ], …(1) } to deeply equal { offenders: [], banned: [] }
Tests  1 failed | 5 passed (6)
# after adding '05','06' to FACT_ALLOWLIST and updating HypeSection.test.ts:152:
PageRetention + HypeSection: Test Files 2 passed (2) · Tests 19 passed (19)
```

## Mechanism
`vitest run tests/CloseSections.test.ts` → **10 passed (10)**; eslint clean. Each falsifier was applied by script, run, then restored:
```
F1 /login href in CTA:        exit=1 Tests 2 failed | 8 passed (10)   x CTA links only…(D4) · x renders hero, hype, FAQ, then CTA…no internal links
F2 "Play now" in an answer:   exit=1 Tests 1 failed | 9 passed (10)   x passes the fact rule over the FAQ and the CTA
F3 "100,000 traders":         exit=1 Tests 1 failed | 9 passed (10)   x passes the fact rule over the FAQ and the CTA
F4 aria-expanded removed:     exit=1 Tests 2 failed | 8 passed (10)   x opens only the first question · x toggles aria-expanded and hidden together
F5 toggle is a no-op:         exit=1 Tests 1 failed | 9 passed (10)   x toggles aria-expanded and hidden together
```

## Canonical
```
$ npx vitest run      (baseline at b1066f6: 2 failed | 173 passed (175))
 FAIL  tests/DesignTokens.test.ts > … > assay A: design-tokens.css defines 4-tier surface elevation system
 FAIL  tests/DesignTokens.test.ts > … > assay B: design-tokens.css defines functional chromatic telemetry tokens
 Test Files  1 failed | 23 passed (24)
      Tests  2 failed | 183 passed (185)
$ npx vite build                 → exit 0
$ pnpm build:hero                → exit 0 (JS 80.70 kB, was 76.58; CSS 15.78 kB)
$ bundlecheck.sh dist-hero       → bundle clean (exit 0); leak control exit 1; empty-input control exit 2
$ pnpm dlx knip                  → Unused files 7 → 10. The 3 new are CLOSE-1 prototype records under .wargaming/
                                   (close.js, fact-gate.mjs, page/ snapshot bundle). 0 findings under packages/;
                                   unused exported types unchanged (7).
```

## Activation (browser pane, 2026-10-21)
**Standalone `vite preview :4173`** (iframes at fixed widths; rect check over `main, main *`, excluding visually hidden ≤1 px elements):

| Width | Section order | nav / h1 | Questions (open) | Links | Overflowing | F6 control (FAQ `content-box`) | CLS (full scroll) |
|---|---|---|---|---|---|---|---|
| 1440 | hero, match, faq, cta | 1 / 1 | 6 (`tfffff`) | source + case study only | 0 | 35 | 0 |
| 768 | same | 1 / 1 | 6 (`tfffff`) | same | 0 | 37 | 0 |
| 375 | same | 1 / 1 | 6 (`tfffff`) | same | 0 | 32 | 0 |

- **Keyboard (real key events, 1440):**
  - Tab from Q01 moves focus to `faq-q-money` (`:focus-visible` true, violet outline in the screenshot);
  - Return sets `aria-expanded` true and `hidden` false;
  - Space sets `aria-expanded` false and `hidden` true.
- **Reduced motion:** both rules are present in the shipped CSS (`.close-icon::before/::after { transition: none }` and `.close-btn { transition: none }` under `prefers-reduced-motion: reduce`). Behaviour under emulation is **UNVERIFIED**; the pane cannot emulate the setting.
- **Deep links:**
  - `/#faq` lands at faq top 0.
  - `/#cta` lands with the CTA top at 347 px, which is the end of the page (the CTA is the last section). On dev, max scroll 4266 gives a CTA top of 319 px, so this is expected.
- **Console errors (standalone):** 0.

**Dev `:3333`:** 200; order hero, match, faq, cta; 1 nav, 1 h1, 6 questions, 0 internal links.

Both servers stopped; ports 3333 and 4173 confirmed clear.

## Not proven here
- CLOSE-3 still has to extend PageRetention to cover the FAQ and CTA (order, outbound-only links across the whole page, fact rule), each run red once, and take your review of the final page.
- The flow claim per-row matrix stays at PLAN (campaign precedent).
