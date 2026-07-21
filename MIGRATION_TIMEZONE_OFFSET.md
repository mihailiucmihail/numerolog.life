# Timezone Offset Database Migration

## Required Action

Run this SQL migration in Supabase to add the `birth_timezone_offset` column:

```sql
-- Add numeric timezone offset column to profiles table
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS birth_timezone_offset INTEGER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_timezone_offset ON profiles(birth_timezone_offset);

-- Add comment for documentation
COMMENT ON COLUMN profiles.birth_timezone_offset IS 'Numeric UTC offset for timezone (e.g., 3 for UTC+3, -5 for UTC-5). Required by AstrologyAPI for calculations.';
```

## How to Apply

### Option 1: Using Supabase SQL Editor
1. Go to your Supabase project
2. Open SQL Editor
3. Click "New Query"
4. Copy the migration SQL above
5. Click "Run"

### Option 2: Using Migration Files
The file `supabase/migrations/add_timezone_offset.sql` contains this migration and will be applied automatically by Supabase.

## Verification

After running the migration, check that:

1. Column exists:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'birth_timezone_offset';
```

2. Index exists:
```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'profiles' AND indexname = 'idx_profiles_timezone_offset';
```

## What This Does

- Adds `birth_timezone_offset` column to store numeric UTC offset (e.g., 3 for UTC+3)
- Creates index for efficient queries
- Enables the system to properly send numeric timezone offsets to AstrologyAPI

## Data Type

- **Column Name**: `birth_timezone_offset`
- **Type**: INTEGER
- **Values**: -12 to +14 (hours from UTC)
- **Nullable**: YES (users can have null if they haven't selected a location)

## Examples

- Romania (Europe/Bucharest): 2 or 3 (depending on DST)
- Moldova (Europe/Chisinau): 2 or 3 (depending on DST)
- New York (America/New_York): -5 or -4 (depending on DST)
- Tokyo (Asia/Tokyo): 9
- London (Europe/London): 0 or 1 (depending on DST)
