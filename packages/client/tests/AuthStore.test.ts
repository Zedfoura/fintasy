/**
 * @author: Tinatsei Chingaya (Zedfoura), Antigravity
 * @description: Vitest test suite for Mission AUTH-2: Client Authentication Store, Guest Session & Route Guards
 */

import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useAPI } from '~/composables/api'
import { isPublicRoute, setupAuthGuard } from '~/modules/auth'
import { useStateStore } from '~/stores/state'

describe('client Authentication Store, Guest Session & Route Guards (AUTH-2)', () => {
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('assay A: persistent token hydration & reactive authentication state', () => {
    const fintasy = useAPI()
    const state = useStateStore()

    // Initially unauthenticated
    fintasy.clearToken()
    state.clearUserState()
    expect(fintasy.authenticated.value).toBe(false)
    expect(state.isAuthenticated).toBe(false)
    expect(state.isGuest).toBe(false)

    // Set token
    fintasy.setToken('test-token-uuid-1234')
    expect(fintasy.authenticated.value).toBe(true)
    expect(fintasy.sessionToken.value).toBe('test-token-uuid-1234')

    // Hydrate user UUID
    state.user.uuid = 'user-uuid-5678'
    expect(state.isAuthenticated).toBe(true)
    expect(state.isGuest).toBe(false)

    // Clear token drops authenticated state
    fintasy.clearToken()
    expect(fintasy.authenticated.value).toBe(false)
  })

  it('assay B: instant guest login provisions session and $15,000 integer cent pot (INV-1)', async () => {
    const mockGuestToken = 'guest-token-uuid-abcd'
    const mockGuestOwner = '00000000-0000-4000-8000-000000000001'

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/sessions/guest')) {
        return Promise.resolve(new Response(JSON.stringify({
          code: 200,
          message: 'Ok',
          data: {
            owner: mockGuestOwner,
            token: mockGuestToken,
          },
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }))
      }
      if (url.includes(`/users/${mockGuestOwner}`)) {
        return Promise.resolve(new Response(JSON.stringify({
          code: 200,
          message: 'Ok',
          data: {
            uuid: mockGuestOwner,
            username: 'guest_trader',
            coins: 1500000,
            created_at: '2026-10-01T00:00:00Z',
          },
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }))
      }
      if (url.includes('/portfolios')) {
        return Promise.resolve(new Response(JSON.stringify({
          code: 200,
          message: 'Ok',
          data: [],
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }))
      }
      if (url.includes('/tournaments')) {
        return Promise.resolve(new Response(JSON.stringify({
          code: 200,
          message: 'Ok',
          data: [],
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }))
      }
      return Promise.resolve(new Response('{}', { status: 200 }))
    })

    const fintasy = useAPI()
    const state = useStateStore()

    const res = await state.loginAsGuest()
    expect(res.code).toBe(200)

    // Token & user assertions
    expect(fintasy.sessionToken.value).toBe(mockGuestToken)
    expect(fintasy.authenticated.value).toBe(true)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isGuest).toBe(true)
    expect(state.user.uuid).toBe(mockGuestOwner)
    expect(state.user.username).toBe('guest_trader')

    // Strict 64-bit integer cents pot ($15,000 = 1,500,000 cents)
    expect(state.user.coins).toBe(1500000)
    expect(Number.isInteger(state.user.coins)).toBe(true)
  })

  it('assay C: automatic token revocation and store teardown on 401/403 responses', async () => {
    const fintasy = useAPI()
    const state = useStateStore()

    fintasy.setToken('expiring-test-token')
    state.user.uuid = 'active-user-123'
    expect(fintasy.authenticated.value).toBe(true)
    expect(state.isAuthenticated).toBe(true)

    // 401 Unauthorized response simulation
    globalThis.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify({
        code: 401,
        message: 'Invalid or expired session token',
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }))
    })

    const userRes = await fintasy.getUser({ uuid: 'active-user-123' })
    expect(userRes.code).toBe(401)
    expect(fintasy.sessionToken.value).toBe('')
    expect(fintasy.authenticated.value).toBe(false)
    expect(state.isAuthenticated).toBe(false)

    // 403 Forbidden response simulation
    fintasy.setToken('forbidden-test-token')
    state.user.uuid = 'active-user-123'
    expect(fintasy.authenticated.value).toBe(true)

    globalThis.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(new Response(JSON.stringify({
        code: 403,
        message: 'Session revoked or permission denied',
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }))
    })

    const portRes = await fintasy.getPortfolios({ owner: 'active-user-123' })
    expect(portRes.code).toBe(403)
    expect(fintasy.sessionToken.value).toBe('')
    expect(fintasy.authenticated.value).toBe(false)
  })

  it('assay D: public route classifier correctly identifies open vs protected paths', () => {
    // Open marketing & auth paths
    expect(isPublicRoute('/')).toBe(true)
    expect(isPublicRoute('/login')).toBe(true)

    // Open documentation & FAQ paths
    expect(isPublicRoute('/dashboard/help')).toBe(true)
    expect(isPublicRoute('/dashboard/help/faq')).toBe(true)
    expect(isPublicRoute('/dashboard/help/rules')).toBe(true)

    // Non-dashboard root-level paths
    expect(isPublicRoute('/about')).toBe(true)
    expect(isPublicRoute('/404')).toBe(true)

    // Protected application & trading paths
    expect(isPublicRoute('/dashboard')).toBe(false)
    expect(isPublicRoute('/dashboard/royale')).toBe(false)
    expect(isPublicRoute('/dashboard/trade')).toBe(false)
    expect(isPublicRoute('/dashboard/settings')).toBe(false)
    expect(isPublicRoute('/dashboard/tournaments')).toBe(false)
  })

  it('assay E: router guard intercepts unauthenticated users and preserves destination query', async () => {
    const fintasy = useAPI()
    fintasy.clearToken()

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/dashboard/royale', component: { template: '<div>Royale</div>' } },
        { path: '/dashboard/help', component: { template: '<div>Help</div>' } },
        { path: '/dashboard/help/faq', component: { template: '<div>FAQ</div>' } },
      ],
    })
    setupAuthGuard(router)

    // Public routes navigate directly
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/')

    await router.push('/dashboard/help')
    expect(router.currentRoute.value.path).toBe('/dashboard/help')

    await router.push('/dashboard/help/faq')
    expect(router.currentRoute.value.path).toBe('/dashboard/help/faq')

    // Protected route /dashboard redirects to /login with redirect query
    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/dashboard')

    // Protected route /dashboard/royale redirects to /login with redirect query
    await router.push('/dashboard/royale')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/dashboard/royale')
  })

  it('assay F: router guard permits authenticated navigation and redirects away from /login', async () => {
    const fintasy = useAPI()
    fintasy.setToken('valid-auth-token-999')

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/dashboard/royale', component: { template: '<div>Royale</div>' } },
      ],
    })
    setupAuthGuard(router)

    // Authenticated access to protected route succeeds
    await router.push('/dashboard/royale')
    expect(router.currentRoute.value.path).toBe('/dashboard/royale')

    // Visiting /login when already authenticated redirects to /dashboard
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/dashboard')

    // Visiting /login with specific redirect destination honours target
    await router.push({ path: '/login', query: { redirect: '/dashboard/royale' } })
    expect(router.currentRoute.value.path).toBe('/dashboard/royale')
  })

  it('assay G: explicit logout revokes token and wipes state', async () => {
    const fintasy = useAPI()
    const state = useStateStore()

    fintasy.setToken('session-to-terminate')
    state.user.uuid = 'uuid-to-terminate'
    state.user.username = 'active_trader'
    state.user.coins = 500000

    globalThis.fetch = vi.fn().mockImplementation((url: string, init: any) => {
      if (url.includes('/sessions') && init?.method === 'DELETE') {
        return Promise.resolve(new Response(JSON.stringify({
          code: 200,
          message: 'Session successfully deleted',
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }))
      }
      return Promise.resolve(new Response('{}', { status: 200 }))
    })

    await state.logout()

    expect(fintasy.sessionToken.value).toBe('')
    expect(fintasy.authenticated.value).toBe(false)
    expect(state.isAuthenticated).toBe(false)
    expect(state.user.uuid).toBe('')
    expect(state.user.username).toBe('')
    expect(state.user.coins).toBe(0)
    expect(state.portfolio.available.length).toBe(0)
  })
})
