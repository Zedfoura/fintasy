# Wargame ARC Specification — Mission THEME-1: Sticky Glassmorphic Navbar & Brand Identity Revamp

**Mission ID:** `THEME-1`  
**Campaign:** `2026-10-01_fintasy-stock-royale`  
**Target Stage:** `CANONICAL`  
**Flow Coverage:** `FLOW-THEME-NAVBAR`, `FLOW-LANDING-CONVERSION`  
**Lane:** `lane_navbar_ui`  

---

## 1. Action (Proposed State Mutation)
- Overhaul `packages/client/src/components/navigation/HomeNav.vue`:
  - **Sticky Frosted Glass Container:** `sticky top-0 z-50 backdrop-blur-xl bg-white/85 dark:bg-[#0c0d14]/85 border-b border-slate-200/80 dark:border-[#1f2438] transition-colors duration-200`.
  - **Brand Identity & Logo:**
    - High-tech rounded badge housing the crosshair/radar icon with subtle pulse glow (`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`).
    - Logo typography: `font-mono font-black tracking-tight text-slate-900 dark:text-white md:text-2xl`.
    - Live Season Tag: `BETA S1` chip in font-mono (`bg-slate-100 dark:bg-[#121526] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-[#1f2438] text-[10px]`).
  - **Navigation Links:**
    - Interactive pill buttons with hover micro-animations and active indicator styling (`font-mono text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white`).
  - **High-Contrast Dual-Theme "Play Royale" CTA:**
    - `.play-royale-nav-btn`:
      - In Light Mode: Solid, vibrant emerald background (`bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold shadow-md shadow-emerald-600/25`).
      - In Dark Mode: Neon emerald background (`dark:bg-[#00e676] dark:hover:bg-[#00c853] dark:text-black dark:font-black dark:shadow-[0_0_20px_rgba(0,230,118,0.35)]`).
      - Eliminates the washed-out pale text and faint outline on white background.
  - **Controls Group:**
    - Cohesive rounded pill container housing `LanguageSwitch` and `ThemeSwitch`.
- Author test suite `packages/client/tests/NavBarTheme.test.ts` verifying classes, DOM elements, CTA button, and navigation.

---

## 2. Reaction (Anticipated Failure Modes & Regressions)
- **R-1 (Existing Test Regressions in `LandingHero.test.ts`):** `LandingHero.test.ts` mounts `HomeNav.vue` and asserts `.play-royale-nav-btn` and router push to `/dashboard/royale`.
- **R-2 (Z-Index / Stacking Context):** A sticky navbar could interfere with absolute positioned glow lights or dialogs if z-index is too low or high.
- **R-3 (Mobile Viewport Collapse):** Text links or badges could cause overflow on narrow screens (<380px).

---

## 3. Counteraction (Hardened Mitigations & Guards)
- **C-1:** Preserve all existing class names (`.play-royale-nav-btn`, `router.push('/dashboard/royale')`, router links) ensuring 100% backward compatibility with `LandingHero.test.ts`.
- **C-2:** Use standard `sticky top-0 z-50` with `backdrop-blur-xl`, keeping it above page content while below Naive UI modals (`z-index: 2000+`).
- **C-3:** Use responsive utility classes (`hidden sm:inline-flex`, compact text, auto-scroll prevention).
