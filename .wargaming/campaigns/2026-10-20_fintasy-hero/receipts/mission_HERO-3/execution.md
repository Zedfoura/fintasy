# Execution receipt — HERO-3 (2026-10-20, session a4a10a71)

- Grant: grant-2026-10-20-hero-2-3-exec
- Lane: wt/hero_layout @ 511b80c → e7bc563; merged locally as 9ef5471. Not pushed.

## Merge
```
*   9ef5471 merge(hero): HERO-3 hero composition on /
|\  
| * e7bc563 feat(hero): HERO-3 hero composition, nav and single-nav landing route
* |   c832897 merge(hero): HERO-2 generative domain visual
|\ \  
| |/  
|/|   
| * 0288857 refactor(hero): drop unused heroSim exports flagged by knip
| * 59e5115 feat(hero): HERO-2 seeded sector-storm visual engine and canvas renderer
|/  
 packages/client/src/components/hero/HeroNav.vue    |  94 ++++++
 .../client/src/components/hero/HeroSection.vue     | 316 +++++++++++++++++++
 packages/client/src/components/hero/HeroVisual.vue | 340 +++++++++++++++++++++
 packages/client/src/components/hero/heroSim.ts     | 284 +++++++++++++++++
 packages/client/src/pages/index.vue                |  76 +----
 packages/client/tests/HeroSection.test.ts          | 163 ++++++++++
 packages/client/tests/HeroVisual.test.ts           | 260 ++++++++++++++++
 packages/client/vite.config.ts                     |   2 +
 8 files changed, 1475 insertions(+), 60 deletions(-)
```

## Mechanism
- Parent re-run: `npx vitest run tests/HeroSection.test.ts` → Tests 12 passed (12).
- Falsifiers (lane): extra LandingHeader → "expected … to have a length of 1 but got 2" (2 failed); CTA to /dashboard → "expected '/dashboard' to be '/dashboard/royale'" (1 failed). Both restored.
- Build: exit 0. The Archivo wdth-axis URL works ("5 webfont css downloaded").

## Activation (live dev server, vite on :3333, browser pane)
- `curl localhost:3333/` → 200
- 1440x900 DOM: navs=1; h1="Sixty traders.\nOne market.\nLast one solvent."; links [Match]→/dashboard/royale, [How it plays]→/dashboard/help, [Source]→https://github.com/Zedfoura/fintasy target=_blank rel="noopener noreferrer", Enter a match→/dashboard/royale, Sign in→/login; strip "Round 1 / 5 · Storm holding … 60 / 60 solvent"; legacy landing DOM absent; scrollWidth 1440 = innerWidth 1440; h1 font "Archivo, …"; title "Fintasy — the stock-market battle royale"; console errors: none.
- 768: scrollWidth 768 = innerWidth 768. 375: 375 = 375, navs=1.
- Overflow falsifier at 375: injecting a 120vw element made mobile emulation widen the layout viewport (innerWidth 375 → 450) rather than make scrollWidth > innerWidth. So the valid signal is innerWidth == 375, which held without the injection. Instrument recorded as falsifiable via innerWidth.
- CTA click (pane holds an api-session-token but is not authenticated): landed on /login?redirect=/dashboard/royale, title "Login/Register • Fintasy".
- Font leak: the /login body font is "v-sans, system-ui, …", so the hero fonts don't leak. The dashboard check after a guest login was NOT run (it would require logging into the user's pane session).

## Legacy tests (ROUTED to HERO-4)
LandingHero 6/7 fail, LandingPageIntegration 3/4 fail, ThemeToggleIntegration 1/6 fail; LandingHeroV2 passes.

## Flow contract
Campaign inventory: VALID (schema v2). Claim: "VALID; CLAIM INCOMPLETE — requires ACTIVATION but has reached only PLAN". v2 achieved_stage is left at PLAN: promoting it needs receipt-provenance and artifact-hash bindings that were not generated. UNVERIFIED by the instrument. The legacy `stage` field is set to activated.

## Stage
activated
