/**
 * LOCALIZED FIXED COUNTRY PRICING — produsul complet „Кристалл судьбы”.
 *
 * Singura sursă de adevăr pentru prețul Cristalului: un preț FIX per țară (ISO 3166-1 alpha-2),
 * fără conversie valutară, fără curs în timp real, fără Stripe Adaptive Pricing.
 *   - Țara vine din geolocația Vercel (server-side); limba site-ului NU depinde de țară.
 *   - UI afișează EXACT `displayPrice`; Stripe primește `toStripeMinor(amount, currency)` — aceeași sumă.
 *   - Frontend-ul nu trimite niciodată sume/monede: checkout-ul le citește de aici, pe server.
 *
 * Grani NU folosește acest fișier (rămâne pe lib/currency.ts: EUR / KZT / MDL).
 */

export type CountryPrice = {
  countryCode: string
  countryName: string
  /** Cod ISO 4217, majuscule. */
  currency: string
  /** Suma în unitatea majoră (14.99, 39, 3490). */
  amount: number
  /** Textul afișat în UI, exact așa. */
  displayPrice: string
  /** Contul Stripe actual poate factura această monedă din această țară. */
  stripeSupported: boolean
  /**
   * Piață cu restricții (sancțiuni / Stripe indisponibil): RU, CU, SY, KP… Codul rămâne pregătit
   * pentru un alt procesator; până atunci checkout-ul folosește prețul global de rezervă (vezi resolveCheckoutPrice).
   */
  paymentRestricted?: boolean
  /** Plata este complet dezactivată (KP). */
  paymentDisabled?: boolean
}

/** Rezerva globală: țară necunoscută / nedetectată / teritoriu lipsă din mapping. */
export const FALLBACK_PRICE: CountryPrice = {
  countryCode: 'ZZ',
  countryName: 'Unknown',
  currency: 'USD',
  amount: 9.99,
  displayPrice: '$9.99',
  stripeSupported: true,
}

/** Monede fără subunitate în Stripe: suma se trimite ca număr întreg, NU ×100. */
export const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
])

/** Monede cu 3 decimale în Stripe (×1000, iar suma trebuie să fie multiplu de 10). */
export const THREE_DECIMAL_CURRENCIES = new Set(['BHD', 'JOD', 'KWD', 'OMR', 'TND'])

/**
 * Monedele pe care CONTUL NOSTRU Stripe (România) le poate procesa — lista exactă returnată de API-ul Stripe
 * la 8 sept. 2026 (mesajul „Your account currently supports these currencies”). Tot ce nu e aici primește
 * stripeSupported:false — NU inventăm suport. Lipsesc din contul RO: BHD, JOD, KWD, OMR, TND (3 decimale),
 * BGN (retras de Stripe — Bulgaria a trecut la euro), GHS, LYD, BTN, IQD, MRU, STN. Toate combinațiile
 * (monedă, sumă) din mapping au fost verificate live prin sesiuni Checkout create și expirate.
 */
const STRIPE_CURRENCIES = new Set([
  'USD', 'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BIF', 'BMD', 'BND',
  'BOB', 'BRL', 'BSD', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY', 'COP', 'CRC', 'CVE', 'CZK', 'DJF', 'DKK',
  'DOP', 'DZD', 'EGP', 'ETB', 'EUR', 'FJD', 'FKP', 'GBP', 'GEL', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK',
  'HTG', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JMD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KRW', 'KYD', 'KZT', 'LAK', 'LBP',
  'LKR', 'LRD', 'LSL', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD',
  'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF',
  'SAR', 'SBD', 'SCR', 'SEK', 'SGD', 'SHP', 'SLE', 'SOS', 'SRD', 'STD', 'SZL', 'THB', 'TJS', 'TOP', 'TRY', 'TTD', 'TWD',
  'TZS', 'UAH', 'UGX', 'UYU', 'UZS', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XCG', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW',
])

/** Piețe pe care Stripe nu poate încasa (sancțiuni / restricții), indiferent de monedă. */
// BY (Belarus) NU este aici: decizie explicită — afișăm și încasăm 29 BYN (Stripe acceptă BYN; verificat live).
// Cardurile emise în Belarus pot fi totuși refuzate de bănci — riscul e la finalizarea plății, nu la afișare.
const RESTRICTED_MARKETS = new Set(['RU', 'CU', 'SY', 'KP', 'IR', 'AF', 'MM', 'VE', 'SD', 'SS', 'YE', 'SO', 'LY'])

