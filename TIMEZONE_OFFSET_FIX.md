// Timezone Offset Fix - Complete Implementation

## Root Cause
AstrologyAPI requires a NUMERIC timezone offset (e.g., 3 for UTC+3), but the system was sending:
- null values
- timezone strings like "Europe/Chisinau"

## Solution Overview

The fix implements a complete pipeline to store BOTH timezone name and numeric offset, then send ONLY the numeric offset to AstrologyAPI.

## Changes Made

### 1. Timezone Converter Utility (`lib/astrology/timezone-converter.ts`)
- New file: Converts timezone names to numeric offsets
- Handles daylight saving time for European and US timezones
- Provides validation for numeric offsets
- Validates that offsets are between -12 and +14

**Key Functions:**
- `getTimezoneOffset(timezoneName, birthDate?)` → returns numeric offset
- `formatTimezoneDisplay(timezoneName, offset)` → returns display string
- `isValidTimezoneOffset(offset)` → validates numeric offset

### 2. Database Schema (`supabase/migrations/add_timezone_offset.sql`)
- Adds `birth_timezone_offset` INTEGER column to profiles table
- Stores numeric UTC offset alongside timezone name
- Includes default values for known timezones
- Added index for fast lookups

### 3. Type Updates (`lib/astrology/types.ts`)
- Updated `GeoCoordinates` interface to include `timezoneOffset: number`
- Now stores both timezone name AND numeric offset

### 4. Geocoding Enhancement (`lib/astrology/geocoding.ts`)
- All city databases (Romanian, International) now include `timezoneOffset`
- When geocoding a city, returns both timezone name and numeric offset
- Added import of timezone converter for calculation fallback

### 5. Profile Editor (`app/profil/edit/page.tsx`)
- Birth location state now stores `timezoneOffset`
- Loads and displays timezone offset from database
- Saves timezone offset when updating profile

### 6. Birth Location Selector (`components/birth-location-selector.tsx`)
- Imports timezone converter utility
- When city is selected, calculates numeric offset from timezone name
- Stores offset in location data
- Displays offset in coordinates debug section
- Resets offset when country is changed

### 7. Report Data API (`app/api/report/data/route.ts`)
- NEW: Validates timezone offset is numeric before sending to AstrologyAPI
- NEW: Detailed logging showing coordinates and offset
- Sends numeric offset ONLY to AstrologyAPI (as `tzone` parameter)
- Includes validation error with helpful message

### 8. Generate Report Route (`app/api/astrology/generate-report/route.ts`)
- Enhanced validation to confirm timezone is NUMERIC
- Error message specifically mentions: "timezone must be a NUMBER (e.g., 3 for UTC+3)"
- Rejects string timezones with clear error
- Includes type checking and range validation

### 9. Astrology API (`lib/astrology/astrology-api.ts`)
- Enhanced logging in `calculateWithSwissEphemeris` function
- Validates timezone parameter is numeric before API call
- Logs detailed payload including:
  - Date/time
  - Coordinates (lat/lon)
  - Timezone name (for reference)
  - **tzone: NUMERIC offset (for AstrologyAPI)**
- Throws clear error if timezone is not numeric or out of range

## Data Flow

### Profile Setup:
```
1. User selects city in BirthLocationSelector
2. geocodeCity() returns { latitude, longitude, timezone, timezoneOffset }
3. BirthLocationSelector calculates offset via getTimezoneOffset() if needed
4. Profile editor stores in database:
   - birth_timezone (string name, e.g., "Europe/Chisinau")
   - birth_timezone_offset (number, e.g., 3)
```

### Report Generation:
```
1. /api/report/data loads user's profile
2. Extracts birth_timezone_offset from database
3. Validates it's a number between -12 and +14
4. Sends to /api/astrology/generate-report with:
   {
     ...other params,
     timezone: 3  // NUMERIC ONLY
   }
5. /api/astrology/generate-report validates again
6. Passes to AstrologyAPI with tzone: 3
7. AstrologyAPI accepts numeric offset ✓
```

## API Payloads

### Before (BROKEN):
```json
{
  "day": 5,
  "month": 10,
  "year": 1992,
  "hour": 8,
  "min": 39,
  "lat": 45.904,
  "lon": 28.194,
  "tzone": "Europe/Chisinau"  // ❌ STRING - API REJECTS
}
```

### After (FIXED):
```json
{
  "day": 5,
  "month": 10,
  "year": 1992,
  "hour": 8,
  "min": 39,
  "lat": 45.904,
  "lon": 28.194,
  "tzone": 3  // ✓ NUMBER - API ACCEPTS
}
```

## Validation Points

1. **Profile Editor**: Validates timezone offset is set before saving
2. **Birth Location Selector**: Ensures offset is calculated and returned
3. **Report Data API**: Validates `typeof offset === "number"`
4. **Generate Report Route**: Double-validates numeric type and range
5. **Astrology API**: Triple-validates before sending to AstrologyAPI

## Testing Checklist

- [ ] Create new profile with city selection (Chisinau)
- [ ] Verify `birth_timezone_offset = 3` is stored in database
- [ ] Edit profile and verify offset is loaded and displayed
- [ ] Generate report and verify it uses numeric offset in API call
- [ ] Check console logs show numeric offset in payload
- [ ] Verify AstrologyAPI accepts the numeric offset
- [ ] Test with different cities/timezones (New York, Tokyo, etc.)

## Debugging

Check these logs when troubleshooting:

**Profile Save:**
```
[v0] Updating form with coordinates: {
  latitude: 47.0105,
  longitude: 28.8638,
  timezone: "Europe/Chisinau",
  timezoneOffset: 3
}
```

**Report Generation:**
```
[v0] Validating timezone offset for AstrologyAPI...
SUCCESS: Timezone offset validated (3)
```

**API Logging:**
```
[v0] [API] =========================================
[v0] [API] AstrologyAPI Request to /planets
[v0] [API] =========================================
[v0] [API] tzone: 3 (NUMERIC - type: number)
```
