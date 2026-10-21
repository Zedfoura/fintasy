# Campaign: Fintasy Marketing Hero (From-Scratch Rebuild)

- **Slug:** `2026-10-20_fintasy-hero`
- **Goal:** Build a distinctive, recruiter-facing hero section for the Fintasy marketing page at `/`, designed from scratch: new palette, copy, typography, and composition.
- **Scope:** Hero section only: the top strip inside the hero, headline and subtitle, the primary visual, and outbound links (GitHub source; case study once its URL is given). Per D4 there are no links into the game.
- **Deferred / out of scope:** every landing section below the hero (media, benefits, testimonials, FAQ, final CTA, footer); the app shell and dashboard theming; deploy and publish.
- **Authority:** Planning artifacts only. Executing a mission needs user authority (`wargame-run` / `wargame-arc <ID> execute`). Tier B (push to canon, deploy) always needs a separate explicit grant.
- **Disposition:** active
- **Run Mode:** client-only (Vue 3 + Vite + UnoCSS in `packages/client`). Per `.wargaming/DATA-MODEL-AUTHORITY.md` §2.1, legacy API endpoints are untouched and no persistent or real-time tier is read or written. Mode recorded as `client-only / no-data-tier`.
- **Data Model Authority:** Cited as `.wargaming/DATA-MODEL-AUTHORITY.md` (sha256 `1807e0c9a16c3f373c3b1e7b61a698d28a6608efc00401140d2bb1fe8edf3207`).

## User brief (2026-10-20, verbatim intent summary)

The user supplied three reference heroes:
1. **The user's own portfolio hero.** A dark field, an oversized grotesk name set in two lines, a tracked uppercase subtitle, a faint vertical column grid, and a single mono accent (`[ SCROLL TO EXPLORE ]`). Liked for its simplicity and directness.
2. **AiiD 2026 "AI in Design".** An image-mosaic upper band with mono caption tags, and the headline displaced to the right column with a small lede on the left. Liked for the intentional spacing and the rightward displacement that focuses attention on the image.
3. **Prødux.** A dark top band with a large sans statement on the left and a mono paragraph on the right, then a full-bleed framed image with the wordmark overlaid and small floating captions. Liked for its framing and overall aesthetic.

Constraints: hero only; it must feel unique to recruiters reviewing a public project; ignore all prior landing and design work; palette, copy, and design are free to change.

## Decision rulings

| ID | Decision | Status |
|----|----------|--------|
| D1 | New campaign rather than appending to `2026-10-01_fintasy-stock-royale` | Decided by the user's explicit "disregard the previous work… starting from scratch" |
| D2 | Fate of legacy sections below the hero during this campaign | **DECIDED by the user, 2026-10-20:** "render only the new hero on / and unmount the legacy sections." Legacy `components/landing/*` files stay on disk, unmounted. Owned by HERO-3 (index.vue) and HERO-4 (legacy test reconciliation). |
| D4 | Game availability and CTAs | **DECIDED by the user, 2026-10-20:** "this landing page will not link to the game as I will not have the game up … I'll be placing just this page on my portfolio site linked within the case study … This game will not be going live." CTA choice (structured question): **Source + case study**. Remove every link into the app (`/dashboard/*`, `/login`); the primary button becomes "View the source →" (GitHub); "Read the case study" is added once the case-study URL is provided; the nav keeps only `[Source]`. "Coming soon" was rejected because the game is not going live. |
| D5 | Deliverable form | The page will be shown standalone from the user's portfolio case study. Hosting/publishing is Tier B and needs its own grant; a standalone static build is proposed as HERO-6. |
| D3 | Visual centerpiece medium (refs 2 and 3 lean on imagery) | Resolved inside HERO-1 by user selection between rendered directions. Bias: generated in code from Fintasy's own domain (sector map, tick field), no stock imagery. |
