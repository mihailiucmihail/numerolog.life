import 'server-only'
import { cookies, headers } from 'next/headers'
import { CURRENCY_COOKIE, currencyFromCountry, parseCurrency, type Currency } from '@/lib/currency'

/**
 * Moneda cererii curente (Server Components, Server Actions, Route Handlers).
 * 1) cookie-ul NEXT_CURRENCY (setat de proxy din geolocație sau din ?currency=);
 * 2) altfel header-ul Vercel x-vercel-ip-country (KZ -> KZT);
 * 3) altfel EUR.
 */
export async function getRequestCurrency(): Promise<Currency> {
  try {
    const cookieStore = await cookies()
    const fromCookie = parseCurrency(cookieStore.get(CURRENCY_COOKIE)?.value)
    if (fromCookie) return fromCookie
  } catch {}
  try {
    const h = await headers()
    return currencyFromCountry(h.get('x-vercel-ip-country'))
  } catch {
    return 'eur'
  }
}