type Row = [code: string, name: string, currency: string, amount: number, display: string]

// Mapping-ul EXACT cerut (nu recalcula, nu rotunji, nu converti).
const ROWS: Row[] = [
  // ==== EUROPE ====
  ['AL', 'Albania', 'ALL', 790, '790 ALL'],
  ['AD', 'Andorra', 'EUR', 14.99, '14,99 €'],
  ['AT', 'Austria', 'EUR', 14.99, '14,99 €'],
  ['BY', 'Belarus', 'BYN', 29, '29 BYN'],
  ['BE', 'Belgium', 'EUR', 14.99, '14,99 €'],
  ['BA', 'Bosnia and Herzegovina', 'BAM', 15.90, '15,90 BAM'],
  ['BG', 'Bulgaria', 'BGN', 14.90, '14,90 BGN'],
  ['HR', 'Croatia', 'EUR', 9.99, '9,99 €'],
  ['CY', 'Cyprus', 'EUR', 11.99, '11,99 €'],
  ['CZ', 'Czechia', 'CZK', 249, '249 CZK'],
  ['DK', 'Denmark', 'DKK', 99, '99 DKK'],
  ['EE', 'Estonia', 'EUR', 11.99, '11,99 €'],
  ['FI', 'Finland', 'EUR', 14.99, '14,99 €'],
  ['FR', 'France', 'EUR', 14.99, '14,99 €'],
  ['DE', 'Germany', 'EUR', 14.99, '14,99 €'],
  ['GR', 'Greece', 'EUR', 9.99, '9,99 €'],
  ['HU', 'Hungary', 'HUF', 3490, '3 490 HUF'],
  ['IS', 'Iceland', 'ISK', 1990, '1 990 ISK'],
  ['IE', 'Ireland', 'EUR', 14.99, '14,99 €'],
  ['IT', 'Italy', 'EUR', 11.99, '11,99 €'],
  ['LV', 'Latvia', 'EUR', 9.99, '9,99 €'],
  ['LI', 'Liechtenstein', 'CHF', 14.90, '14,90 CHF'],
  ['LT', 'Lithuania', 'EUR', 9.99, '9,99 €'],
  ['LU', 'Luxembourg', 'EUR', 14.99, '14,99 €'],
  ['MT', 'Malta', 'EUR', 11.99, '11,99 €'],
  ['MD', 'Moldova', 'MDL', 129, '129 MDL'],
  ['MC', 'Monaco', 'EUR', 17.99, '17,99 €'],
  ['ME', 'Montenegro', 'EUR', 7.99, '7,99 €'],
  ['NL', 'Netherlands', 'EUR', 14.99, '14,99 €'],
  ['MK', 'North Macedonia', 'MKD', 490, '490 MKD'],
  ['NO', 'Norway', 'NOK', 149, '149 NOK'],
  ['PL', 'Poland', 'PLN', 39, '39 PLN'],
  ['PT', 'Portugal', 'EUR', 9.99, '9,99 €'],
  ['RO', 'Romania', 'RON', 39, '39 RON'],
  ['RU', 'Russia', 'RUB', 790, '790 RUB'],
  ['SM', 'San Marino', 'EUR', 14.99, '14,99 €'],
  ['RS', 'Serbia', 'RSD', 890, '890 RSD'],
  ['SK', 'Slovakia', 'EUR', 9.99, '9,99 €'],
  ['SI', 'Slovenia', 'EUR', 9.99, '9,99 €'],
  ['ES', 'Spain', 'EUR', 11.99, '11,99 €'],
  ['SE', 'Sweden', 'SEK', 149, '149 SEK'],
  ['CH', 'Switzerland', 'CHF', 14.90, '14,90 CHF'],
  ['UA', 'Ukraine', 'UAH', 299, '299 UAH'],
  ['GB', 'United Kingdom', 'GBP', 12.99, '£12.99'],
  ['VA', 'Vatican City', 'EUR', 14.99, '14,99 €'],
  // ==== ASIA / MIDDLE EAST ====
  ['AF', 'Afghanistan', 'USD', 4.99, '$4.99'],
  ['AM', 'Armenia', 'AMD', 3490, '3 490 AMD'],
  ['AZ', 'Azerbaijan', 'AZN', 14.90, '14,90 AZN'],
  ['BH', 'Bahrain', 'BHD', 4.90, '4,90 BHD'],
  ['BD', 'Bangladesh', 'BDT', 599, '599 BDT'],
  ['BT', 'Bhutan', 'BTN', 499, '499 BTN'],
  ['BN', 'Brunei', 'BND', 17.90, '17,90 BND'],
  ['KH', 'Cambodia', 'USD', 5.99, '$5.99'],
  ['CN', 'China', 'CNY', 69, '¥69'],
  ['GE', 'Georgia', 'GEL', 24.90, '24,90 GEL'],
  ['IN', 'India', 'INR', 499, '₹499'],
  ['ID', 'Indonesia', 'IDR', 99000, 'Rp99.000'],
  ['IQ', 'Iraq', 'IQD', 9900, '9 900 IQD'],
  ['IL', 'Israel', 'ILS', 49.90, '₪49.90'],
  ['JP', 'Japan', 'JPY', 1990, '¥1 990'],
  ['JO', 'Jordan', 'JOD', 6.90, '6,90 JOD'],
  ['KZ', 'Kazakhstan', 'KZT', 3490, '3 490 KZT'],
  ['KW', 'Kuwait', 'KWD', 3.90, '3,90 KWD'],
  ['KG', 'Kyrgyzstan', 'KGS', 590, '590 KGS'],
  ['LA', 'Laos', 'LAK', 129000, '129 000 LAK'],
  ['LB', 'Lebanon', 'USD', 6.99, '$6.99'],
  ['MY', 'Malaysia', 'MYR', 39.90, '39,90 MYR'],
  ['MV', 'Maldives', 'MVR', 149, '149 MVR'],
  ['MN', 'Mongolia', 'MNT', 24900, '24 900 MNT'],
  ['MM', 'Myanmar', 'USD', 4.99, '$4.99'],
  ['NP', 'Nepal', 'NPR', 699, '699 NPR'],
  ['KP', 'North Korea', 'USD', 0, 'N/A'],
  ['KR', 'South Korea', 'KRW', 16900, '₩16 900'],
  ['OM', 'Oman', 'OMR', 4.90, '4,90 OMR'],
  ['PK', 'Pakistan', 'PKR', 1490, '1 490 PKR'],
  ['PS', 'Palestine', 'ILS', 29.90, '₪29.90'],
  ['PH', 'Philippines', 'PHP', 399, '₱399'],
  ['QA', 'Qatar', 'QAR', 49, '49 QAR'],
  ['SA', 'Saudi Arabia', 'SAR', 49, '49 SAR'],
  ['SG', 'Singapore', 'SGD', 19.90, 'S$19.90'],
  ['LK', 'Sri Lanka', 'LKR', 1990, '1 990 LKR'],
  ['SY', 'Syria', 'USD', 4.99, '$4.99'],
  ['TJ', 'Tajikistan', 'TJS', 69, '69 TJS'],
  ['TH', 'Thailand', 'THB', 299, '฿299'],
  ['TL', 'Timor-Leste', 'USD', 4.99, '$4.99'],
  ['TR', 'Turkey', 'TRY', 399, '₺399'],
  ['TM', 'Turkmenistan', 'USD', 6.99, '$6.99'],
  ['AE', 'United Arab Emirates', 'AED', 49, '49 AED'],
  ['UZ', 'Uzbekistan', 'UZS', 79000, '79 000 UZS'],
  ['VN', 'Vietnam', 'VND', 169000, '₫169.000'],
  ['YE', 'Yemen', 'USD', 4.99, '$4.99'],
  // ==== NORTH AMERICA + CARIBBEAN ====
  ['US', 'United States', 'USD', 14.99, '$14.99'],
  ['CA', 'Canada', 'CAD', 19.99, 'C$19.99'],
  ['MX', 'Mexico', 'MXN', 199, 'MX$199'],
  ['AG', 'Antigua and Barbuda', 'XCD', 34.90, 'EC$34.90'],
  ['BS', 'Bahamas', 'BSD', 14.99, '$14.99 BSD'],
  ['BB', 'Barbados', 'BBD', 24.90, 'Bds$24.90'],
  ['BZ', 'Belize', 'BZD', 19.90, 'BZ$19.90'],
  ['CR', 'Costa Rica', 'CRC', 4990, '₡4 990'],
  ['CU', 'Cuba', 'USD', 5.99, '$5.99'],
  ['DM', 'Dominica', 'XCD', 24.90, 'EC$24.90'],
  ['DO', 'Dominican Republic', 'DOP', 499, 'RD$499'],
  ['SV', 'El Salvador', 'USD', 7.99, '$7.99'],
  ['GD', 'Grenada', 'XCD', 24.90, 'EC$24.90'],
  ['GT', 'Guatemala', 'GTQ', 69, 'Q69'],
  ['HT', 'Haiti', 'USD', 4.99, '$4.99'],
  ['HN', 'Honduras', 'HNL', 199, 'L199'],
  ['JM', 'Jamaica', 'JMD', 1490, 'J$1 490'],
  ['NI', 'Nicaragua', 'NIO', 249, 'C$249'],
  ['PA', 'Panama', 'USD', 9.99, '$9.99'],
  ['KN', 'Saint Kitts and Nevis', 'XCD', 34.90, 'EC$34.90'],
  ['LC', 'Saint Lucia', 'XCD', 24.90, 'EC$24.90'],
  ['VC', 'Saint Vincent and the Grenadines', 'XCD', 24.90, 'EC$24.90'],
  ['TT', 'Trinidad and Tobago', 'TTD', 69, 'TT$69'],
  // ==== SOUTH AMERICA ====
  ['AR', 'Argentina', 'USD', 9.99, '$9.99'],
  ['BO', 'Bolivia', 'BOB', 49, 'Bs49'],
  ['BR', 'Brazil', 'BRL', 39.90, 'R$39,90'],
  ['CL', 'Chile', 'CLP', 8990, 'CLP$8 990'],
  ['CO', 'Colombia', 'COP', 34900, 'COP$34 900'],
  ['EC', 'Ecuador', 'USD', 7.99, '$7.99'],
  ['GY', 'Guyana', 'GYD', 2490, 'GY$2 490'],
  ['PY', 'Paraguay', 'PYG', 69000, '₲69 000'],
  ['PE', 'Peru', 'PEN', 29.90, 'S/29,90'],
  ['SR', 'Suriname', 'SRD', 299, 'SRD299'],
  ['UY', 'Uruguay', 'UYU', 490, 'UY$490'],
  ['VE', 'Venezuela', 'USD', 5.99, '$5.99'],
  // ==== AFRICA ====
  ['DZ', 'Algeria', 'DZD', 990, '990 DZD'],
  ['AO', 'Angola', 'AOA', 5990, '5 990 AOA'],
  ['BJ', 'Benin', 'XOF', 3990, '3 990 XOF'],
  ['BW', 'Botswana', 'BWP', 99, '99 BWP'],
  ['BF', 'Burkina Faso', 'XOF', 2990, '2 990 XOF'],
  ['BI', 'Burundi', 'BIF', 14900, '14 900 BIF'],
  ['CV', 'Cabo Verde', 'CVE', 690, '690 CVE'],
  ['CM', 'Cameroon', 'XAF', 3990, '3 990 XAF'],
  ['CF', 'Central African Republic', 'XAF', 2990, '2 990 XAF'],
  ['TD', 'Chad', 'XAF', 2990, '2 990 XAF'],
  ['KM', 'Comoros', 'KMF', 2990, '2 990 KMF'],
  ['CG', 'Republic of the Congo', 'XAF', 3990, '3 990 XAF'],
  ['CD', 'DR Congo', 'USD', 4.99, '$4.99'],
  ['CI', 'Côte d’Ivoire', 'XOF', 3990, '3 990 XOF'],
  ['DJ', 'Djibouti', 'DJF', 990, '990 DJF'],
  ['EG', 'Egypt', 'EGP', 299, '299 EGP'],
  ['GQ', 'Equatorial Guinea', 'XAF', 4990, '4 990 XAF'],
  ['ER', 'Eritrea', 'USD', 4.99, '$4.99'],
  ['SZ', 'Eswatini', 'SZL', 99, '99 SZL'],
  ['ET', 'Ethiopia', 'ETB', 499, '499 ETB'],
  ['GA', 'Gabon', 'XAF', 4990, '4 990 XAF'],
  ['GM', 'Gambia', 'GMD', 399, '399 GMD'],
  ['GH', 'Ghana', 'GHS', 79, '79 GHS'],
  ['GN', 'Guinea', 'GNF', 49000, '49 000 GNF'],
  ['GW', 'Guinea-Bissau', 'XOF', 2990, '2 990 XOF'],
  ['KE', 'Kenya', 'KES', 799, '799 KES'],
  ['LS', 'Lesotho', 'LSL', 99, '99 LSL'],
  ['LR', 'Liberia', 'USD', 4.99, '$4.99'],
  ['LY', 'Libya', 'LYD', 39, '39 LYD'],
  ['MG', 'Madagascar', 'MGA', 24900, '24 900 MGA'],
  ['MW', 'Malawi', 'MWK', 8900, '8 900 MWK'],
  ['ML', 'Mali', 'XOF', 2990, '2 990 XOF'],
  ['MR', 'Mauritania', 'MRU', 249, '249 MRU'],
  ['MU', 'Mauritius', 'MUR', 399, '399 MUR'],
  ['MA', 'Morocco', 'MAD', 79, '79 MAD'],
  ['MZ', 'Mozambique', 'MZN', 399, '399 MZN'],
  ['NA', 'Namibia', 'NAD', 129, '129 NAD'],
  ['NE', 'Niger', 'XOF', 2990, '2 990 XOF'],
  ['NG', 'Nigeria', 'NGN', 7900, '₦7 900'],
  ['RW', 'Rwanda', 'RWF', 7900, '7 900 RWF'],
  ['ST', 'São Tomé and Príncipe', 'STN', 149, '149 STN'],
  ['SN', 'Senegal', 'XOF', 3990, '3 990 XOF'],
  ['SC', 'Seychelles', 'SCR', 149, '149 SCR'],
  ['SL', 'Sierra Leone', 'SLE', 129, '129 SLE'],
  ['SO', 'Somalia', 'USD', 4.99, '$4.99'],
  ['ZA', 'South Africa', 'ZAR', 149, 'R149'],
  ['SS', 'South Sudan', 'USD', 4.99, '$4.99'],
  ['SD', 'Sudan', 'USD', 4.99, '$4.99'],
  ['TZ', 'Tanzania', 'TZS', 14900, 'TSh14 900'],
  ['TG', 'Togo', 'XOF', 3490, '3 490 XOF'],
  ['TN', 'Tunisia', 'TND', 24.90, '24,90 TND'],
  ['UG', 'Uganda', 'UGX', 19900, 'USh19 900'],
  ['ZM', 'Zambia', 'ZMW', 149, '149 ZMW'],
  ['ZW', 'Zimbabwe', 'USD', 5.99, '$5.99'],
  // ==== OCEANIA ====
  ['AU', 'Australia', 'AUD', 22.99, 'A$22.99'],
  ['FJ', 'Fiji', 'FJD', 19.90, 'FJ$19.90'],
  ['KI', 'Kiribati', 'AUD', 9.99, 'A$9.99'],
  ['MH', 'Marshall Islands', 'USD', 7.99, '$7.99'],
  ['FM', 'Micronesia', 'USD', 7.99, '$7.99'],
  ['NR', 'Nauru', 'AUD', 14.99, 'A$14.99'],
  ['NZ', 'New Zealand', 'NZD', 24.99, 'NZ$24.99'],
  ['PW', 'Palau', 'USD', 9.99, '$9.99'],
  ['PG', 'Papua New Guinea', 'PGK', 24.90, 'K24.90'],
  ['WS', 'Samoa', 'WST', 24.90, 'WS$24.90'],
  ['SB', 'Solomon Islands', 'SBD', 59, 'SI$59'],
  ['TO', 'Tonga', 'TOP', 19.90, 'T$19.90'],
  ['TV', 'Tuvalu', 'AUD', 9.99, 'A$9.99'],
  ['VU', 'Vanuatu', 'VUV', 790, 'VT790'],
]

