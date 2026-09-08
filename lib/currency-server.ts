import 'server-only'
import { cookies, headers } from 'next/headers'
import { COUNTRY_HEADER, CURRENCY_COOKIE, CURRENCY_HEADER, currencyFromCountry, parseCurrency, type Currency } from '@/lib/currency'
import { isNativelyPriced, resolveChargeablePrice, type CountryPrice } from '@/lib/country-pricing'
import { COUNTRY_COOKIE, readCountryCookie } from '@/lib/country-cookie'

/**
 * Prețul FIX al Cristalului pentru cererea curentă, decis exclusiv pe server din țara vizitatorului
 * (COUNTRY_PRICING). Este și ce se afișează, și ce se facturează — niciodată din browser.
 */
export async function getRequestCristalPrice(): Promise<CountryPrice> {
  return resolveChargeablePrice(await getRequestCountry())
}

/**
 * Țara EFECTIVĂ a vizitatorului (ISO alpha-2) sau null — aceeași logică ca în proxy, ca prețul afișat și
 * cel facturat să coincidă și în Server Actions (unde header-ul intern din proxy poate lipsi):
 *  1) header-ul intern x-country (proxy);
 *  2) geolocația x-vercel-ip-country, dacă indică o țară cu preț propriu;
 *  3) cookie-ul semnat NEXT_COUNTRY (ultima țară cu preț propriu văzută pentru acest browser);
 *  4) geolocația brută (→ rezerva $9.99) sau null.
 */
export async function getRequestCountry(): Promise<string | null> {
  let geo: string | null = null
  try {
    const h = await headers()
    const fromProxy = h.get(COUNTRY_HEADER)
    if (fromProxy && /^[A-Za-z]{2}$/.test(fromProxy)) return fromProxy.toUpperCase()
    const raw = h.get('x-vercel-ip-country')
    geo = raw && /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : null
    if (geo && isNativelyPriced(geo)) return geo
  } catch {}
  try {
    const cookieStore = await cookies()
    const sticky = await readCountryCookie(cookieStore.get(COUNTRY_COOKIE)?.value)
    if (sticky) return sticky
  } catch {}
  return geo
}

/**
 * Moneda cererii curente (Server Components, Server Actions, Route Handlers).
 * 1) header-ul intern x-currency (setat de proxy — valabil din prima randare);
 * 2) header-ul Vercel x-vercel-ip-country (KZ -> KZT, MD -> MDL) — geolocația bate cookie-ul (vezi proxy.ts);
 * 3) cookie-ul NEXT_CURRENCY (override explicit ?currency= sau rezervă fără header de țară);
 * 4) altfel EUR.
 */
export async function getRequestCurrency(): Promise<Currency> {
  let h: Awaited<ReturnType<typeof headers>> | null = null
  try {
    h = await headers()
    const fromHeader = parseCurrency(h.get(CURRENCY_HEADER))
    if (fromHeader) return fromHeader
    const country = h.get('x-vercel-ip-country')
    if (country) return currencyFromCountry(country)
  } catch {}
  try {
    const cookieStore = await cookies()
    const fromCookie = parseCurrency(cookieStore.get(CURRENCY_COOKIE)?.value)
    if (fromCookie) return fromCookie
  } catch {}
  return currencyFromCountry(null)
}
