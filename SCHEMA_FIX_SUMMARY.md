# Schema Mismatch Fix - natal_charts Table

## Problem
The code was attempting to write non-existent columns to the `natal_charts` table:
- `data_source`
- `provider`
- `generated_at`

This caused: "Could not find the 'data_source' column of 'natal_charts' in the schema cache"

## Solution
Removed all writes to non-existent columns from the application code.

## Changes Made

### 1. `/app/api/report/data/route.ts` (Line 262)
**Removed from .update():**
```typescript
data_source: "REAL_API",
```

The update now only writes valid columns:
- `planetary_positions`
- `houses`
- `updated_at`

### 2. `/app/api/astrology/generate-report/route.ts` (Lines 142-143, 152)
**Removed from .upsert():**
```typescript
source: "REAL_API",
provider: "AstrologyAPI",
generated_at: new Date().toISOString(),
```

The upsert now only writes valid columns:
- `user_id`, `first_name`, `last_name`
- Birth data: `birth_date`, `birth_time`, `birth_city`, `birth_country`
- Coordinates: `birth_latitude`, `birth_longitude`, `birth_timezone`
- Chart data: `raw_api_response`, `chart_json`
- `trace_id`

### 3. `/app/api/natal-chart/calculate/route.ts` (Line 118)
**Removed from .upsert():**
```typescript
data_source: "real_api"
```

The upsert now only writes valid columns including:
- Basic info, birth data, coordinates, chart data
- `julian_day`, `sidereal_time`

## Metadata Tracking
The application still tracks metadata (data source, generation time, provider) in:
1. **Response objects** - returned in API responses for verification
2. **JSON fields** - stored inside `chart_json` and `raw_api_response` columns
3. **Response metadata** - included in verification objects

This allows the application to maintain full traceability without requiring extra database columns.

## Current natal_charts Schema
The following columns are valid and in use:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `first_name`, `last_name`
- `birth_date`, `birth_time`
- `birth_city`, `birth_country`
- `birth_latitude`, `birth_longitude`, `birth_timezone`, `birth_timezone_offset`
- `sun_sign`, `sun_degree`
- `moon_sign`, `moon_degree`
- `ascendant_sign`, `ascendant_degree`
- `midheaven_sign`, `midheaven_degree`
- `planetary_positions` (JSONB)
- `houses` (JSONB)
- `aspects` (JSONB)
- `chart_json` (JSONB)
- `raw_api_response` (JSONB)
- `julian_day`, `sidereal_time`
- `trace_id`
- `created_at`, `updated_at` (timestamps)

## Future Improvements
If additional metadata columns are needed:
1. Create a Supabase migration to add them
2. Verify columns exist in schema cache before writing
3. Update code to write to new columns

Example migration:
```sql
ALTER TABLE natal_charts
ADD COLUMN data_source TEXT DEFAULT 'REAL_API',
ADD COLUMN provider TEXT DEFAULT 'AstrologyAPI',
ADD COLUMN generated_at TIMESTAMPTZ DEFAULT NOW();
```

## Testing
After deployment, verify:
1. Reports can be generated without "schema cache" errors
2. All natal chart data is saved correctly
3. Metadata is properly included in API responses
