/**
 * Astrological Compatibility Calculator
 * Calculates synastry between two natal charts
 */

interface CompatibilityResult {
  overall: number
  sun: number
  moon: number
  venus: number
  mars: number
  rising: number
  details: CompatibilityDetail[]
}

interface CompatibilityDetail {
  aspect: string
  score: number
  description: string
  advice: string
}

/**
 * Calculate zodiac sign compatibility (0-100)
 * Based on element and modality harmony
 */
export function calculateSignCompatibility(sign1: string, sign2: string): number {
  const elements: { [key: string]: string } = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
  }

  const element1 = elements[sign1]
  const element2 = elements[sign2]

  // Same element = high compatibility
  if (element1 === element2) return 85
  
  // Compatible elements (Fire-Air, Earth-Water)
  if ((element1 === 'Fire' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Fire')) return 75
  if ((element1 === 'Earth' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Earth')) return 75
  
  // Neutral elements
  return 50
}

/**
 * Calculate synastry compatibility between two natal charts
 */
export function calculateSynastry(
  chart1: { sun: string; moon: string; venus: string; mars: string; ascendant: string },
  chart2: { sun: string; moon: string; venus: string; mars: string; ascendant: string }
): CompatibilityResult {
  const sunCompat = calculateSignCompatibility(chart1.sun, chart2.sun)
  const moonCompat = calculateSignCompatibility(chart1.moon, chart2.moon)
  const venusCompat = calculateSignCompatibility(chart1.venus, chart2.venus)
  const marsCompat = calculateSignCompatibility(chart1.mars, chart2.mars)
  const risingCompat = calculateSignCompatibility(chart1.ascendant, chart2.ascendant)

  const overall = Math.round((sunCompat + moonCompat * 1.2 + venusCompat * 1.3 + marsCompat + risingCompat * 0.8) / 5)

  const details: CompatibilityDetail[] = [
    {
      aspect: 'Soarele (Identity)',
      score: sunCompat,
      description: `${chart1.sun} și ${chart2.sun}`,
      advice: sunCompat >= 75 ? 'Personalități compatibile, înțelegere reciprocă puternică' : 'Diferențe de perspectivă, oportunitate de creștere'
    },
    {
      aspect: 'Luna (Emoții)',
      score: moonCompat,
      description: `${chart1.moon} și ${chart2.moon}`,
      advice: moonCompat >= 75 ? 'Conexiune emoțională profundă și stabilă' : 'Necesită empatie și înțelegere emoțională'
    },
    {
      aspect: 'Venus (Iubire)',
      score: venusCompat,
      description: `${chart1.venus} și ${chart2.venus}`,
      advice: venusCompat >= 75 ? 'Armonie în exprimarea afecțiunii și valorilor' : 'Diferite expresii de iubire, oportunitate de compromis'
    },
    {
      aspect: 'Mars (Pasiune)',
      score: marsCompat,
      description: `${chart1.mars} și ${chart2.mars}`,
      advice: marsCompat >= 75 ? 'Energie și pasiune bine aliniată' : 'Dinamică de putere care necesită echilibru'
    },
    {
      aspect: 'Ascendent (Prima Impresie)',
      score: risingCompat,
      description: `${chart1.ascendant} și ${chart2.ascendant}`,
      advice: risingCompat >= 75 ? 'Atracție fizică și chimie imediată' : 'Poate necesita timp pentru a se poznegotic'
    }
  ]

  return {
    overall,
    sun: sunCompat,
    moon: moonCompat,
    venus: venusCompat,
    mars: marsCompat,
    rising: risingCompat,
    details
  }
}

/**
 * Get compatibility interpretation text
 */
export function getCompatibilityInterpretation(score: number): string {
  if (score >= 85) return 'Compatibilitate Excepțională - Conexiune rară și profundă'
  if (score >= 75) return 'Compatibilitate Foarte Bună - Relație armonioasă și durabilă'
  if (score >= 65) return 'Compatibilitate Bună - Relație echilibrată cu potențial'
  if (score >= 50) return 'Compatibilitate Moderată - Necesită efort și înțelegere'
  return 'Compatibilitate Redusă - Provocări semnificative, dar transformare posibilă'
}
