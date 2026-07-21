/**
 * Career & Finance Score Calculator
 * Deterministic scoring based on natal chart positions, houses, and dignities
 * Each score: 0-100 based on planetary placements relevant to that indicator
 */

interface PlanetaryData {
  planets: any[]
  houses: any[]
  aspects: any[]
}

function normalizePlanet(planet: any): any {
  if (!planet) return null
  return {
    name: planet.name || '',
    sign: planet.sign || '',
    degree: planet.fullDegree ?? planet.degree ?? 0,
    house: planet.house ?? 0,
    retrograde: planet.isRetro ?? planet.retrograde ?? false,
  }
}

const CAREER_DIGNITIES: Record<string, Record<string, number>> = {
  Sun: { Aries: 20, Leo: 20, Capricorn: -15 },
  Saturn: { Capricorn: 20, Libra: 15, Scorpio: -15 },
  Mercury: { Gemini: 20, Virgo: 20, Pisces: -10 },
  Jupiter: { Sagittarius: 20, Pisces: 20, Virgo: -15 },
  Mars: { Aries: 20, Scorpio: 20, Libra: -15 },
}

function getDignityBonus(planetName: string, sign: string): number {
  const planet = planetName.toLowerCase()
  const dignities = Object.entries(CAREER_DIGNITIES).find(
    ([key]) => key.toLowerCase() === planet
  )?.[1]

  if (!dignities) return 0
  return dignities[sign] || 0
}

/**
 * CAREER POTENTIAL (Sun + House X + Leadership planets)
 * Based on Sun sign dignity, House X activity, Saturn stability
 */
export function calculateCareerPotential(chartData: PlanetaryData): number {
  let score = 50
  
  const sun = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('sun'))
  if (sun) {
    const sunNorm = normalizePlanet(sun)
    const dignityBonus = getDignityBonus('Sun', sunNorm.sign)
    const degreeScore = ((sunNorm.degree % 30) / 30) * 20
    score += dignityBonus + degreeScore
  }

  const house10Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 10) || []
  score += house10Planets.length * 10

  return Math.min(Math.max(Math.round(score), 0), 100)
}

/**
 * FINANCIAL POTENTIAL (Venus + Moon in Houses II/VIII + Jupiter)
 * Based on Venus dignity, House II activity, Jupiter blessings
 */
export function calculateFinancialPotential(chartData: PlanetaryData): number {
  let score = 50

  const venus = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('venus'))
  if (venus) {
    const venusNorm = normalizePlanet(venus)
    const dignityBonus = getDignityBonus('Venus', venusNorm.sign)
    score += dignityBonus * 0.8
  }

  const jupiter = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('jupiter'))
  if (jupiter) {
    const jupiterNorm = normalizePlanet(jupiter)
    const dignityBonus = getDignityBonus('Jupiter', jupiterNorm.sign)
    score += dignityBonus * 0.6
  }

  const house2Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 2) || []
  const house8Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 8) || []
  score += (house2Planets.length * 8) + (house8Planets.length * 5)

  return Math.min(Math.max(Math.round(score), 0), 100)
}

/**
 * ENTREPRENEURSHIP (Mars + House I + Uranus innovation)
 * Based on Mars strength, House I (self) activity, Uranus revolutionary energy
 */
export function calculateEntrepreneurship(chartData: PlanetaryData): number {
  let score = 50

  const mars = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('mars'))
  if (mars) {
    const marsNorm = normalizePlanet(mars)
    const dignityBonus = getDignityBonus('Mars', marsNorm.sign)
    score += dignityBonus
  }

  const uranus = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('uranus'))
  if (uranus) {
    score += 12
  }

  const house1Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 1) || []
  score += house1Planets.length * 12

  return Math.min(Math.max(Math.round(score), 0), 100)
}

/**
 * LEADERSHIP (Sun + House X + Saturn discipline)
 * Based on Sun authority, House X visibility, Saturn structure
 */
export function calculateLeadership(chartData: PlanetaryData): number {
  let score = 50

  const sun = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('sun'))
  if (sun) {
    const sunNorm = normalizePlanet(sun)
    const dignityBonus = getDignityBonus('Sun', sunNorm.sign)
    score += dignityBonus * 0.7
  }

  const saturn = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('saturn'))
  if (saturn) {
    const saturnNorm = normalizePlanet(saturn)
    const dignityBonus = getDignityBonus('Saturn', saturnNorm.sign)
    if (dignityBonus > 0) score += 15
    else score -= 5
  }

  const house10Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 10) || []
  score += house10Planets.length * 12

  return Math.min(Math.max(Math.round(score), 0), 100)
}

