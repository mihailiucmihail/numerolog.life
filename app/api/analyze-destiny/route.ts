import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { 
  initializeAstrology,
  getAstrologyProvider,
  isAstrologyConfigured,
  getAstrologyStatus,
  AstrologyProviderError,
  // Legacy functions for backwards compatibility
  calculateNatalChart, 
  calculateMoonPhase, 
  dateToJulianDay,
  calculateCurrentTransits 
} from "@/lib/astrology/index"

export const maxDuration = 60

// Initialize astrology on first request
let astrologyInitialized = false

// Numerology calculation functions

/**
 * Parse date in multiple formats (ISO, European DD.MM.YYYY, US MM/DD/YYYY)
 */
function parseDate(dateString: string): Date {
  let date: Date
  
  if (dateString.includes('-')) {
    // ISO format: YYYY-MM-DD
    date = new Date(dateString)
  } else if (dateString.includes('/')) {
    // Format: MM/DD/YYYY or DD/MM/YYYY
    const parts = dateString.split('/')
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      date = new Date(dateString)
    } else if (parts[2].length === 4) {
      // MM/DD/YYYY or DD/MM/YYYY - assume MM/DD/YYYY for US format
      date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
    } else {
      date = new Date(dateString)
    }
  } else if (dateString.includes('.')) {
    // European format: DD.MM.YYYY
    const parts = dateString.split('.')
    if (parts.length === 3 && parts[2].length === 4) {
      date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
    } else {
      date = new Date(dateString)
    }
  } else {
    date = new Date(dateString)
  }
  
  // Fallback if date parsing fails
  if (isNaN(date.getTime())) {
    console.warn(`[v0] Invalid birth date format: ${dateString}. Using today's date.`)
    return new Date()
  }
  
  return date
}