export const COUNTRY_PRICING: Record<string, CountryPrice> = Object.fromEntries(
  ROWS.map(([countryCode, countryName, currency, amount, displayPrice]) => {
    const paymentDisabled = countryCode === 'KP'
    const paymentRestricted = RESTRICTED_MARKETS.has(countryCode)
    return [
      countryCode,
      {
        countryCode,
        countryName,
        currency,
        amount,
        displayPrice,
        stripeSupported: !paymentDisabled && !paymentRestricted && STRIPE_CURRENCIES.has(currency),
        ...(paymentRestricted ? { paymentRestricted: true } : {}),
        ...(paymentDisabled ? { paymentDisabled: true } : {}),
      },
    ]
  }),
)

/** Intrarea din mapping pentru o țară (ISO alpha-2), sau rezerva globală. */
export function getCountryPrice(country: string | null | undefined): CountryPrice {
  const code = country?.trim().toUpperCase()
  if (!code || !/^[A-Z]{2}$/.test(code)) return FALLBACK_PRICE
  return COUNTRY_PRICING[code] ?? FALLBACK_PRICE
}

/**
 * Prețul care se AFIȘEAZĂ și se FACTUREAZĂ efectiv — întotdeauna identice:
 *   - țară procesabilă → prețul ei;
 *   - plată dezactivată (KP) → aceeași intrare (displayPrice „N/A”), checkout-ul refuză;
 *   - monedă/piață pe care Stripe nu o poate încasa → rezerva globală configurată explicit (FALLBACK_PRICE),
 *     fără să inventăm suport pentru moneda locală. Când apare un alt procesator, aici se ramifică.
 */
