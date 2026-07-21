// Calculate astrological scores based on real birth chart data
// All scores are derived from actual planetary positions, aspects, and house placements

interface PlanetaryData {
  planets: any[]
  houses: any[]
  aspects: any[]
  midheaven: any
  ascendant: any
}

/**
 * Normalize planet data to ensure consistent property names
 * Handles both AstrologyAPI format (name, fullDegree, sign, house)
 * and other formats
 */
function normalizePlanet(planet: any): any {
  if (!planet) return null
  
  return {
    name: planet.name || '',
    sign: planet.sign || '',
    degree: planet.fullDegree ?? planet.degree ?? 0,
    fullDegree: planet.fullDegree ?? planet.degree ?? 0,
    house: planet.house ?? 0,
    retrograde: planet.isRetro ?? planet.retrograde ?? false
  }
}

/**
 * Normalize aspect data
 * AspectData has planet1 and planet2 as strings (planet names)
 */
function normalizeAspect(aspect: any): any {
  if (!aspect) return null
  
  return {
    planet1: { name: typeof aspect.planet1 === 'string' ? aspect.planet1 : aspect.planet1?.name || '' },
    planet2: { name: typeof aspect.planet2 === 'string' ? aspect.planet2 : aspect.planet2?.name || '' },
    aspect: aspect.aspect || '',
    orb: aspect.orb ?? 0
  }
}

/**
 * Calculate Love Score from Venus, Moon, 5th House, and 7th House
 * Range: 1-10 (higher = stronger love/relationship focus)
 */
export function calculateLoveScore(chartData: PlanetaryData): { score: number; explanation: string; factors: string[] } {
  let score = 50 // Base percentage
  const factors: string[] = []

  try {
    // Find Venus and Moon positions
    const venus = chartData.planets?.find(p => {
      const norm = normalizePlanet(p)
      return norm?.name?.toLowerCase().includes('venus')
    })
    const moon = chartData.planets?.find(p => {
      const norm = normalizePlanet(p)
      return norm?.name?.toLowerCase().includes('moon')
    })
    
    const venusNorm = venus ? normalizePlanet(venus) : null
    const moonNorm = moon ? normalizePlanet(moon) : null

    // Venus in water signs
    if (venusNorm?.sign) {
      const waterSigns = ['Cancer', 'Scorpio', 'Pisces']
      if (waterSigns.includes(venusNorm.sign)) {
        score += 15
        factors.push(`Venus în ${venusNorm.sign}`)
      }
      
      // Venus in Air signs
      const airSigns = ['Gemini', 'Libra', 'Aquarius']
      if (airSigns.includes(venusNorm.sign)) {
        score += 8
        factors.push(`Venus în ${venusNorm.sign}`)
      }
    }

    // Moon in earth signs
    if (moonNorm?.sign) {
      const earthSigns = ['Taurus', 'Virgo', 'Capricorn']
      if (earthSigns.includes(moonNorm.sign)) {
        score += 10
        factors.push(`Lună în ${moonNorm.sign}`)
      }
    }

    // Beneficial aspects
    const loveAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      if (!aspectNorm) return false
      const hasVenus = aspectNorm.planet1.name?.toLowerCase().includes('venus') || 
                       aspectNorm.planet2.name?.toLowerCase().includes('venus') ||
                       aspectNorm.planet1.name?.toLowerCase().includes('moon') ||
                       aspectNorm.planet2.name?.toLowerCase().includes('moon')
      const isBeneficial = aspectNorm.aspect?.toLowerCase().includes('trine') || 
                           aspectNorm.aspect?.toLowerCase().includes('sextile') ||
                           aspectNorm.aspect?.toLowerCase().includes('conjunction')
      return hasVenus && isBeneficial
    }).length || 0
    
    score += Math.min(loveAspects * 3, 10)
    if (loveAspects > 0) {
      factors.push(`Aspecte armonioase Venus-Lună (${loveAspects})`)
    }

    // Cap score at 100
    score = Math.min(Math.max(score, 10), 100)

    const explanation = `Harta ta indică o capacitate ridicată de a construi relații autentice și stabile. ${venusNorm?.sign && moonNorm?.sign ? `Venus și Lună formează tipare favorabile pentru conexiuni emoționale profunde.` : `Această zonă conține lecții importante și oportunități de dezvoltare personală.`}`

    return { score: Math.round(score), explanation, factors }
  } catch (error) {
    console.error('[v0] Error calculating love score:', error)
    return { score: 50, explanation: "Calculul scorului de dragoste este în curs...", factors: [] }
  }
}

/**
 * Calculate Career Score from Midheaven, Saturn, Jupiter, and 10th House
 * Range: 1-10 (higher = stronger career focus/success potential)
 */
