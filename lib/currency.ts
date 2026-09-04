// Sursa unică de adevăr pentru monede și prețuri.
// Vizitatorii din Kazahstan văd și plătesc în tenge (KZT), cei din Republica Moldova în lei (MDL);
// toți ceilalți în euro (EUR).
// Prețurile sunt FIXE per monedă (nu se convertesc la curs) și sunt stabilite după reguli de
// marketing (praguri psihologice: 399 în loc de 382, 99 în loc de 100 etc.). Serverul recalculează
// mereu suma din id-ul produsului + monedă; clientul nu trimite niciodată prețul.

export type Currency = 'eur' | 'kzt' | 'mdl'

export const DEFAULT_CURRENCY: Currency = 'eur'
export const CURRENCY_COOKIE = 'NEXT_CURRENCY'
/** Header intern setat de proxy, ca prima randare să cunoască moneda înainte să existe cookie-ul. */
export const CURRENCY_HEADER = 'x-currency'

// Țară (ISO 3166-1 alpha-2, din header-ul Vercel x-vercel-ip-country) -> monedă
const COUNTRY_CURRENCY: Record<string, Currency> = {
  KZ: 'kzt',
  MD: 'mdl',
}

type CurrencyConfig = {
  /** Simbolul afișat după sumă. */
  symbol: string
  /** Fără zecimale la afișare și la reducere (sume „rotunde" în unitatea întreagă). */
  wholeUnits: boolean
}

const CONFIG: Record<Currency, CurrencyConfig> = {
  eur: { symbol: '€', wholeUnits: false },
  kzt: { symbol: '₸', wholeUnits: true },
  mdl: { symbol: 'lei', wholeUnits: true },
}

// Sume în unitatea minimă a monedei (cenți / tiyn / bani).
// Curs orientativ la stabilire: 1 EUR ≈ 527 KZT, 1 EUR ≈ 20,12 MDL.
export const PRICES: Record<Currency, { cristal: number; graniStandard: number; graniGraph: number }> = {
  eur: { cristal: 1900, graniStandard: 199, graniGraph: 499 }, // 19,00 € / 1,99 € / 4,99 €
  kzt: { cristal: 999000, graniStandard: 105000, graniGraph: 265000 }, // 9 990 ₸ / 1 050 ₸ / 2 650 ₸
  mdl: { cristal: 39900, graniStandard: 3900, graniGraph: 9900 }, // 399 lei / 39 lei / 99 lei
}

export function parseCurrency(value: string | null | undefined): Currency | null {
  const v = value?.trim().toLowerCase()
  return v === 'eur' || v === 'kzt' || v === 'mdl' ? v : null
}

export function currencyFromCountry(country: string | null | undefined): Currency {
  if (!country) return DEFAULT_CURRENCY
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? DEFAULT_CURRENCY
}

/** Formatare pentru afișare: „19,00 €", „9 990 ₸" sau „399 lei" (tenge și lei fără zecimale). */
export function formatPrice(minor: number, currency: Currency): string {
  const { symbol, wholeUnits } = CONFIG[currency]
  if (wholeUnits) {
    const whole = Math.round(minor / 100)
    const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
    return `${grouped}\u00a0${symbol}`
  }
  return (minor / 100).toFixed(2).replace('.', ',') + `\u00a0${symbol}`
}

/** Reducere procentuală; pentru monedele „întregi" (tenge, lei) rotunjim la unitatea întreagă. */
export function applyDiscountMinor(minor: number, percent: number, currency: Currency): number {
  const raw = minor * (100 - percent) / 100
  if (CONFIG[currency].wholeUnits) return Math.round(raw / 100) * 100
  return Math.round(raw)
}

export function getGraniPriceMinor(facet: string, currency: Currency, graphFacets: ReadonlySet<string>): number {
  const p = PRICES[currency]
  return graphFacets.has(facet) ? p.graniGraph : p.graniStandard
}
