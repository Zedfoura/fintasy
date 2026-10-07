/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Steamworks SDK client bridge composable with multi-platform graceful degradation
 */

import { computed, ref } from 'vue'

export interface SteamUser {
  steamId: string
  personaName: string
  isDeck: boolean
}

export interface SteamStatusResponse {
  connected: boolean
  user: SteamUser | null
  message: string
}

export function useSteam() {
  const isSteamConnected = ref<boolean>(false)
  const steamUser = ref<SteamUser | null>(null)
  const activeRichPresence = ref<string>('')
  const unlockedAchievements = ref<Set<string>>(new Set())

  // Runtime environment check for native Tauri container
  const isDesktop = computed<boolean>(() => {
    if (typeof window === 'undefined')
      return false
    const w = window as unknown as Record<string, unknown>
    return Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__)
  })

  async function invokeTauri<T>(cmd: string, args: Record<string, unknown> = {}): Promise<T | null> {
    if (!isDesktop.value)
      return null

    const w = window as unknown as {
      __TAURI__?: { invoke?: <R>(cmd: string, args?: Record<string, unknown>) => Promise<R> }
      __TAURI_INTERNALS__?: { invoke?: <R>(cmd: string, args?: Record<string, unknown>) => Promise<R> }
    }

    const invokeFn = w.__TAURI__?.invoke || w.__TAURI_INTERNALS__?.invoke
    if (invokeFn) {
      try {
        return await invokeFn<T>(cmd, args)
      }
      catch (err) {
        console.warn(`[Tauri IPC] Failed to invoke command ${cmd}:`, err)
        return null
      }
    }
    return null
  }

  async function initSteam(): Promise<SteamStatusResponse> {
    if (isDesktop.value) {
      const res = await invokeTauri<SteamStatusResponse>('get_steam_status')
      if (res) {
        isSteamConnected.value = res.connected
        steamUser.value = res.user
        return res
      }
    }

    // Graceful web fallback
    const fallback: SteamStatusResponse = {
      connected: false,
      user: null,
      message: 'Running in standard web browser mode',
    }
    isSteamConnected.value = false
    steamUser.value = null
    return fallback
  }

  async function unlockAchievement(achievementId: string): Promise<boolean> {
    if (!achievementId)
      return false

    unlockedAchievements.value.add(achievementId)

    if (isDesktop.value) {
      const res = await invokeTauri<boolean>('unlock_achievement', { achievementId })
      if (res !== null)
        return res
    }

    // Telemetry fallback in web browser
    return true
  }

  async function setRichPresence(status: string): Promise<boolean> {
    activeRichPresence.value = status

    if (isDesktop.value) {
      const res = await invokeTauri<boolean>('set_rich_presence', { status })
      if (res !== null)
        return res
    }

    // Telemetry fallback in web browser
    return true
  }

  return {
    isDesktop,
    isSteamConnected,
    steamUser,
    activeRichPresence,
    unlockedAchievements,
    initSteam,
    unlockAchievement,
    setRichPresence,
  }
}
