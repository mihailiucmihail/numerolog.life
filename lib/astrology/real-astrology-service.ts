/**
 * SINGLE SOURCE OF TRUTH - Real Astrology Service
 * 
 * This is the ONLY service that should be used for astrology calculations.
 * All pages, APIs, and components must use this service.
 * 
 * REQUIREMENTS:
 * 1. ASTROLOGY_API_KEY must be set (no fallback to mock)
 * 2. ASTROLOGY_USER_ID must be set (no fallback to mock)
 * 3. Every request is traced with a unique traceId
 * 4. All responses include data_source = "REAL_API" only
 * 5. No mock data, no fallback data - EVER
 * 6. If real API fails, fail gracefully with clear error
 */

import {
  getHouseCuspsDetailed,
  getMoonPhaseReport,
  getWesternHoroscope,
  calculateWithSwissEphemeris
} from "./astrology-api"

// Global trace counter for debugging
let traceCounter = 0

/**
 * Generate unique trace ID for request tracking
 */
export function generateTraceId(): string {
  const timestamp = Date.now()
  const counter = ++traceCounter
  const random = Math.random().toString(36).substring(2, 9)
  return `trace-${timestamp}-${counter}-${random}`
}

/**
 * Real Astrology Service - ONLY source of truth
 */
export class RealAstrologyService {
  private traceId: string
  private static requiredEnvVars = ["ASTROLOGY_API_KEY", "ASTROLOGY_USER_ID"]

  constructor(traceId?: string) {
    this.traceId = traceId || generateTraceId()
    console.log(`[v0] [${this.traceId}] RealAstrologyService initialized`)
  }

  /**
   * Validate that real API credentials are set
   * THROWS ERROR if missing - no fallback!
   */
  private validateCredentials(): void {
    const missing = RealAstrologyService.requiredEnvVars.filter(v => !process.env[v])
    
    if (missing.length > 0) {
      const error = `[${this.traceId}] CRITICAL: Missing credentials: ${missing.join(", ")}. Real astrology API cannot be used.`
      console.error(`[v0] ${error}`)
      throw new Error(error)
    }

    console.log(`[v0] [${this.traceId}] Credentials verified: API_KEY present, USER_ID present`)
  }

  /**
   * Calculate complete natal chart from real API
   * NEVER uses mock or fallback data
   */
  async calculateNatalChart(data: {
    birthDate: string
    birthTime: string
    latitude: number
    longitude: number
    timezone: number
    firstName?: string
    lastName?: string
    birthCity?: string
    birthCountry?: string
  }) {
    console.log(`[v0] [${this.traceId}] calculateNatalChart called`)
    
    this.validateCredentials()

    try {
      // Fetch planets and complete chart from real API using Swiss Ephemeris
      const chartData = await calculateWithSwissEphemeris(
        data.birthDate,
        data.birthTime,
        data.latitude,
        data.longitude,
        data.timezone
      )

      if (!chartData) {
        throw new Error("Failed to calculate chart from API")
      }

      console.log(`[v0] [${this.traceId}] Chart calculated: ${chartData.planets?.length || 0} planets`)

      // Fetch house cusps for detailed analysis
      let houseCuspsData = null
      try {
        houseCuspsData = await getHouseCuspsDetailed(
          data.birthDate,
          data.birthTime,
          data.latitude,
          data.longitude,
          data.timezone
        )
        console.log(`[v0] [${this.traceId}] House cusps fetched`)
      } catch (err) {
        console.warn(`[v0] [${this.traceId}] House cusps fetch failed (non-critical):`, err)
      }

      // Fetch moon phase data
      let moonPhaseData = null
      try {
        moonPhaseData = await getMoonPhaseReport(
          data.birthDate,
          data.birthTime,
          data.latitude,
          data.longitude,
          data.timezone
        )
        console.log(`[v0] [${this.traceId}] Moon phase data fetched`)
      } catch (err) {
        console.warn(`[v0] [${this.traceId}] Moon phase fetch failed (non-critical):`, err)
      }

      // Fetch horoscope predictions
      let horoscopeData = null
      try {
        horoscopeData = await getWesternHoroscope(
          data.birthDate,
          data.birthTime,
          data.latitude,
          data.longitude,
          data.timezone
        )
        console.log(`[v0] [${this.traceId}] Western horoscope fetched`)
      } catch (err) {
        console.warn(`[v0] [${this.traceId}] Horoscope fetch failed (non-critical):`, err)
      }

      // Return complete response with trace ID and data source guarantee
      const response = {
        success: true,
        traceId: this.traceId,
        data_source: "REAL_API",
        planets: chartData.planets,
        houseCusps: houseCuspsData || chartData.houses,
        moonPhase: moonPhaseData,
        horoscope: horoscopeData,
        personalData: {
          firstName: data.firstName,
          lastName: data.lastName,
          birthCity: data.birthCity,
          birthCountry: data.birthCountry,
          birthDate: data.birthDate,
          birthTime: data.birthTime,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone
        },
        metadata: {
          traceId: this.traceId,
          calculatedAt: new Date().toISOString(),
          source: "RealAstrologyService",
          verified: true,
          allEndpointsAttempted: true,
          endpointStatus: {
            chart: !!chartData,
            houseCusps: !!houseCuspsData,
            moonPhase: !!moonPhaseData,
            horoscope: !!horoscopeData
          }
        }
      }

      console.log(`[v0] [${this.traceId}] Natal chart calculation complete. Data source: REAL_API`)
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[v0] [${this.traceId}] FATAL ERROR in calculateNatalChart:`, errorMessage)
      
      // NO fallback - throw the error
      throw new Error(
        `Real astrology calculation failed [${this.traceId}]: ${errorMessage}. ` +
        `Ensure ASTROLOGY_API_KEY and ASTROLOGY_USER_ID are set correctly.`
      )
    }
  }

  /**
   * Get trace ID for this service instance
   */
  getTraceId(): string {
    return this.traceId
  }

  /**
   * Static factory method - enforces trace ID generation
   */
  static create(traceId?: string): RealAstrologyService {
    return new RealAstrologyService(traceId)
  }

  /**
   * Static validation - check if environment is properly configured
   */
  static validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    const requiredVars = ["ASTROLOGY_API_KEY", "ASTROLOGY_USER_ID"]
    requiredVars.forEach(v => {
      if (!process.env[v]) {
        errors.push(`Missing: ${v}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * Global instance for convenience
 * Use: realAstrologyService.calculateNatalChart(...)
 */
export const realAstrologyService = RealAstrologyService.create()