export function resolveChargeablePrice(country: string | null | undefined): CountryPrice {
  const cp = getCountryPrice(country)
  if (cp.stripeSupported || cp.paymentDisabled) return cp
  return { ...FALLBACK_PRICE, countryCode: cp.countryCode, countryName: cp.countryName, paymentRestricted: cp.paymentRestricted }
}

/** Numărul de decimale ale monedei în Stripe (0, 2 sau 3). */
export function currencyExponent(currency: string): 0 | 2 | 3 {
  const c = currency.toUpperCase()
  if (ZERO_DECIMAL_CURRENCIES.has(c)) return 0
  if (THREE_DECIMAL_CURRENCIES.has(c)) return 3
  return 2
}

/** Suma în unitatea minimă Stripe: EUR 14.99 → 1499, JPY 1990 → 1990, BHD 4.90 → 4900. */
export function toStripeMinor(amount: number, currency: string): number {
  const exp = currencyExponent(currency)
  const minor = Math.round(amount * 10 ** exp)
  // Monedele cu 3 decimale acceptă doar multipli de 10 în unitatea minimă.
  return exp === 3 ? Math.round(minor / 10) * 10 : minor
}

export function fromStripeMinor(minor: number, currency: string): number {
  return minor / 10 ** currencyExponent(currency)
}

