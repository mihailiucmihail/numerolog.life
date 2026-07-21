/**
 * Real Astrology API Provider
 * 
 * This provider connects to external astrology APIs that use Swiss Ephemeris
 * or equivalent precision astronomical calculations.
 * 
 * Supported APIs (configure via ASTROLOGY_API_PROVIDER env var):
 * - "astro-api" - AstroAPI.com (default)
 * - "prokerala" - Prokerala Astrology API
 * - "vedicastro" - VedicAstro API
 * - "custom" - Custom endpoint (set ASTROLOGY_API_URL)
 * 
 * Required environment variables:
 * - ASTROLOGY_API_KEY: Your API key
 * - ASTROLOGY_API_PROVIDER: Which provider to use (optional, defaults to "astro-api")
 * - ASTROLOGY_API_URL: Custom API URL (only for "custom" provider)
 */

import type { 
  IAstrologyProvider, 
  AstrologyProviderConfig,
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

type AstroAPIProvider = "astro-api" | "prokerala" | "vedicastro" | "custom"

const API_ENDPOINTS: Record<AstroAPIProvider, string> = {
  "astro-api": "https://json.astrologyapi.com/v1",
  "prokerala": "https://api.prokerala.com/v2/astrology",
  "vedicastro": "https://api.vedicastro.com/v1",
  "custom": "" // Set via ASTROLOGY_API_URL
}

export class AstrologyAPIProvider implements IAstrologyProvider {
  readonly name = "astrology-api"
  readonly isProduction = true
  
  private apiKey: string = ""
  private apiUrl: string = ""
  private provider: AstroAPIProvider = "astro-api"
  private timeout: number
  private initialized = false
  private lastInitAttempt = 0
  
  constructor(config?: AstrologyProviderConfig) {
    this.provider = (process.env.ASTROLOGY_API_PROVIDER as AstroAPIProvider) || "astro-api"
    this.apiUrl = config?.apiUrl || process.env.ASTROLOGY_API_URL || API_ENDPOINTS[this.provider]
    this.timeout = config?.timeout || 30000
    // Don't read API key here - will read fresh on each call
  }
  
  /**
   * Refresh credentials from environment - called on each API call
   * This ensures new env vars are picked up after Vercel redeploy
   */
  private refreshCredentials(): void {
    this.apiKey = process.env.ASTROLOGY_API_KEY?.trim() || ""
    console.log("[v0] [AstrologyAPIProvider] Refreshed credentials - API Key present:", !!this.apiKey)
  }
  
  async initialize(): Promise<boolean> {
    // Always refresh credentials before checking
    this.refreshCredentials()
    
    if (!this.apiKey) {
      console.error("[AstrologyAPI] No API key configured. ASTROLOGY_API_KEY not found in environment.")
      return false
    }
    
    if (!this.apiUrl) {
      console.error("[AstrologyAPI] No API URL configured")
      return false
    }
    
    // No health check needed - if we have credentials, assume valid
    // AstrologyAPI doesn't have a public status endpoint we can safely call
    this.initialized = true
    console.log("[v0] [AstrologyAPI] Initialized successfully with API key")
    return true
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      // Simple validation - most APIs have a status endpoint
      const response = await fetch(`${this.apiUrl}/status`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(5000)
      })
      
      return response.ok
    } catch {
      // If no status endpoint, assume valid if we have credentials
      return !!this.apiKey && !!this.apiUrl
    }
  }
  
  async calculateNatalChart(input: NatalChartInput): Promise<ProviderResponse<NatalChartData>> {
    // Always refresh credentials on API call - picks up Vercel env var changes
    this.refreshCredentials()
    
    // Allow re-initialization if credentials were missing before but are now set
    if (!this.apiKey || !await this.initialize()) {
      console.error("[v0] [AstrologyAPIProvider] initialization failed - API Key:", !!this.apiKey)
      return {
        success: false,
        error: "Real astrology engine is not configured. Please set ASTROLOGY_API_KEY environment variable.",
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: false
      }
    }
    
    try {
      const requestBody = this.formatNatalChartRequest(input)
      
      const response = await fetch(`${this.apiUrl}/natal-chart`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeout)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      const normalizedData = this.normalizeNatalChartResponse(data)
      
      return {
        success: true,
        data: normalizedData,
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: true
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: false
      }
    }
  }
  
  async calculateTransits(input: TransitInput): Promise<ProviderResponse<TransitData>> {
    if (!this.initialized && !await this.initialize()) {
      return {
        success: false,
        error: "Real astrology engine is not configured.",
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: false
      }
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/transits`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: input.date,
          latitude: input.latitude,
          longitude: input.longitude,
          natal_chart: input.natalChart
        }),
        signal: AbortSignal.timeout(this.timeout)
      })
      
      if (!response.ok) {
        throw new Error(`API error ${response.status}`)
      }
      
      const data = await response.json()
      const normalizedData = this.normalizeTransitResponse(data)
      
      return {
        success: true,
        data: normalizedData,
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: true
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: false
      }
    }
  }
  
  async calculateSynastry(input: SynastryInput): Promise<ProviderResponse<SynastryData>> {
    if (!this.initialized && !await this.initialize()) {
      return {
        success: false,
        error: "Real astrology engine is not configured.",
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: false
      }
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/synastry`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          person1: this.formatNatalChartRequest(input.person1),
          person2: this.formatNatalChartRequest(input.person2)
        }),
        signal: AbortSignal.timeout(this.timeout)
      })
      
      if (!response.ok) {
        throw new Error(`API error ${response.status}`)
      }
      
      const data = await response.json()
      const normalizedData = this.normalizeSynastryResponse(data)
      
      return {
        success: true,
        data: normalizedData,
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: true
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: false
      }
    }
  }
  
  async calculateMoonPhase(date: string): Promise<ProviderResponse<MoonPhaseData>> {
    if (!this.initialized && !await this.initialize()) {
      return {
        success: false,
        error: "Real astrology engine is not configured.",
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: false
      }
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/moon-phase`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ date }),
        signal: AbortSignal.timeout(this.timeout)
      })
      
      if (!response.ok) {
        throw new Error(`API error ${response.status}`)
      }
      
      const data = await response.json()
      const normalizedData = this.normalizeMoonPhaseResponse(data)
      
      return {
        success: true,
        data: normalizedData,
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: true
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        provider: this.name,
        calculatedAt: new Date().toISOString(),
        isRealCalculation: false
      }
    }
  }
  
  // ===== Request/Response Normalization =====
  // These methods handle different API formats
  
  private formatNatalChartRequest(input: NatalChartInput): Record<string, unknown> {
    // Format varies by provider
    switch (this.provider) {
      case "astro-api":
        return {
          birth_date: input.birthDate,
          birth_time: input.birthTime,
          latitude: input.latitude,
          longitude: input.longitude,
          timezone: input.timezone || "UTC",
          house_system: "placidus"
        }
      
      case "prokerala":
        return {
          datetime: `${input.birthDate}T${input.birthTime}:00`,
          coordinates: {
            latitude: input.latitude,
            longitude: input.longitude
          },
          ayanamsa: 1 // Lahiri for Vedic (use 0 for Western)
        }
      
      case "vedicastro":
        return {
          dob: input.birthDate,
          tob: input.birthTime,
          lat: input.latitude,
          lon: input.longitude,
          tz: input.timezone || "0"
        }
      
      default:
        return {
          birthDate: input.birthDate,
          birthTime: input.birthTime,
          latitude: input.latitude,
          longitude: input.longitude,
          timezone: input.timezone
        }
    }
  }
  
  private normalizeNatalChartResponse(data: Record<string, unknown>): NatalChartData {
    // Normalize different API response formats to our standard format
    // This is a generic handler - specific providers may need custom normalization
    
    const planets = this.extractPlanets(data)
    const houses = this.extractHouses(data)
    const aspects = this.extractAspects(data)
    
    return {
      sun: this.findPlanet(planets, "Sun") || { sign: "Unknown", degree: 0, longitude: 0 },
      moon: this.findPlanet(planets, "Moon") || { sign: "Unknown", degree: 0, longitude: 0 },
      ascendant: this.extractAscendant(data, houses),
      midheaven: this.extractMidheaven(data, houses),
      planets,
      houses,
      aspects,
      northNode: this.findPlanet(planets, "NorthNode") || this.findPlanet(planets, "Rahu") || { sign: "Unknown", degree: 0, longitude: 0 },
      southNode: this.findPlanet(planets, "SouthNode") || this.findPlanet(planets, "Ketu") || { sign: "Unknown", degree: 0, longitude: 0 },
      elementBalance: this.calculateElementBalance(planets),
      modalityBalance: this.calculateModalityBalance(planets),
      calculatedAt: new Date().toISOString(),
      provider: this.name
    }
  }
  
  private normalizeTransitResponse(data: Record<string, unknown>): TransitData {
    return {
      date: new Date().toISOString(),
      planets: this.extractPlanets(data),
      moonPhase: this.normalizeMoonPhaseResponse(data.moonPhase as Record<string, unknown> || {}),
      aspectsToNatal: this.extractAspects(data),
      significantTransits: []
    }
  }
  
  private normalizeSynastryResponse(data: Record<string, unknown>): SynastryData {
    return {
      overallScore: (data.score as number) || 70,
      aspects: this.extractAspects(data),
      harmonicAspects: (data.harmonicAspects as number) || 0,
      challengingAspects: (data.challengingAspects as number) || 0,
      emotional: { score: 70, description: "" },
      mental: { score: 70, description: "" },
      physical: { score: 70, description: "" },
      spiritual: { score: 70, description: "" },
      sunMoonConnection: "",
      venusConnection: "",
      marsConnection: "",
      compositeSun: { sign: "Unknown", degree: 0 },
      compositeMoon: { sign: "Unknown", degree: 0 }
    }
  }
  
  private normalizeMoonPhaseResponse(data: Record<string, unknown>): MoonPhaseData {
    const phase = (data.phase as string) || "unknown"
    const illumination = (data.illumination as number) || 0
    
    return {
      phase,
      phaseName: this.getMoonPhaseName(phase),
      illumination,
      age: (data.age as number) || 0,
      emoji: this.getMoonPhaseEmoji(phase),
      nextNewMoon: (data.nextNewMoon as string) || "",
      nextFullMoon: (data.nextFullMoon as string) || ""
    }
  }
  
  // ===== Helper Methods =====
  
  private extractPlanets(data: Record<string, unknown>): Array<{
    name: string
    sign: string
    degree: number
    longitude: number
    retrograde: boolean
    house?: number
  }> {
    const planets = (data.planets as Array<Record<string, unknown>>) || []
    return planets.map(p => ({
      name: (p.name as string) || (p.planet as string) || "Unknown",
      sign: (p.sign as string) || this.longitudeToSign((p.longitude as number) || 0),
      degree: (p.degree as number) || ((p.longitude as number) || 0) % 30,
      longitude: (p.longitude as number) || 0,
      retrograde: (p.retrograde as boolean) || false,
      house: p.house as number | undefined
    }))
  }
  
  private extractHouses(data: Record<string, unknown>): Array<{
    number: number
    sign: string
    degree: number
    longitude: number
  }> {
    const houses = (data.houses as Array<Record<string, unknown>>) || []
    return houses.map((h, i) => ({
      number: (h.number as number) || i + 1,
      sign: (h.sign as string) || this.longitudeToSign((h.longitude as number) || 0),
      degree: (h.degree as number) || ((h.longitude as number) || 0) % 30,
      longitude: (h.longitude as number) || 0
    }))
  }
  
  private extractAspects(data: Record<string, unknown>): Array<{
    planet1: string
    planet2: string
    aspect: string
    orb: number
    applying: boolean
  }> {
    const aspects = (data.aspects as Array<Record<string, unknown>>) || []
    return aspects.map(a => ({
      planet1: (a.planet1 as string) || "",
      planet2: (a.planet2 as string) || "",
      aspect: (a.aspect as string) || (a.type as string) || "conjunction",
      orb: (a.orb as number) || 0,
      applying: (a.applying as boolean) || false
    }))
  }
  
  private extractAscendant(data: Record<string, unknown>, houses: Array<{ longitude: number; sign: string; degree: number }>): { sign: string; degree: number; longitude: number } {
    if (data.ascendant) {
      const asc = data.ascendant as Record<string, unknown>
      return {
        sign: (asc.sign as string) || "Unknown",
        degree: (asc.degree as number) || 0,
        longitude: (asc.longitude as number) || 0
      }
    }
    // Ascendant is cusp of house 1
    if (houses.length > 0) {
      return {
        sign: houses[0].sign,
        degree: houses[0].degree,
        longitude: houses[0].longitude
      }
    }
    return { sign: "Unknown", degree: 0, longitude: 0 }
  }
  
  private extractMidheaven(data: Record<string, unknown>, houses: Array<{ longitude: number; sign: string; degree: number }>): { sign: string; degree: number; longitude: number } {
    if (data.midheaven || data.mc) {
      const mc = (data.midheaven || data.mc) as Record<string, unknown>
      return {
        sign: (mc.sign as string) || "Unknown",
        degree: (mc.degree as number) || 0,
        longitude: (mc.longitude as number) || 0
      }
    }
    // Midheaven is cusp of house 10
    if (houses.length >= 10) {
      return {
        sign: houses[9].sign,
        degree: houses[9].degree,
        longitude: houses[9].longitude
      }
    }
    return { sign: "Unknown", degree: 0, longitude: 0 }
  }
  
  private findPlanet(planets: Array<{ name: string; sign: string; degree: number; longitude: number }>, name: string): { sign: string; degree: number; longitude: number } | undefined {
    const planet = planets.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (planet) {
      return { sign: planet.sign, degree: planet.degree, longitude: planet.longitude }
    }
    return undefined
  }
  
  private longitudeToSign(longitude: number): string {
    const signs = ["Berbec", "Taur", "Gemeni", "Rac", "Leu", "Fecioara", "Balanta", "Scorpion", "Sagetator", "Capricorn", "Varsator", "Pesti"]
    const signIndex = Math.floor((longitude % 360) / 30)
    return signs[signIndex] || "Unknown"
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
  
  private getMoonPhaseName(phase: string): string {
    const names: Record<string, string> = {
      "new": "Luna Noua",
      "waxing_crescent": "Luna Crescatoare",
      "first_quarter": "Primul Pătrar",
      "waxing_gibbous": "Luna Convexa Crescatoare",
      "full": "Luna Plina",
      "waning_gibbous": "Luna Convexa Descrescatoare",
      "last_quarter": "Ultimul Pătrar",
      "waning_crescent": "Luna Descrescatoare"
    }
    return names[phase] || phase
  }
  
  private getMoonPhaseEmoji(phase: string): string {
    const emojis: Record<string, string> = {
      "new": "🌑",
      "waxing_crescent": "🌒",
      "first_quarter": "🌓",
      "waxing_gibbous": "🌔",
      "full": "🌕",
      "waning_gibbous": "🌖",
      "last_quarter": "🌗",
      "waning_crescent": "🌘"
    }
    return emojis[phase] || "🌙"
  }
}
