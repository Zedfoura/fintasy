# Wargame ARC Simulation — Mission ROYALE-12

**Mission:** `ROYALE-12` — Tauri Desktop Wrapper & Steamworks SDK Scaffolding  
**Mode:** PLAN  
**Authority:** Scoped to planning artifacts (`wargames/`, `success/`, ledger metadata) and authorized execution  
**Consumer:** Campaign Completion & Native Desktop / Steam Deck Distribution  
**Applicable Flows:** `FLOW-ROYALE-GOLDEN`  

---

## 1. Grounded Reality Probes (Preflight Assays)

| Check | Probe Command | Observed Reality | Signal |
| :--- | :--- | :--- | :--- |
| **All Existing Tests Green** | `pnpm test` | 72 server + 32 client tests pass (100%) | ✅ Holds |
| **Monorepo Linting Clean** | `pnpm run lint` | All server & client files cleanly formatted | ✅ Holds |
| **Programmatic Blast Radius** | `npx ts-node wargame-metaharness/src/scripts/get-blast-radius.ts --files "..."` | Verified functioning | ✅ Holds |
| **Client Web Bundle** | `pnpm --filter client run build` | Vite build outputs to `dist/` | ✅ Holds |
| **Steamworks Bridge Target** | `packages/client/src/composables/useSteam.ts` | Browser fallback + Tauri IPC abstraction | ✅ Holds |

---

## 2. Action–Reaction–Counteraction (ARC) Stress Testing

### Scenario 1: Missing Rust Toolchain in CI / Headless Environments
* **Action:** Desktop build scripts or unit tests attempt to invoke `cargo build` on an environment lacking Rust / Cargo.
* **Adversarial Reaction:** Build pipelines break, blocking web development and monorepo verification.
* **Counteraction:** Zero-Dependency Desktop Scaffolding & Graceful Fallbacks:
  - Tauri 2.0 configuration (`tauri.conf.json`) and Rust source (`Cargo.toml`, `main.rs`, `steam.rs`) are scaffolded cleanly as production-ready configuration artifacts.
  - Client code accesses native desktop features strictly via the `useSteam` composable with automatic runtime environment detection.
  - Test suite validates the complete configuration schema and composable fallback behavior in Vitest without requiring a native Rust compiler.

### Scenario 2: Web Browser Execution Crash Due to Tauri IPC Calls
* **Action:** Web browser user plays Stock Royale via standard URL; code invokes Tauri IPC `window.__TAURI__.invoke()`.
* **Adversarial Reaction:** `TypeError: Cannot read properties of undefined (reading 'invoke')` crashes the client app in Chrome/Firefox.
* **Counteraction:** Multi-Tiered Runtime Environment Detection:
  - `useSteam.ts` checks for `window.__TAURI__` or `window.__TAURI_INTERNALS__`.
  - When in a standard browser, all desktop functions (`unlockAchievement`, `updateRichPresence`) route to lightweight console/telemetry fallbacks.
  - The web application continues to function 100% identically whether running inside Tauri or in a web browser.

### Scenario 3: Steam Deck Resolution & Window Scaling Mismatches
* **Action:** Desktop executable launches on Valve Steam Deck (1280x800 native 16:10 display).
* **Adversarial Reaction:** HUD elements (market radar map, trading duel terminal, kill feed) overflow screen boundaries or clip.
* **Counteraction:** Steam Deck First-Class Window Spec:
  - `tauri.conf.json` configures default resolution to 1280x800 with resizable enabled and minWidth/minHeight bounds.
  - Responsive UnoCSS grid ensures both standard 1080p/1440p displays and 1280x800 Steam Deck displays render without clipping.

---

## 3. Invariants & Negative Constraints
* **INV-1 (Web Independent Operation):** Web browser deployment must continue to run 100% unimpeded without requiring Tauri or Steam.
* **INV-2 (Steam Deck Compatibility):** Window configuration adheres to Steam Deck standard 1280x800 resolution.
* **INV-3 (Graceful Steamworks Degradation):** All achievement and Rich Presence calls degrade safely to no-ops when Steam client is not running.
* **INV-4 (Config Validation):** `tauri.conf.json` and `Cargo.toml` must adhere strictly to valid Tauri 2.0 specifications.
