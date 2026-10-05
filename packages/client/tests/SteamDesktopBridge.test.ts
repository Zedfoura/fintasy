/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite for ROYALE-12 Tauri Desktop Wrapper & Steamworks SDK Scaffolding
 */

import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSteam } from '~/composables/useSteam'

describe('steamDesktopBridge (ROYALE-12)', () => {
  beforeEach(() => {
    // Reset window Tauri stubs
    delete (window as unknown as Record<string, unknown>).__TAURI__
    delete (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__
  })

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).__TAURI__
    delete (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__
  })

  describe('assay A: browser fallback mode', () => {
    it('should detect non-desktop environment and report graceful fallback status', async () => {
      const steam = useSteam()
      expect(steam.isDesktop.value).toBe(false)
      expect(steam.isSteamConnected.value).toBe(false)
      expect(steam.steamUser.value).toBeNull()

      const status = await steam.initSteam()
      expect(status.connected).toBe(false)
      expect(status.user).toBeNull()
      expect(status.message).toContain('standard web browser mode')
    })
  })

  describe('assay B: browser telemetry achievement unlocking', () => {
    it('should record unlocked achievements locally without throwing errors', async () => {
      const steam = useSteam()

      const res1 = await steam.unlockAchievement('ACH_VICTORY_ROYALE')
      expect(res1).toBe(true)
      expect(steam.unlockedAchievements.value.has('ACH_VICTORY_ROYALE')).toBe(true)

      const res2 = await steam.unlockAchievement('ACH_MARGIN_CALL_SURVIVOR')
      expect(res2).toBe(true)
      expect(steam.unlockedAchievements.value.has('ACH_MARGIN_CALL_SURVIVOR')).toBe(true)

      // Empty ID guard
      const resEmpty = await steam.unlockAchievement('')
      expect(resEmpty).toBe(false)
    })
  })

  describe('assay C: rich presence updates', () => {
    it('should update active rich presence in web mode', async () => {
      const steam = useSteam()

      const success = await steam.setRichPresence('Contesting Semis & AI | 14 Traders Left')
      expect(success).toBe(true)
      expect(steam.activeRichPresence.value).toBe('Contesting Semis & AI | 14 Traders Left')
    })
  })

  describe('assay D: simulated tauri desktop IPC bridge', () => {
    it('should invoke Tauri IPC commands when __TAURI__ is available', async () => {
      const mockInvoke = vi.fn().mockImplementation((cmd: string, _args: Record<string, unknown>) => {
        if (cmd === 'get_steam_status') {
          return Promise.resolve({
            connected: true,
            user: { steamId: '76561198000000000', personaName: 'GabeNewell', isDeck: true },
            message: 'Steamworks initialized',
          })
        }
        if (cmd === 'unlock_achievement') {
          return Promise.resolve(true)
        }
        if (cmd === 'set_rich_presence') {
          return Promise.resolve(true)
        }
        return Promise.resolve(null)
      })

      // Inject mock Tauri API
      ;(window as unknown as Record<string, unknown>).__TAURI__ = {
        invoke: mockInvoke,
      }

      const steam = useSteam()
      expect(steam.isDesktop.value).toBe(true)

      const status = await steam.initSteam()
      expect(mockInvoke).toHaveBeenCalledWith('get_steam_status', {})
      expect(status.connected).toBe(true)
      expect(status.user?.personaName).toBe('GabeNewell')
      expect(status.user?.isDeck).toBe(true)
      expect(steam.isSteamConnected.value).toBe(true)

      await steam.unlockAchievement('ACH_TRIPLE_KILL')
      expect(mockInvoke).toHaveBeenCalledWith('unlock_achievement', { achievementId: 'ACH_TRIPLE_KILL' })

      await steam.setRichPresence('Match Over | Winner')
      expect(mockInvoke).toHaveBeenCalledWith('set_rich_presence', { status: 'Match Over | Winner' })
    })
  })

  describe('assay E: tauri 2.0 configuration validation', () => {
    it('should validate tauri.conf.json format, Steam Deck 1280x800 dimensions, and bundle target', () => {
      const tauriConfigPath = path.resolve(__dirname, '../../../src-tauri/tauri.conf.json')
      expect(fs.existsSync(tauriConfigPath)).toBe(true)

      const content = fs.readFileSync(tauriConfigPath, 'utf-8')
      const config = JSON.parse(content)

      expect(config.productName).toBe('Fintasy: Stock Royale')
      expect(config.identifier).toBe('com.fintasy.stockroyale')
      expect(config.build.devUrl).toBe('http://localhost:3333')
      expect(config.build.frontendDist).toBe('../packages/client/dist')

      // Steam Deck aspect ratio / resolution check (1280 x 800)
      const windowConfig = config.app.windows[0]
      expect(windowConfig.width).toBe(1280)
      expect(windowConfig.height).toBe(800)
      expect(windowConfig.resizable).toBe(true)
      expect(config.bundle.active).toBe(true)
    })
  })

  describe('assay F: rust cargo manifest validation', () => {
    it('should validate src-tauri/Cargo.toml contains package metadata and Steamworks dependency', () => {
      const cargoPath = path.resolve(__dirname, '../../../src-tauri/Cargo.toml')
      expect(fs.existsSync(cargoPath)).toBe(true)

      const cargoContent = fs.readFileSync(cargoPath, 'utf-8')
      expect(cargoContent).toContain('name = "fintasy-stock-royale"')
      expect(cargoContent).toContain('tauri = { version = "2.0.0"')
      expect(cargoContent).toContain('steamworks')
    })
  })
})
