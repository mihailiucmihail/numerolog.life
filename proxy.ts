import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import { COUNTRY_HEADER, CURRENCY_COOKIE, CURRENCY_HEADER, currencyFromCountry, parseCurrency, type Currency } from './lib/currency'
import { isCountryOverrideAllowed } from './lib/country-pricing'

const handleI18nRouting = createMiddleware(routing)

// Experiența publică este exclusiv în limba rusă.
const LOCALE_REGEX = /^\/ru(\/|$)/

const CURRENCY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 de zile

/**
 * Moneda vizitatorului: ?currency=kzt|mdl|eur (override explicit, ținut în cookie) > geolocație (KZ -> KZT,
 * MD -> MDL) > cookie existent > EUR.
 * Geolocația bate cookie-ul: altfel un vizitator din Kazahstan care a primit cândva `eur` (înainte de
 * introducerea KZT sau de pe alt IP) ar rămâne blocat pe euro 30 de zile. Cookie-ul rămâne util doar
 * pentru override-ul explicit și ca rezervă când header-ul de țară lipsește.
 */
function resolveCurrency(request: NextRequest): { currency: Currency; persist: boolean } {
  // Override-urile din URL (?currency=, ?country=) sunt permise doar în development/preview — în producție
  // prețul nu poate fi manipulat din URL; contează exclusiv geolocația.
  const fromQuery = isCountryOverrideAllowed() ? parseCurrency(request.nextUrl.searchParams.get('currency')) : null
  if (fromQuery) return { currency: fromQuery, persist: true }
  const fromCookie = parseCurrency(request.cookies.get(CURRENCY_COOKIE)?.value)
  const country = resolveCountry(request)
  if (country) {
    const fromCountry = currencyFromCountry(country)
    return { currency: fromCountry, persist: fromCountry !== fromCookie }
  }
  if (fromCookie) return { currency: fromCookie, persist: false }
  return { currency: currencyFromCountry(null), persist: true }
}

/** Țara vizitatorului (ISO alpha-2): geolocația Vercel; ?country=XX doar în development/preview. */
function resolveCountry(request: NextRequest): string | null {
  const override = isCountryOverrideAllowed() ? request.nextUrl.searchParams.get('country') : null
  const raw = override || request.headers.get('x-vercel-ip-country')
  return raw && /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : null
}

function withCurrencyCookie(response: NextResponse | Response, request: NextRequest): NextResponse | Response {
  const { currency, persist } = resolveCurrency(request)
  if (!persist) return response
  const res = response instanceof NextResponse ? response : new NextResponse(response.body, response)
  res.cookies.set(CURRENCY_COOKIE, currency, { path: '/', maxAge: CURRENCY_COOKIE_MAX_AGE, sameSite: 'lax' })
  return res
}

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Pagina de login nu mai este publică în produsul actual: orice acces direct
  // la ruta localizată sau ne-localizată merge la pagina principală.
  if (/^\/(?:ru\/)?auth\/login\/?$/.test(pathname)) {
    const home = request.nextUrl.clone()
    home.pathname = '/ru'
    home.search = ''
    return NextResponse.redirect(home)
  }

  // Dacă URL-ul este deja în rusă, lasă next-intl să gestioneze ruta.
  if (LOCALE_REGEX.test(pathname)) {
    // Moneda merge și ca header de request, ca prima randare (înainte să existe cookie-ul)
    // să afișeze deja prețurile corecte — fără flash EUR -> KZT.
    const { currency } = resolveCurrency(request)
    const headers = new Headers(request.headers)
    headers.set(CURRENCY_HEADER, currency)
    // Țara (prețul fix al Cristalului, alfabetul numelui); ?country=XX permite testarea fără VPN doar în dev/preview.
    const country = resolveCountry(request)
    if (country) headers.set(COUNTRY_HEADER, country)
    const forwarded = new NextRequest(request, { headers })
    return withCurrencyCookie(handleI18nRouting(forwarded), request)
  }

  // Orice rută publică este redirecționată către versiunea rusă.
  const url = request.nextUrl.clone()
  if (/^\/ro(\/|$)/.test(pathname)) {
    url.pathname = `/ru${pathname.slice(3) || '/'}`
  } else {
    url.pathname = `/ru${pathname}`
  }
  return withCurrencyCookie(NextResponse.redirect(url), request)
}

export const config = {
  matcher: [
    // Toate rutele cu exceptia: api, _next, _vercel, auth/callback, fisiere cu punct
    '/((?!api|_next|_vercel|auth/callback|.*\\..*).*)',
  ],
}
