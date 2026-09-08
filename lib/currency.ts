// Sursa unică de adevăr pentru monede și prețuri.
// Raportul „Cristalul Destinului" este localizat în moneda țării vizitatorului (geolocație Vercel).
// Prețul de bază este 19 EUR; prețul local este FIX per monedă (nu se convertește la curs în timp real)
// și este ales după reguli de marketing: echivalentul în moneda locală rotunjit în jos la un prag
// psihologic (x9 / x,99 / x90), cu cel mult 20 % sub echivalentul exact al celor 19 EUR.
// Serverul recalculează mereu suma din id-ul produsului + monedă; clientul nu trimite niciodată prețul.
// Grani Судьбы NU este localizat: rămâne în EUR / KZT / MDL (vezi GRANI_CURRENCIES).

export const CURRENCIES = [
  'eur', 'usd', 'gbp', 'chf', 'cad', 'aud',
  'pln', 'czk', 'ron', 'huf', 'sek', 'nok', 'dkk',
  'uah', 'try', 'gel', 'amd', 'azn', 'kzt', 'uzs', 'kgs', 'mdl',
  'ils', 'aed',
] as const

export type Currency = (typeof CURRENCIES)[number]

export const DEFAULT_CURRENCY: Currency = 'eur'
export const CURRENCY_COOKIE = 'NEXT_CURRENCY'
/** Header intern setat de proxy, ca prima randare să cunoască moneda înainte să existe cookie-ul. */
export const CURRENCY_HEADER = 'x-currency'

// Țară (ISO 3166-1 alpha-2, din header-ul Vercel x-vercel-ip-country) -> monedă.
// Țările fără intrare (zona euro, Rusia, Belarus, restul lumii) plătesc în EUR.
const COUNTRY_CURRENCY: Record<string, Currency> = {
  US: 'usd', PR: 'usd',
  GB: 'gbp',
  CH: 'chf', LI: 'chf',
  CA: 'cad',
  AU: 'aud',
  PL: 'pln',
  CZ: 'czk',
  RO: 'ron',
  HU: 'huf',
  SE: 'sek',
  NO: 'nok',
  DK: 'dkk',
  UA: 'uah',
  TR: 'try',
  GE: 'gel',
  AM: 'amd',
  AZ: 'azn',
  KZ: 'kzt',
  UZ: 'uzs',
  KG: 'kgs',
  MD: 'mdl',
  IL: 'ils',
  AE: 'aed',
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
  usd: { symbol: '$', wholeUnits: false },
  gbp: { symbol: '£', wholeUnits: false },
  chf: { symbol: 'CHF', wholeUnits: false },
  cad: { symbol: 'CA$', wholeUnits: false },
  aud: { symbol: 'A$', wholeUnits: false },
  pln: { symbol: 'zł', wholeUnits: true },
  czk: { symbol: 'Kč', wholeUnits: true },
  ron: { symbol: 'lei', wholeUnits: true },
  huf: { symbol: 'Ft', wholeUnits: true },
  sek: { symbol: 'kr', wholeUnits: true },
  nok: { symbol: 'kr', wholeUnits: true },
  dkk: { symbol: 'kr', wholeUnits: true },
  uah: { symbol: '₴', wholeUnits: true },
  try: { symbol: '₺', wholeUnits: true },
  gel: { symbol: '₾', wholeUnits: true },
  amd: { symbol: '֏', wholeUnits: true },
  azn: { symbol: '₼', wholeUnits: false },
  kzt: { symbol: '₸', wholeUnits: true },
  uzs: { symbol: 'сум', wholeUnits: true },
  kgs: { symbol: 'сом', wholeUnits: true },
  mdl: { symbol: 'lei', wholeUnits: true },
  ils: { symbol: '₪', wholeUnits: false },
  aed: { symbol: 'AED', wholeUnits: true },
}

/**
 * Prețul raportului „Cristalul Destinului" în unitatea minimă a monedei (cenți, bani, tiyn…).
 * În comentariu: echivalentul exact al celor 19 EUR la cursul orientativ de la stabilire și reducerea rezultată
 * (mereu între 0 % și 20 %). Prețurile sunt fixe — se revizuiesc manual dacă cursul se mișcă mult.
 */
