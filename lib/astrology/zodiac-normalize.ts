// ============================================================================
// ZODIAC NORMALIZATION - Canonical Zodiac Sign IDs
// Handles Romanian and English zodiac names with/without diacritics
// ============================================================================

// Comprehensive zodiac sign mapping
const ZODIAC_MAP: Record<string, string> = {
  // Aries (Berbec)
  'aries': 'aries',
  'berbec': 'aries',
  
  // Taurus (Taur)
  'taurus': 'taurus',
  'taur': 'taurus',
  
  // Gemini (Gemeni)
  'gemini': 'gemini',
  'gemeni': 'gemini',
  
  // Cancer (Rac)
  'cancer': 'cancer',
  'rac': 'cancer',
  
  // Leo (Leu)
  'leo': 'leo',
  'leu': 'leo',
  
  // Virgo (Fecioară / Fecioara)
  'virgo': 'virgo',
  'fecioară': 'virgo',
  'fecioara': 'virgo',
  
  // Libra (Balanță / Balanta)
  'libra': 'libra',
  'balanță': 'libra',
  'balanta': 'libra',
  
  // Scorpio (Scorpion)
  'scorpio': 'scorpio',
  'scorpion': 'scorpio',
  
  // Sagittarius (Săgetător / Sagetator)
  'sagittarius': 'sagittarius',
  'săgetător': 'sagittarius',
  'sagetator': 'sagittarius',
  
  // Capricorn (Capricorn)
  'capricorn': 'capricorn',
  'capricornul': 'capricorn',
  
  // Aquarius (Vărsător / Varsator)
  'aquarius': 'aquarius',
  'vărsător': 'aquarius',
  'varsator': 'aquarius',
  
  // Pisces (Pești / Pesti)
  'pisces': 'pisces',
  'pești': 'pisces',
  'pesti': 'pisces',
}

/**
 * Normalize zodiac sign name to canonical lowercase ID
 * Handles Romanian names (with/without diacritics) and English names
 * 
 * @param zodiacName - Zodiac sign name in any format
 * @returns Canonical zodiac ID in lowercase (e.g., 'libra', 'aries', 'leo')
 * 
 * @example
 * normalizeZodiac("Balanță") => "libra"
 * normalizeZodiac("Balanta") => "libra"
 * normalizeZodiac("Libra") => "libra"
 * normalizeZodiac("LIBRA") => "libra"
 */
export function normalizeZodiac(zodiacName: string | null | undefined): string | null {
  if (!zodiacName) return null
  
  // Normalize: trim, lowercase, handle diacritics
  const normalized = zodiacName
    .trim()
    .toLowerCase()
    // Remove common Romanian diacritics by replacing them
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
  
  // Look up in map
  const canonical = ZODIAC_MAP[normalized]
  
  if (!canonical) {
    console.warn(`[v0] Unknown zodiac sign: "${zodiacName}" (normalized: "${normalized}")`)
    return null
  }
  
  return canonical
}

/**
 * Validate that two zodiac signs match (accounting for variations)
 * @returns true if signs match, false otherwise
 */
export function zodiacSignMatches(sign1: string | null | undefined, sign2: string | null | undefined): boolean {
  const normalized1 = normalizeZodiac(sign1)
  const normalized2 = normalizeZodiac(sign2)
  
  if (!normalized1 || !normalized2) {
    return false
  }
  
  return normalized1 === normalized2
}

/**
 * Get display name for canonical zodiac ID
 */
export function getZodiacDisplayName(canonicalId: string): string {
  const displayNames: Record<string, string> = {
    'aries': 'Aries (Berbec)',
    'taurus': 'Taurus (Taur)',
    'gemini': 'Gemini (Gemeni)',
    'cancer': 'Cancer (Rac)',
    'leo': 'Leo (Leu)',
    'virgo': 'Virgo (Fecioară)',
    'libra': 'Libra (Balanță)',
    'scorpio': 'Scorpio (Scorpion)',
    'sagittarius': 'Sagittarius (Săgetător)',
    'capricorn': 'Capricorn (Capricorn)',
    'aquarius': 'Aquarius (Vărsător)',
    'pisces': 'Pisces (Pești)',
  }
  
  return displayNames[canonicalId] || canonicalId
}
