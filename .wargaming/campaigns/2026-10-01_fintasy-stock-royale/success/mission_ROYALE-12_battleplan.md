# Battle Plan — Mission ROYALE-12: Tauri Desktop Wrapper & Steamworks SDK Scaffolding

**Mission:** `ROYALE-12`  
**Required Evidence Stage:** `ACTIVATION`  
**Governing Authority:** `DATA-MODEL-AUTHORITY.md` & Steamworks SDK specifications  
**Assigned Parallel Lane:** `lane_engine`  
**Target Files:**
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/src/main.rs`
- `src-tauri/src/steam.rs`
- `packages/client/src/composables/useSteam.ts`
- `packages/client/tests/SteamDesktopBridge.test.ts`
- `package.json`

---

## 1. Concrete Execution Specification

### 1.1 Tauri 2.0 Configuration (`src-tauri/tauri.conf.json`)
* Configure `build`:
  * `beforeDevCommand`: `pnpm dev:client`
  * `beforeBuildCommand`: `pnpm --filter client build`
  * `devUrl`: `http://localhost:3333`
  * `frontendDist`: `../packages/client/dist`
* Configure `app`:
  * Windows: Title `Fintasy: Stock Royale`, Width `1280`, Height `800` (Steam Deck native aspect ratio), Resizable `true`.
  * Security: Content Security Policy ensuring secure asset loading.
* Configure `bundle`:
  * Active: `true`
  * Targets: `all`
  * Identifier: `com.fintasy.stockroyale`

### 1.2 Rust Cargo Manifest & Steamworks Stubs (`src-tauri/Cargo.toml`, `src-tauri/src/main.rs`, `src-tauri/src/steam.rs`)
* `Cargo.toml`: Tauri 2.0 dependencies with optional `steamworks` feature flag.
* `main.rs`: Entry point with Tauri command handlers:
  * `init_steamworks`: Checks Steam status and initializes bridge.
  * `unlock_achievement`: Unlocks Steam achievements (e.g., `ACH_VICTORY_ROYALE`, `ACH_MARGIN_CALL_SURVIVOR`).
  * `set_rich_presence`: Updates Steam status ("Contesting Semis & AI | 14 Traders Left").
  * `get_steam_user`: Returns persona name and Steam ID.
* `steam.rs`: Safe wrapper handling Steam API unavailability gracefully.

### 1.3 Client Steam Composable (`packages/client/src/composables/useSteam.ts`)
* Runtime Environment Detection: Checks `window.__TAURI__` / `window.__TAURI_INTERNALS__`.
* Exposed state & methods:
  * `isDesktop`: `ComputedRef<boolean>`
  * `isSteamConnected`: `Ref<boolean>`
  * `steamUser`: `Ref<{ username: string, steamId: string } | null>`
  * `unlockAchievement(id: string)`: Calls Tauri IPC or browser telemetry fallback.
  * `setRichPresence(status: string)`: Calls Tauri IPC or browser telemetry fallback.

### 1.4 Test Assays (`packages/client/tests/SteamDesktopBridge.test.ts`)
* **Assay A (Browser Fallback Mode):** Verifies `useSteam` operates without errors in standard browser environment.
* **Assay B (Mock Achievement Unlocking):** Verifies `unlockAchievement` emits telemetry without exceptions.
* **Assay C (Rich Presence Updates):** Verifies `setRichPresence` formats and updates state.
* **Assay D (Tauri IPC Bridge Integration):** Simulates Tauri environment and verifies IPC command dispatching.
* **Assay E (Tauri Configuration Validation):** Validates `tauri.conf.json` parses as valid JSON with 1280x800 dimensions and correct bundle identifier.
* **Assay F (Cargo Manifest Validation):** Validates `Cargo.toml` contains required dependencies.

---

## 2. Falsifiable Verification Assays
1. Vitest suite `packages/client/tests/SteamDesktopBridge.test.ts` passes 100%.
2. Full monorepo test suite `pnpm test` passes 100%.
3. Monorepo linting `pnpm run lint` passes with 0 errors and 0 warnings.
4. Programmatic blast radius calculated and verified.

---

## 3. Rollback & Pre-conditions
* **Pre-conditions:** All 104 monorepo tests pass; git tree clean at `b100179`.
* **Rollback Plan:** `git checkout -- src-tauri/ packages/client/`
* **Points of No Return:** None (additive desktop wrapper files).
