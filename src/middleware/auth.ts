import { auth } from '#/lib/auth'
import { AUTH_LOGIN_PATH, isLoginPath, isPublicPath } from '#/lib/auth-paths'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'

export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ request, next }) => {
    const headers = getRequestHeaders()
    const { pathname } = new URL(request.url)
    const session = await auth.api.getSession({ headers })

    if (isLoginPath(pathname)) {
      if (session) {
        throw redirect({ to: '/' })
      }
      return next()
    }

    if (isPublicPath(pathname)) {
      return next()
    }

    if (!session) {
      throw redirect({ to: AUTH_LOGIN_PATH })
    }

    return next({ context: { session } })
  },
)
