# Execution receipt — HERO-5 (2026-10-20, session a4a10a71)
- Grant: grant-2026-10-20-hero-5-4-6 ("And do HERO-6", answering "Build HERO-5 now?"). Ruling D4.
- Commit: 86d3501 (heroLinks.ts new; HeroNav.vue, HeroSection.vue, HeroSection.test.ts). Local only.
## Mechanism
- `vitest run tests/HeroSection.test.ts` → Tests 14 passed (14)
- Falsifier: an injected `<a href="/login">` → "FAIL … links nowhere inside the app … expected '/login' to match /^https:\/\//", Tests 1 failed | 13 passed; restored → 14 passed.
- Case-study branch: the URL renders; caseStudyUrl='' hides it (both asserted).
## Activation (dev server :3333, 1440x900)
links: "[Source] -> https://github.com/Zedfoura/fintasy", "View the source → -> https://github.com/Zedfoura/fintasy", "Read the case study -> https://www.tinatseichingaya.com/projects/fintasy"; internal links: []; navs 1; console errors none. Both URLs probed with curl → 200.
## Stage: activated