/**
 * COMMUNICATION (Mercury + House III/IX + Gemini/Virgo influence)
 * Based on Mercury dignity, House III/IX activity, Air element emphasis
 */
export function calculateCommunication(chartData: PlanetaryData): number {
  let score = 50

  const mercury = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('mercury'))
  if (mercury) {
    const mercuryNorm = normalizePlanet(mercury)
    const dignityBonus = getDignityBonus('Mercury', mercuryNorm.sign)
    score += dignityBonus
  }

  const house3Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 3) || []
  const house9Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 9) || []
  score += (house3Planets.length * 10) + (house9Planets.length * 8)

  return Math.min(Math.max(Math.round(score), 0), 100)
}

/**
 * STABILITY (Saturn + Earth signs + House IV/X)
 * Based on Saturn strength, Earth element dominance, House IV/X groundedness
 */
export function calculateStability(chartData: PlanetaryData): number {
  let score = 50

  const saturn = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('saturn'))
  if (saturn) {
    const saturnNorm = normalizePlanet(saturn)
    const dignityBonus = getDignityBonus('Saturn', saturnNorm.sign)
    if (dignityBonus > 0) score += 20
    else if (dignityBonus < 0) score -= 10
    else score += 5
  }

  const earthPlanets = chartData.planets?.filter(p => {
    const sign = normalizePlanet(p).sign
    return ['Taurus', 'Virgo', 'Capricorn'].includes(sign)
  }) || []
  score += earthPlanets.length * 8

  const house4Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 4) || []
  const house10Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 10) || []
  score += (house4Planets.length * 8) + (house10Planets.length * 8)

  return Math.min(Math.max(Math.round(score), 0), 100)
}

/**
 * INTUITION (Moon + Neptune + House XII + Water signs)
 * Based on Moon sensitivity, Neptune mystical gifts, House XII depth, Water element
 */
export function calculateIntuition(chartData: PlanetaryData): number {
  let score = 50

  const moon = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('moon'))
  if (moon) {
    const moonNorm = normalizePlanet(moon)
    score += 15
  }

  const neptune = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('neptune'))
  if (neptune) {
    score += 12
  }

  const waterPlanets = chartData.planets?.filter(p => {
    const sign = normalizePlanet(p).sign
    return ['Cancer', 'Scorpio', 'Pisces'].includes(sign)
  }) || []
  score += waterPlanets.length * 6

  const house12Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 12) || []
  score += house12Planets.length * 10

  return Math.min(Math.max(Math.round(score), 0), 100)
}

/**
 * SUCCESS (Jupiter + Sun + House X + Favorable aspects)
 * Based on Jupiter expansion, Sun radiance, House X visibility, beneficial aspects
 */
export function calculateSuccess(chartData: PlanetaryData): number {
  let score = 50

  const jupiter = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('jupiter'))
  if (jupiter) {
    const jupiterNorm = normalizePlanet(jupiter)
    const dignityBonus = getDignityBonus('Jupiter', jupiterNorm.sign)
    score += dignityBonus
  }

  const sun = chartData.planets?.find(p => normalizePlanet(p).name?.toLowerCase().includes('sun'))
  if (sun) {
    const sunNorm = normalizePlanet(sun)
    const dignityBonus = getDignityBonus('Sun', sunNorm.sign)
    score += dignityBonus * 0.5
  }

  const house10Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 10) || []
  score += house10Planets.length * 15

  const trineAspects = chartData.aspects?.filter(a => a.aspect?.toLowerCase().includes('trine')) || []
  score += trineAspects.length * 5

  return Math.min(Math.max(Math.round(score), 0), 100)
}

/**
 * Calculate all 8 career scores
 */
export function calculateAllCareerScores(chartData: PlanetaryData) {
  return {
    careerPotential: calculateCareerPotential(chartData),
    financialPotential: calculateFinancialPotential(chartData),
    entrepreneurship: calculateEntrepreneurship(chartData),
    leadership: calculateLeadership(chartData),
    communication: calculateCommunication(chartData),
    stability: calculateStability(chartData),
    intuition: calculateIntuition(chartData),
    success: calculateSuccess(chartData),
  }
}
