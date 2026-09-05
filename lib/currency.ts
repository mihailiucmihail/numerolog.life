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

/** Header intern setat de proxy cu țara vizitatorului (ISO alpha-2), pentru localizări dependente de țară. */
export const COUNTRY_HEADER = 'x-country'

/**
 * Alfabetul numelui preselectat în calculatorul Cristalul Destinului, după țara vizitatorului.
 * Cheile sunt exact valorile `<option>` din `#nameAlphabetSelect` (public/cristalul-calculator.html).
 * Țările fără intrare (și vizitatorii fără geolocație) primesc 'ru'. Utilizatorul poate schimba manual.
 */
export type NameAlphabet =
  | 'ru' | 'uk' | 'be' | 'kk' | 'bg' | 'en' | 'de' | 'es' | 'it' | 'ro' | 'pl' | 'cs'
  | 'lt' | 'lv' | 'et' | 'sv' | 'fi' | 'da' | 'el' | 'hy' | 'az' | 'ar' | 'he'

export const DEFAULT_ALPHABET: NameAlphabet = 'ru'

const COUNTRY_ALPHABET: Record<string, NameAlphabet> = {
  RU: 'ru', UA: 'uk', BY: 'be', KZ: 'kk', BG: 'bg',
  // Spațiul post-sovietic fără alfabet propriu în listă: numele sunt de regulă scrise în chirilică rusă.
  KG: 'ru', UZ: 'ru', TJ: 'ru', TM: 'ru',
  MD: 'ro', RO: 'ro',
  GB: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en',
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', UY: 'es',
  IT: 'it', SM: 'it',
  PL: 'pl', CZ: 'cs', SK: 'cs',
  LT: 'lt', LV: 'lv', EE: 'et',
  SE: 'sv', FI: 'fi', DK: 'da', NO: 'da', IS: 'da',
  GR: 'el', CY: 'el',
  AM: 'hy', AZ: 'az',
  IL: 'he',
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar', KW: 'ar', LB: 'ar', MA: 'ar', OM: 'ar', QA: 'ar', SY: 'ar', TN: 'ar', DZ: 'ar', LY: 'ar', BH: 'ar', YE: 'ar',
}

/** Cod ISO alpha-2 valid (două litere) sau null. */
export function normalizeCountry(country: string | null | undefined): string | null {
  const c = country?.trim().toUpperCase()
  return c && /^[A-Z]{2}$/.test(c) ? c : null
}

/** Emoji-steag din codul ISO alpha-2 (indicatori regionali Unicode). */
export function countryFlag(country: string | null | undefined): string {
  const c = normalizeCountry(country)
  if (!c) return ''
  return String.fromCodePoint(...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65))
}

export function alphabetFromCountry(country: string | null | undefined): NameAlphabet {
  if (!country) return DEFAULT_ALPHABET
  return COUNTRY_ALPHABET[country.toUpperCase()] ?? DEFAULT_ALPHABET
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
  kzt: { cristal: 699000, graniStandard: 105000, graniGraph: 265000 }, // 6 990 ₸ / 1 050 ₸ / 2 650 ₸
  mdl: { cristal: 19900, graniStandard: 3900, graniGraph: 9900 }, // 199 lei / 39 lei / 99 lei
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
