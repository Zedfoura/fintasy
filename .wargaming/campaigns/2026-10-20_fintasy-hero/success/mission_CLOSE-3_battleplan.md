# ARC / Battle Plan — CLOSE-3 Page Retention Extension & Final Review (campaign 2026-10-20_fintasy-hero)

## Claim frame
- **Outcome:** `tests/PageRetention.test.ts` also guards the closing sections. It fails if any of these regress:
  - section order hero → match → faq → cta;
  - the six locked FAQ questions as disclosure buttons wired to their regions;
  - the CTA heading and its two outbound links;
  - standalone parity for FAQ and CTA.

  The existing whole-page checks (outbound-only links, fact rule) already cover the new text.

  The standalone page is rebuilt, and you review it on `vite preview`.
- **Required stage:** RETENTION. The guard is in the suite with each new check run red once; the user's review is the outcome.
- **Authority:** user, 2026-10-21: "Authorized: plan and execute CLOSE-3 on feature/closing-sections (extend PageRetention for the FAQ and CTA, rebuild the standalone page), then start the preview so I can review the finished page. Local commits only; no push/PR/merge."
- **Ref:** `refs/heads/feature/closing-sections` @ `7162ec2`.
- **Data model:** DATA-MODEL-AUTHORITY.md sha256 `1807e0c9…f3207`, client-only / no-data-tier.
- **Invariants:**
  - suite at 183/185, with only the 2 DesignTokens failures;
  - existing PageRetention cases unchanged (6), with new cases added;
  - bundle check clean;
  - no source changes outside the test file.
- **Falsifiers (each applied to source, run, then restored):**
  - **G1:** remove `<CloseCta />` from FintasyPage.
  - **G2:** render the CTA above the FAQ.
  - **G3:** drop a question from `closeCopy.ts`.
  - **G4:** point the CTA's case-study link at `/dashboard/royale`.
  - **G5:** change the CTA heading.
- **Flows:** FLOW-CLOSE-SECTIONS @ RETENTION.

## Design
- **New cases in `PageRetention.test.ts`:**
  1. **Order:** `main > section` reads `[hero, match, faq, cta]` (id, or the first class when there is no id).
  2. **FAQ:** the h3 buttons read the six locked questions (hard-coded); each `aria-controls` resolves to a region whose `aria-labelledby` points back to the button.
  3. **CTA:** `#cta` h2 is "That's the match." and its hrefs equal `[SOURCE_URL, CASE_STUDY_URL]` in that order.
- **Extended case:** the standalone parity case also compares `#faq` and `#cta`.
- **Single lane:** parent; sequential commit.

## Transitions and evidence
1. **Mechanism:** PageRetention green; G1–G5 each red, with raw output.
2. **Canonical:**
   - commit;
   - full suite `N of M`;
   - `build:hero` exit 0;
   - bundle check clean with both controls.
3. **Activated:** `vite preview` serving the rebuilt page (HTTP 200; FAQ and CTA present).
4. **Outcome / retained:** your review of the page.

## Rollback
Revert the CLOSE-3 commit. No point of no return locally; push and PR need their own go-ahead.