/**
 * Formatează o altă sumă (ex. prețul redus) EXACT în stilul lui displayPrice: același simbol, aceeași
 * poziție (prefix/sufix), același separator decimal și de grupare, același număr de zecimale.
 */
export function formatLikeDisplay(amount: number, price: CountryPrice): string {
  const match = price.displayPrice.match(/\d[\d\s\u00a0.,]*\d|\d/)
  if (!match) return `${amount} ${price.currency}`
  const numeric = match[0]
  const prefix = price.displayPrice.slice(0, match.index)
  const suffix = price.displayPrice.slice((match.index ?? 0) + numeric.length)

  const decimals = Number.isInteger(price.amount) ? 0 : 2
  let decimalSep = ','
  let groupSep = '\u00a0'
  if (decimals) {
    decimalSep = numeric.charAt(numeric.length - 3)
    const rest = numeric.slice(0, -3)
    const g = rest.match(/[\s\u00a0.,]/)
    groupSep = g ? (g[0] === ' ' ? '\u00a0' : g[0]) : '\u00a0'
  } else {
    const g = numeric.match(/[\s\u00a0.,]/)
    groupSep = g ? (g[0] === ' ' ? '\u00a0' : g[0]) : '\u00a0'
  }
  const hasGrouping = /[\s\u00a0.,]/.test(decimals ? numeric.slice(0, -3) : numeric)

  const fixed = amount.toFixed(decimals)
  const [intPart, fracPart] = fixed.split('.')
  const grouped = hasGrouping || intPart.length > 3
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep)
    : intPart
  const body = decimals ? `${grouped}${decimalSep}${fracPart}` : grouped
  return `${prefix}${body}${suffix}`
}

/**
 * Reducere procentuală aplicată prețului fix. Rotunjire: la unitatea minimă a monedei; pentru prețurile
 * afișate fără zecimale (39 RON, 3 490 KZT) rotunjim la unitatea întreagă, ca prețul redus să arate la fel.
 */
export function discountedMinor(price: CountryPrice, percent: number): number {
  const exp = currencyExponent(price.currency)
  const factor = 10 ** exp
  const raw = price.amount * (100 - percent) / 100
  if (Number.isInteger(price.amount)) return Math.round(raw) * factor
  return toStripeMinor(Math.round(raw * 100) / 100, price.currency)
}

export function formatDiscounted(price: CountryPrice, percent: number): string {
  return formatLikeDisplay(fromStripeMinor(discountedMinor(price, percent), price.currency), price)
}

/**
 * Override-ul ?country=XX este permis DOAR în development / preview — în producție prețul vine exclusiv
 * din geolocație, ca să nu poată fi manipulat din URL.
 */
export function isCountryOverrideAllowed(): boolean {
  return process.env.VERCEL_ENV !== 'production'
}
