/**
 * Astrology Provider Interface
 * 
 * This defines the contract for all astrology calculation providers.
 * Production systems MUST use a real provider (external API or Swiss Ephemeris backend).
 * Mock provider is ONLY for development/testing.
 */

import type { 
  NatalChartData, 
  TransitData, 
  SynastryData,
  MoonPhaseData,
  PlanetPosition,
  AspectData,
  HouseData
} from "./types"

// Provider configuration
export interface AstrologyProviderConfig {
  apiKey?: string
  apiUrl?: string
  timeout?: number
}

// Input for natal chart calculation
export interface NatalChartInput {
  birthDate: string      // ISO date string: "1990-05-15"
  birthTime: string      // 24h format: "14:30"
  latitude: number       // Decimal degrees: 44.4268
  longitude: number      // Decimal degrees: 26.1025
  timezone?: string      // IANA timezone: "Europe/Bucharest"
}

// Input for transit calculation
export interface TransitInput {
  date: string           // ISO date string for transit date
  latitude: number
  longitude: number
  natalChart: NatalChartData  // Reference natal chart
}

// Input for synastry/compatibility
export interface SynastryInput {
  person1: NatalChartInput
  person2: NatalChartInput
}

// Provider response wrapper
export interface ProviderResponse<T> {
  success: boolean
  data?: T
  error?: string
  provider: string
  calculatedAt: string
  isRealCalculation: boolean  // MUST be true for production
}

/**
 * Astrology Provider Interface
 * All providers must implement these methods
 */
export interface IAstrologyProvider {
  readonly name: string
  readonly isProduction: boolean  // false for mock providers
  
  // Initialize the provider (validate API key, etc.)
  initialize(): Promise<boolean>
  
  // Calculate natal chart from birth data
  calculateNatalChart(input: NatalChartInput): Promise<ProviderResponse<NatalChartData>>
  
  // Calculate current transits relative to a natal chart
  calculateTransits(input: TransitInput): Promise<ProviderResponse<TransitData>>
  
  // Calculate synastry between two charts
  calculateSynastry(input: SynastryInput): Promise<ProviderResponse<SynastryData>>
  
  // Calculate moon phase for a given date
  calculateMoonPhase(date: string): Promise<ProviderResponse<MoonPhaseData>>
  
  // Health check
  healthCheck(): Promise<boolean>
}

/**
 * Provider Registry
 * Manages available providers and selects the appropriate one
 */
class AstrologyProviderRegistry {
  private providers: Map<string, IAstrologyProvider> = new Map()
  private activeProvider: IAstrologyProvider | null = null
  
  register(provider: IAstrologyProvider): void {
    this.providers.set(provider.name, provider)
  }
  
  async setActiveProvider(name: string): Promise<boolean> {
    const provider = this.providers.get(name)
    if (!provider) {
      console.error(`[Astrology] Provider "${name}" not found`)
      return false
    }
    
    const initialized = await provider.initialize()
    if (!initialized) {
      console.error(`[Astrology] Provider "${name}" failed to initialize`)
      return false
    }
    
    this.activeProvider = provider
    console.log(`[Astrology] Active provider: ${name} (production: ${provider.isProduction})`)
    return true
  }
  
  getActiveProvider(): IAstrologyProvider | null {
    return this.activeProvider
  }
  
  getProvider(name: string): IAstrologyProvider | undefined {
    return this.providers.get(name)
  }
  
  listProviders(): string[] {
    return Array.from(this.providers.keys())
  }
  
  hasProductionProvider(): boolean {
    return this.activeProvider?.isProduction ?? false
  }
}

// Global registry instance
export const astrologyRegistry = new AstrologyProviderRegistry()

/**
 * Get the active astrology provider
 * Throws error if no production provider is configured in production mode
 */
export function getAstrologyProvider(): IAstrologyProvider {
  const provider = astrologyRegistry.getActiveProvider()
  
  if (!provider) {
    throw new AstrologyProviderError(
      "NO_PROVIDER_CONFIGURED",
      "Real astrology engine is not configured. Please set ASTROLOGY_API_KEY environment variable."
    )
  }
  
  // In production, ensure we have a real provider
  const isProduction = process.env.NODE_ENV === "production"
  if (isProduction && !provider.isProduction) {
    throw new AstrologyProviderError(
      "MOCK_PROVIDER_IN_PRODUCTION",
      "Real astrology engine is not configured. Mock provider cannot be used in production."
    )
  }
  
  return provider
}

/**
 * Custom error class for astrology provider errors
 */
export class AstrologyProviderError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message)
    this.name = "AstrologyProviderError"
  }
}

/**
 * Check if astrology is properly configured for production
 */
export function isAstrologyConfigured(): boolean {
  try {
    const provider = getAstrologyProvider()
    return provider.isProduction
  } catch {
    return false
  }
}

/**
 * Get astrology configuration status
 */
export function getAstrologyStatus(): {
  configured: boolean
  provider: string | null
  isProduction: boolean
  error?: string
} {
  try {
    const provider = astrologyRegistry.getActiveProvider()
    return {
      configured: !!provider,
      provider: provider?.name ?? null,
      isProduction: provider?.isProduction ?? false
    }
  } catch (error) {
    return {
      configured: false,
      provider: null,
      isProduction: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}
