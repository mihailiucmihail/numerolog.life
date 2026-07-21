/**
 * Mock Astrology Provider - FOR DEVELOPMENT ONLY
 * 
 * This provider generates approximate astrology data for testing purposes.
 * It MUST NOT be used in production.
 * 
 * When this provider is active, the UI should show a clear warning:
 * "Development mode - Using approximate astrology calculations"
 */

import type { 
  IAstrologyProvider,
  NatalChartInput,
  TransitInput,
  SynastryInput,
  ProviderResponse
} from "./provider"

import type {
  NatalChartData,
  TransitData,
  SynastryData,
  MoonPhaseData
} from "./types"

const ZODIAC_SIGNS = [
  "Berbec", "Taur", "Gemeni", "Rac", "Leu", "Fecioara",
  "Balanta", "Scorpion", "Sagetator", "Capricorn", "Varsator", "Pesti"
]

const PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
]

export class MockAstrologyProvider implements IAstrologyProvider {
  readonly name = "mock-development"
  readonly isProduction = false // IMPORTANT: This marks it as non-production
  
  async initialize(): Promise<boolean> {
    console.warn("[MockAstrology] WARNING: Using mock provider. This is for development only!")
    return true
  }
  
  async healthCheck(): Promise<boolean> {
    return true
  }
  
  async calculateNatalChart(input: NatalChartInput): Promise<ProviderResponse<NatalChartData>> {
    console.warn("[MockAstrology] Generating APPROXIMATE natal chart data")
    
    // Generate pseudo-random but deterministic positions based on birth date
    const birthDate = new Date(input.birthDate)
    const seed = birthDate.getTime()
    
    const planets = PLANETS.map((name, index) => {
      const longitude = this.seededRandom(seed + index * 1000) * 360
      return {
        name,
        sign: ZODIAC_SIGNS[Math.floor(longitude / 30)],
        degree: longitude % 30,
        longitude,
        retrograde: this.seededRandom(seed + index * 2000) > 0.7,
        house: (index % 12) + 1
      }
    })
    
    const houses = Array.from({ length: 12 }, (_, i) => {
      const longitude = (this.seededRandom(seed + 5000) * 360 + i * 30) % 360
      return {
        number: i + 1,
        sign: ZODIAC_SIGNS[Math.floor(longitude / 30)],
        degree: longitude % 30,
        longitude
      }
    })
    
    // Sun position based on actual birth date (simplified)
    const dayOfYear = this.getDayOfYear(birthDate)
    const sunLongitude = ((dayOfYear / 365) * 360 + 280) % 360 // Approximate
    const sunSign = ZODIAC_SIGNS[Math.floor(sunLongitude / 30)]
    
    const data: NatalChartData = {
      sun: {
        sign: sunSign,
        degree: sunLongitude % 30,
        longitude: sunLongitude,
        house: 1
      },
      moon: {
        sign: planets[1].sign,
        degree: planets[1].degree,
        longitude: planets[1].longitude,
        house: planets[1].house
      },
      ascendant: {
        sign: houses[0].sign,
        degree: houses[0].degree,
        longitude: houses[0].longitude
      },
      midheaven: {
        sign: houses[9].sign,
        degree: houses[9].degree,
        longitude: houses[9].longitude
      },
      planets,
      houses,
      aspects: this.generateMockAspects(planets),
      northNode: {
        sign: ZODIAC_SIGNS[Math.floor(this.seededRandom(seed + 9000) * 12)],
        degree: this.seededRandom(seed + 9001) * 30,
        longitude: this.seededRandom(seed + 9002) * 360
      },
      southNode: {
        sign: ZODIAC_SIGNS[Math.floor(this.seededRandom(seed + 9003) * 12)],
        degree: this.seededRandom(seed + 9004) * 30,
        longitude: this.seededRandom(seed + 9005) * 360
      },
      elementBalance: this.calculateElementBalance(planets),
      modalityBalance: this.calculateModalityBalance(planets),
      calculatedAt: new Date().toISOString(),
      provider: this.name
    }
    
    return {
      success: true,
      data,
      provider: this.name,
      calculatedAt: new Date().toISOString(),
      isRealCalculation: false // IMPORTANT: Marks as NOT real
    }
  }
  
  async calculateTransits(input: TransitInput): Promise<ProviderResponse<TransitData>> {
    console.warn("[MockAstrology] Generating APPROXIMATE transit data")
    
    const date = new Date(input.date)
    const seed = date.getTime()
    
    const planets = PLANETS.map((name, index) => {
      const longitude = this.seededRandom(seed + index * 1000) * 360
      return {
        name,
        sign: ZODIAC_SIGNS[Math.floor(longitude / 30)],
        degree: longitude % 30,
        longitude,
        retrograde: this.seededRandom(seed + index * 2000) > 0.8
      }
    })
    
    const data: TransitData = {
      date: input.date,
      planets,
      moonPhase: this.calculateMockMoonPhase(date),
      aspectsToNatal: [],
      significantTransits: []
    }
    
    return {
      success: true,
      data,
      provider: this.name,
      calculatedAt: new Date().toISOString(),
      isRealCalculation: false
    }
  }
  
