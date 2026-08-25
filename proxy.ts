import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

// Experiența publică este exclusiv în limba rusă.
const LOCALE_REGEX = /^\/ru(\/|$)/

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Dacă URL-ul este deja în rusă, lasă next-intl să gestioneze ruta.
  if (LOCALE_REGEX.test(pathname)) {
    return handleI18nRouting(request)
  }

  // Orice rută publică este redirecționată către versiunea rusă.
  const url = request.nextUrl.clone()
  if (/^\/ro(\/|$)/.test(pathname)) {
    url.pathname = `/ru${pathname.slice(3) || '/'}`
  } else {
    url.pathname = `/ru${pathname}`
  }
  return Response.redirect(url)
}

export const config = {
  matcher: [
    // Toate rutele cu exceptia: api, _next, _vercel, auth/callback, fisiere cu punct
    '/((?!api|_next|_vercel|auth/callback|.*\\..*).*)',
  ],
}
