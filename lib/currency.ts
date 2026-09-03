// Sursa unică de adevăr pentru monede și prețuri.
// Vizitatorii din Kazahstan văd și plătesc în tenge (KZT); toți ceilalți în euro (EUR).
// Prețurile sunt FIXE per monedă (nu se convertesc la curs) — serverul recalculează
// mereu suma din id-ul produsului + monedă; clientul nu trimite niciodată prețul.

export type Currency = 'eur' | 'kzt'

export const DEFAULT_CURRENCY: Currency = 'eur'
export const CURRENCY_COOKIE = 'NEXT_CURRENCY'

// Țară (ISO 3166-1 alpha-2, din header-ul Vercel x-vercel-ip-country) -> monedă
const COUNTRY_CURRENCY: Record<string, Currency> = {
  KZ: 'kzt',
}

// Sume în unitatea minimă a monedei (cenți / tiyn). Curs orientativ la stabilire: 1 EUR ≈ 527 KZT.
export const PRICES: Record<Currency, { cristal: number; graniStandard: number; graniGraph: number }> = {
  eur: { cristal: 1900, graniStandard: 199, graniGraph: 499 }, // 19,00 € / 1,99 € / 4,99 €
  kzt: { cristal: 999000, graniStandard: 105000, graniGraph: 265000 }, // 9 990 ₸ / 1 050 ₸ / 2 650 ₸
}

export function parseCurrency(value: string | null | undefined): Currency | null {
  const v = value?.trim().toLowerCase()
  return v === 'eur' || v === 'kzt' ? v : null
}

export function currencyFromCountry(country: string | null | undefined): Currency {
  if (!country) return DEFAULT_CURRENCY
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? DEFAULT_CURRENCY
}

/** Formatare pentru afișare: „19,00 €" sau „9 990 ₸" (tenge se afișează fără zecimale). */
export function formatPrice(minor: number, currency: Currency): string {
  if (currency === 'kzt') {
    const whole = Math.round(minor / 100)
    const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
    return `${grouped}\u00a0₸`
  }
  return (minor / 100).toFixed(2).replace('.', ',') + '\u00a0€'
}

/** Reducere procentuală; pentru tenge rotunjim la tenge întreg (multiplu de 100 tiyn). */
export function applyDiscountMinor(minor: number, percent: number, currency: Currency): number {
  const raw = minor * (100 - percent) / 100
  if (currency === 'kzt') return Math.round(raw / 100) * 100
  return Math.round(raw)
}

export function getGraniPriceMinor(facet: string, currency: Currency, graphFacets: ReadonlySet<string>): number {
  const p = PRICES[currency]
  return graphFacets.has(facet) ? p.graniGraph : p.graniStandard
}
