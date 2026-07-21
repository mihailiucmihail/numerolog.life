/**
 * Astrology Provider Initialization
 * 
 * STRICT REAL API ONLY - NO MOCK/FALLBACK ALLOWED
 * 
 * This initialization enforces that:
 * 1. ASTROLOGY_API_KEY must be configured
 * 2. ASTROLOGY_USER_ID must be configured
 * 3. Mock provider is NEVER loaded
 * 4. If credentials missing → clear error on first API call
 */

import { astrologyRegistry, getAstrologyProvider, AstrologyProviderError, isAstrologyConfigured, getAstrologyStatus } from "./provider"
import { AstrologyAPIProvider } from "./astrology-api-provider"

let initialized = false

/**
 * Initialize the astrology provider system - REAL API ONLY
 * Non-blocking initialization - errors are logged but don't crash the server
 */
export async function initializeAstrology(): Promise<void> {
  if (initialized) return
  
  try {
    console.log("[v0] Astrology initialization starting (STRICT REAL API ONLY)...")
    
    // Register ONLY the real API provider (no mock)
    astrologyRegistry.register(new AstrologyAPIProvider())
    
    const apiKey = process.env.ASTROLOGY_API_KEY?.trim()
    const userId = process.env.ASTROLOGY_USER_ID?.trim()
    
    console.log("[v0] Environment check:")
    console.log("[v0]   - ASTROLOGY_API_KEY present:", !!apiKey)
    console.log("[v0]   - ASTROLOGY_USER_ID present:", !!userId)
    
    // Require BOTH API key and User ID
    if (!apiKey || !userId) {
      console.error("[v0] WARNING: Missing astrology credentials!")
      console.error("[v0] Reports will fail when attempted without real API data")
      console.error("[v0] Set ASTROLOGY_API_KEY and ASTROLOGY_USER_ID in environment")
      initialized = true
      return
    }
    
    // Real API credentials found - initialize real provider
    console.log("[v0] Real API credentials detected")
    console.log("[v0] Attempting to initialize REAL API provider...")
    
    const success = await astrologyRegistry.setActiveProvider("astrology-api")
    
    if (success) {
      console.log("[v0] SUCCESS! Real API provider initialized")
      console.log("[v0] Astrology engine: astrologyapi.com")
      console.log("[v0] Data source will be: REAL_API")
      initialized = true
      return
    }
    
    console.error("[v0] WARNING: Real API provider init returned false")
    console.error("[v0] Check if ASTROLOGY_API_KEY and ASTROLOGY_USER_ID are valid")
    initialized = true
    
  } catch (error) {
    console.error("[v0] ERROR during astrology initialization:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Initialization will be retried on first API call")
    initialized = false
  }
}

// Re-export everything from provider
export { 
  getAstrologyProvider, 
  AstrologyProviderError, 
  isAstrologyConfigured, 
  getAstrologyStatus,
  astrologyRegistry 
} from "./provider"

export type { 
  IAstrologyProvider, 
  NatalChartInput, 
  TransitInput, 
  SynastryInput, 
  ProviderResponse 
} from "./provider"

export * from "./types"
