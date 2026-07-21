// Global Geocoding Service with Nominatim API
// Supports worldwide city search with coordinates, timezone, and country detection

import { type GeoCoordinates } from "./types"
import { getTimezoneOffset } from "./timezone-converter"

export interface LocationData extends GeoCoordinates {
  city: string
  country: string
  region?: string | null
  source: "local_db" | "nominatim_api" | "browser_geolocation"
}

export interface CitySearchResult {
  name: string
  country: string
  region?: string
  latitude: number
  longitude: number
  displayName: string
}

// Cache for API results (in-memory, resets on server restart)
const geocodeCache = new Map<string, LocationData>()
const citySearchCache = new Map<string, CitySearchResult[]>()

// Timezone database (comprehensive for major regions)
const TIMEZONE_BY_COORDINATES = new Map<string, string>()

// Initialize timezone mappings by country/region
function initializeTimezoneMappings() {
  // Romania
  for (let lat = 43.6; lat <= 48.3; lat += 0.1) {
    for (let lng = 20.3; lng <= 29.7; lng += 0.1) {
      TIMEZONE_BY_COORDINATES.set(`${lat.toFixed(1)},${lng.toFixed(1)}`, "Europe/Bucharest")
    }
  }
  
  // Moldova
  for (let lat = 45.4; lat <= 48.5; lat += 0.1) {
    for (let lng = 26.6; lng <= 30.2; lng += 0.1) {
      TIMEZONE_BY_COORDINATES.set(`${lat.toFixed(1)},${lng.toFixed(1)}`, "Europe/Chisinau")
    }
  }
}

// Get timezone from coordinates using library
async function getTimezoneFromCoordinates(latitude: number, longitude: number): Promise<string> {
  // Check cache first
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`
  const cached = TIMEZONE_BY_COORDINATES.get(cacheKey)
  if (cached) return cached

  try {
    // Try to use a timezone lookup library (if available in future)
    // For now, use simple latitude/longitude mapping
    
    // Romania timezone
    if (latitude >= 43.6 && latitude <= 48.3 && longitude >= 20.3 && longitude <= 29.7) {
      return "Europe/Bucharest"
    }
    
    // Moldova timezone
    if (latitude >= 45.4 && latitude <= 48.5 && longitude >= 26.6 && longitude <= 30.2) {
      return "Europe/Chisinau"
    }
    
    // Other European timezones
    if (latitude >= 50 && longitude >= -10 && longitude <= 40) {
      if (longitude < 0) return "Europe/London"
      if (longitude < 15) return "Europe/Paris"
      if (longitude < 30) return "Europe/Berlin"
      if (longitude < 50) return "Europe/Moscow"
    }
    
    // Fallback to UTC
    return "UTC"
  } catch (err) {
    console.error("[v0] Error getting timezone:", err)
    return "UTC"
  }
}

// Search cities using OpenStreetMap Nominatim API
export async function searchCities(query: string, countryCode?: string): Promise<CitySearchResult[]> {
  if (query.length < 2) return []
  
  const cacheKey = `${query}:${countryCode || "global"}`
  const cached = citySearchCache.get(cacheKey)
  if (cached) return cached

  try {
    // Build search parameters
    let searchUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=10&type=city,town,village&q=${encodeURIComponent(query)}`
    
    if (countryCode) {
      searchUrl += `&countrycodes=${countryCode.toLowerCase()}`
    }
    
    // Add user-agent header (required by Nominatim)
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "AstroAI-BirthChart/1.0"
      }
    })
    
    if (!response.ok) throw new Error(`Nominatim API error: ${response.status}`)
    
    const results = await response.json()
    
    const cities: CitySearchResult[] = results.map((result: any) => ({
      name: result.name,
      country: result.address?.country || "Unknown",
      region: result.address?.state || result.address?.county || undefined,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: `${result.name}${result.address?.state ? ", " + result.address.state : ""}, ${result.address?.country || ""}`
    }))
    
    // Cache results
    citySearchCache.set(cacheKey, cities)
    
    return cities
  } catch (err) {
    console.error("[v0] Error searching cities:", err)
    return []
  }
}

// Get full location data for a selected city
export async function geocodeCity(city: string, country?: string): Promise<LocationData | null> {
  const cacheKey = `${city}:${country || "unknown"}`
  const cached = geocodeCache.get(cacheKey)
  if (cached) return cached

  try {
    // Search for the city
    const searchResults = await searchCities(city, country)
    
    if (searchResults.length === 0) {
      console.warn(`[v0] No results found for city: ${city}, country: ${country}`)
      return null
    }
    
    // Use first result
    const result = searchResults[0]
    
    // Get timezone from coordinates
    const timezone = await getTimezoneFromCoordinates(result.latitude, result.longitude)
    
    const locationData: LocationData = {
      city: result.name,
      country: result.country,
      region: result.region || null,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone,
      timezoneOffset: getTimezoneOffset(timezone),
      source: "nominatim_api"
    }
    
    // Cache result
    geocodeCache.set(cacheKey, locationData)
    
    return locationData
  } catch (err) {
    console.error("[v0] Error geocoding city:", err)
    return null
  }
}

// Detect user's country from browser
export async function detectUserCountry(): Promise<string | null> {
  try {
    // Try to get from browser geolocation first (privacy-respecting)
    if ("geolocation" in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Reverse geocode to get country
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                {
                  headers: {
                    "User-Agent": "AstroAI-BirthChart/1.0"
                  }
                }
              )
              
              if (response.ok) {
                const data = await response.json()
                resolve(data.address?.country || null)
              } else {
                resolve(null)
              }
            } catch (err) {
              console.error("[v0] Error reverse geocoding:", err)
              resolve(null)
            }
          },
          () => {
            // Geolocation denied, fallback to IP detection
            resolve(null)
          },
          { timeout: 5000 }
        )
      })
    }
    
    return null
  } catch (err) {
    console.error("[v0] Error detecting user country:", err)
    return null
  }
}

// Detect country from IP address (fallback)
export async function detectCountryFromIP(): Promise<string | null> {
  try {
    // Use ip-api.com (free tier available)
    const response = await fetch("https://ipapi.co/json/", {
      headers: {
        "User-Agent": "AstroAI-BirthChart/1.0"
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.country_name || null
    }
    
    return null
  } catch (err) {
    console.error("[v0] Error detecting country from IP:", err)
    return null
  }
}

// Auto-enrich existing profiles with missing location data
export async function enrichLocationData(city: string, country?: string): Promise<LocationData | null> {
  return geocodeCity(city, country)
}
