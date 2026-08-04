import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

// Verifica daca pathname incepe deja cu un locale valid (/ro sau /ru)
const LOCALE_REGEX = /^\/(ro|ru)(\/|$)/

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Daca URL-ul are deja un locale (/ro/..., /ru/...), lasa next-intl sa gestioneze
  if (LOCALE_REGEX.test(pathname)) {
    return handleI18nRouting(request)
  }

  // Preferinta salvata in cookie (override manual din language switcher)
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value

  // Geolocation: Romania -> romana; orice alta tara -> rusa
  const country = request.headers.get('x-vercel-ip-country') || ''
  const geoLocale = country.toUpperCase() === 'RO' ? 'ro' : 'ru'

  const finalLocale =
    cookieLocale === 'ro' || cookieLocale === 'ru' ? cookieLocale : geoLocale

  // Redirectioneaza la versiunea localizata
  const url = request.nextUrl.clone()
  url.pathname = `/${finalLocale}${pathname}`
  return Response.redirect(url)
}

export const config = {
  matcher: [
    // Toate rutele cu exceptia: api, _next, _vercel, auth/callback, fisiere cu punct
    '/((?!api|_next|_vercel|auth/callback|.*\\..*).*)',
  ],
}
