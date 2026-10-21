# Execution receipt — HERO-4 (2026-10-20, session a4a10a71)
- Grant: grant-2026-10-20-hero-5-4-6 (HERO-4 is a dependency of HERO-6).
- Commit: 96353db: HeroVisual mounted in the HeroSection slot on / (index.vue), wired through the exposed onVisualUpdate; HeroSection imports the HeroVisualUpdate type from HeroVisual (the duplicate exports knip flagged are gone); new tests/HeroRetention.test.ts.
## Legacy test reconciliation (no skips)
- tests/LandingPageIntegration.test.ts: RETIRED (deleted). Assays A–C asserted the old 11-section page (removed by D2); assay D only asserted inside `if (widgets exist)` guards, so it passed vacuously on the new page.
- tests/LandingHero.test.ts: kept assay D (HomeNav, still used by layouts/home.vue); removed A–C and E–G (old page via index.vue).
- tests/ThemeToggleIntegration.test.ts: assay C replaced with a new-hero check. Correction to the HERO-2/3 receipts: the file had 4 tests at this point, not 6. Commit 974d108 (another Claude session, 21:33, "remove dead tests and orphaned landing components") had already removed 2 assays plus LandingDuelSimulator/GameplayPillars/SocialProof and their tests. That commit was not made by this session; it is reported to the user and left in place.
## Activation (dev server :3333, 1440x900)
canvas 2880x772 (DPR 2); strip "Round 2 / 5 · Storm holding · 46 / 60 solvent" updating from the sim; internal links []; navs 1; scrollWidth 1440; CLS 0; console errors none.
## Retention
- tests/HeroRetention.test.ts (4): locked headline; outbound-only links; visual mounted and wired to the strip; every tokens.json colour present in HeroSection.vue.
- Falsifier: SOURCE_URL → github.com/someone/else ⇒ "FAIL … expected [ …(3) ] to include 'https://github.com/Zedfoura/fintasy'", Tests 1 failed | 3 passed; restored → 4 passed.
## Full gates (HEAD daf06c5)
```
 ❯ tests/DesignTokens.test.ts  (4 tests | 2 failed) 33ms
 Test Files  1 failed | 19 passed (20)
      Tests  2 failed | 125 passed (127)
build exit=0
Unused files (6)
Unused dependencies (1)
Unused devDependencies (2)
Unused exported types (1)
```
The only failures are the pre-existing DesignTokens ones (2), present in the baseline before this campaign. ROUTED outside the campaign.
```
daf06c5 feat(hero): HERO-6 standalone static build of the hero for the portfolio case study
96353db feat(hero): HERO-4 mount live HeroVisual on /, retention guard, reconcile legacy landing tests
86d3501 feat(hero): HERO-5 outbound-only links (source + case study), no in-app CTAs
974d108 chore: remove dead tests and orphaned landing components
9ef5471 merge(hero): HERO-3 hero composition on /
c832897 merge(hero): HERO-2 generative domain visual
```
## UNVERIFIED
The v2 flow claim promotion (receipt-provenance bindings not generated); .vue type-check (no vue-tsc).
## Stage: retained
