/**
 * Utilitar pentru traducerea raportului astrologic în limba română
 * Folosește endpoint-ul de traducere AI pentru interpretări dinamice
 */

export interface AstrologicalReport {
  sun_sign?: string
  moon_sign?: string
  ascendant_sign?: string
  aspects?: Array<{
    planet1: string
    planet2: string
    aspect: string
    meaning: string
  }>
  lifeTheme?: string
  forecast?: string
  [key: string]: any
}

export interface TranslatedReport extends AstrologicalReport {
  romanian_report?: string
  translated_aspects?: Array<{
    planet1: string
    planet2: string
    aspect: string
    meaning: string
  }>
}

/**
 * Dicționar de traduceri pentru termeni astrologici comuni
 */
const astrologicalDictionary: Record<string, string> = {
  // Planete
  Sun: 'Soare',
  Moon: 'Lună',
  Mercury: 'Mercur',
  Venus: 'Venus',
  Mars: 'Marte',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
  Uranus: 'Uranus',
  Neptune: 'Neptun',
  Pluto: 'Pluton',

  // Zodii
  Aries: 'Berbec',
  Taurus: 'Taur',
  Gemini: 'Gemeni',
  Cancer: 'Rac',
  Leo: 'Leu',
  Virgo: 'Fecioară',
  Libra: 'Balanță',
  Scorpio: 'Scorpion',
  Sagittarius: 'Săgetător',
  Capricorn: 'Capricorn',
  Aquarius: 'Vărsător',
  Pisces: 'Pești',

  // Aspecte
  Conjunction: 'Conjuncție',
  Trine: 'Trigon',
  Square: 'Pătrat',
  Opposition: 'Opoziție',
  Sextile: 'Sextil',
  Quincunx: 'Quincunx',
  SemiSquare: 'Semi-pătrat',
  SemiSextile: 'Semi-sextil',

  // Elemente
  Fire: 'Foc',
  Earth: 'Pământ',
  Air: 'Aer',
  Water: 'Apă',

  // Modalități
  Cardinal: 'Cardinal',
  Fixed: 'Fix',
  Mutable: 'Mutabil',
}

/**
 * Traduce un termen astrologic din dicționar
 */
export function translateAstrologicalTerm(term: string): string {
  return astrologicalDictionary[term] || term
}

/**
 * Apelează endpoint-ul de traducere pentru text dinamic
 */
export async function translateText(
  text: string,
  context: 'dashboard' | 'aspects' | 'events' | 'forecast' | 'general' = 'general'
): Promise<string> {
  try {
    const response = await fetch('/api/translate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        context,
      }),
    })

    if (!response.ok) {
      console.warn('[TRANSLATE] Failed to translate:', response.status)
      return text // Fallback la textul original
    }

    const data = await response.json()
    return data.translated || text
  } catch (error) {
    console.warn('[TRANSLATE] Error:', error)
    return text // Fallback la textul original
  }
}

/**
 * Traduce o interpretare de aspect planetar
 */
export async function translateAspectMeaning(meaning: string): Promise<string> {
  return translateText(meaning, 'aspects')
}

/**
 * Traduce tema vieții
 */
export async function translateLifeTheme(theme: string): Promise<string> {
  return translateText(theme, 'dashboard')
}

/**
 * Traduce o previziune
 */
export async function translateForecast(forecast: string): Promise<string> {
  return translateText(forecast, 'forecast')
}

/**
 * Traduce raportul complet (client-side helper)
 * Folosit în pagina de previzualizare pentru a traduce datele calculate
 */
export async function translateReport(report: AstrologicalReport): Promise<TranslatedReport> {
  const translated: TranslatedReport = { ...report }

  // Traduce semnele zodiacale
  if (report.sun_sign) {
    translated.sun_sign = translateAstrologicalTerm(report.sun_sign)
  }
  if (report.moon_sign) {
    translated.moon_sign = translateAstrologicalTerm(report.moon_sign)
  }
  if (report.ascendant_sign) {
    translated.ascendant_sign = translateAstrologicalTerm(report.ascendant_sign)
  }

  // Traduce aspectele
  if (report.aspects && Array.isArray(report.aspects)) {
    translated.translated_aspects = await Promise.all(
      report.aspects.map(async (aspect) => ({
        ...aspect,
        planet1: translateAstrologicalTerm(aspect.planet1),
        planet2: translateAstrologicalTerm(aspect.planet2),
        aspect: translateAstrologicalTerm(aspect.aspect),
        meaning: await translateAspectMeaning(aspect.meaning),
      }))
    )
  }

  // Traduce tema vieții
  if (report.lifeTheme) {
    translated.lifeTheme = await translateLifeTheme(report.lifeTheme)
  }

  return translated
}