export const CRISTAL_PRICES: Record<Currency, number> = {
  eur: 1900,      // 19,00 € — prețul de bază
  usd: 1999,      // ≈ 22,20 $ → 19,99 $ (−10 %)
  gbp: 1499,      // ≈ 16,50 £ → 14,99 £ (−9 %)
  chf: 1690,      // ≈ 17,90 CHF → 16,90 CHF (−6 %)
  cad: 2699,      // ≈ 30,40 CA$ → 26,99 CA$ (−11 %)
  aud: 2999,      // ≈ 33,80 A$ → 29,99 A$ (−11 %)
  pln: 6900,      // ≈ 81 zł → 69 zł (−15 %)
  czk: 39900,     // ≈ 465 Kč → 399 Kč (−14 %)
  ron: 7900,      // ≈ 96 lei → 79 lei (−18 %)
  huf: 649000,    // ≈ 7 500 Ft → 6 490 Ft (−13 %)
  sek: 17900,     // ≈ 209 kr → 179 kr (−14 %)
  nok: 18900,     // ≈ 222 kr → 189 kr (−15 %)
  dkk: 12900,     // ≈ 142 kr → 129 kr (−9 %)
  uah: 74900,     // ≈ 921 ₴ → 749 ₴ (−19 %)
  try: 74900,     // ≈ 912 ₺ → 749 ₺ (−18 %)
  gel: 4900,      // ≈ 60 ₾ → 49 ₾ (−18 %)
  amd: 699000,    // ≈ 8 550 ֏ → 6 990 ֏ (−18 %)
  azn: 3199,      // ≈ 38,00 ₼ → 31,99 ₼ (−16 %)
  kzt: 799000,    // ≈ 10 000 ₸ → 7 990 ₸ (−20 %)
  uzs: 22900000,  // ≈ 279 000 сум → 229 000 сум (−18 %)
  kgs: 159000,    // ≈ 1 940 сом → 1 590 сом (−18 %)
  mdl: 31900,     // ≈ 382 lei → 319 lei (−16 %)
  ils: 5990,      // ≈ 74,00 ₪ → 59,90 ₪ (−19 %)
  aed: 6900,      // ≈ 82 AED → 69 AED (−16 %)
}

/** Grani nu este localizat: doar aceste monede au prețuri proprii, restul vizitatorilor plătesc Grani în EUR. */
export const GRANI_CURRENCIES = ['eur', 'kzt', 'mdl'] as const satisfies readonly Currency[]
export type GraniCurrency = (typeof GRANI_CURRENCIES)[number]

const GRANI_PRICES: Record<GraniCurrency, { graniStandard: number; graniGraph: number }> = {
  eur: { graniStandard: 199, graniGraph: 499 }, // 1,99 € / 4,99 €
  kzt: { graniStandard: 105000, graniGraph: 265000 }, // 1 050 ₸ / 2 650 ₸
  mdl: { graniStandard: 3900, graniGraph: 9900 }, // 39 lei / 99 lei
}

/** Moneda în care se afișează și se facturează Grani pentru un vizitator cu moneda `currency`. */
export function graniCurrency(currency: Currency): GraniCurrency {
  return (GRANI_CURRENCIES as readonly string[]).includes(currency) ? (currency as GraniCurrency) : 'eur'
}

/** Prețurile tuturor produselor per monedă; Grani cade pe EUR în monedele nelocalizate (vezi graniCurrency). */
export const PRICES: Record<Currency, { cristal: number; graniStandard: number; graniGraph: number }> =
  Object.fromEntries(
    CURRENCIES.map((c) => [c, { cristal: CRISTAL_PRICES[c], ...GRANI_PRICES[graniCurrency(c)] }]),
  ) as Record<Currency, { cristal: number; graniStandard: number; graniGraph: number }>

export function parseCurrency(value: string | null | undefined): Currency | null {
  const v = value?.trim().toLowerCase()
  return v && (CURRENCIES as readonly string[]).includes(v) ? (v as Currency) : null
}

export function currencyFromCountry(country: string | null | undefined): Currency {
  if (!country) return DEFAULT_CURRENCY
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? DEFAULT_CURRENCY
}

/** Formatare pentru afișare: „19,00 €", „7 990 ₸" sau „79 lei" (monedele „întregi" fără zecimale). */
export function formatPrice(minor: number, currency: Currency): string {
  const { symbol, wholeUnits } = CONFIG[currency]
  if (wholeUnits) {
    const whole = Math.round(minor / 100)
    const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
    return `${grouped}\u00a0${symbol}`
  }
  return (minor / 100).toFixed(2).replace('.', ',') + `\u00a0${symbol}`
}

/** Reducere procentuală; pentru monedele „întregi" rotunjim la unitatea întreagă. */
export function applyDiscountMinor(minor: number, percent: number, currency: Currency): number {
  const raw = minor * (100 - percent) / 100
  if (CONFIG[currency].wholeUnits) return Math.round(raw / 100) * 100
  return Math.round(raw)
}

export function getGraniPriceMinor(facet: string, currency: Currency, graphFacets: ReadonlySet<string>): number {
  const p = GRANI_PRICES[graniCurrency(currency)]
  return graphFacets.has(facet) ? p.graniGraph : p.graniStandard
}