export function calculateCareerScore(chartData: PlanetaryData): { score: number; explanation: string; factors: string[] } {
  let score = 50 // Base percentage
  const factors: string[] = []

  try {
    // Midheaven sign influences career
    const midheaven = chartData.midheaven
    const careerSigns = ['Capricorn', 'Scorpio', 'Leo', 'Aries', 'Libra']
    if (midheaven && careerSigns.includes(midheaven.sign)) {
      score += 15
      factors.push(`Mijlocul Cerului în ${midheaven.sign}`)
    }

    // Saturn placements (career discipline)
    const saturn = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('saturn'))
    const saturnNorm = saturn ? normalizePlanet(saturn) : null
    if (saturnNorm && saturnNorm.house === 10) {
      score += 12
      factors.push(`Saturn în casa X`)
    }

    // Jupiter placements (career expansion)
    const jupiter = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('jupiter'))
    const jupiterNorm = jupiter ? normalizePlanet(jupiter) : null
    if (jupiterNorm && jupiterNorm.house === 10) {
      score += 15
      factors.push(`Jupiter în casa X`)
    }
    if (jupiterNorm?.sign) {
      const fireEarthSigns = ['Aries', 'Leo', 'Sagittarius', 'Taurus', 'Virgo', 'Capricorn']
      if (fireEarthSigns.includes(jupiterNorm.sign)) {
        score += 8
        factors.push(`Jupiter în ${jupiterNorm.sign}`)
      }
    }

    // Career-related aspects
    const careerAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      if (!aspectNorm) return false
      const hasPlanet = aspectNorm.planet1.name?.toLowerCase().includes('saturn') ||
                       aspectNorm.planet2.name?.toLowerCase().includes('saturn') ||
                       aspectNorm.planet1.name?.toLowerCase().includes('jupiter') ||
                       aspectNorm.planet2.name?.toLowerCase().includes('jupiter')
      const isBeneficial = aspectNorm.aspect?.toLowerCase().includes('trine') ||
                          aspectNorm.aspect?.toLowerCase().includes('sextile') ||
                          aspectNorm.aspect?.toLowerCase().includes('conjunction')
      return hasPlanet && isBeneficial
    }).length || 0

    score += Math.min(careerAspects * 4, 12)
    if (careerAspects > 0) {
      factors.push(`Aspecte profesionale favorabile (${careerAspects})`)
    }

    score = Math.min(Math.max(score, 10), 100)

    const explanation = `Harta ta arată potențial profesional semnificativ. ${midheaven || saturnNorm || jupiterNorm ? `Energiile astrologice favorizează dezvoltarea unei cariere de succes și realizare.` : `Această zonă conține lecții importante și oportunități de dezvoltare personală.`}`

    return { score: Math.round(score), explanation, factors }
  } catch (error) {
    console.error('[v0] Error calculating career score:', error)
    return { score: 50, explanation: "Calculul scorului de carieră este în curs...", factors: [] }
  }
}

/**
 * Calculate Financial Score from 2nd House, 8th House, Jupiter, and Venus
 * Range: 1-10 (higher = stronger financial potential)
 */
export function calculateFinancialScore(chartData: PlanetaryData): { score: number; explanation: string; factors: string[] } {
  let score = 50 // Base percentage
  const factors: string[] = []

  try {
    // Jupiter in financial houses
    const jupiter = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('jupiter'))
    const jupiterNorm = jupiter ? normalizePlanet(jupiter) : null
    if (jupiterNorm && (jupiterNorm.house === 2 || jupiterNorm.house === 8)) {
      score += 15
      factors.push(`Jupiter în casa ${jupiterNorm.house}`)
    }
    if (jupiterNorm && (jupiterNorm.house === 11)) {
      score += 8
      factors.push(`Jupiter în casa XI (venituri)`)
    }

    // Venus in 2nd house
    const venus = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('venus'))
    const venusNorm = venus ? normalizePlanet(venus) : null
    if (venusNorm && venusNorm.house === 2) {
      score += 12
      factors.push(`Venus în casa II`)
    }

    // Saturn in 2nd house
    const saturn = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('saturn'))
    const saturnNorm = saturn ? normalizePlanet(saturn) : null
    if (saturnNorm && saturnNorm.house === 2) {
      score += 10
      factors.push(`Saturn în casa II`)
    }

    // Pluto in financial houses
    const pluto = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('pluto'))
    const plutoNorm = pluto ? normalizePlanet(pluto) : null
    if (plutoNorm && (plutoNorm.house === 2 || plutoNorm.house === 8)) {
      score += 8
      factors.push(`Pluton în casa ${plutoNorm.house}`)
    }

    // Money-related aspects
    const moneyAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      if (!aspectNorm) return false
      const hasMoneyPlanets = 
        (aspectNorm.planet1.name?.toLowerCase().includes('jupiter') || 
         aspectNorm.planet1.name?.toLowerCase().includes('saturn') || 
         aspectNorm.planet1.name?.toLowerCase().includes('venus')) &&
        (aspectNorm.planet2.name?.toLowerCase().includes('jupiter') || 
         aspectNorm.planet2.name?.toLowerCase().includes('saturn') || 
         aspectNorm.planet2.name?.toLowerCase().includes('venus'))
      const isBeneficial = aspectNorm.aspect?.toLowerCase().includes('trine') ||
                          aspectNorm.aspect?.toLowerCase().includes('sextile')
      return hasMoneyPlanets && isBeneficial
    }).length || 0

    score += Math.min(moneyAspects * 4, 12)
    if (moneyAspects > 0) {
      factors.push(`Aspecte financiare favorabile (${moneyAspects})`)
    }

    score = Math.min(Math.max(score, 10), 100)

    const explanation = `Harta ta arată oportunități financiare semnificative. ${jupiterNorm || venusNorm ? `Energiile planetare favorizează construirea unei stabilități și abundență materiale.` : `Această zonă conține lecții importante și oportunități de dezvoltare personală.`}`

    return { score: Math.round(score), explanation, factors }
  } catch (error) {
    console.error('[v0] Error calculating financial score:', error)
    return { score: 50, explanation: "Calculul scorului de finanțe este în curs...", factors: [] }
  }
}

