import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import { COUNTRY_HEADER, CURRENCY_COOKIE, CURRENCY_HEADER, currencyFromCountry, parseCurrency, type Currency } from './lib/currency'
import { isCountryOverrideAllowed, isNativelyPriced } from './lib/country-pricing'
import { COUNTRY_COOKIE, COUNTRY_COOKIE_MAX_AGE, readCountryCookie, signCountryCookie } from './lib/country-cookie'
import {
  EXPERIMENT_COOKIE,
  EXPERIMENT_COOKIE_MAX_AGE,
  resolveAssignment,
  signAssignment,
  type Assignment,
} from './lib/experiments/assignment'
import { PREVIEW_TOKEN_PARAM, verifyPreviewToken } from './lib/experiments/preview-token'
import { getRuntimeFunnels } from './lib/experiments/runtime-config'

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
function resolveCurrency(request: NextRequest, country: string | null): { currency: Currency; persist: boolean } {
  // Override-urile din URL (?currency=, ?country=) sunt permise doar în development/preview — în producție
  // prețul nu poate fi manipulat din URL; contează exclusiv geolocația.
  const fromQuery = isCountryOverrideAllowed() ? parseCurrency(request.nextUrl.searchParams.get('currency')) : null
  if (fromQuery) return { currency: fromQuery, persist: true }
  const fromCookie = parseCurrency(request.cookies.get(CURRENCY_COOKIE)?.value)
  if (country) {
    const fromCountry = currencyFromCountry(country)
    return { currency: fromCountry, persist: fromCountry !== fromCookie }
  }
  if (fromCookie) return { currency: fromCookie, persist: false }
  return { currency: currencyFromCountry(null), persist: true }
}

/** Țara din geolocația Vercel (ISO alpha-2); ?country=XX doar în development/preview. */
function geoCountry(request: NextRequest): string | null {
  const override = isCountryOverrideAllowed() ? request.nextUrl.searchParams.get('country') : null
  const raw = override || request.headers.get('x-vercel-ip-country')
  return raw && /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : null
}

/**
 * Țara EFECTIVĂ a vizitatorului, stabilă între cereri:
 *  - geolocația indică o țară cu preț propriu → o folosim și o reținem în cookie-ul semnat;
 *  - geolocația lipsește sau cade pe rezerva $9.99 (necunoscut, RU…) → folosim țara reținută anterior, dacă există.
 * Astfel un vizitator din Belarus prin VPN nu mai vede alternativ 29 BYN și $9.99.
 */
async function resolveCountry(request: NextRequest): Promise<{ country: string | null; persist: boolean }> {
  const geo = geoCountry(request)
  if (geo && isNativelyPriced(geo)) {
    const sticky = await readCountryCookie(request.cookies.get(COUNTRY_COOKIE)?.value)
    return { country: geo, persist: sticky !== geo }
  }
  const sticky = await readCountryCookie(request.cookies.get(COUNTRY_COOKIE)?.value)
  if (sticky) return { country: sticky, persist: false }
  return { country: geo, persist: false }
}

async function withGeoCookies(
  response: NextResponse | Response,
  request: NextRequest,
  resolved: { country: string | null; persist: boolean },
  experiment?: { assignment: Assignment; changed: boolean },
): Promise<NextResponse | Response> {
  const { currency, persist } = resolveCurrency(request, resolved.country)
  const persistExperiment = experiment?.changed === true
  if (!persist && !resolved.persist && !persistExperiment) return response
  const res = response instanceof NextResponse ? response : new NextResponse(response.body, response)
  if (persistExperiment && experiment) {
    // Nu este httpOnly: interfața trebuie să știe ce variantă randează. Semnătura HMAC
    // împiedică alegerea manuală a unei variante din browser.
    res.cookies.set(EXPERIMENT_COOKIE, await signAssignment(experiment.assignment), {
      path: '/', maxAge: EXPERIMENT_COOKIE_MAX_AGE, sameSite: 'lax',
    })
  }
  if (persist) res.cookies.set(CURRENCY_COOKIE, currency, { path: '/', maxAge: CURRENCY_COOKIE_MAX_AGE, sameSite: 'lax' })
  if (resolved.persist && resolved.country) {
    res.cookies.set(COUNTRY_COOKIE, await signCountryCookie(resolved.country), {
      path: '/', maxAge: COUNTRY_COOKIE_MAX_AGE, sameSite: 'lax', httpOnly: true,
    })
  }
  return res
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const resolved = await resolveCountry(request)

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
    const { currency } = resolveCurrency(request, resolved.country)
    const headers = new Headers(request.headers)
    headers.set(CURRENCY_HEADER, currency)
    // Țara efectivă (prețul fix al Cristalului, alfabetul numelui); ?country=XX permite testarea fără VPN doar în dev/preview.
    if (resolved.country) headers.set(COUNTRY_HEADER, resolved.country)
    // Previzualizarea unei variante din panoul de admin: `?fv=&pv=&ap=<semnătură>`.
    // Fără semnătură validă parametrii sunt eliminați prin redirect, ca varianta să nu poată fi
    // aleasă din browser (atribuirea reală rămâne cea din cookie-ul semnat).
    const sp = request.nextUrl.searchParams
    const previewToken = sp.get(PREVIEW_TOKEN_PARAM)
    const fvParam = sp.get('fv')
    const pvParam = sp.get('pv')
    if (previewToken || fvParam || pvParam) {
      if (!(await verifyPreviewToken(previewToken, fvParam, pvParam))) {
        const clean = request.nextUrl.clone()
        clean.searchParams.delete('fv')
        clean.searchParams.delete('pv')
        clean.searchParams.delete(PREVIEW_TOKEN_PARAM)
        return withGeoCookies(NextResponse.redirect(clean), request, resolved)
      }
    }

    // Variantele de experiment se stabilesc ÎNAINTE de randare, ca prima pagină să fie deja
    // varianta finală (fără schimbare vizibilă) și să rămână aceeași la refresh sau revenire.
    const runtimeFunnels = /^\/ru\/numerologie\/?$/.test(pathname) ? await getRuntimeFunnels() : undefined
    const experiment = await resolveAssignment(request.cookies.get(EXPERIMENT_COOKIE)?.value, runtimeFunnels)
    headers.set('x-exp-visitor', experiment.assignment.visitorId)
    headers.set('x-exp-form', experiment.assignment.form)
    headers.set('x-exp-preview', experiment.assignment.preview)
    const forwarded = new NextRequest(request, { headers })
    return withGeoCookies(handleI18nRouting(forwarded), request, resolved, experiment)
  }

  // Orice rută publică este redirecționată către versiunea rusă.
  const url = request.nextUrl.clone()
  if (/^\/ro(\/|$)/.test(pathname)) {
    url.pathname = `/ru${pathname.slice(3) || '/'}`
  } else {
    url.pathname = `/ru${pathname}`
  }
  return withGeoCookies(NextResponse.redirect(url), request, resolved)
}

export const config = {
  matcher: [
    // Toate rutele cu exceptia: api, _next, _vercel, auth/callback, fisiere cu punct
    '/((?!api|_next|_vercel|auth/callback|.*\\..*).*)',
  ],
}
