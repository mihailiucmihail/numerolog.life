import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'

const handleI18nRouting = createMiddleware({
  locales: ['ro', 'ru'],
  defaultLocale: 'ru',
  localePrefix: 'always',
})

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Daca utilizatorul e deja pe o ruta cu locale (/ro/..., /ru/...), usa next-intl middleware
  if (pathname.startsWith('/ro') || pathname.startsWith('/ru')) {
    return handleI18nRouting(request)
  }

  // Rute speciale care nu au nevoie de locale (ex: API routes, public assets)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/cristalul-calculator.html') ||
    pathname.startsWith('/_next')
  ) {
    return undefined
  }

  // Geolocation: detecteaza tara utilizatorului din Vercel headers
  const country = request.headers.get('x-vercel-ip-country') || ''
  const locale = country.toUpperCase() === 'RO' ? 'ro' : 'ru'

  // Redirectioneaza la versiunea localizata
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return Response.redirect(url)
}

export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*|cristalul-calculator\\.html|auth|checkout|preview|profil|dashboard|rapoarte|setari).*)',
  ],
}
