// Database schema types for birth location data
// Extends existing natal_charts table with comprehensive location information

export interface BirthLocationData {
  birth_city: string
  birth_country: string
  birth_region?: string | null
  birth_latitude: number
  birth_longitude: number
  birth_timezone: string
  birth_location_source: "manual_input" | "local_database" | "nominatim_api" | "google_places" | "browser_geolocation"
  birth_location_enriched_at?: string | null
}

// SQL migration for adding missing columns to natal_charts table
export const BIRTH_LOCATION_MIGRATION = `
-- Add comprehensive birth location columns to natal_charts
ALTER TABLE IF EXISTS natal_charts
ADD COLUMN IF NOT EXISTS birth_region VARCHAR(255),
ADD COLUMN IF NOT EXISTS birth_latitude DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS birth_longitude DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS birth_timezone VARCHAR(50),
ADD COLUMN IF NOT EXISTS birth_location_source VARCHAR(50) DEFAULT 'manual_input',
ADD COLUMN IF NOT EXISTS birth_location_enriched_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS birth_latitude_validated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS birth_longitude_validated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS birth_timezone_validated BOOLEAN DEFAULT FALSE;

-- Create index for faster location lookups
CREATE INDEX IF NOT EXISTS idx_natal_charts_location 
ON natal_charts(birth_latitude, birth_longitude);

CREATE INDEX IF NOT EXISTS idx_natal_charts_city_country
ON natal_charts(birth_city, birth_country);

-- Update constraint to ensure coordinates and timezone are required for calculations
ALTER TABLE IF EXISTS natal_charts
ADD CONSTRAINT check_location_required 
CHECK (
  (birth_latitude IS NOT NULL AND birth_longitude IS NOT NULL AND birth_timezone IS NOT NULL) OR
  birth_location_source = 'manual_input'
);
`

// Validation helper
export function validateLocationData(data: Partial<BirthLocationData>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.birth_city) errors.push("Orașul nașterii este obligatoriu")
  if (!data.birth_country) errors.push("Țara nașterii este obligatorie")
  if (data.birth_latitude === undefined || data.birth_latitude === null) {
    errors.push("Latitudinea este obligatorie pentru calcule astrologice")
  }
  if (data.birth_longitude === undefined || data.birth_longitude === null) {
    errors.push("Longitudinea este obligatorie pentru calcule astrologice")
  }
  if (!data.birth_timezone) {
    errors.push("Fusul orar este obligatoriu pentru calcule astrologice")
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Check if profile needs location enrichment
export function needsLocationEnrichment(data: Partial<BirthLocationData>): boolean {
  return Boolean(
    data.birth_city &&
    data.birth_country &&
    (!data.birth_latitude || !data.birth_longitude || !data.birth_timezone)
  )
}