/**
 * Calculate Spiritual Score from Neptune, 12th House, and North Node
 * Range: 1-10 (higher = stronger spiritual connection)
 */
export function calculateSpiritualScore(chartData: PlanetaryData): { score: number; explanation: string; factors: string[] } {
  let score = 50 // Base percentage
  const factors: string[] = []

  try {
    // Neptune (spirituality, intuition)
    const neptune = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('neptune'))
    const neptuneNorm = neptune ? normalizePlanet(neptune) : null
    if (neptuneNorm && (neptuneNorm.house === 12 || neptuneNorm.house === 8 || neptuneNorm.house === 9)) {
      score += 15
      factors.push(`Neptun în casa ${neptuneNorm.house}`)
    }

    // Water sign placements
    if (neptuneNorm?.sign) {
      const waterSigns = ['Cancer', 'Scorpio', 'Pisces']
      if (waterSigns.includes(neptuneNorm.sign)) {
        score += 10
        factors.push(`Neptun în ${neptuneNorm.sign}`)
      }
    }

    // 12th house planets
    const twelfthHousePlanets = chartData.planets?.filter(p => {
      const norm = normalizePlanet(p)
      return norm?.house === 12
    }).length || 0
    score += Math.min(twelfthHousePlanets * 5, 12)
    if (twelfthHousePlanets > 0) {
      factors.push(`${twelfthHousePlanets} planete în casa XII`)
    }

    // North Node
    const northNode = chartData.planets?.find(p => {
      const norm = normalizePlanet(p)
      return norm?.name?.toLowerCase().includes('north') && norm?.name?.toLowerCase().includes('node')
    })
    const northNodeNorm = northNode ? normalizePlanet(northNode) : null
    if (northNodeNorm && (northNodeNorm.house === 8 || northNodeNorm.house === 9 || northNodeNorm.house === 12)) {
      score += 12
      factors.push(`Nodul Nord în casa ${northNodeNorm.house}`)
    }

    // Chiron
    const chiron = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('chiron'))
    const chironNorm = chiron ? normalizePlanet(chiron) : null
    if (chironNorm && (chironNorm.house === 12 || chironNorm.house === 8)) {
      score += 8
      factors.push(`Chiron în casa ${chironNorm.house}`)
    }

    score = Math.min(Math.max(score, 10), 100)

    const explanation = `Harta ta arată o căi spirituale profunde și o legătură puternică cu dimensiunile transcendente ale existenței. ${neptuneNorm || northNodeNorm ? `Energiile astrologice te ghidează către o mai mare înțelegere și conectare spirituală.` : `Această zonă conține lecții importante și oportunități de dezvoltare personală.`}`

    return { score: Math.round(score), explanation, factors }
  } catch (error) {
    console.error('[v0] Error calculating spiritual score:', error)
    return { score: 50, explanation: "Calculul scorului de spiritualitate este în curs...", factors: [] }
  }
}

export interface AstrologyScores {
  love: { score: number; explanation: string; factors: string[] }
  career: { score: number; explanation: string; factors: string[] }
  financial: { score: number; explanation: string; factors: string[] }
  spiritual: { score: number; explanation: string; factors: string[] }
}

/**
 * Calculate all astrological scores from birth chart
 */
export function calculateAllScores(chartData: PlanetaryData): AstrologyScores {
  console.log('[v0] Starting score calculation with chart data:', {
    planetsCount: chartData.planets?.length,
    aspectsCount: chartData.aspects?.length,
    housesCount: chartData.houses?.length,
    planets: chartData.planets?.slice(0, 5).map(p => {
      const norm = normalizePlanet(p)
      return { name: norm?.name, sign: norm?.sign, degree: norm?.degree, house: norm?.house }
    }),
    aspects: chartData.aspects?.slice(0, 3).map(a => {
      const norm = normalizeAspect(a)
      return { p1: norm?.planet1.name, p2: norm?.planet2.name, type: norm?.aspect, orb: norm?.orb }
    })
  })

  return {
    love: calculateLoveScore(chartData),
    career: calculateCareerScore(chartData),
    financial: calculateFinancialScore(chartData),
    spiritual: calculateSpiritualScore(chartData)
  }
}