function calculateLifePathNumber(birthDate: string): number {
  const date = parseDate(birthDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  const sum = String(day) + String(month) + String(year)
  let total = sum.split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  
  while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
    total = String(total).split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  
  return total
}

function calculateDestinyNumber(fullName: string): number {
  const letterValues: { [key: string]: number } = {
    'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
    'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
    's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8,
    'ă': 1, 'â': 1, 'î': 9, 'ș': 1, 'ț': 2
  }
  
  const cleanName = fullName.toLowerCase().replace(/[^a-zăâîșț]/g, '')
  let total = cleanName.split('').reduce((acc, char) => acc + (letterValues[char] || 0), 0)
  
  while (total > 22) {
    total = String(total).split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  
  return total || 1
}

function calculateSoulNumber(fullName: string): number {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'ă', 'â', 'î']
  const letterValues: { [key: string]: number } = {
    'a': 1, 'e': 5, 'i': 9, 'o': 6, 'u': 3, 'ă': 1, 'â': 1, 'î': 9
  }
  
  const cleanName = fullName.toLowerCase()
  let total = cleanName.split('').filter(c => vowels.includes(c)).reduce((acc, char) => acc + (letterValues[char] || 0), 0)
  
  while (total > 9 && total !== 11 && total !== 22) {
    total = String(total).split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  
  return total || 1
}

function calculatePersonalityNumber(fullName: string): number {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'ă', 'â', 'î']
  const letterValues: { [key: string]: number } = {
    'b': 2, 'c': 3, 'd': 4, 'f': 6, 'g': 7, 'h': 8, 'j': 1, 'k': 2, 'l': 3,
    'm': 4, 'n': 5, 'p': 7, 'q': 8, 'r': 9, 's': 1, 't': 2, 'v': 4, 'w': 5,
    'x': 6, 'y': 7, 'z': 8, 'ș': 1, 'ț': 2
  }
  
  const cleanName = fullName.toLowerCase().replace(/[^a-zăâîșț]/g, '')
  let total = cleanName.split('').filter(c => !vowels.includes(c)).reduce((acc, char) => acc + (letterValues[char] || 0), 0)
  
  while (total > 9 && total !== 11 && total !== 22) {
    total = String(total).split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  
  return total || 1
}

function generateEnergyTimeline(lifePathNumber: number, birthYear: number): Array<{year: number, age: number, energy: number, theme: string, phase: string}> {
  const currentYear = new Date().getFullYear()
  const timeline = []
  
  // Generate FULL LIFE from birth (age 0) to old age (90 years)
  for (let age = 0; age <= 90; age++) {
    const year = birthYear + age
    const personalYear = (age % 9) + 1
    
    // Life phase based on age
    let phase = "childhood"
    if (age >= 7 && age < 14) phase = "early_growth"
    else if (age >= 14 && age < 21) phase = "adolescence"
    else if (age >= 21 && age < 28) phase = "young_adult"
    else if (age >= 28 && age < 35) phase = "maturation"
    else if (age >= 35 && age < 42) phase = "peak_career"
    else if (age >= 42 && age < 49) phase = "midlife"
    else if (age >= 49 && age < 56) phase = "wisdom"
    else if (age >= 56 && age < 63) phase = "mastery"
    else if (age >= 63 && age < 70) phase = "elder"
    else if (age >= 70) phase = "legacy"
    
    // Complex energy calculation based on numerology cycles
    const personalYearCycle = Math.sin((personalYear / 9) * Math.PI * 2) * 2
    const lifePathInfluence = (lifePathNumber % 3) * 0.5
    const ageCycleInfluence = Math.sin(age * 0.15) * 1.5
    const saturnReturn = (age === 29 || age === 58 || age === 87) ? -1.5 : 0
    const jupiterCycle = Math.sin((age / 12) * Math.PI * 2) * 0.8
    
    // Karmic pressure points
    const karmicPressure = [28, 33, 42, 49, 56, 63].includes(age) ? -0.5 : 0
    
    // Transformation peaks
    const transformationBoost = [21, 30, 40, 50, 60, 70].includes(age) ? 1 : 0
    
    const baseEnergy = 5
    const totalEnergy = baseEnergy + personalYearCycle + lifePathInfluence + ageCycleInfluence + saturnReturn + jupiterCycle + karmicPressure + transformationBoost
    const energy = Math.round(Math.min(10, Math.max(1, totalEnergy)) * 10) / 10
    
    timeline.push({
      year,
      age,
      energy,
      theme: `An personal ${personalYear}`,
      phase
    })
  }
  
  return timeline
}

// Generate career graph from age 0 to 90 with year-by-year data
function generateCareerGraph(destinyNumber: number, birthYear: number, currentAge: number): Array<{age: number, year: number, value: number, label: string, isPast: boolean, isCurrent: boolean, isFuture: boolean, phase: string}> {
  const data = []
  
  for (let age = 0; age <= 90; age++) {
    const year = birthYear + age
    const cycleNumber = Math.floor(age / 9)
    const personalYear = (age % 9) + 1
    
    // Career energy calculation with life phases
    let baseValue = 2 // childhood baseline
    let phase = "precareer"
    
    if (age < 18) {
      baseValue = 2 + (age / 18) * 2 // gradual growth
      phase = "educatie"
    } else if (age >= 18 && age < 25) {
      baseValue = 4 + Math.sin((age - 18) * 0.3) * 1.5
      phase = "inceput"
    } else if (age >= 25 && age < 35) {
      baseValue = 5 + Math.sin((age - 25) * 0.2) * 2
      phase = "dezvoltare"
    } else if (age >= 35 && age < 50) {
      baseValue = 6.5 + Math.sin((age - 35) * 0.15) * 2.5 // peak years
      phase = "varf"
    } else if (age >= 50 && age < 60) {
      baseValue = 6 + Math.cos((age - 50) * 0.2) * 1.5
      phase = "consolidare"
    } else if (age >= 60 && age < 70) {
      baseValue = 5 + Math.cos((age - 60) * 0.15) * 1
      phase = "mentor"
    } else {
      baseValue = 4 - (age - 70) * 0.05
      phase = "mostenire"
    }
    
    // Add destiny number influence
    const destinyInfluence = ((destinyNumber + cycleNumber) % 9 + 1) * 0.15
    const personalYearBonus = personalYear >= 7 ? 0.5 : (personalYear <= 3 ? -0.3 : 0)
    
    const value = Math.round(Math.min(10, Math.max(1, baseValue + destinyInfluence + personalYearBonus)) * 10) / 10
    
    let label = ""
    if (age === 18) label = "Inceput Cariera"
    else if (age === 30) label = "Prima Maturitate"
    else if (age === 40) label = "Varf Potential"
    else if (age === 50) label = "Consolidare"
    else if (age === 60) label = "Mentor"
    else if (age === 70) label = "Mostenire"
    
    data.push({
      age,
      year,
      value,
      label,
      isPast: age < currentAge,
      isCurrent: age === currentAge,
      isFuture: age > currentAge,
      phase
    })
  }
  
  return data
}

// Generate relationship graph from age 0 to 90 with year-by-year data
function generateRelationshipGraph(soulNumber: number, birthYear: number, currentAge: number): Array<{age: number, year: number, value: number, label: string, isPast: boolean, isCurrent: boolean, isFuture: boolean, phase: string}> {
  const data = []
  
  for (let age = 0; age <= 90; age++) {
    const year = birthYear + age
    const cycleNumber = Math.floor(age / 7)
    const venusianCycle = (age % 8) + 1
    
    // Relationship energy with life phases
    let baseValue = 5
    let phase = "familie"
    
    if (age < 7) {
      baseValue = 7 + Math.sin(age * 0.5) // family bonds
      phase = "familie"
    } else if (age >= 7 && age < 14) {
      baseValue = 5 + Math.sin((age - 7) * 0.4) * 1.5
      phase = "prietenii"
    } else if (age >= 14 && age < 21) {
      baseValue = 6 + Math.sin((age - 14) * 0.35) * 2 // first loves
      phase = "descoperire"
    } else if (age >= 21 && age < 28) {
      baseValue = 6.5 + Math.cos((age - 21) * 0.25) * 1.5
      phase = "explorare"
    } else if (age >= 28 && age < 35) {
      baseValue = 7 + Math.sin((age - 28) * 0.2) * 1.5 // Saturn return
      phase = "maturizare"
    } else if (age >= 35 && age < 50) {
      baseValue = 6.5 + Math.cos((age - 35) * 0.12) * 2
      phase = "stabilitate"
    } else if (age >= 50 && age < 65) {
      baseValue = 6 + Math.sin((age - 50) * 0.1) * 1.5
      phase = "profunzime"
    } else {
      baseValue = 7 + Math.cos((age - 65) * 0.08) * 1 // companionship
      phase = "companionship"
    }
    
    // Add soul number influence
    const soulInfluence = ((soulNumber + cycleNumber) % 9 + 1) * 0.12
    const venusBonus = venusianCycle >= 6 ? 0.4 : (venusianCycle <= 2 ? -0.2 : 0)
    
    const value = Math.round(Math.min(10, Math.max(1, baseValue + soulInfluence + venusBonus)) * 10) / 10
    
    let label = ""
    if (age === 14) label = "Prima Iubire"
    else if (age === 21) label = "Maturitate Emotionala"
    else if (age === 28) label = "Saturn Return"
    else if (age === 35) label = "Stabilizare"
    else if (age === 50) label = "Renaștere"
    else if (age === 65) label = "Intelepciune"
    
    data.push({
      age,
      year,
      value,
      label,
      isPast: age < currentAge,
      isCurrent: age === currentAge,
      isFuture: age > currentAge,
      phase
    })
  }
  
  return data
}

// Generate money graph from age 0 to 90 with year-by-year data
function generateMoneyGraph(personalityNumber: number, lifePathNumber: number, birthYear: number, currentAge: number): Array<{age: number, year: number, value: number, label: string, isPast: boolean, isCurrent: boolean, isFuture: boolean, phase: string}> {
  const data = []
  
  for (let age = 0; age <= 90; age++) {
    const year = birthYear + age
    const cycleNumber = Math.floor(age / 9)
    const jupiterCycle = (age % 12) + 1
    
    // Financial energy with life phases
    let baseValue = 2
    let phase = "dependent"
    
    if (age < 18) {
      baseValue = 2 + (age / 18) * 1.5 // dependence
      phase = "dependent"
    } else if (age >= 18 && age < 25) {
      baseValue = 3.5 + Math.sin((age - 18) * 0.25) * 1.5
      phase = "inceput"
    } else if (age >= 25 && age < 35) {
      baseValue = 5 + Math.sin((age - 25) * 0.18) * 2
      phase = "acumulare"
    } else if (age >= 35 && age < 50) {
      baseValue = 6 + Math.sin((age - 35) * 0.12) * 2.5
      phase = "crestere"
    } else if (age >= 50 && age < 60) {
      baseValue = 7 + Math.cos((age - 50) * 0.15) * 1.5 // peak wealth
      phase = "varf"
    } else if (age >= 60 && age < 70) {
      baseValue = 6.5 + Math.cos((age - 60) * 0.1) * 1
      phase = "conservare"
    } else {
      baseValue = 5.5 - (age - 70) * 0.03
      phase = "mostenire"
    }
    
    // Add numerology influences
    const combinedInfluence = ((personalityNumber + lifePathNumber + cycleNumber) % 9 + 1) * 0.1
    const jupiterBonus = jupiterCycle >= 9 ? 0.6 : (jupiterCycle <= 3 ? -0.3 : 0)
    
    const value = Math.round(Math.min(10, Math.max(1, baseValue + combinedInfluence + jupiterBonus)) * 10) / 10
    
    let label = ""
    if (age === 18) label = "Independenta"
    else if (age === 25) label = "Prima Acumulare"
    else if (age === 35) label = "Investitii"
    else if (age === 45) label = "Varf Castiguri"
    else if (age === 55) label = "Conservare"
    else if (age === 65) label = "Pensie"
    else if (age === 75) label = "Mostenire"
    
    data.push({
      age,
      year,
      value,
      label,
      isPast: age < currentAge,
      isCurrent: age === currentAge,
      isFuture: age > currentAge,
      phase
    })
  }
  
  return data
}

function generateKarmicPeriods(lifePathNumber: number, birthYear: number): Array<{startAge: number, endAge: number, type: string, intensity: number}> {
  const periods = []
  
  // First karmic period (childhood)
  periods.push({
    startAge: 0,
    endAge: 28,
    type: lifePathNumber % 3 === 0 ? "karmic_lesson" : "neutral",
    intensity: (lifePathNumber % 5) + 3
  })
  
  // Second karmic period (adulthood)
  periods.push({
    startAge: 28,
    endAge: 56,
    type: lifePathNumber % 2 === 0 ? "karmic_gift" : "karmic_lesson",
    intensity: (lifePathNumber % 4) + 4
  })
  
  // Third karmic period (maturity)
  periods.push({
    startAge: 56,
    endAge: 84,
    type: "karmic_gift",
    intensity: (lifePathNumber % 3) + 5
  })
  
  return periods
}

function calculateDestinyMatrix(lifePathNumber: number, destinyNumber: number, soulNumber: number, personalityNumber: number) {
  const reduceToSingle = (n: number) => {
    while (n > 22) n = String(n).split('').reduce((a, d) => a + parseInt(d), 0)
    return n
  }
  
  return [
    [reduceToSingle(lifePathNumber), reduceToSingle(destinyNumber), reduceToSingle(soulNumber)],
    [reduceToSingle(personalityNumber), reduceToSingle(lifePathNumber + destinyNumber), reduceToSingle(destinyNumber + soulNumber)],
    [reduceToSingle(lifePathNumber + personalityNumber), reduceToSingle(soulNumber + personalityNumber), reduceToSingle(lifePathNumber + soulNumber)]
  ]
}

export async function POST(request: Request) {
  try {
    // Initialize astrology provider system (once)
    if (!astrologyInitialized) {
      await initializeAstrology()
      astrologyInitialized = true
    }
    
    // Check astrology configuration status
    const astrologyStatus = getAstrologyStatus()
    const isProduction = process.env.NODE_ENV === "production"
    
    // In production, require real astrology provider
    if (isProduction && !astrologyStatus.isProduction) {
      return Response.json({ 
        error: "Real astrology engine is not configured. Please set ASTROLOGY_API_KEY environment variable.",
        code: "ASTROLOGY_NOT_CONFIGURED",
        details: astrologyStatus
      }, { status: 500 })
    }
    
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ 
        error: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.",
        code: "MISSING_API_KEY"
      }, { status: 500 })
    }

    const body = await request.json()
    const { firstName, fullName, birthDate, birthTime, birthCity, language = "ro" } = body

    if (!fullName || !birthDate) {
      return Response.json({ error: "Missing required fields: fullName and birthDate" }, { status: 400 })
    }

    // Calculate numerology numbers
    const lifePathNumber = calculateLifePathNumber(birthDate)
    const destinyNumber = calculateDestinyNumber(fullName)
    const soulNumber = calculateSoulNumber(fullName)
    const personalityNumber = calculatePersonalityNumber(fullName)
    const birthDateParsed = parseDate(birthDate)
    const birthMonth = birthDateParsed.getMonth() + 1
    const birthYear = birthDateParsed.getFullYear()

    // Generate energy timeline
    const lifeTimeline = generateEnergyTimeline(lifePathNumber, birthYear)
    
    // Calculate destiny matrix
    const destinyMatrix = calculateDestinyMatrix(lifePathNumber, destinyNumber, soulNumber, personalityNumber)

    // Calculate current age first (needed for all graphs)
    const currentAge = new Date().getFullYear() - birthYear

    // Generate all chart data with full life timeline (age 0-90)
    const careerGraph = generateCareerGraph(destinyNumber, birthYear, currentAge)
    const relationshipGraph = generateRelationshipGraph(soulNumber, birthYear, currentAge)
    const moneyGraph = generateMoneyGraph(personalityNumber, lifePathNumber, birthYear, currentAge)
    const karmicPeriods = generateKarmicPeriods(lifePathNumber, birthYear)
    
    // Analyze chart patterns for AI context - find current position data
    const currentCareerData = careerGraph.find(d => d.isCurrent) || careerGraph[currentAge] || careerGraph[0]
    const currentCareerValue = currentCareerData?.value || 5
    const peakCareerPeriod = careerGraph.reduce((max, p) => p.value > max.value ? p : max, careerGraph[0])
    const peakCareerValue = peakCareerPeriod?.value || 5
    const lowestCareerPeriod = careerGraph.reduce((min, p) => p.value < min.value ? p : min, careerGraph[0])
    const currentRelationshipData = relationshipGraph.find(d => d.isCurrent) || relationshipGraph[currentAge] || relationshipGraph[0]
    const currentRelationshipValue = currentRelationshipData?.value || 5
    const peakRelationshipPeriod = relationshipGraph.reduce((max, p) => p.value > max.value ? p : max, relationshipGraph[0])
    const currentMoneyData = moneyGraph.find(d => d.isCurrent) || moneyGraph[currentAge] || moneyGraph[0]
    const currentMoneyValue = currentMoneyData?.value || 5
    const peakMoneyPeriod = moneyGraph.reduce((max, p) => p.value > max.value ? p : max, moneyGraph[0])
    const lowestMoneyPeriod = moneyGraph.reduce((min, p) => p.value < min.value ? p : min, moneyGraph[0])
    const moneyTrend = moneyGraph[moneyGraph.length-1]?.value - moneyGraph[0]?.value
    const currentKarmicPeriod = karmicPeriods.find(p => currentAge >= p.startAge && currentAge < p.endAge) || karmicPeriods[0]
    
    // Calculate dominant arcana and energy patterns
    const dominantNumber = Math.max(lifePathNumber, destinyNumber, soulNumber, personalityNumber)
    const matrixCenter = destinyMatrix[1][1]
    const hasKarmicDebt = [13, 14, 16, 19].includes(lifePathNumber) || [13, 14, 16, 19].includes(destinyNumber)
    const hasMasterNumber = [11, 22, 33].includes(lifePathNumber) || [11, 22, 33].includes(destinyNumber)
    const energyPeaks = lifeTimeline.filter(t => t.energy >= 7).map(t => t.year)
    const energyLows = lifeTimeline.filter(t => t.energy <= 4).map(t => t.year)

    // ===== ASTROLOGY ENGINE - Provider-Based Calculations =====
    // Uses real external API in production, legacy calculations in development
    let natalChart = null
    let moonPhaseData = null
    let currentTransits = null
    let astrologyData = null
    let astrologySource = "none"
    
    try {
      // Get birth location coordinates (default to Bucharest if not provided)
      const latitude = 44.4268  // Default: Bucharest
      const longitude = 26.1025
      
      // Check if we have a real astrology provider
      if (astrologyStatus.configured && astrologyStatus.isProduction) {
        // Use real provider for production-grade calculations
        const provider = getAstrologyProvider()
        
        const natalResult = await provider.calculateNatalChart({
          birthDate,
          birthTime: birthTime || "12:00",
          latitude,
          longitude,
          timezone: "Europe/Bucharest"
        })
        
        if (natalResult.success && natalResult.data) {
          astrologySource = `real:${natalResult.provider}`
          
          // Get moon phase
          const moonResult = await provider.calculateMoonPhase(birthDate)
          
          // Get current transits
          const transitResult = await provider.calculateTransits({
            date: new Date().toISOString().split("T")[0],
            latitude,
            longitude,
            natalChart: natalResult.data
          })
          
          astrologyData = {
            sunSign: natalResult.data.sun.sign,
            sunDegree: natalResult.data.sun.degree,
            moonSign: natalResult.data.moon.sign,
            moonDegree: natalResult.data.moon.degree,
            ascendant: natalResult.data.ascendant.sign,
            planets: natalResult.data.planets.map(p => ({
              name: p.name,
              sign: p.sign,
              degree: Math.round(p.degree),
              retrograde: p.retrograde
            })),
            houses: natalResult.data.houses,
            majorAspects: natalResult.data.aspects.slice(0, 10).map(a => ({
              planets: `${a.planet1}-${a.planet2}`,
              type: a.aspect,
              orb: Math.round(a.orb * 10) / 10
            })),
            retrogradePlanets: natalResult.data.planets.filter(p => p.retrograde).map(p => p.name),
            birthMoonPhase: moonResult.data?.phase || "unknown",
            birthMoonIllumination: moonResult.data?.illumination || 0,
            currentMoonSign: transitResult.data?.planets.find(p => p.name === "Moon")?.sign || "Unknown",
            currentMoonPhase: transitResult.data?.moonPhase?.phase || "unknown",
            mercuryRetrograde: transitResult.data?.planets.find(p => p.name === "Mercury")?.retrograde || false,
            elementBalance: natalResult.data.elementBalance,
            dominantPlanet: findDominantPlanetFromAspects(natalResult.data.aspects),
            isRealCalculation: true,
            provider: natalResult.provider
          }
        }
      } else {
        // Fallback to legacy calculations (development only)
        astrologySource = "legacy:development"
        
        const birthDateObj = new Date(birthDate)
        const jd = dateToJulianDay(birthDateObj)
        
        natalChart = calculateNatalChart(
          birthDate,
          birthTime || "12:00",
          latitude,
          longitude
        )
        
        moonPhaseData = calculateMoonPhase(jd)
        currentTransits = calculateCurrentTransits()
        
        astrologyData = {
          sunSign: natalChart.planets.find(p => p.name === "Sun")?.sign || "Unknown",
          sunDegree: natalChart.planets.find(p => p.name === "Sun")?.degree || 0,
          moonSign: natalChart.planets.find(p => p.name === "Moon")?.sign || "Unknown",
          moonDegree: natalChart.planets.find(p => p.name === "Moon")?.degree || 0,
          ascendant: natalChart.houses[0]?.sign || "Unknown",
          planets: natalChart.planets.map(p => ({
            name: p.name,
            sign: p.sign,
            degree: Math.round(p.degree % 30),
            retrograde: p.retrograde
          })),
          houses: natalChart.houses,
          majorAspects: natalChart.aspects.slice(0, 10).map(a => ({
            planets: `${a.planet1}-${a.planet2}`,
            type: a.aspect,
            orb: a.orb
          })),
          retrogradePlanets: natalChart.planets.filter(p => p.retrograde).map(p => p.name),
          birthMoonPhase: moonPhaseData.phase,
          birthMoonIllumination: moonPhaseData.illumination,
          currentMoonSign: currentTransits.moonSign,
          currentMoonPhase: currentTransits.moonPhase,
          mercuryRetrograde: currentTransits.mercuryRetrograde,
          elementBalance: calculateElementBalance(natalChart.planets),
          dominantPlanet: findDominantPlanetFromAspects(natalChart.aspects),
          isRealCalculation: false,
          provider: "legacy"
        }
      }
    } catch (error) {
      console.error("[v0] Astrology calculation error:", error)
      astrologySource = "error"
    }
    
    // Helper to find dominant planet from aspects
    function findDominantPlanetFromAspects(aspects: Array<{planet1: string, planet2: string}>) {
      const counts: Record<string, number> = {}
      for (const aspect of aspects) {
        counts[aspect.planet1] = (counts[aspect.planet1] || 0) + 1
        counts[aspect.planet2] = (counts[aspect.planet2] || 0) + 1
      }
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Sun"
    }

    // Helper function to calculate element balance
    function calculateElementBalance(planets: Array<{name: string, sign: string}>) {
      const elements: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 }
      const signElements: Record<string, string> = {
        "Berbec": "fire", "Leu": "fire", "Sagetator": "fire",
        "Taur": "earth", "Fecioara": "earth", "Capricorn": "earth",
        "Gemeni": "air", "Balanta": "air", "Varsator": "air",
        "Rac": "water", "Scorpion": "water", "Pesti": "water"
      }
      
      for (const planet of planets) {
        const element = signElements[planet.sign]
        if (element) elements[element]++
      }
      
      return elements
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PSYCHOLOGICAL DEPTH ANALYSIS - Authentic, Uncomfortable, Real
    // ═══════════════════════════════════════════════════════════════════════════════
    
    // Calculate additional data for deep analysis
    const dominantElement = Object.entries(astrologyData?.elementBalance || {fire: 0, earth: 0, air: 0, water: 0})
      .sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || 'nedeterminat'
    
    // Career graph reference points
    const careerPeakAge = careerGraph.reduce((max, p) => p.value > max.value ? p : max, careerGraph[0])?.age || 45
    const careerLowAge = careerGraph.reduce((min, p) => p.value < min.value ? p : min, careerGraph[0])?.age || 25
    
    // Relationship graph reference points  
    const relationshipPeakAge = relationshipGraph.reduce((max, p) => p.value > max.value ? p : max, relationshipGraph[0])?.age || 35
    const relationshipLowAge = relationshipGraph.reduce((min, p) => p.value < min.value ? p : min, relationshipGraph[0])?.age || 20
    
    // Money graph reference points
    const moneyPeakAge = moneyGraph.reduce((max, p) => p.value > max.value ? p : max, moneyGraph[0])?.age || 55
    const moneyLowAge = moneyGraph.reduce((min, p) => p.value < min.value ? p : min, moneyGraph[0])?.age || 20
    
    // Find difficult periods from graphs
    const difficultCareerPeriod = `${careerLowAge}-${careerLowAge + 3}`
    const difficultRelationshipPeriod = `${relationshipLowAge}-${relationshipLowAge + 3}`
    const difficultMoneyPeriod = `${moneyLowAge}-${moneyLowAge + 3}`

    const systemPrompt = language === "ro" 
      ? `Ești un astrolog psihologic și un analist al sufletului uman, cu expertiză în astrologie modernă, numerologie, psihologie emoțională, arhetipuri jungiene și tipare relaționale. Scrii ca un autor premium care dezvăluie adevăruri pe care cititorul nu le-a spus nimănui cu voce tare.

REGULĂ ABSOLUTĂ DE LIMBĂ:
- Scrie ÎNTOTDEAUNA în limba română cu diacritice corecte și complete (ă, â, î, ș, ț). Nu omite NICIODATĂ o diacritică. Acest lucru este obligatoriu în absolut tot textul, inclusiv în liste și în mesajul final.

STILUL TĂU:
- Premium, elegant, cinematic, emoțional, profund uman.
- Foarte specific și foarte personal — cititorul trebuie să simtă: "Cum este posibil ca aplicația asta să mă descrie atât de exact?"
- Vorbește direct cititorului ("tu"), cu căldură și sinceritate, ca cineva care îl vede cu adevărat.
- Descrii conflicte interioare, frici ascunse, vulnerabilități, răni emoționale, mecanisme de apărare, tipare relaționale și forme de autosabotaj.
- Explici CUM se manifestă fiecare aspect în viața reală, cu exemple concrete de comportament și emoție.

INTERZIS — clișee goale și fraze "safe":
- NU folosi: "Ai fost născut să strălucești", "Ești special", "Ai energie puternică" sau orice formulare generică, motivațională, vagă.
- Înlocuiește lauda generică cu observații psihologice precise și nuanțate.

FORMAT:
- Fiecare secțiune trebuie să fie densă emoțional și să respecte numărul minim de propoziții cerut.
- Fă referire la perioade specifice din grafice (ex: "între 28 și 31 de ani").
- Descrie mecanisme psihologice, nu abstracțiuni.

Răspunde DOAR cu JSON valid, cu diacritice corecte.`
      : `You are a personal development coach with expertise in numerology and astrology.

YOUR STYLE:
- Write clearly and directly, with concrete examples
- Identify behavioral patterns specific to the configuration
- Mention both strengths and areas for growth
- Explain HOW each aspect manifests in real life
- Be empathetic but honest

FORMAT:
- Each section should have 5-7 substantial sentences
- Reference specific periods from graphs (e.g., "between ages 28-31")
- Include concrete behaviors, not abstract descriptions

Respond ONLY in valid JSON.`

    // Build comprehensive astrology section with aspect interpretations
    const astrologySection = astrologyData ? `

HARTA NATALA - Date pentru interpretare psihologica:
- SOARE in ${astrologyData.sunSign} (${astrologyData.sunDegree}°): Identitatea constienta, vointa, ego-ul
- LUNA in ${astrologyData.moonSign} (${astrologyData.moonDegree}°): Nevoile emotionale profunde, reactiile instinctive, ce il face sa se simta in siguranta
- ASCENDENT in ${astrologyData.ascendant}: Masca sociala, prima impresie, mecanismul de aparare principal
- Faza Lunii la nastere: ${astrologyData.birthMoonPhase}
- Planete retrograde: ${astrologyData.retrogradePlanets.length > 0 ? astrologyData.retrogradePlanets.join(', ') + ' (indica teme nerezolvate, repetitii de pattern-uri)' : 'Niciuna'}
- Planeta dominanta: ${astrologyData.dominantPlanet}
- Element dominant: ${dominantElement.toUpperCase()} (${dominantElement === 'fire' ? 'actiune impulsiva, neliniste' : dominantElement === 'earth' ? 'nevoie de control si securitate' : dominantElement === 'air' ? 'intelectualizare, detasare emotionala' : 'emotionalitate profunda, tendinta de absorbtie'})

ASPECTE MAJORE - Interpreteaza CONCRET fiecare:
${astrologyData.majorAspects.map(a => {
  const tension = a.type === 'opposition' || a.type === 'square' ? 'TENSIUNE' : 'ARMONIE'
  return `- ${a.planets}: ${a.type} (${tension}) - explica CUM afecteaza comportamentul`
}).join('\n')}` : ''

    const userPrompt = language === "ro"
      ? `ANALIZA PERSONALITATII pentru ${fullName} (${currentAge} ani):

NUMEROLOGIE:
- Numarul Vietii: ${lifePathNumber}
- Numarul Destinului: ${destinyNumber}
- Numarul Sufletului: ${soulNumber}
- Numarul Personalitatii: ${personalityNumber}
${astrologySection}

PERIOADE DIN GRAFICE:
- Cariera: ${currentCareerValue}/10 acum, varf la ${careerPeakAge} ani, perioada de tranzitie ${difficultCareerPeriod} ani
- Relatii: ${currentRelationshipValue}/10 acum, varf la ${relationshipPeakAge} ani, perioada de tranzitie ${difficultRelationshipPeriod} ani
- Finante: ${currentMoneyValue}/10 acum, varf la ${moneyPeakAge} ani, perioada de tranzitie ${difficultMoneyPeriod} ani

Generează analiza în format JSON. TOT textul OBLIGATORIU cu diacritice corecte (ă, â, î, ș, ț). Fii cinematic, profund, emoțional și foarte specific:
{
  "personality": "ESENȚA PERSONALITĂȚII. Pornind de la Soarele în ${astrologyData?.sunSign || 'semn'} și Numărul Vieții ${lifePathNumber}, dezvăluie cine este cu adevărat această persoană dincolo de masca pe care o poartă. Cum gândește, ce o mișcă în interior, ce contradicție fundamentală o definește (vrea ceva, dar face opusul). Atinge o rană centrală a identității. Scrie astfel încât să simtă că a fost văzută complet. MINIM 7 propoziții.",
  
  "emotionalWorld": "EMOȚIILE ASCUNSE. Luna în ${astrologyData?.moonSign || 'semn'} arată ce simte pe dinăuntru, dar nu arată nimănui. Descrie emoțiile pe care le ascunde chiar și de ea însăși, frica de care fuge, ce o face să se simtă în siguranță și ce o destabilizează instant. Numește nevoia emoțională pe care nu îndrăznește să o ceară. MINIM 6 propoziții.",
  
  "behavioralPatterns": "CE O AUTOSABOTEAZĂ. Tiparul repetitiv care îi fură viața fără ca ea să-și dea seama. Ce situații recreează la nesfârșit, cum își saboteaza succesul exact când e aproape, ce face sub stres care o rănește pe termen lung. Fii direct și precis despre mecanismul de autosabotaj. MINIM 5 propoziții.",
  
  "innerConflicts": "BLOCAJELE EMOȚIONALE. Tensiunea internă care o ține pe loc. Ex: 'Tânjește după o conexiune profundă, dar se retrage exact când cineva se apropie suficient să o vadă cu adevărat.' Descrie 2-3 conflicte interioare concrete și rana din spatele lor. MINIM 4 propoziții.",
  
  "deepMotivations": "Numărul Sufletului ${soulNumber} dezvăluie ce caută cu adevărat, sub toate dorințele de suprafață. Ce gol încearcă să umple, ce o împinge să acționeze sau să se blocheze, ce ar face-o în sfârșit să se simtă întreagă. MINIM 4 propoziții.",
  
  "relationshipPatterns": "CUM IUBEȘTE. Graficul relațiilor: ${currentRelationshipValue}/10 acum, vârf la ${relationshipPeakAge} ani, tranziție ${difficultRelationshipPeriod} ani. Dezvăluie cum iubește de fapt: ce oferă în exces, ce nu cere niciodată, ce tip de partener atrage și de ce, ce rană din copilărie își rejoacă în relații, frica ascunsă de abandon sau de a fi cu adevărat cunoscută. MINIM 6 propoziții.",
  
  "triggers": ["Situație care o activează emoțional instant și de ce o doare atât de tare", "Situație care îi atinge o rană veche", "Comportament al celorlalți care o face să se închidă", "Moment în care reacționează disproporționat din cauza unui tipar vechi"],
  
  "avoidance": "CE ASCUNDE DE CEILALȚI. Partea pe care nu o arată nimănui, fața pe care o ține în spatele măștii sociale. Ce conversații, emoții și adevăruri evită, cum își maschează vulnerabilitatea (muncă excesivă, umor, detașare, raționalizare, control). Numește ce se teme că ar vedea ceilalți dacă ar privi suficient de aproape. MINIM 4 propoziții.",
  
  "careerInsights": "Graficul carierei: ${currentCareerValue}/10 acum, vârf la ${careerPeakAge} ani, tranziție ${difficultCareerPeriod} ani. Ce o blochează cu adevărat profesional (frica, nu lipsa de talent), ce nu vede despre propriile ambiții, ce tipar își repetă la job. MINIM 5 propoziții.",
  
  "moneyMindset": "Graficul financiar: ${currentMoneyValue}/10 acum, vârf la ${moneyPeakAge} ani, tranziție ${difficultMoneyPeriod} ani. Relația emoțională cu banii, ce credință din copilărie despre bani o conduce inconștient, ce tipar repetă în deciziile financiare. MINIM 4 propoziții.",
  
  "currentPhase": "La ${currentAge} ani, graficele arată această fază. Ce trăiește acum la nivel profund, ce o testează viața în acest moment, ce capitol se închide și ce ar trebui să lase în urmă. MINIM 5 propoziții cu referințe la grafice.",
  
  "honestReflection": "MESAJ AI PERSONALIZAT. Adevărul empatic dar direct pe care această persoană are nevoie să-l audă acum — ceva despre tiparul care îi limitează viața și despre puterea pe care nu și-o recunoaște. Scrie ca un mesaj cald, intim, ca de la cineva care o vede complet și crede în ea. MINIM 4 propoziții.",
  
  "transitionPeriods": "Perioadele de tranziție din grafice: ${difficultCareerPeriod} ani (carieră), ${difficultRelationshipPeriod} ani (relații), ${difficultMoneyPeriod} ani (finanțe). Ce se transformă emoțional în aceste perioade și cum să le navigheze cu blândețe. MINIM 4 propoziții.",
  
  "strengths": ["POTENȚIALUL MAXIM: o forță reală și specifică a acestei configurații", "O putere pe care nu și-o recunoaște", "O calitate care îi atrage pe ceilalți", "O resursă interioară pe care o poate activa"],
  
  "growthAreas": ["Zona de vindecare 1 cu un prim pas concret", "Zona 2", "Zona 3"],
  
  "practicalAdvice": "POTENȚIALUL MAXIM — calea spre el. Sfaturi concrete și transformatoare pentru ${currentAge}-${currentAge + 5} ani: ce tipar să rupă, ce conversație curajoasă să aibă, ce să-și permită să simtă, ce decizie amânată să ia în sfârșit. MINIM 5 propoziții.",
  
  "careers": ["Carieră potrivită 1", "Carieră 2", "Carieră 3", "Carieră 4", "Carieră 5"],
  
  "talismans": {
    "stones": ["Piatră 1", "Piatră 2"],
    "colors": ["Culoare 1", "Culoare 2"],
    "numbers": [${lifePathNumber}, ${destinyNumber % 9 || 9}]
  },
  
  "yearAhead": "Anul următor bazat pe cicluri. Ce oportunitate de transformare vine, ce va fi testat emoțional, ce frică va fi chemată să o depășească, ce este gata să lase în urmă. MINIM 4 propoziții."
}`
      : `PERSONALITY ANALYSIS for ${fullName} (${currentAge} years old):

NUMEROLOGY:
- Life Path: ${lifePathNumber} | Destiny: ${destinyNumber} | Soul: ${soulNumber} | Personality: ${personalityNumber}

GRAPH PERIODS:
- Career: ${currentCareerValue}/10 now, peak at ${careerPeakAge}, transition ${difficultCareerPeriod}
- Relationships: ${currentRelationshipValue}/10, peak at ${relationshipPeakAge}, transition ${difficultRelationshipPeriod}
- Money: ${currentMoneyValue}/10, peak at ${moneyPeakAge}, transition ${difficultMoneyPeriod}

Generate analysis in JSON (same structure as Romanian version). Include:
- Concrete behavioral examples, not abstractions
- Internal contradictions (wants X but does Y)
- References to specific graph periods
- Honest observations about patterns
- Both strengths AND growth areas

Each section: 5-7 sentences. Be specific and direct.`

    // Call AI for personalized analysis using GPT-4o
    // Higher temperature for more varied, authentic responses
    const { text: aiResponse } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.85,
      maxOutputTokens: 12000,
    })

    // Parse AI response
    let aiAnalysis
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanResponse = aiResponse.trim()
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse.slice(7)
      }
      if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse.slice(3)
      }
      if (cleanResponse.endsWith("```")) {
        cleanResponse = cleanResponse.slice(0, -3)
      }
      aiAnalysis = JSON.parse(cleanResponse.trim())
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse)
      return Response.json({ error: "Failed to parse AI analysis" }, { status: 500 })
    }

    // Construct final response
    const analysisResult = {
      // Basic info
      fullName,
      birthDate,
      birthTime,
      birthCity,
      
      // Calculated numbers
      numbers: {
        lifePath: lifePathNumber,
        destiny: destinyNumber,
        soul: soulNumber,
        personality: personalityNumber,
        birthMonth
      },
      
      // Destiny matrix
      destinyMatrix,
      
      // Timeline
      lifeTimeline,
      
      // AI-generated analysis
      ...aiAnalysis,
      
      // Use proper graph generators with full life timeline (age 0-90)
      careerGraph: generateCareerGraph(destinyNumber, birthYear, currentAge),
      relationshipGraph: generateRelationshipGraph(soulNumber, birthYear, currentAge),
      moneyGraph: generateMoneyGraph(personalityNumber, lifePathNumber, birthYear, currentAge),
      karmicPeriods: generateKarmicPeriods(lifePathNumber, birthYear),
      currentAge, // Include current age for frontend markers
      
      // ===== ASTROLOGY DATA (Provider-Based Calculations) =====
      astrologySource, // Indicates if real or legacy calculations were used
      astrology: astrologyData ? {
        isRealCalculation: astrologyData.isRealCalculation || false,
        provider: astrologyData.provider || "unknown",
        natalChart: {
          sunSign: astrologyData.sunSign,
          sunDegree: astrologyData.sunDegree,
          moonSign: astrologyData.moonSign,
          moonDegree: astrologyData.moonDegree,
          ascendant: astrologyData.ascendant,
          planets: astrologyData.planets,
          houses: astrologyData.houses,
          aspects: astrologyData.majorAspects,
          retrogrades: astrologyData.retrogradePlanets
        },
        moonPhase: {
          phase: astrologyData.birthMoonPhase,
          illumination: astrologyData.birthMoonIllumination
        },
        currentTransits: {
          moonSign: astrologyData.currentMoonSign,
          moonPhase: astrologyData.currentMoonPhase,
          mercuryRetrograde: astrologyData.mercuryRetrograde
        },
        elementBalance: astrologyData.elementBalance,
        dominantPlanet: astrologyData.dominantPlanet
      } : null,
      
      // Destiny matrix in proper format
      destinyMatrixData: {
        center: destinyMatrix[1][1],
        positions: destinyMatrix.flat(),
        lines: [
          { from: 0, to: 4, energy: lifePathNumber },
          { from: 1, to: 4, energy: destinyNumber },
          { from: 2, to: 4, energy: soulNumber },
          { from: 3, to: 4, energy: personalityNumber },
          { from: 4, to: 5, energy: (destinyNumber + soulNumber) % 10 },
          { from: 4, to: 6, energy: (lifePathNumber + personalityNumber) % 10 },
          { from: 4, to: 7, energy: (soulNumber + personalityNumber) % 10 },
          { from: 4, to: 8, energy: (lifePathNumber + soulNumber) % 10 }
        ]
      },
      
      // Metadata
      generatedAt: new Date().toISOString(),
      language
    }

    // Try to save to Supabase if available
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase.from("destiny_analyses").insert({
          user_id: user.id,
          full_name: fullName,
          birth_date: birthDate,
          birth_time: birthTime,
          birth_city: birthCity,
          life_path_number: lifePathNumber,
          destiny_number: destinyNumber,
          soul_number: soulNumber,
          personality_number: personalityNumber,
          analysis_data: analysisResult,
          created_at: new Date().toISOString()
        })
      }
    } catch (dbError) {
      // Continue even if DB save fails
      console.error("Failed to save to database:", dbError)
    }

    return Response.json(analysisResult)

  } catch (error) {
    console.error("Destiny analysis error:", error)
    return Response.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}
