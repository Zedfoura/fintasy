# Execution receipt — HERO-6 (2026-10-20, session a4a10a71)
- Grant: grant-2026-10-20-hero-5-4-6. Hosting/publishing NOT granted (Tier B) and NOT done.
- Commit: daf06c5: hero-standalone/{index.html,main.ts,StandaloneHero.vue}, vite.hero.config.ts, package.json scripts build:hero / preview:hero, dist-hero/ gitignored and ESLint-ignored. (A first commit attempt failed because the repo-wide pre-commit lint read the minified dist-hero bundle; fixed by the ESLint ignore.)
## Build
`pnpm --filter client build:hero` → ✓ built in 2.77s; dist-hero/index.html + assets (JS 66.00 kB, CSS 5.77 kB, 9 self-hosted woff2).
## Bundle-content check
- dist-hero: "bundle clean: no router, auth token, API path, pinia or naive-ui" (exit 0)
- Falsifier (vue-router imported into the entry): "LEAK: RouterView" (exit 1); entry restored (cmp-identical).
## Activation (vite preview :4173)
- 1440x900: title "Fintasy — the stock-market battle royale"; h1 locked; navs 1; live canvas; strip updating; links = GitHub ×2 + case study; resource hosts ["localhost:4173"] only; /api calls 0; fonts loaded Archivo + JetBrains Mono (self-hosted); hero height 900 = innerHeight; CLS 0; console errors none.
- 375x812: scrollWidth 375 = innerWidth 375; navs 1.
## Note
Module scripts don't run from file:// in Chromium, so the build needs a static host (or `pnpm --filter client preview:hero`). base './' lets it live in any sub-path, e.g. /projects/fintasy/demo/.
## Stage: activated (OUTCOME needs the user to open the built page and confirm it's the one they'll link)

## Outcome (2026-10-21, user)
- **Reviewed artifact:** standalone build `dist-hero` (`assets/index-BqOzzip0.js`) served by `vite preview` on :4173 at `refs/heads/feature/hype-section` @ `2227c2d`: the hero plus the Match-timeline section with live vignettes.
- **Change made during review:** beat 03 copy no longer names $15,000 (`2227c2d`, at the user's request).
- **User confirmation:** "Reviewed the page: looks good. Record the outcome as confirmed, then stop the preview server."
- Preview server stopped afterwards; ports 3333 and 4173 confirmed closed.
