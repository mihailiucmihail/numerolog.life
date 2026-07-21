/**
 * Astrology Module - Production-Grade Astrology Engine
 * 
 * IMPORTANT: In production, a real astrology API must be configured.
 * Set ASTROLOGY_API_KEY environment variable with your API key.
 */

// Provider system (new architecture)
export { 
  initializeAstrology,
  getAstrologyProvider, 
  AstrologyProviderError, 
  isAstrologyConfigured, 
  getAstrologyStatus,
  astrologyRegistry 
} from "./init"

export type { 
  IAstrologyProvider, 
  NatalChartInput, 
  TransitInput, 
  SynastryInput, 
  ProviderResponse,
  AstrologyProviderConfig
} from "./provider"

// Providers
export { AstrologyAPIProvider } from "./astrology-api-provider"
export { MockAstrologyProvider } from "./mock-provider"

// Types
export * from "./types"

// Legacy exports (backwards compatibility)
export * from "./ephemeris"
export * from "./aspects"
export * from "./natal-chart"
export * from "./geocoding"

// Re-export functii principale pentru acces usor
export { 
  calculateNatalChart, 
  calculateFullNatalChart,
  getNatalChartSummary, 
  getDominantElement, 
  getDominantModality,
  calculateCurrentTransits,
  getSignFromDegree
} from "./natal-chart"

export { 
  geocodeCity, 
  isKnownCity, 
  getCitySuggestions 
} from "./geocoding"

export { 
  calculateMoonPhase, 
  dateToJulianDay, 
  createPlanetPosition,
  calculateSunPosition,
  calculateMoonPosition,
  calculatePlanetPosition,
  calculateAscendant,
  calculateMidheaven,
  isRetrograde,
  longitudeToSign,
  longitudeToDegreeInSign
} from "./ephemeris"

export { 
  calculateAllAspects, 
  findAspect, 
  formatAspect, 
  categorizeAspects,
  getMainAspects,
  calculateTransitAspects
} from "./aspects"
