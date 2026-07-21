interface PlanetaryData {
  planets: any[]
  houses: any[]
  aspects: any[]
  midheaven: any
  ascendant: any
}

/**
 * Normalize planet data to ensure consistent property names
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

interface ScoreFactor {
  name: string
  value: number
  contribution: string
}

interface DetailedScore {
  score: number
  percentage: number
  category: string
  factors: ScoreFactor[]
  explanation: string
}

// ============================================================================
// ASTROLOGICAL DIGNITIES DATABASE - Essential Dignities (Ptolemy's System)
// Based on Traditional Astrological Rulerships and Exaltations
// ============================================================================
interface PlanetaryDignity {
  domicilium: string[]
  exaltation: string[]
  exile?: string[]
  fall: string[]
  detriment?: string[]
}

const PLANETARY_DIGNITIES: Record<string, PlanetaryDignity> = {
  Venus: {
    domicilium: ['Taurus', 'Libra'],
    exaltation: ['Pisces'],
    exile: ['Scorpio', 'Aries'],
    fall: ['Virgo'],
    detriment: ['Scorpio', 'Aries'],
  },
  Moon: {
    domicilium: ['Cancer'],
    exaltation: ['Taurus'],
    exile: ['Capricorn'],
    fall: ['Scorpio'],
    detriment: ['Capricorn'],
  },
  Jupiter: {
    domicilium: ['Sagittarius', 'Pisces'],
    exaltation: ['Cancer'],
    exile: ['Gemini', 'Virgo'],
    fall: ['Capricorn'],
    detriment: ['Gemini', 'Virgo'],
  },
  Saturn: {
    domicilium: ['Capricorn', 'Aquarius'],
    exaltation: ['Libra'],
    exile: ['Cancer', 'Leo'],
    fall: ['Aries'],
    detriment: ['Cancer', 'Leo'],
  },
  Neptune: {
    domicilium: ['Pisces'],
    exaltation: [],
    exile: ['Virgo'],
    fall: [],
    detriment: ['Virgo'],
  },
  Chiron: {
    domicilium: [],
    exaltation: ['Libra'],
    exile: [],
    fall: [],
    detriment: [],
  },
  Sun: {
    domicilium: ['Leo'],
    exaltation: ['Aries'],
    exile: ['Aquarius'],
    fall: ['Libra'],
    detriment: ['Aquarius'],
  },
  Mercury: {
    domicilium: ['Gemini', 'Virgo'],
    exaltation: ['Virgo'],
    exile: ['Sagittarius', 'Pisces'],
    fall: ['Pisces'],
    detriment: ['Sagittarius', 'Pisces'],
  },
}

// ============================================================================
// ASPECT STRENGTH CALCULATOR - Harmonic vs Challenging Aspects
// Based on angle separation and traditional astrological interpretation
// ============================================================================
function getAspectStrength(aspectName: string): { strength: number; weight: number } {
  const aspectLower = aspectName.toLowerCase()
  
  // Harmonic aspects (positive influence)
  if (aspectLower.includes('trine')) return { strength: 2, weight: 1.0 }          // 120°
  if (aspectLower.includes('sextile')) return { strength: 1.5, weight: 0.9 }      // 60°
  if (aspectLower.includes('conjunction')) return { strength: 1.2, weight: 0.85 } // 0°
  
  // Challenging aspects (negative influence)
  if (aspectLower.includes('opposition')) return { strength: -1.5, weight: 0.9 }  // 180°
  if (aspectLower.includes('square')) return { strength: -1.2, weight: 0.85 }     // 90°
  if (aspectLower.includes('quincunx')) return { strength: -0.8, weight: 0.7 }    // 150°
  
  return { strength: 0, weight: 0 }
}

// ============================================================================
// DIGNITY BONUS CALCULATOR - Precise Essential Dignity Points
// Based on Traditional Ptolemaic System (5-point scale)
// ============================================================================
function getDignityBonus(planetName: string, sign: string): { points: number; type: string } {
  const planet = planetName.toLowerCase()
  const dignities = Object.entries(PLANETARY_DIGNITIES).find(
    ([key]) => key.toLowerCase() === planet
  )?.[1]

  if (!dignities) return { points: 0, type: 'neutral' }

  if (dignities.domicilium.includes(sign)) {
    return { points: 20, type: 'domicilium' }  // Rulership: +20 points
  }
  if (dignities.exaltation.includes(sign)) {
    return { points: 15, type: 'exaltation' }  // Exaltation: +15 points
  }
  if (dignities.detriment?.includes(sign) || dignities.exile?.includes(sign)) {
    return { points: -10, type: 'detriment' }  // Exile: -10 points
  }
  if (dignities.fall.includes(sign)) {
    return { points: -15, type: 'cadera' }     // Fall: -15 points (Lat: cadera)
  }
  
  return { points: 0, type: 'neutral' }
}

// ============================================================================
// RELATIONAL POTENTIAL SCORE CALCULATOR
// Weights: Venus 25% | Moon 20% | House VII 25% | House V 15% | Aspects 15%
// ============================================================================
export function calculateRelationalScore(chartData: PlanetaryData): DetailedScore {
  const factors: ScoreFactor[] = []
  let baseScore = 50
  let weightedScore = 0
  const weights = { venus: 0.35, moon: 0.35, houseVII: 0.25, houseV: 0.15, aspects: 0.15 }

  try {
    // ========== VENUS ANALYSIS (35% weight - EXACT from AstrologyAPI) ==========
    const venus = chartData.planets?.find(p => {
      const norm = normalizePlanet(p)
      return norm?.name?.toLowerCase().includes('venus')
    })
    const venusNorm = venus ? normalizePlanet(venus) : null

    if (venusNorm?.sign && venusNorm?.degree !== undefined) {
      // Calculate based on actual degree position within sign (0-30°)
      const degreeInSign = venusNorm.degree % 30
      const dignity = getDignityBonus('Venus', venusNorm.sign)
      
      // Scoring: degree position (0-30°) maps to 0-30 points, dignity adds up to 40 points = 0-70 base
      const degreeScore = (degreeInSign / 30) * 30 // 0-30 points
      const dignityBonus = (dignity.points > 0 ? dignity.points * 4 : dignity.points * 3) // -12 to 40
      const venusScore = Math.min(Math.max(50 + degreeScore + dignityBonus, 0), 100)
      
      factors.push({
        name: `Venus în ${venusNorm.sign} la ${venusNorm.degree.toFixed(1)}°`,
        value: Math.round(venusScore),
        contribution: `Venus (dragoste) în ${venusNorm.sign} ${venusNorm.degree.toFixed(1)}° (${dignity.type}): ${Math.round(venusScore)}/100`,
      })
      weightedScore += venusScore * weights.venus
    } else {
      weightedScore += 50 * weights.venus
    }

    // ========== MOON ANALYSIS (35% weight - EXACT from AstrologyAPI) ==========
    const moon = chartData.planets?.find(p => {
      const norm = normalizePlanet(p)
      return norm?.name?.toLowerCase().includes('moon')
    })
    const moonNorm = moon ? normalizePlanet(moon) : null

    if (moonNorm?.sign && moonNorm?.degree !== undefined) {
      // Calculate based on actual degree position within sign (0-30°)
      const degreeInSign = moonNorm.degree % 30
      const dignity = getDignityBonus('Moon', moonNorm.sign)
      
      // Scoring: degree position (0-30°) maps to 0-25 points, dignity adds up to 30 points = 0-55 base
      const degreeScore = (degreeInSign / 30) * 25 // 0-25 points
      const dignityBonus = (dignity.points > 0 ? dignity.points * 3 : dignity.points * 2.5) // -12.5 to 30
      const moonScore = Math.min(Math.max(50 + degreeScore + dignityBonus, 0), 100)
      
      factors.push({
        name: `Lună în ${moonNorm.sign} la ${moonNorm.degree.toFixed(1)}°`,
        value: Math.round(moonScore),
        contribution: `Lună (emoții) în ${moonNorm.sign} ${moonNorm.degree.toFixed(1)}° (${dignity.type}): ${Math.round(moonScore)}/100`,
      })
      weightedScore += moonScore * weights.moon
    } else {
      weightedScore += 50 * weights.moon
    }

    // ========== HOUSE VII ANALYSIS (25% weight) ==========
    const house7Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 7) || []
    const house7SignificantPlanets = house7Planets.filter(p => {
      const name = normalizePlanet(p).name?.toLowerCase() || ''
      return ['sun', 'moon', 'venus', 'mars', 'jupiter'].some(planet => name.includes(planet))
    })
    
    if (house7SignificantPlanets.length > 0) {
      const house7Score = Math.min(50 + (house7SignificantPlanets.length * 15), 100)
      factors.push({
        name: `Casa VII activă`,
        value: house7Score,
        contribution: `Casa VII conține ${house7SignificantPlanets.length} planetă(e) semnificativă(e) = ${house7Score}/100`,
      })
      weightedScore += house7Score * weights.houseVII
    } else {
      weightedScore += 50 * weights.houseVII
    }

    // ========== HOUSE V ANALYSIS (15% weight) ==========
    const house5Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 5) || []
    if (house5Planets.length > 0) {
      const house5Score = Math.min(50 + (house5Planets.length * 12), 100)
      factors.push({
        name: `Casa V activă`,
        value: house5Score,
        contribution: `Casa V conține ${house5Planets.length} planetă(e) = ${house5Score}/100`,
      })
      weightedScore += house5Score * weights.houseV
    } else {
      weightedScore += 50 * weights.houseV
    }

    // ========== RELATIONAL ASPECTS (15% weight) ==========
    let aspectScore = 50
    const venusLunaAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      const hasVenus = aspectNorm?.planet1.name?.toLowerCase().includes('venus') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('venus')
      const hasMoon = aspectNorm?.planet1.name?.toLowerCase().includes('moon') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('moon')
      return hasVenus && hasMoon
    }) || []

    if (venusLunaAspects.length > 0) {
      for (const aspect of venusLunaAspects) {
        const aspectNorm = normalizeAspect(aspect)
        const { strength, weight } = getAspectStrength(aspectNorm?.aspect || '')
        const aspectContribution = strength * weight * 10
        
        aspectScore += aspectContribution
        factors.push({
          name: `${aspectNorm?.aspect} Venus-Lună`,
          value: aspectScore,
          contribution: `${aspectNorm?.aspect} Venus-Lună (orb: ${aspectNorm?.orb?.toFixed(1)}°): ${strength > 0 ? '+' : ''}${aspectContribution.toFixed(1)} = ${Math.round(aspectScore)}/100`,
        })
      }
      aspectScore = Math.min(Math.max(aspectScore, 0), 100)
    }
    weightedScore += aspectScore * weights.aspects

    // ========== FINAL CALCULATION ==========
    baseScore = Math.round(weightedScore)
    baseScore = Math.min(Math.max(baseScore, 0), 100)

    return {
      score: baseScore,
      percentage: baseScore,
      category: getScoreCategory(baseScore),
      factors,
      explanation: generateRelationalExplanation(baseScore, venusNorm, moonNorm),
    }
  } catch (error) {
    console.error('[v0] Error calculating relational score:', error)
    return {
      score: 50,
      percentage: 50,
      category: 'Potențial în Dezvoltare',
      factors: [],
      explanation: 'Calculul scorului relațional este în curs...',
    }
  }
}

// ============================================================================
// FINANCIAL POTENTIAL SCORE CALCULATOR
// Weights: House II 30% | Jupiter 25% | House VIII 15% | Venus 15% | Aspects 15%
// ============================================================================
export function calculateFinancialScore(chartData: PlanetaryData): DetailedScore {
  const factors: ScoreFactor[] = []
  let baseScore = 50
  let weightedScore = 0
  const weights = { houseII: 0.30, jupiter: 0.25, houseVIII: 0.15, venus: 0.15, aspects: 0.15 }

  try {
    // ========== HOUSE II ANALYSIS (30% weight - Material Resources) ==========
    const house2Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 2) || []
    const house2SignificantPlanets = house2Planets.filter(p => {
      const name = normalizePlanet(p).name?.toLowerCase() || ''
      return ['sun', 'moon', 'venus', 'jupiter', 'saturn'].some(planet => name.includes(planet))
    })
    
    let house2Score = 50
    if (house2SignificantPlanets.length > 0) {
      house2Score = Math.min(50 + (house2SignificantPlanets.length * 12), 100)
      factors.push({
        name: `Casa II activă`,
        value: house2Score,
        contribution: `Casa II (resurse materiale) conține ${house2SignificantPlanets.length} planetă(e) semnificativă(e) = ${house2Score}/100`,
      })
    }
    weightedScore += house2Score * weights.houseII

    // ========== JUPITER ANALYSIS (25% weight - Expansion & Abundance - EXACT) ==========
    const jupiter = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('jupiter')
    )
    const jupiterNorm = jupiter ? normalizePlanet(jupiter) : null

    let jupiterScore = 50
    if (jupiterNorm?.sign && jupiterNorm?.degree !== undefined) {
      const degreeInSign = jupiterNorm.degree % 30
      const dignity = getDignityBonus('Jupiter', jupiterNorm.sign)
      
      // Jupiter score: degree (0-30°) maps to 0-35 points, dignity adds -15 to +40
      const degreeScore = (degreeInSign / 30) * 35
      const dignityBonus = (dignity.points > 0 ? dignity.points * 4 : dignity.points * 2.5)
      jupiterScore = Math.min(Math.max(50 + degreeScore + dignityBonus, 0), 100)
      
      factors.push({
        name: `Jupiter în ${jupiterNorm.sign} la ${jupiterNorm.degree.toFixed(1)}°`,
        value: Math.round(jupiterScore),
        contribution: `Jupiter (abundență) în ${jupiterNorm.sign} ${jupiterNorm.degree.toFixed(1)}° (${dignity.type}): ${Math.round(jupiterScore)}/100`,
      })
    } else {
      jupiterScore = 50
    }
    jupiterScore = Math.min(Math.max(jupiterScore, 0), 100)
    weightedScore += jupiterScore * weights.jupiter

    // ========== HOUSE VIII ANALYSIS (15% weight - Shared/Inherited Resources) ==========
    const house8Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 8) || []
    let house8Score = 50
    if (house8Planets.length > 0) {
      house8Score = Math.min(50 + (house8Planets.length * 10), 100)
      factors.push({
        name: `Casa VIII activă`,
        value: house8Score,
        contribution: `Casa VIII (resurse moștenite) conține ${house8Planets.length} planetă(e) = ${house8Score}/100`,
      })
    }
    weightedScore += house8Score * weights.houseVIII

    // ========== VENUS ANALYSIS (15% weight - Value & Pleasure) ==========
    const venus = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('venus')
    )
    const venusNorm = venus ? normalizePlanet(venus) : null

    let venusScore = 50
    if (venusNorm?.sign) {
      const dignity = getDignityBonus('Venus', venusNorm.sign)
      venusScore = 50 + (dignity.points * 2)
      
      factors.push({
        name: `Venus în ${venusNorm.sign}`,
        value: venusScore,
        contribution: `Venus (valoare) în ${venusNorm.sign} (${dignity.type}): ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${venusScore}/100`,
      })
    }
    venusScore = Math.min(Math.max(venusScore, 0), 100)
    weightedScore += venusScore * weights.venus

    // ========== FINANCIAL ASPECTS (15% weight) ==========
    let aspectScore = 50
    const jupiterAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      const hasJupiter = aspectNorm?.planet1.name?.toLowerCase().includes('jupiter') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('jupiter')
      const hasVenus = aspectNorm?.planet1.name?.toLowerCase().includes('venus') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('venus')
      return hasJupiter && hasVenus
    }) || []

    if (jupiterAspects.length > 0) {
      for (const aspect of jupiterAspects) {
        const aspectNorm = normalizeAspect(aspect)
        const { strength, weight } = getAspectStrength(aspectNorm?.aspect || '')
        const aspectContribution = strength * weight * 12
        
        aspectScore += aspectContribution
        factors.push({
          name: `${aspectNorm?.aspect} Jupiter-Venus`,
          value: aspectScore,
          contribution: `${aspectNorm?.aspect} Jupiter-Venus (orb: ${aspectNorm?.orb?.toFixed(1)}°): ${strength > 0 ? '+' : ''}${aspectContribution.toFixed(1)} = ${Math.round(aspectScore)}/100`,
        })
      }
    }
    aspectScore = Math.min(Math.max(aspectScore, 0), 100)
    weightedScore += aspectScore * weights.aspects

    // ========== FINAL CALCULATION ==========
    baseScore = Math.round(weightedScore)
    baseScore = Math.min(Math.max(baseScore, 0), 100)

    return {
      score: Math.round(baseScore),
      percentage: Math.round(baseScore),
      category: getScoreCategory(baseScore),
      factors,
      explanation: generateFinancialExplanation(baseScore, jupiterNorm, venusNorm),
    }
  } catch (error) {
    console.error('[v0] Error calculating financial score:', error)
    return {
      score: 50,
      percentage: 50,
      category: 'Potențial în Dezvoltare',
      factors: [],
      explanation: 'Calculul scorului financiar este în curs...',
    }
  }
}

// ============================================================================
// PROFESSIONAL POTENTIAL SCORE CALCULATOR
// Weights: MC 30% | House X 25% | Saturn 20% | Jupiter 15% | Aspects 10%
// ============================================================================
export function calculateProfessionalScore(chartData: PlanetaryData): DetailedScore {
  const factors: ScoreFactor[] = []
  let baseScore = 50
  let weightedScore = 0
  const weights = { mc: 0.30, houseX: 0.25, saturn: 0.20, jupiter: 0.15, aspects: 0.10 }

  try {
    // ========== MIDHEAVEN ANALYSIS (30% weight - Career Direction) ==========
    const midheaven = chartData.midheaven
    const careerSignatures = ['Capricorn', 'Scorpio', 'Leo', 'Aries', 'Libra']
    let mcScore = 50
    
    if (midheaven) {
      mcScore = careerSignatures.includes(midheaven.sign) ? 65 : 50
      factors.push({
        name: `MC în ${midheaven.sign}`,
        value: mcScore,
        contribution: `Mijlocul Cerului (carier) în ${midheaven.sign} = ${mcScore}/100`,
      })
    }
    weightedScore += mcScore * weights.mc

    // ========== HOUSE X ANALYSIS (25% weight - Public Life & Reputation) ==========
    const house10Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 10) || []
    const house10SignificantPlanets = house10Planets.filter(p => {
      const name = normalizePlanet(p).name?.toLowerCase() || ''
      return ['sun', 'saturn', 'jupiter', 'mars'].some(planet => name.includes(planet))
    })
    
    let house10Score = 50
    if (house10SignificantPlanets.length > 0) {
      house10Score = Math.min(50 + (house10SignificantPlanets.length * 15), 100)
      factors.push({
        name: `Casa X activă`,
        value: house10Score,
        contribution: `Casa X (reputație) conține ${house10SignificantPlanets.length} planetă(e) semnificativă(e) = ${house10Score}/100`,
      })
    }
    weightedScore += house10Score * weights.houseX

    // ========== SATURN ANALYSIS (20% weight - Discipline & Achievement - EXACT) ==========
    const saturn = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('saturn')
    )
    const saturnNorm = saturn ? normalizePlanet(saturn) : null

    let saturnScore = 50
    if (saturnNorm?.sign && saturnNorm?.degree !== undefined) {
      const degreeInSign = saturnNorm.degree % 30
      const dignity = getDignityBonus('Saturn', saturnNorm.sign)
      
      // Saturn score: degree (0-30°) maps to 0-30 points, dignity adds -15 to +40 = 0-70 base
      const degreeScore = (degreeInSign / 30) * 30
      const dignityBonus = (dignity.points > 0 ? dignity.points * 4 : dignity.points * 2)
      saturnScore = Math.min(Math.max(50 + degreeScore + dignityBonus, 0), 100)
      
      factors.push({
        name: `Saturn în ${saturnNorm.sign} la ${saturnNorm.degree.toFixed(1)}°`,
        value: Math.round(saturnScore),
        contribution: `Saturn (disciplină) în ${saturnNorm.sign} ${saturnNorm.degree.toFixed(1)}° (${dignity.type}): ${Math.round(saturnScore)}/100`,
      })
    } else {
      saturnScore = 50
    }
    saturnScore = Math.min(Math.max(saturnScore, 0), 100)
    weightedScore += saturnScore * weights.saturn

    // ========== JUPITER ANALYSIS (15% weight - Expansion & Growth - EXACT) ==========
    const jupiter = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('jupiter')
    )
    const jupiterNorm = jupiter ? normalizePlanet(jupiter) : null

    let jupiterScore = 50
    if (jupiterNorm?.sign && jupiterNorm?.degree !== undefined) {
      const degreeInSign = jupiterNorm.degree % 30
      const dignity = getDignityBonus('Jupiter', jupiterNorm.sign)
      
      // Jupiter score: degree (0-30°) maps to 0-28 points, dignity adds -15 to +40 = 0-68 base
      const degreeScore = (degreeInSign / 30) * 28
      const dignityBonus = (dignity.points > 0 ? dignity.points * 3.5 : dignity.points * 2.5)
      jupiterScore = Math.min(Math.max(50 + degreeScore + dignityBonus, 0), 100)
      
      factors.push({
        name: `Jupiter în ${jupiterNorm.sign} la ${jupiterNorm.degree.toFixed(1)}°`,
        value: Math.round(jupiterScore),
        contribution: `Jupiter (creștere) în ${jupiterNorm.sign} ${jupiterNorm.degree.toFixed(1)}° (${dignity.type}): ${Math.round(jupiterScore)}/100`,
      })
    } else {
      jupiterScore = 50
    }
    jupiterScore = Math.min(Math.max(jupiterScore, 0), 100)
    weightedScore += jupiterScore * weights.jupiter

    // ========== PROFESSIONAL ASPECTS (10% weight) ==========
    let aspectScore = 50
    const professionalAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      const hasSaturn = aspectNorm?.planet1.name?.toLowerCase().includes('saturn') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('saturn')
      const hasJupiter = aspectNorm?.planet1.name?.toLowerCase().includes('jupiter') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('jupiter')
      return hasSaturn && hasJupiter
    }) || []

    if (professionalAspects.length > 0) {
      for (const aspect of professionalAspects) {
        const aspectNorm = normalizeAspect(aspect)
        const { strength, weight } = getAspectStrength(aspectNorm?.aspect || '')
        const aspectContribution = strength * weight * 12
        
        aspectScore += aspectContribution
        factors.push({
          name: `${aspectNorm?.aspect} Saturn-Jupiter`,
          value: aspectScore,
          contribution: `${aspectNorm?.aspect} Saturn-Jupiter (orb: ${aspectNorm?.orb?.toFixed(1)}°): ${strength > 0 ? '+' : ''}${aspectContribution.toFixed(1)} = ${Math.round(aspectScore)}/100`,
        })
      }
    }
    aspectScore = Math.min(Math.max(aspectScore, 0), 100)
    weightedScore += aspectScore * weights.aspects

    // ========== FINAL CALCULATION ==========
    baseScore = Math.round(weightedScore)
    baseScore = Math.min(Math.max(baseScore, 0), 100)

    return {
      score: baseScore,
      percentage: baseScore,
      category: getScoreCategory(baseScore),
      factors,
      explanation: generateProfessionalExplanation(baseScore, midheaven, saturnNorm),
    }
  } catch (error) {
    console.error('[v0] Error calculating professional score:', error)
    return {
      score: 50,
      percentage: 50,
      category: 'Potențial în Dezvoltare',
      factors: [],
      explanation: 'Calculul scorului profesional este în curs...',
    }
  }
}

// ============================================================================
// SPIRITUAL EVOLUTION SCORE CALCULATOR
// Weights: North Node 30% | House XII 25% | Neptune 20% | Chiron 15% | Aspects 10%
// ============================================================================
export function calculateSpiritualScore(chartData: PlanetaryData): DetailedScore {
  const factors: ScoreFactor[] = []
  let baseScore = 50
  let weightedScore = 0
  const weights = { northNode: 0.30, houseXII: 0.25, neptune: 0.20, chiron: 0.15, aspects: 0.10 }

  try {
    // ========== NORTH NODE ANALYSIS (30% weight - Soul's Direction) ==========
    const northNode = chartData.planets?.find(p => {
      const norm = normalizePlanet(p)
      return norm?.name?.toLowerCase().includes('north') &&
        norm?.name?.toLowerCase().includes('node')
    })
    const northNodeNorm = northNode ? normalizePlanet(northNode) : null

    const spiritualHouses = [8, 9, 12]
    let northNodeScore = 50
    
    if (northNodeNorm?.house) {
      northNodeScore = spiritualHouses.includes(northNodeNorm.house) ? 75 : 50
      factors.push({
        name: `Nodul Nord în casa ${northNodeNorm.house}`,
        value: northNodeScore,
        contribution: `Nodul Nord (evoluție sufletească) în casa ${northNodeNorm.house} ${spiritualHouses.includes(northNodeNorm.house) ? '(spiritual)' : ''} = ${northNodeScore}/100`,
      })
    }
    weightedScore += northNodeScore * weights.northNode

    // ========== HOUSE XII ANALYSIS (25% weight - Transcendence & Spirituality) ==========
    const house12Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 12) || []
    const house12SignificantPlanets = house12Planets.filter(p => {
      const name = normalizePlanet(p).name?.toLowerCase() || ''
      return ['sun', 'moon', 'venus', 'neptune', 'jupiter'].some(planet => name.includes(planet))
    })
    
    let house12Score = 50
    if (house12SignificantPlanets.length > 0) {
      house12Score = Math.min(50 + (house12SignificantPlanets.length * 14), 100)
      factors.push({
        name: `Casa XII activă`,
        value: house12Score,
        contribution: `Casa XII (transcendență) conține ${house12SignificantPlanets.length} planetă(e) semnificativă(e) = ${house12Score}/100`,
      })
    }
    weightedScore += house12Score * weights.houseXII

    // ========== NEPTUNE ANALYSIS (20% weight - Intuition & Spirituality) ==========
    const neptune = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('neptune')
    )
    const neptuneNorm = neptune ? normalizePlanet(neptune) : null

    let neptuneScore = 50
    if (neptuneNorm?.sign) {
      const dignity = getDignityBonus('Neptune', neptuneNorm.sign)
      neptuneScore = 50 + (dignity.points * 2.3)
      
      factors.push({
        name: `Neptun în ${neptuneNorm.sign}`,
        value: neptuneScore,
        contribution: `Neptun (spiritualitate) în ${neptuneNorm.sign} (${dignity.type}): ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${neptuneScore}/100`,
      })
    }
    neptuneScore = Math.min(Math.max(neptuneScore, 0), 100)
    weightedScore += neptuneScore * weights.neptune

    // ========== CHIRON ANALYSIS (15% weight - Healing & Wisdom) ==========
    const chiron = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('chiron')
    )
    const chironNorm = chiron ? normalizePlanet(chiron) : null

    let chironScore = 50
    if (chironNorm?.house) {
      const spiritualChironHouses = [8, 9, 12]
      chironScore = spiritualChironHouses.includes(chironNorm.house) ? 68 : 55
      
      factors.push({
        name: `Chiron în casa ${chironNorm.house}`,
        value: chironScore,
        contribution: `Chiron (vindecarea sufletului) în casa ${chironNorm.house} = ${chironScore}/100`,
      })
    }
    chironScore = Math.min(Math.max(chironScore, 0), 100)
    weightedScore += chironScore * weights.chiron

    // ========== SPIRITUAL ASPECTS (10% weight) ==========
    let aspectScore = 50
    const spiritualAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      const hasNeptune = aspectNorm?.planet1.name?.toLowerCase().includes('neptune') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('neptune')
      const hasChiron = aspectNorm?.planet1.name?.toLowerCase().includes('chiron') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('chiron')
      return (hasNeptune || hasChiron)
    }) || []

    if (spiritualAspects.length > 0) {
      for (const aspect of spiritualAspects) {
        const aspectNorm = normalizeAspect(aspect)
        const { strength, weight } = getAspectStrength(aspectNorm?.aspect || '')
        const aspectContribution = strength * weight * 11
        
        aspectScore += aspectContribution
        factors.push({
          name: `${aspectNorm?.aspect} spiritual`,
          value: aspectScore,
          contribution: `${aspectNorm?.aspect} (Neptun/Chiron) (orb: ${aspectNorm?.orb?.toFixed(1)}°): ${strength > 0 ? '+' : ''}${aspectContribution.toFixed(1)} = ${Math.round(aspectScore)}/100`,
        })
      }
    }
    aspectScore = Math.min(Math.max(aspectScore, 0), 100)
    weightedScore += aspectScore * weights.aspects

    // ========== FINAL CALCULATION ==========
    baseScore = Math.round(weightedScore)
    baseScore = Math.min(Math.max(baseScore, 0), 100)

    return {
      score: baseScore,
      percentage: baseScore,
      category: getScoreCategory(baseScore),
      factors,
      explanation: generateSpiritualExplanation(baseScore, northNodeNorm, neptuneNorm),
    }
  } catch (error) {
    console.error('[v0] Error calculating spiritual score:', error)
    return {
      score: 50,
      percentage: 50,
      category: 'Potențial în Dezvoltare',
      factors: [],
      explanation: 'Calculul scorului spiritual este în curs...',
    }
  }
}

function getScoreCategory(score: number): string {
  if (score >= 90) return 'Potențial Excepțional'
  if (score >= 80) return 'Potențial Ridicat'
  if (score >= 70) return 'Potențial Foarte Bun'
  if (score >= 60) return 'Potențial Bun'
  if (score >= 50) return 'Potențial în Dezvoltare'
  return 'Zonă de Evoluție'
}

function generateRelationalExplanation(
  score: number,
  venus: any,
  moon: any
): string {
  if (score >= 80) {
    return 'Harta ta indică o capacitate ridicată de a construi relații autentice și stabile. Venus și Lună formează tipare favorabile pentru conexiuni emoționale profunde.'
  }
  if (score >= 60) {
    return 'Energiile relaționale din harta ta sunt bune. Această zonă conține oportunități de creștere și dezvoltare a conexiunilor emoționale.'
  }
  return 'Această zonă conține lecții importante și oportunități de creștere în relații. Fiecare experiență te ghidează către mai mult echilibru.'
}

function generateFinancialExplanation(
  score: number,
  jupiter: any,
  venus: any
): string {
  if (score >= 80) {
    return 'Harta ta arată oportunități financiare semnificative. Energiile planetare favorizează construirea unei stabilități și abundență materiale.'
  }
  if (score >= 60) {
    return 'Potențialul financiar din harta ta este în dezvoltare. Cu atenție și strategie, poți accesa resursele disponibile.'
  }
  return 'Această zonă conține lecții importante și oportunități de creștere financiară. Evoluția ta aduce noi posibilități.'
}

function generateProfessionalExplanation(
  score: number,
  midheaven: any,
  saturn: any
): string {
  if (score >= 80) {
    return 'Harta ta arată potențial profesional excepțional. Energiile astrologice favorizează dezvoltarea unei cariere de succes și realizare.'
  }
  if (score >= 60) {
    return 'Potențialul profesional din harta ta este solid. Cu dedicare și perseverență, poți atinge obiectivele tale.'
  }
  return 'Această zonă conține lecții importante și oportunități de creștere profesională. Evoluția ta aduce noi perspective.'
}

function generateSpiritualExplanation(
  score: number,
  northNode: any,
  neptune: any
): string {
  if (score >= 80) {
    return 'Harta ta arată o cale spirituală profundă și o legătură puternică cu dimensiunile transcendente ale existenței. Energiile astrologice te ghidează către o mai mare înțelegere.'
  }
  if (score >= 60) {
    return 'Potențialul spiritual din harta ta este în dezvoltare. Această cale te ghidează către înțelegere și conectare mai profundă.'
  }
  return 'Această zonă conține lecții importante și oportunități de creștere spirituală. Călătoria ta de descoperire de sine este cea mai importantă.'
}

// ============================================================================
// INTELLIGENCE & COMMUNICATION SCORE CALCULATOR
// Weights: Mercury 40% | 3rd House 25% | Mercury Aspects 20% | Jupiter 15%
// ============================================================================
export function calculateIntelligenceScore(chartData: PlanetaryData): DetailedScore {
  const factors: ScoreFactor[] = []
  let baseScore = 50
  let weightedScore = 0
  const weights = { mercury: 0.40, house3: 0.25, aspects: 0.20, jupiter: 0.15 }

  try {
    // ========== MERCURY ANALYSIS (40% weight - Mind & Communication) ==========
    const mercury = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('mercury')
    )
    const mercuryNorm = mercury ? normalizePlanet(mercury) : null

    let mercuryScore = 50
    if (mercuryNorm?.sign) {
      const dignity = getDignityBonus('Mercury', mercuryNorm.sign)
      mercuryScore = 50 + (dignity.points * 2.4)
      
      factors.push({
        name: `Mercur în ${mercuryNorm.sign}`,
        value: mercuryScore,
        contribution: `Mercur (minte) în ${mercuryNorm.sign} (${dignity.type}): ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${mercuryScore}/100`,
      })
    }
    mercuryScore = Math.min(Math.max(mercuryScore, 0), 100)
    weightedScore += mercuryScore * weights.mercury

    // ========== HOUSE III ANALYSIS (25% weight - Communication & Siblings) ==========
    const house3Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 3) || []
    const house3SignificantPlanets = house3Planets.filter(p => {
      const name = normalizePlanet(p).name?.toLowerCase() || ''
      return ['mercury', 'sun', 'venus', 'jupiter'].some(planet => name.includes(planet))
    })
    
    let house3Score = 50
    if (house3SignificantPlanets.length > 0) {
      house3Score = Math.min(50 + (house3SignificantPlanets.length * 13), 100)
      factors.push({
        name: `Casa III activă`,
        value: house3Score,
        contribution: `Casa III (comunicare) conține ${house3SignificantPlanets.length} planetă(e) semnificativă(e) = ${house3Score}/100`,
      })
    }
    weightedScore += house3Score * weights.house3

    // ========== MERCURY ASPECTS (20% weight) ==========
    let aspectScore = 50
    const mercuryAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      return aspectNorm?.planet1.name?.toLowerCase().includes('mercury') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('mercury')
    }) || []

    if (mercuryAspects.length > 0) {
      for (const aspect of mercuryAspects) {
        const aspectNorm = normalizeAspect(aspect)
        const { strength, weight } = getAspectStrength(aspectNorm?.aspect || '')
        const aspectContribution = strength * weight * 10
        
        aspectScore += aspectContribution
        factors.push({
          name: `${aspectNorm?.aspect} cu Mercur`,
          value: aspectScore,
          contribution: `${aspectNorm?.aspect} cu Mercur (orb: ${aspectNorm?.orb?.toFixed(1)}°): ${strength > 0 ? '+' : ''}${aspectContribution.toFixed(1)} = ${Math.round(aspectScore)}/100`,
        })
      }
    }
    aspectScore = Math.min(Math.max(aspectScore, 0), 100)
    weightedScore += aspectScore * weights.aspects

    // ========== JUPITER ANALYSIS (15% weight - Learning Capacity) ==========
    const jupiter = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('jupiter')
    )
    const jupiterNorm = jupiter ? normalizePlanet(jupiter) : null

    let jupiterScore = 50
    if (jupiterNorm?.sign) {
      const dignity = getDignityBonus('Jupiter', jupiterNorm.sign)
      jupiterScore = 50 + (dignity.points * 2)
      
      factors.push({
        name: `Jupiter în ${jupiterNorm.sign}`,
        value: jupiterScore,
        contribution: `Jupiter (învățare) în ${jupiterNorm.sign} (${dignity.type}): ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${jupiterScore}/100`,
      })
    }
    jupiterScore = Math.min(Math.max(jupiterScore, 0), 100)
    weightedScore += jupiterScore * weights.jupiter

    // ========== FINAL CALCULATION ==========
    baseScore = Math.round(weightedScore)
    baseScore = Math.min(Math.max(baseScore, 0), 100)

    return {
      score: baseScore,
      percentage: baseScore,
      category: getScoreCategory(baseScore),
      factors,
      explanation: generateIntelligenceExplanation(baseScore, mercuryNorm),
    }
  } catch (error) {
    console.error('[v0] Error calculating intelligence score:', error)
    return {
      score: 50,
      percentage: 50,
      category: 'Potențial în Dezvoltare',
      factors: [],
      explanation: 'Calculul scorului de inteligență este în curs...',
    }
  }
}

// ============================================================================
// LEADERSHIP & INFLUENCE SCORE CALCULATOR
// Weights: Sun 30% | Ascendant 20% | Mars 15% | MC 15% | 1st House 10% | Aspects 10%
// ============================================================================
export function calculateLeadershipScore(chartData: PlanetaryData): DetailedScore {
  const factors: ScoreFactor[] = []
  let baseScore = 50
  let weightedScore = 0
  const weights = { sun: 0.30, ascendant: 0.20, mars: 0.15, mc: 0.15, house1: 0.10, aspects: 0.10 }

  try {
    // ========== SUN ANALYSIS (30% weight - Will & Identity) ==========
    const sun = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('sun')
    )
    const sunNorm = sun ? normalizePlanet(sun) : null

    let sunScore = 50
    if (sunNorm?.sign) {
      const dignity = getDignityBonus('Sun', sunNorm.sign)
      sunScore = 50 + (dignity.points * 2.5)
      
      factors.push({
        name: `Soare în ${sunNorm.sign}`,
        value: sunScore,
        contribution: `Soare (voință) în ${sunNorm.sign} (${dignity.type}): ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${sunScore}/100`,
      })
    }
    sunScore = Math.min(Math.max(sunScore, 0), 100)
    weightedScore += sunScore * weights.sun

    // ========== ASCENDANT ANALYSIS (20% weight - Image & Presence) ==========
    const ascendant = chartData.ascendant
    let ascendantScore = 50
    if (ascendant?.sign) {
      const leadershipSigns = ['Aries', 'Leo', 'Sagittarius', 'Capricorn', 'Scorpio']
      ascendantScore = leadershipSigns.includes(ascendant.sign) ? 70 : 55
      
      factors.push({
        name: `Ascendent în ${ascendant.sign}`,
        value: ascendantScore,
        contribution: `Ascendent (prezență) în ${ascendant.sign} = ${ascendantScore}/100`,
      })
    }
    weightedScore += ascendantScore * weights.ascendant

    // ========== MARS ANALYSIS (15% weight - Drive & Courage) ==========
    const mars = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('mars')
    )
    const marsNorm = mars ? normalizePlanet(mars) : null

    let marsScore = 50
    if (marsNorm?.sign) {
      const dignity = getDignityBonus('Mars', marsNorm?.sign) || { points: 0, type: 'neutral' }
      marsScore = 50 + (dignity.points * 2)
      
      factors.push({
        name: `Marte în ${marsNorm.sign}`,
        value: marsScore,
        contribution: `Marte (curaj) în ${marsNorm.sign}: ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${marsScore}/100`,
      })
    }
    marsScore = Math.min(Math.max(marsScore, 0), 100)
    weightedScore += marsScore * weights.mars

    // ========== MIDHEAVEN ANALYSIS (15% weight - Public Authority) ==========
    const midheaven = chartData.midheaven
    let mcScore = 50
    if (midheaven?.sign) {
      const authoritySignatures = ['Capricorn', 'Leo', 'Aries', 'Scorpio', 'Sagittarius']
      mcScore = authoritySignatures.includes(midheaven.sign) ? 70 : 55
      
      factors.push({
        name: `MC în ${midheaven.sign}`,
        value: mcScore,
        contribution: `Mijlocul Cerului (autoritate) în ${midheaven.sign} = ${mcScore}/100`,
      })
    }
    weightedScore += mcScore * weights.mc

    // ========== HOUSE I ANALYSIS (10% weight - Self Expression) ==========
    const house1Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 1) || []
    let house1Score = 50
    if (house1Planets.length > 0) {
      house1Score = Math.min(50 + (house1Planets.length * 10), 100)
      factors.push({
        name: `Casa I activă`,
        value: house1Score,
        contribution: `Casa I (exprimare) conține ${house1Planets.length} planetă(e) = ${house1Score}/100`,
      })
    }
    weightedScore += house1Score * weights.house1

    // ========== LEADERSHIP ASPECTS (10% weight) ==========
    let aspectScore = 50
    const leadershipAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      const hasSun = aspectNorm?.planet1.name?.toLowerCase().includes('sun') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('sun')
      return hasSun
    }) || []

    if (leadershipAspects.length > 0) {
      for (const aspect of leadershipAspects) {
        const aspectNorm = normalizeAspect(aspect)
        const { strength, weight } = getAspectStrength(aspectNorm?.aspect || '')
        const aspectContribution = strength * weight * 8
        
        aspectScore += aspectContribution
        factors.push({
          name: `${aspectNorm?.aspect} cu Soare`,
          value: aspectScore,
          contribution: `${aspectNorm?.aspect} cu Soare (orb: ${aspectNorm?.orb?.toFixed(1)}°): ${strength > 0 ? '+' : ''}${aspectContribution.toFixed(1)} = ${Math.round(aspectScore)}/100`,
        })
      }
    }
    aspectScore = Math.min(Math.max(aspectScore, 0), 100)
    weightedScore += aspectScore * weights.aspects

    // ========== FINAL CALCULATION ==========
    baseScore = Math.round(weightedScore)
    baseScore = Math.min(Math.max(baseScore, 0), 100)

    return {
      score: baseScore,
      percentage: baseScore,
      category: getScoreCategory(baseScore),
      factors,
      explanation: generateLeadershipExplanation(baseScore, sunNorm),
    }
  } catch (error) {
    console.error('[v0] Error calculating leadership score:', error)
    return {
      score: 50,
      percentage: 50,
      category: 'Potențial în Dezvoltare',
      factors: [],
      explanation: 'Calculul scorului de leadership este în curs...',
    }
  }
}

// ============================================================================
// ENERGY & VITALITY SCORE CALCULATOR
// Weights: Mars 35% | Sun 25% | 1st House 15% | Ascendant 15% | Mars Aspects 10%
// ============================================================================
export function calculateEnergyScore(chartData: PlanetaryData): DetailedScore {
  const factors: ScoreFactor[] = []
  let baseScore = 50
  let weightedScore = 0
  const weights = { mars: 0.35, sun: 0.25, house1: 0.15, ascendant: 0.15, aspects: 0.10 }

  try {
    // ========== MARS ANALYSIS (35% weight - Physical Energy) ==========
    const mars = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('mars')
    )
    const marsNorm = mars ? normalizePlanet(mars) : null

    let marsScore = 50
    if (marsNorm?.sign) {
      const dignity = getDignityBonus('Mars', marsNorm.sign)
      marsScore = 50 + (dignity.points * 2.5)
      
      factors.push({
        name: `Marte în ${marsNorm.sign}`,
        value: marsScore,
        contribution: `Marte (energie) în ${marsNorm.sign} (${dignity.type}): ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${marsScore}/100`,
      })
    }
    marsScore = Math.min(Math.max(marsScore, 0), 100)
    weightedScore += marsScore * weights.mars

    // ========== SUN ANALYSIS (25% weight - Vital Force) ==========
    const sun = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('sun')
    )
    const sunNorm = sun ? normalizePlanet(sun) : null

    let sunScore = 50
    if (sunNorm?.sign) {
      const dignity = getDignityBonus('Sun', sunNorm.sign)
      sunScore = 50 + (dignity.points * 2.2)
      
      factors.push({
        name: `Soare în ${sunNorm.sign}`,
        value: sunScore,
        contribution: `Soare (forță vitală) în ${sunNorm.sign} (${dignity.type}): ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${sunScore}/100`,
      })
    }
    sunScore = Math.min(Math.max(sunScore, 0), 100)
    weightedScore += sunScore * weights.sun

    // ========== HOUSE I ANALYSIS (15% weight) ==========
    const house1Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 1) || []
    let house1Score = 50
    if (house1Planets.length > 0) {
      house1Score = Math.min(50 + (house1Planets.length * 12), 100)
      factors.push({
        name: `Casa I activă`,
        value: house1Score,
        contribution: `Casa I conține ${house1Planets.length} planetă(e) = ${house1Score}/100`,
      })
    }
    weightedScore += house1Score * weights.house1

    // ========== ASCENDANT ANALYSIS (15% weight) ==========
    const ascendant = chartData.ascendant
    let ascendantScore = 50
    if (ascendant?.sign) {
      const energeticSigns = ['Aries', 'Leo', 'Sagittarius', 'Scorpio', 'Gemini']
      ascendantScore = energeticSigns.includes(ascendant.sign) ? 68 : 55
      
      factors.push({
        name: `Ascendent în ${ascendant.sign}`,
        value: ascendantScore,
        contribution: `Ascendent (vitalitate) în ${ascendant.sign} = ${ascendantScore}/100`,
      })
    }
    weightedScore += ascendantScore * weights.ascendant

    // ========== MARS ASPECTS (10% weight) ==========
    let aspectScore = 50
    const marsAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      return aspectNorm?.planet1.name?.toLowerCase().includes('mars') ||
        aspectNorm?.planet2.name?.toLowerCase().includes('mars')
    }) || []

    if (marsAspects.length > 0) {
      for (const aspect of marsAspects) {
        const aspectNorm = normalizeAspect(aspect)
        const { strength, weight } = getAspectStrength(aspectNorm?.aspect || '')
        const aspectContribution = strength * weight * 9
        
        aspectScore += aspectContribution
        factors.push({
          name: `${aspectNorm?.aspect} cu Marte`,
          value: aspectScore,
          contribution: `${aspectNorm?.aspect} cu Marte (orb: ${aspectNorm?.orb?.toFixed(1)}°): ${strength > 0 ? '+' : ''}${aspectContribution.toFixed(1)} = ${Math.round(aspectScore)}/100`,
        })
      }
    }
    aspectScore = Math.min(Math.max(aspectScore, 0), 100)
    weightedScore += aspectScore * weights.aspects

    // ========== FINAL CALCULATION ==========
    baseScore = Math.round(weightedScore)
    baseScore = Math.min(Math.max(baseScore, 0), 100)

    return {
      score: baseScore,
      percentage: baseScore,
      category: getScoreCategory(baseScore),
      factors,
      explanation: generateEnergyExplanation(baseScore, marsNorm),
    }
  } catch (error) {
    console.error('[v0] Error calculating energy score:', error)
    return {
      score: 50,
      percentage: 50,
      category: 'Potențial în Dezvoltare',
      factors: [],
      explanation: 'Calculul scorului de energie este în curs...',
    }
  }
}

// ============================================================================
// SUCCESS POTENTIAL SCORE CALCULATOR
// Weights: MC 25% | Jupiter 20% | Saturn 20% | Sun 15% | House X 10% | Aspects 10%
// ============================================================================
export function calculateSuccessScore(chartData: PlanetaryData): DetailedScore {
  const factors: ScoreFactor[] = []
  let baseScore = 50
  let weightedScore = 0
  const weights = { mc: 0.25, jupiter: 0.20, saturn: 0.20, sun: 0.15, houseX: 0.10, aspects: 0.10 }

  try {
    // ========== MIDHEAVEN ANALYSIS (25% weight) ==========
    const midheaven = chartData.midheaven
    let mcScore = 50
    if (midheaven?.sign) {
      const successSigns = ['Capricorn', 'Leo', 'Scorpio', 'Aries', 'Sagittarius']
      mcScore = successSigns.includes(midheaven.sign) ? 72 : 55
      
      factors.push({
        name: `MC în ${midheaven.sign}`,
        value: mcScore,
        contribution: `Mijlocul Cerului (succes) în ${midheaven.sign} = ${mcScore}/100`,
      })
    }
    weightedScore += mcScore * weights.mc

    // ========== JUPITER ANALYSIS (20% weight - Luck & Expansion) ==========
    const jupiter = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('jupiter')
    )
    const jupiterNorm = jupiter ? normalizePlanet(jupiter) : null

    let jupiterScore = 50
    if (jupiterNorm?.sign) {
      const dignity = getDignityBonus('Jupiter', jupiterNorm.sign)
      jupiterScore = 50 + (dignity.points * 2.4)
      
      factors.push({
        name: `Jupiter în ${jupiterNorm.sign}`,
        value: jupiterScore,
        contribution: `Jupiter (norocul) în ${jupiterNorm.sign} (${dignity.type}): ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${jupiterScore}/100`,
      })
    }
    jupiterScore = Math.min(Math.max(jupiterScore, 0), 100)
    weightedScore += jupiterScore * weights.jupiter

    // ========== SATURN ANALYSIS (20% weight - Discipline & Persistence) ==========
    const saturn = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('saturn')
    )
    const saturnNorm = saturn ? normalizePlanet(saturn) : null

    let saturnScore = 50
    if (saturnNorm?.sign) {
      const dignity = getDignityBonus('Saturn', saturnNorm.sign)
      saturnScore = 50 + (dignity.points * 2.2)
      
      factors.push({
        name: `Saturn în ${saturnNorm.sign}`,
        value: saturnScore,
        contribution: `Saturn (perseverență) în ${saturnNorm.sign} (${dignity.type}): ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${saturnScore}/100`,
      })
    }
    saturnScore = Math.min(Math.max(saturnScore, 0), 100)
    weightedScore += saturnScore * weights.saturn

    // ========== SUN ANALYSIS (15% weight - Will & Purpose) ==========
    const sun = chartData.planets?.find(p =>
      normalizePlanet(p).name?.toLowerCase().includes('sun')
    )
    const sunNorm = sun ? normalizePlanet(sun) : null

    let sunScore = 50
    if (sunNorm?.sign) {
      const dignity = getDignityBonus('Sun', sunNorm.sign)
      sunScore = 50 + (dignity.points * 2)
      
      factors.push({
        name: `Soare în ${sunNorm.sign}`,
        value: sunScore,
        contribution: `Soare (scop) în ${sunNorm.sign} (${dignity.type}): ${dignity.points > 0 ? '+' : ''}${dignity.points} puncte = ${sunScore}/100`,
      })
    }
    sunScore = Math.min(Math.max(sunScore, 0), 100)
    weightedScore += sunScore * weights.sun

    // ========== HOUSE X ANALYSIS (10% weight) ==========
    const house10Planets = chartData.planets?.filter(p => normalizePlanet(p).house === 10) || []
    let house10Score = 50
    if (house10Planets.length > 0) {
      house10Score = Math.min(50 + (house10Planets.length * 10), 100)
      factors.push({
        name: `Casa X activă`,
        value: house10Score,
        contribution: `Casa X conține ${house10Planets.length} planetă(e) = ${house10Score}/100`,
      })
    }
    weightedScore += house10Score * weights.houseX

    // ========== MAJOR ASPECTS (10% weight) ==========
    let aspectScore = 50
    const majorAspects = chartData.aspects?.filter(a => {
      const aspectNorm = normalizeAspect(a)
      const aspect = aspectNorm?.aspect?.toLowerCase() || ''
      return aspect.includes('trine') || aspect.includes('sextile')
    }) || []

    if (majorAspects.length > 0) {
      for (const aspect of majorAspects) {
        const aspectNorm = normalizeAspect(aspect)
        const { strength, weight } = getAspectStrength(aspectNorm?.aspect || '')
        const aspectContribution = strength * weight * 7
        
        aspectScore += aspectContribution
        factors.push({
          name: `${aspectNorm?.aspect}`,
          value: aspectScore,
          contribution: `${aspectNorm?.aspect} (orb: ${aspectNorm?.orb?.toFixed(1)}°): ${strength > 0 ? '+' : ''}${aspectContribution.toFixed(1)} = ${Math.round(aspectScore)}/100`,
        })
      }
    }
    aspectScore = Math.min(Math.max(aspectScore, 0), 100)
    weightedScore += aspectScore * weights.aspects

    // ========== FINAL CALCULATION ==========
    baseScore = Math.round(weightedScore)
    baseScore = Math.min(Math.max(baseScore, 0), 100)

    return {
      score: baseScore,
      percentage: baseScore,
      category: getScoreCategory(baseScore),
      factors,
      explanation: generateSuccessExplanation(baseScore, midheaven),
    }
  } catch (error) {
    console.error('[v0] Error calculating success score:', error)
    return {
      score: 50,
      percentage: 50,
      category: 'Potențial în Dezvoltare',
      factors: [],
      explanation: 'Calculul scorului de succes este în curs...',
    }
  }
}

// ============================================================================
// EXPLANATION GENERATORS FOR NEW SCORES
// ============================================================================
function generateIntelligenceExplanation(score: number, mercury: any): string {
  if (score >= 80) {
    return 'Harta ta arată o inteligență și claritate mentală excepționale. Mercur și poziția sa favorizează o comunicare precisă și o capacitate de învățare rapidă.'
  }
  if (score >= 60) {
    return 'Potențialul intelectual din harta ta este solid. Cu studiu și practică, poți dezvolta abilități de comunicare și gândire critică puternice.'
  }
  return 'Această zonă conține lecții importante și oportunități de creștere mentală. Dezvoltarea cognitivă este o călătorie continuă.'
}

function generateLeadershipExplanation(score: number, sun: any): string {
  if (score >= 80) {
    return 'Harta ta arată potențial de liderșip natural și o prezență puternică. Soarele și plantele din case unghiulare te echipează pentru a influența și conduce cu autoritate.'
  }
  if (score >= 60) {
    return 'Potențialul de liderșip din harta ta este în dezvoltare. Cu încredere și acțiune, poți cultiva abilități de conducere și influență.'
  }
  return 'Această zonă conține lecții importante asupra liderșipului și influenței. Fiecare experiență te dezvoltă ca persoană.'
}

function generateEnergyExplanation(score: number, mars: any): string {
  if (score >= 80) {
    return 'Harta ta arată o energie și vitalitate remarcabilă. Marte și plasamentul din casa I te dotează cu un dinamism și o reziliență puternică.'
  }
  if (score >= 60) {
    return 'Potențialul energetic din harta ta este bun. Îngrijit și channelat corect, energia ta poate realiza lucruri extraordinare.'
  }
  return 'Această zonă conține lecții despre stocajul și exprimarea energiei. Îmbunătățiri vor veni în timp.'
}

function generateSuccessExplanation(score: number, midheaven: any): string {
  if (score >= 80) {
    return 'Harta ta indică un potențial ridicat de succes și realizare. Jupiter, Saturn și MC formează o combinație favorabilă pentru reușită pe termen lung și prosperitate.'
  }
  if (score >= 60) {
    return 'Potențialul de succes din harta ta este real și accesibil. Cu obiective clare și dedicare, poți realiza obiective importante.'
  }
  return 'Această zonă conține lecții importante asupra succesului și realizării. Fiecare pas te apropie de obiectivele tale.'
}
