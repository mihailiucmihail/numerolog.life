// Geocoding Service - Converteste nume oras in coordonate geografice

import { type GeoCoordinates } from "./types"
import { getTimezoneOffset } from "./timezone-converter"

// Cache pentru rezultate (in-memory, se reseteaza la restart)
const geocodeCache = new Map<string, GeoCoordinates>()

// Baza de date locala pentru orase comune din Romania
const ROMANIAN_CITIES: Record<string, GeoCoordinates> = {
  "bucuresti": { latitude: 44.4268, longitude: 26.1025, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "bucharest": { latitude: 44.4268, longitude: 26.1025, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "cluj-napoca": { latitude: 46.7712, longitude: 23.6236, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "cluj": { latitude: 46.7712, longitude: 23.6236, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "timisoara": { latitude: 45.7489, longitude: 21.2087, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "iasi": { latitude: 47.1585, longitude: 27.6014, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "constanta": { latitude: 44.1598, longitude: 28.6348, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "craiova": { latitude: 44.3302, longitude: 23.7949, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "brasov": { latitude: 45.6427, longitude: 25.5887, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "galati": { latitude: 45.4353, longitude: 28.0080, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "ploiesti": { latitude: 44.9366, longitude: 26.0232, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "oradea": { latitude: 47.0722, longitude: 21.9217, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "braila": { latitude: 45.2692, longitude: 27.9575, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "arad": { latitude: 46.1866, longitude: 21.3123, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "pitesti": { latitude: 44.8565, longitude: 24.8692, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "sibiu": { latitude: 45.7983, longitude: 24.1256, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "bacau": { latitude: 46.5670, longitude: 26.9146, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "targu mures": { latitude: 46.5386, longitude: 24.5579, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "baia mare": { latitude: 47.6567, longitude: 23.5850, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "buzau": { latitude: 45.1500, longitude: 26.8333, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "botosani": { latitude: 47.7500, longitude: 26.6667, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "satu mare": { latitude: 47.7925, longitude: 22.8854, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "ramnicu valcea": { latitude: 45.1047, longitude: 24.3754, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "suceava": { latitude: 47.6514, longitude: 26.2556, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "piatra neamt": { latitude: 46.9275, longitude: 26.3708, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "drobeta-turnu severin": { latitude: 44.6369, longitude: 22.6597, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "focsani": { latitude: 45.6967, longitude: 27.1833, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "targoviste": { latitude: 44.9333, longitude: 25.4500, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "tulcea": { latitude: 45.1667, longitude: 28.8000, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "resita": { latitude: 45.3000, longitude: 21.8833, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "alba iulia": { latitude: 46.0667, longitude: 23.5833, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "giurgiu": { latitude: 43.9037, longitude: 25.9699, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "deva": { latitude: 45.8833, longitude: 22.9000, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "hunedoara": { latitude: 45.7500, longitude: 22.9167, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "zalau": { latitude: 47.1833, longitude: 23.0500, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "sfantu gheorghe": { latitude: 45.8667, longitude: 25.7833, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "bistrita": { latitude: 47.1333, longitude: 24.5000, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "vaslui": { latitude: 46.6333, longitude: 27.7333, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "calarasi": { latitude: 44.2000, longitude: 27.3333, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "targu jiu": { latitude: 45.0333, longitude: 23.2833, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "alexandria": { latitude: 43.9833, longitude: 25.3333, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "slobozia": { latitude: 44.5667, longitude: 27.3667, timezone: "Europe/Bucharest", timezoneOffset: 2 },
  "miercurea ciuc": { latitude: 46.3500, longitude: 25.8000, timezone: "Europe/Bucharest", timezoneOffset: 2 },
}

// Orase internationale comune
const INTERNATIONAL_CITIES: Record<string, GeoCoordinates> = {
  // Moldova
  "chisinau": { latitude: 47.0105, longitude: 28.8638, timezone: "Europe/Chisinau", timezoneOffset: 2 },
  "cahul": { latitude: 45.9958, longitude: 28.1936, timezone: "Europe/Chisinau", timezoneOffset: 2 },
  "balti": { latitude: 47.7639, longitude: 27.9221, timezone: "Europe/Chisinau", timezoneOffset: 2 },
  "tiraspol": { latitude: 47.8300, longitude: 29.6300, timezone: "Europe/Chisinau", timezoneOffset: 2 },
  "bender": { latitude: 47.6400, longitude: 29.4667, timezone: "Europe/Chisinau", timezoneOffset: 2 },
  
  // Rest of international cities
  "london": { latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London", timezoneOffset: 0 },
  "paris": { latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris", timezoneOffset: 1 },
  "berlin": { latitude: 52.5200, longitude: 13.4050, timezone: "Europe/Berlin", timezoneOffset: 1 },
  "madrid": { latitude: 40.4168, longitude: -3.7038, timezone: "Europe/Madrid", timezoneOffset: 1 },
  "rome": { latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome", timezoneOffset: 1 },
  "new york": { latitude: 40.7128, longitude: -74.0060, timezone: "America/New_York", timezoneOffset: -5 },
  "los angeles": { latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles", timezoneOffset: -8 },
  "chicago": { latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago", timezoneOffset: -6 },
  "tokyo": { latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo", timezoneOffset: 9 },
  "sydney": { latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney", timezoneOffset: 10 },
  "moscow": { latitude: 55.7558, longitude: 37.6173, timezone: "Europe/Moscow", timezoneOffset: 3 },
  "vienna": { latitude: 48.2082, longitude: 16.3738, timezone: "Europe/Vienna", timezoneOffset: 1 },
  "budapest": { latitude: 47.4979, longitude: 19.0402, timezone: "Europe/Budapest", timezoneOffset: 1 },
  "prague": { latitude: 50.0755, longitude: 14.4378, timezone: "Europe/Prague", timezoneOffset: 1 },
  "warsaw": { latitude: 52.2297, longitude: 21.0122, timezone: "Europe/Warsaw", timezoneOffset: 1 },
  "sofia": { latitude: 42.6977, longitude: 23.3219, timezone: "Europe/Sofia", timezoneOffset: 2 },
  "athens": { latitude: 37.9838, longitude: 23.7275, timezone: "Europe/Athens", timezoneOffset: 2 },
  "istanbul": { latitude: 41.0082, longitude: 28.9784, timezone: "Europe/Istanbul", timezoneOffset: 3 },
  "amsterdam": { latitude: 52.3676, longitude: 4.9041, timezone: "Europe/Amsterdam", timezoneOffset: 1 },
  "brussels": { latitude: 50.8503, longitude: 4.3517, timezone: "Europe/Brussels", timezoneOffset: 1 },
  "lisbon": { latitude: 38.7223, longitude: -9.1393, timezone: "Europe/Lisbon", timezoneOffset: 0 },
  "barcelona": { latitude: 41.3851, longitude: 2.1734, timezone: "Europe/Madrid", timezoneOffset: 1 },
  "milan": { latitude: 45.4642, longitude: 9.1900, timezone: "Europe/Rome", timezoneOffset: 1 },
  "munich": { latitude: 48.1351, longitude: 11.5820, timezone: "Europe/Berlin", timezoneOffset: 1 },
  "frankfurt": { latitude: 50.1109, longitude: 8.6821, timezone: "Europe/Berlin", timezoneOffset: 1 },
  "zurich": { latitude: 47.3769, longitude: 8.5417, timezone: "Europe/Zurich", timezoneOffset: 1 },
  "geneva": { latitude: 46.2044, longitude: 6.1432, timezone: "Europe/Zurich", timezoneOffset: 1 },
  "stockholm": { latitude: 59.3293, longitude: 18.0686, timezone: "Europe/Stockholm", timezoneOffset: 1 },
  "oslo": { latitude: 59.9139, longitude: 10.7522, timezone: "Europe/Oslo", timezoneOffset: 1 },
  "copenhagen": { latitude: 55.6761, longitude: 12.5683, timezone: "Europe/Copenhagen", timezoneOffset: 1 },
  "helsinki": { latitude: 60.1699, longitude: 24.9384, timezone: "Europe/Helsinki", timezoneOffset: 2 },
  "dublin": { latitude: 53.3498, longitude: -6.2603, timezone: "Europe/Dublin", timezoneOffset: 0 },
  "belgrad": { latitude: 44.7866, longitude: 20.4489, timezone: "Europe/Belgrade", timezoneOffset: 1 },
  "zagreb": { latitude: 45.8150, longitude: 15.9819, timezone: "Europe/Zagreb", timezoneOffset: 1 },
  "sarajevo": { latitude: 43.8563, longitude: 18.4131, timezone: "Europe/Sarajevo", timezoneOffset: 1 },
  "tirana": { latitude: 41.3275, longitude: 19.8187, timezone: "Europe/Tirane", timezoneOffset: 1 },
  "skopje": { latitude: 41.9981, longitude: 21.4254, timezone: "Europe/Skopje", timezoneOffset: 1 },
}

// Normalizeaza numele orasului pentru cautare
function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina diacritice
    .replace(/[^a-z0-9\s-]/g, "") // Pastreaza doar litere, cifre, spatii, cratime
    .trim()
}

// Geocoding principal
export async function geocodeCity(city: string): Promise<GeoCoordinates | null> {
  const normalized = normalizeCity(city)
  
  // Verifica cache
  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized)!
  }
  
  // Verifica baza de date locala - Romania
  if (ROMANIAN_CITIES[normalized]) {
    const result = ROMANIAN_CITIES[normalized]
    geocodeCache.set(normalized, result)
    return result
  }
  
  // Verifica orase internationale
  if (INTERNATIONAL_CITIES[normalized]) {
    const result = INTERNATIONAL_CITIES[normalized]
    geocodeCache.set(normalized, result)
    return result
  }
  
  // Incearca API Nominatim (OpenStreetMap) - gratis, dar cu rate limit
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "AstroAI/1.0 (contact@numerolog.life)"
        }
      }
    )
    
    if (!response.ok) {
      console.error("Geocoding API error:", response.status)
      return null
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const resolvedTimezone = guessTimezone(parseFloat(data[0].lat), parseFloat(data[0].lon))
      const result: GeoCoordinates = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        timezone: resolvedTimezone,
        timezoneOffset: getTimezoneOffset(resolvedTimezone),
      }
      
      geocodeCache.set(normalized, result)
      return result
    }
  } catch (error) {
    console.error("Geocoding error:", error)
  }
  
  return null
}

// Ghiceste timezone bazat pe coordonate (simplificat)
function guessTimezone(lat: number, lon: number): string {
  // Europa de Est (Romania, Bulgaria, etc.)
  if (lon >= 20 && lon <= 30 && lat >= 40 && lat <= 50) {
    return "Europe/Bucharest"
  }
  
  // Europa Centrala
  if (lon >= 5 && lon < 20 && lat >= 45 && lat <= 55) {
    return "Europe/Berlin"
  }
  
  // Europa de Vest
  if (lon >= -10 && lon < 5 && lat >= 35 && lat <= 60) {
    return "Europe/London"
  }
  
  // SUA Est
  if (lon >= -85 && lon < -70 && lat >= 25 && lat <= 50) {
    return "America/New_York"
  }
  
  // SUA Vest
  if (lon >= -125 && lon < -100 && lat >= 25 && lat <= 50) {
    return "America/Los_Angeles"
  }
  
  // Asia de Est
  if (lon >= 120 && lon <= 145 && lat >= 30 && lat <= 45) {
    return "Asia/Tokyo"
  }
  
  // Default UTC
  return "UTC"
}

// Verifica daca orasul este in baza de date locala
export function isKnownCity(city: string): boolean {
  const normalized = normalizeCity(city)
  return ROMANIAN_CITIES[normalized] !== undefined || INTERNATIONAL_CITIES[normalized] !== undefined
}

// Obtine sugestii de orase (pentru autocomplete)
export function getCitySuggestions(query: string, limit: number = 5): string[] {
  const normalized = normalizeCity(query)
  const suggestions: string[] = []
  
  // Cauta in orasele romanesti
  for (const city of Object.keys(ROMANIAN_CITIES)) {
    if (city.includes(normalized)) {
      // Capitalizeaza prima litera
      suggestions.push(city.charAt(0).toUpperCase() + city.slice(1))
      if (suggestions.length >= limit) break
    }
  }
  
  // Daca nu am gasit suficiente, cauta si international
  if (suggestions.length < limit) {
    for (const city of Object.keys(INTERNATIONAL_CITIES)) {
      if (city.includes(normalized) && !suggestions.includes(city)) {
        suggestions.push(city.charAt(0).toUpperCase() + city.slice(1))
        if (suggestions.length >= limit) break
      }
    }
  }
  
  return suggestions
}
