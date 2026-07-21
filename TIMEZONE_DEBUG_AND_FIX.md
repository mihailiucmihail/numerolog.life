# Timezone Offset Debug & Fix Guide

## Root Cause Analysis

The error **"Fusul orar nu a fost convertit corect la valoare numerică"** (Timezone was not correctly converted to numeric value) occurs because:

1. **Database Column Missing**: The `birth_timezone_offset` column doesn't exist on `natal_charts` table yet
2. **Value is NULL/Undefined**: When trying to read from database, the value is `null` or `undefined`
3. **Type Validation Fails**: Code checks `typeof timezoneOffset !== "number"` and rejects `null`

## Solution Implemented

### 1. Automatic Fallback Calculation (`app/api/report/data/route.ts`)

When timezone offset is missing or not numeric, the system now:
- Detects the problem early with detailed logging
- Imports `getTimezoneOffsetNumber` from timezone converter
- Calculates the offset on-the-fly using birth date and time
- Ensures the value is numeric before sending to AstrologyAPI

```typescript
// If timezone offset is missing or not numeric, try to calculate it
if (!timezoneOffset || typeof timezoneOffset !== "number") {
  const { getTimezoneOffsetNumber } = await import("@/lib/astrology/timezone-converter")
  timezoneOffset = getTimezoneOffsetNumber(
    natalChart.birth_timezone,
    natalChart.birth_date,
    formattedTime
  )
}
```

### 2. Enhanced Logging

All values are logged at every step:
- **Database load**: Raw values from `natal_charts` table
- **Before calculation**: Shows missing offset
- **During calculation**: Shows inputs to `getTimezoneOffsetNumber`
- **After calculation**: Shows result and type
- **Validation**: Shows if value is numeric and in valid range

### 3. Migration File (`supabase/migrations/add_timezone_offset.sql`)

Creates `birth_timezone_offset` column on both `natal_charts` and `profiles` tables with:
- Default values for common timezones
- Index for performance
- Documentation comments

### 4. Timezone Conversion Utility (`lib/astrology/timezone-converter.ts`)

Uses JavaScript's `Intl.DateTimeFormat` API to:
- Calculate exact numeric offset for a specific date/time
- Account for daylight saving time automatically
- Never return null (fallback to 0 for errors)
- Comprehensive logging of calculation process

### 5. Detailed API Logging (`lib/astrology/astrology-api.ts`)

Before sending to AstrologyAPI, logs:
```javascript
{
  "timezoneName": 3,
  "timezoneType": "number",
  "isNumber": true,
  "tzone_field": 3,
  "tzone_field_type": "number",
  "full_request": { ... }
}
```

## Data Flow (After Fix)

```
User clicks "Generate Report"
  ↓
/api/report/data loads natal_charts from DB
  ↓
birth_timezone_offset is NULL (column just created) OR missing
  ↓
System logs: "Timezone offset not in DB or not numeric, calculating..."
  ↓
Calls getTimezoneOffsetNumber("Europe/Chisinau", "1992-10-05", "08:39:00")
  ↓
Intl API calculates offset = 3 (accounting for DST)
  ↓
Validates: typeof 3 === "number" ✓
  ↓
Sends to AstrologyAPI: { timezone: 3 } ✓
  ↓
AstrologyAPI accepts numeric offset and returns natal chart
```

## Debugging: How to Read the Logs

When a user reports the timezone error, check the server logs for:

1. **Database values section**:
   ```
   DEBUG: Raw database record:
   {
     birth_city: "Cahul",
     birth_country: "Republica Moldova",
     birth_latitude: 45.9958,
     birth_longitude: 28.1936,
     birth_timezone: "Europe/Chisinau",
     birth_timezone_offset: null,  ← This is the problem
     birth_date: "1992-10-05",
     birth_time: "08:39"
   }
   ```

2. **Calculation section**:
   ```
   Calling getTimezoneOffsetNumber...
     timezone: Europe/Chisinau
     date: 1992-10-05
     time: 08:39:00
   ✓ Calculated timezone offset: 3
   ```

3. **Validation section**:
   ```
   SUCCESS: Timezone offset validated
     timezoneOffset: 3 (type: number)
     Ready to send to AstrologyAPI
   ```

4. **API payload section**:
   ```
   DEBUG: Validating timezone type...
   {
     "timezoneName": 3,
     "timezoneType": "number",
     "isNumber": true,
     "tzone_field": 3,
     "tzone_field_type": "number"
   }
   ```

## Migration Steps

1. **Apply SQL Migration**: Run `supabase/migrations/add_timezone_offset.sql`
   ```sql
   ALTER TABLE natal_charts ADD COLUMN IF NOT EXISTS birth_timezone_offset INTEGER;
   ```

2. **Update Existing Records**: The migration includes UPDATEs for common timezones

3. **Users Re-select Location**: When users go to Profile > Edit and re-select their birth city, the new offset is calculated and saved

## Testing

To verify the fix works:

1. Create/update a natal chart with birth location
2. Go to Profile > Edit and select Cahul, Republica Moldova (or other city)
3. Go to Report page and click "Generate Report"
4. Check server logs for calculation steps
5. Verify report generates successfully with numeric timezone offset

## Files Changed

- ✅ `app/api/report/data/route.ts` - Added fallback calculation + logging
- ✅ `lib/astrology/timezone-converter.ts` - Rewrote with Intl API
- ✅ `lib/astrology/astrology-api.ts` - Added detailed payload logging
- ✅ `supabase/migrations/add_timezone_offset.sql` - Fixed to use natal_charts table
- ✅ `components/birth-location-selector.tsx` - Calculates offset when city selected
- ✅ `app/profil/edit/page.tsx` - Passes birth date/time to selector

## Next Steps

1. Apply the migration to the production database
2. Users don't need to do anything - system calculates offset automatically
3. When users re-select their birth location, the offset is saved to DB for future use
