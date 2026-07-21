/**
 * Google Places Autocomplete integration for birth location selection
 * Uses Google Places API for accurate city/location search
 * Uses Google Time Zone API for timezone detection
 */

export interface PlacesPrediction {
  place_id: string
  description: string
  main_text: string
  secondary_text: string
}

export interface LocationDetails {
  placeId: string
  city: string
  country: string
  region?: string
  latitude: number
  longitude: number
  formattedAddress: string
}

export interface TimezoneData {
  timezoneName: string
  timezoneOffset: number
  isDST: boolean
}

/**
 * Get predictions from Google Places Autocomplete
 * Call from frontend only (requires GOOGLE_PLACES_API_KEY)
 */
export async function getPlacesPredictions(input: string, sessionToken?: string): Promise<PlacesPrediction[]> {
  if (!input || input.length < 2) return []

  try {
    const response = await fetch('/api/places/autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        sessionToken,
        componentRestrictions: { country: ['md', 'ro', 'it', 'de', 'fr', 'es', 'pt', 'gb', 'nl', 'be', 'ch', 'at', 'cz', 'pl', 'hu', 'hr', 'sr', 'bg', 'gr', 'tr', 'ru', 'se', 'no', 'dk', 'fi', 'us', 'ca', 'mx', 'br', 'ar', 'jp', 'cn', 'in', 'au'] },
        types: ['(cities)']
      })
    })

    if (!response.ok) {
      console.error('[v0] Places API error:', await response.text())
      return []
    }

    const data = await response.json()
    return data.predictions || []
  } catch (error) {
    console.error('[v0] Error fetching place predictions:', error)
    return []
  }
}

/**
 * Get detailed information about a place
 * Includes coordinates and timezone info
 */
export async function getPlaceDetails(placeId: string, sessionToken?: string): Promise<LocationDetails | null> {
  try {
    const response = await fetch('/api/places/details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId,
        sessionToken,
        fields: ['place_id', 'formatted_address', 'address_components', 'geometry']
      })
    })

    if (!response.ok) {
      console.error('[v0] Places details API error:', await response.text())
      return null
    }

    const data = await response.json()
    return data.result || null
  } catch (error) {
    console.error('[v0] Error fetching place details:', error)
    return null
  }
}

/**
 * Get timezone offset for coordinates at a specific date/time
 * Accounts for DST
 */
export async function getTimezoneForLocation(
  latitude: number,
  longitude: number,
  birthDate: string, // YYYY-MM-DD
  birthTime: string  // HH:MM or HH:MM:SS
): Promise<TimezoneData | null> {
  try {
    const response = await fetch('/api/timezone/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude,
        longitude,
        birthDate,
        birthTime
      })
    })

    if (!response.ok) {
      console.error('[v0] Timezone API error:', await response.text())
      return null
    }

    const data = await response.json()
    return data.timezone || null
  } catch (error) {
    console.error('[v0] Error fetching timezone:', error)
    return null
  }
}

/**
 * Parse address components from Google Places to extract city, country, region
 */
export function parseAddressComponents(
  addressComponents: any[],
  geometry: any
): {
  city: string
  country: string
  region?: string
  latitude: number
  longitude: number
} {
  let city = ''
  let country = ''
  let region = ''

  for (const component of addressComponents) {
    const types = component.types || []
    
    if (types.includes('locality')) {
      city = component.long_name
    }
    if (types.includes('country')) {
      country = component.long_name
    }
    if (types.includes('administrative_area_level_1')) {
      region = component.long_name
    }
  }

  return {
    city,
    country,
    region,
    latitude: geometry?.location?.lat || 0,
    longitude: geometry?.location?.lng || 0
  }
}
