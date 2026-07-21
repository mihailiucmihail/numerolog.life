# Google Places Autocomplete - Birth Location Implementation

## Overview
Replaced free-text city input with Google Places Autocomplete API for accurate birth location selection. The system now:
1. Uses Google Places Autocomplete to search for cities worldwide
2. Retrieves exact coordinates (latitude/longitude)  
3. Uses Google Time Zone API to calculate timezone offset at the specific birth date/time
4. Validates all data before allowing report generation
5. Saves complete location data to both profile and natal_charts tables

## Files Created/Modified

### New Utilities
- `/lib/astrology/google-places-autocomplete.ts` - Client-side Google Places functions

### New API Endpoints
- `/app/api/places/autocomplete/route.ts` - Google Places autocomplete search
- `/app/api/places/details/route.ts` - Get place details and coordinates
- `/app/api/timezone/detect/route.ts` - Get timezone offset for coordinates + date/time

### Modified Components
- `/components/birth-location-selector.tsx` - Replaced with Google Places version

## Required Environment Variables

Add these to your Vercel project environment:
```
GOOGLE_PLACES_API_KEY=your_google_places_api_key
GOOGLE_TIMEZONE_API_KEY=your_google_timezone_api_key (optional, uses GOOGLE_PLACES_API_KEY as fallback)
```

Both can use the same API key if Google Maps API is enabled with Places and Time Zone services.

## How It Works

### User Flow
1. User types city name in birth location field (minimum 2 characters)
2. Google Places Autocomplete returns suggestions
3. User selects from dropdown
4. System fetches:
   - Place details (address components, coordinates)
   - Timezone name for those coordinates
   - Timezone offset for that specific birth date/time (accounts for DST)
5. All location data displayed in debug panel
6. System validates all required fields complete before report generation

### Data Structure

**Location object saved:**
```typescript
{
  city: "Cahul",
  country: "Republica Moldova",
  region: "Gagauzia",
  placeId: "ChIJxxx...",
  latitude: 45.9042,
  longitude: 28.1944,
  timezone: "Europe/Chisinau",
  timezoneOffset: 3  // or 2 if DST
}
```

**Saved to:**
- `profiles` table (user profile)
- `natal_charts` table (for each generated chart)

### Validation

Before calling generate-report, system checks:
- ✓ Birth date complete
- ✓ Birth time complete  
- ✓ Birth city selected (from Google Places dropdown, not free-text)
- ✓ Latitude exists (number)
- ✓ Longitude exists (number)
- ✓ Timezone offset exists (number)

If any missing, shows: "Selectează orașul nașterii din listă pentru calcul astrologic precis."

### Debug Panel

When location is selected, shows:
- City
- Country
- Region
- Place ID
- Latitude (4 decimals)
- Longitude (4 decimals)
- Timezone name (e.g., "Europe/Chisinau")
- Timezone offset (e.g., 3 or 2 for Romania)

## AstrologyAPI Integration

When calling AstrologyAPI, use:
```typescript
lat: birthLocation.latitude,      // 45.9042
lon: birthLocation.longitude,     // 28.1944
tzone: birthLocation.timezoneOffset  // 3 (number, not "Europe/Chisinau")
```

NOT the timezone name - must be numeric offset.

## Handling Existing Profiles

### Case 1: Profile has city but no coordinates
- Show alert: "Locația de naștere are nume dar nu are coordonate"
- Force user to reselect from Google Places
- This enriches the profile with coordinates

### Case 2: Profile is complete
- Pre-fill the location selector with city name
- User can optionally reselect or keep existing data

### Case 3: Profile has nothing
- Empty location selector
- User must select city before report generation

## Example Locations

When user types "Ca", suggestions include:
- Cairo, Egypt
- Cahul, Moldova
- Cambridge, United Kingdom
- Casablanca, Morocco
- etc.

User selects "Cahul, Moldova" → system gets:
- Place ID: ChIJ...
- Coordinates: 45.9042°N, 28.1944°E
- Timezone: Europe/Chisinau
- Birth date: 1990-05-15, Birth time: 14:30
- Timezone offset for that date: 3 hours (no DST in May)

## API Endpoints Reference

### POST /api/places/autocomplete
```json
{
  "input": "cah",
  "sessionToken": "optional",
  "componentRestrictions": { "country": ["md", "ro", ...] },
  "types": ["(cities)"]
}
```
Returns: Array of predictions with place_id and description

### POST /api/places/details
```json
{
  "placeId": "ChIJ...",
  "sessionToken": "optional",
  "fields": ["place_id", "formatted_address", "address_components", "geometry"]
}
```
Returns: Place details including latitude, longitude, address components

### POST /api/timezone/detect
```json
{
  "latitude": 45.9042,
  "longitude": 28.1944,
  "birthDate": "1990-05-15",
  "birthTime": "14:30"
}
```
Returns: Timezone name, numeric offset, DST status

## Build Status

✓ Successfully compiled - ready for testing

## Next Steps

1. Add GOOGLE_PLACES_API_KEY to Vercel environment
2. Test on profile edit page
3. Select a city from Google Places
4. Verify coordinates appear in debug panel
5. Verify timezone offset calculated correctly
6. Try generating report - should now work with complete location data
