import 'server-only'
import { cookies, headers } from 'next/headers'
import { CURRENCY_COOKIE, CURRENCY_HEADER, currencyFromCountry, parseCurrency, type Currency } from '@/lib/currency'

/**
 * Moneda cererii curente (Server Components, Server Actions, Route Handlers).
 * 1) header-ul intern x-currency (setat de proxy — valabil din prima randare);
 * 2) cookie-ul NEXT_CURRENCY (setat de proxy din geolocație sau din ?currency=);
 * 3) altfel header-ul Vercel x-vercel-ip-country (KZ -> KZT);
 * 4) altfel EUR.
 */
export async function getRequestCurrency(): Promise<Currency> {
  let h: Awaited<ReturnType<typeof headers>> | null = null
  try {
    h = await headers()
    const fromHeader = parseCurrency(h.get(CURRENCY_HEADER))
    if (fromHeader) return fromHeader
  } catch {}
  try {
    const cookieStore = await cookies()
    const fromCookie = parseCurrency(cookieStore.get(CURRENCY_COOKIE)?.value)
    if (fromCookie) return fromCookie
  } catch {}
  return currencyFromCountry(h?.get('x-vercel-ip-country'))
}
