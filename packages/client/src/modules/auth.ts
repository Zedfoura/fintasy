/**
 * @author: Zedfoura, Antigravity
 * @description: Global router authentication guard module
 */

import type { Router } from 'vue-router'
import type { UserModule } from '~/types'

/**
 * Checks whether a route path is publicly accessible without active authentication.
 * Public routes:
 * - Root marketing / landing page ('/')
 * - Authentication portal ('/login')
 * - Help documentation & FAQs ('/dashboard/help', '/dashboard/help/*')
 * - Any path outside the '/dashboard' space (e.g. 404 catch-alls)
 */
export function isPublicRoute(path: string): boolean {
  if (path === '/' || path === '/login')
    return true

  if (path === '/dashboard/help' || path.startsWith('/dashboard/help/'))
    return true

  if (!path.startsWith('/dashboard'))
    return true

  return false
}

/**
 * Installs the authentication beforeEach navigation guard on the given router instance.
 */
export function setupAuthGuard(router: Router) {
  const fintasy = useAPI()

  router.beforeEach((to) => {
    const isAuth = fintasy.authenticated.value

    // If authenticated user visits /login, redirect to destination or dashboard
    if (to.path === '/login' && isAuth) {
      const redirect = (to.query.redirect as string) || '/dashboard'
      return redirect
    }

    // Public routes are unconditionally permitted
    if (isPublicRoute(to.path))
      return true

    // Protected dashboard routes require authentication
    if (!isAuth) {
      return {
        path: '/login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    return true
  })
}

export const install: UserModule = ({ router }) => {
  setupAuthGuard(router)
}