  async calculateSynastry(input: SynastryInput): Promise<ProviderResponse<SynastryData>> {
    console.warn("[MockAstrology] Generating APPROXIMATE synastry data")
    
    const seed1 = new Date(input.person1.birthDate).getTime()
    const seed2 = new Date(input.person2.birthDate).getTime()
    const combinedSeed = seed1 + seed2
    
    const overallScore = 50 + Math.floor(this.seededRandom(combinedSeed) * 50)
    
    const data: SynastryData = {
      overallScore,
      aspects: [],
      harmonicAspects: Math.floor(this.seededRandom(combinedSeed + 1000) * 10),
      challengingAspects: Math.floor(this.seededRandom(combinedSeed + 2000) * 5),
      emotional: {
        score: 50 + Math.floor(this.seededRandom(combinedSeed + 3000) * 50),
        description: "Mock emotional compatibility"
      },
      mental: {
        score: 50 + Math.floor(this.seededRandom(combinedSeed + 4000) * 50),
        description: "Mock mental compatibility"
      },
      physical: {
        score: 50 + Math.floor(this.seededRandom(combinedSeed + 5000) * 50),
        description: "Mock physical compatibility"
      },
      spiritual: {
        score: 50 + Math.floor(this.seededRandom(combinedSeed + 6000) * 50),
        description: "Mock spiritual compatibility"
      },
      sunMoonConnection: "Mock connection",
      venusConnection: "Mock Venus connection",
      marsConnection: "Mock Mars connection",
      compositeSun: {
        sign: ZODIAC_SIGNS[Math.floor(this.seededRandom(combinedSeed + 7000) * 12)],
        degree: this.seededRandom(combinedSeed + 7001) * 30
      },
      compositeMoon: {
        sign: ZODIAC_SIGNS[Math.floor(this.seededRandom(combinedSeed + 8000) * 12)],
        degree: this.seededRandom(combinedSeed + 8001) * 30
      }
    }
    
    return {
      success: true,
      data,
      provider: this.name,
      calculatedAt: new Date().toISOString(),
      isRealCalculation: false
    }
  }
  
  async calculateMoonPhase(date: string): Promise<ProviderResponse<MoonPhaseData>> {
    console.warn("[MockAstrology] Generating APPROXIMATE moon phase data")
    
    const data = this.calculateMockMoonPhase(new Date(date))
    
    return {
      success: true,
      data,
      provider: this.name,
      calculatedAt: new Date().toISOString(),
      isRealCalculation: false
    }
  }
  
  // ===== Helper Methods =====
  
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
  
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
  }
  
  private generateMockAspects(planets: Array<{ name: string; longitude: number }>): Array<{
    planet1: string
    planet2: string
    aspect: string
    orb: number
    applying: boolean
  }> {
    const aspects: Array<{
      planet1: string
      planet2: string
      aspect: string
      orb: number
      applying: boolean
    }> = []
    
    const aspectTypes = ["conjunction", "sextile", "square", "trine", "opposition"]
    
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        // Only generate some aspects (not all combinations)
        if (Math.random() > 0.7) {
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            aspect: aspectTypes[Math.floor(Math.random() * aspectTypes.length)],
            orb: Math.random() * 8,
            applying: Math.random() > 0.5
          })
        }
      }
    }
    
    return aspects.slice(0, 15) // Limit to 15 aspects
  }
  
  private calculateMockMoonPhase(date: Date): MoonPhaseData {
    // Simple lunar cycle approximation (29.53 days)
    const lunarCycle = 29.53
    const knownNewMoon = new Date("2024-01-11") // Known new moon date
    const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
    const moonAge = daysSinceNewMoon % lunarCycle
    const illumination = Math.abs(Math.sin((moonAge / lunarCycle) * Math.PI))
    
    let phase: string
    let emoji: string
    
    if (moonAge < 1.85) { phase = "new"; emoji = "🌑" }
    else if (moonAge < 7.38) { phase = "waxing_crescent"; emoji = "🌒" }
    else if (moonAge < 9.23) { phase = "first_quarter"; emoji = "🌓" }
    else if (moonAge < 14.76) { phase = "waxing_gibbous"; emoji = "🌔" }
    else if (moonAge < 16.61) { phase = "full"; emoji = "🌕" }
    else if (moonAge < 22.14) { phase = "waning_gibbous"; emoji = "🌖" }
    else if (moonAge < 23.99) { phase = "last_quarter"; emoji = "🌗" }
    else { phase = "waning_crescent"; emoji = "🌘" }
    
    const phaseNames: Record<string, string> = {
      "new": "Luna Noua",
      "waxing_crescent": "Luna Crescatoare",
      "first_quarter": "Primul Pătrar",
      "waxing_gibbous": "Luna Convexa Crescatoare",
      "full": "Luna Plina",
      "waning_gibbous": "Luna Convexa Descrescatoare",
      "last_quarter": "Ultimul Pătrar",
      "waning_crescent": "Luna Descrescatoare"
    }
    
    return {
      phase,
      phaseName: phaseNames[phase] || phase,
      illumination: illumination * 100,
      age: moonAge,
      emoji,
      nextNewMoon: "",
      nextFullMoon: ""
    }
  }
  
  private calculateElementBalance(planets: Array<{ sign: string }>): { fire: number; earth: number; air: number; water: number } {
    const elements = { fire: 0, earth: 0, air: 0, water: 0 }
    const signElements: Record<string, keyof typeof elements> = {
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
  
  private calculateModalityBalance(planets: Array<{ sign: string }>): { cardinal: number; fixed: number; mutable: number } {
    const modalities = { cardinal: 0, fixed: 0, mutable: 0 }
    const signModalities: Record<string, keyof typeof modalities> = {
      "Berbec": "cardinal", "Rac": "cardinal", "Balanta": "cardinal", "Capricorn": "cardinal",
      "Taur": "fixed", "Leu": "fixed", "Scorpion": "fixed", "Varsator": "fixed",
      "Gemeni": "mutable", "Fecioara": "mutable", "Sagetator": "mutable", "Pesti": "mutable"
    }
    
    for (const planet of planets) {
      const modality = signModalities[planet.sign]
      if (modality) modalities[modality]++
    }
    
    return modalities
  }
}
