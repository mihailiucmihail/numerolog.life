-- Add numeric timezone offset column to natal_charts table
-- This stores the UTC offset (e.g., 3 for UTC+3, -5 for UTC-5)
-- Required by AstrologyAPI which only accepts numeric timezone offsets

ALTER TABLE IF EXISTS natal_charts
ADD COLUMN IF NOT EXISTS birth_timezone_offset INTEGER;

-- Update existing records by calculating offset from timezone name
-- Defaults for European and common timezones
UPDATE natal_charts 
SET birth_timezone_offset = 2 
WHERE birth_timezone = 'Europe/Bucharest' AND birth_timezone_offset IS NULL;

UPDATE natal_charts 
SET birth_timezone_offset = 2 
WHERE birth_timezone = 'Europe/Chisinau' AND birth_timezone_offset IS NULL;

UPDATE natal_charts 
SET birth_timezone_offset = 0 
WHERE birth_timezone = 'Europe/London' AND birth_timezone_offset IS NULL;

UPDATE natal_charts 
SET birth_timezone_offset = 1 
WHERE birth_timezone LIKE 'Europe/%' AND birth_timezone_offset IS NULL;

UPDATE natal_charts 
SET birth_timezone_offset = -5 
WHERE birth_timezone = 'America/New_York' AND birth_timezone_offset IS NULL;

UPDATE natal_charts 
SET birth_timezone_offset = 9 
WHERE birth_timezone = 'Asia/Tokyo' AND birth_timezone_offset IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN natal_charts.birth_timezone_offset IS 'Numeric UTC offset for timezone (e.g., 3 for UTC+3, -5 for UTC-5). Required by AstrologyAPI for calculations.';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_natal_charts_timezone_offset ON natal_charts(birth_timezone_offset);

-- Also update profiles table if it exists and has these columns
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS birth_timezone_offset INTEGER;

UPDATE profiles 
SET birth_timezone_offset = 2 
WHERE birth_timezone = 'Europe/Bucharest' AND birth_timezone_offset IS NULL;

UPDATE profiles 
SET birth_timezone_offset = 2 
WHERE birth_timezone = 'Europe/Chisinau' AND birth_timezone_offset IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_timezone_offset ON profiles(birth_timezone_offset);

