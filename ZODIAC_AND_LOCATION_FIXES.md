# Zodiac Validation and Location Data Fixes

## Issues Fixed

### 1. Zodiac Validation Using Canonical Comparison

**Problem:**
- Debug panel showed "Data Source: REAL" with "Sun: Balanta"
- But validation failed because it used simple array `.includes()` check
- `['Libra', 'Balanță'].includes('Balanta')` returned false even though they're the same sign

**Solution:**
- Updated debug panel to use canonical zodiac comparison function `zodiacSignMatches()`
- `normalizeZodiac()` converts all variations to canonical IDs: 'balanta' → 'libra'
- Validation now correctly recognizes: Balanta = Balanță = Libra (all map to canonical 'libra')

**Files Updated:**
- `/components/dev-debug-panel.tsx` - Added zodiac normalization import and canonical comparison

**Test Case:**
- Birth date: 1992-10-05
- Sun sign: "Balanta" or "Balanță" or "Libra"
- Expected: PASS ✓ (all normalize to 'libra')
- Sun sign: "Leo" or "Leu"
- Expected: FAIL ✗ (canonical 'leo' ≠ 'libra')

### 2. Location Data - Added Cahul and Moldova Cities

**Problem:**
- Debug panel showed: "TZ: N/A | Lat: N/A | Lng: N/A"
- Cahul, Moldova coordinates were missing from geocoding database

**Solution:**
- Added Moldova cities to geocoding database including:
  - Cahul: 45.9958°N, 28.1936°E, Europe/Chisinau
  - Chișinău, Bălți, Tiraspol, Bender
- Debug panel now auto-geocodes missing coordinates using city database
- Falls back to OpenStreetMap Nominatim API if city not in local database

**Files Updated:**
- `/lib/astrology/geocoding.ts` - Added Moldova cities with exact coordinates

**Implementation:**
- If coordinates are missing or 0:
  1. Try local geocoding database (includes Cahul)
  2. Fall back to Nominatim API
  3. Show "Coordonate necesare pentru calcul avansat" if still missing

### 3. Data Source Status Validation

**Problem:**
- If validation failed, debug panel incorrectly showed "Mock/Fallback Data" warning
- But only zodiac issues indicate mock data, not location issues

**Solution:**
- `dataSource` detection now only marks as 'fallback' on zodiac mismatch
- Location missing doesn't affect real/mock determination
- If Sun sign matches expected value, shows "✅ Real Data" even if coordinates missing

**Status Logic:**
- Real Data: Zodiac validation passes + flag indicates real
- Mock Data: Zodiac validation fails
- Fallback: No provider flag set

## Expected Results After Fix

For birth date **1992-10-05** in **Cahul, Republica Moldova**:

✅ Sun Sign Test: PASS
- Input: "Balanta" → Normalized: "libra"
- Expected: "libra"
- Result: "Balanta = Balanță = Libra" ✓

✅ Status: REAL DATA
- Zodiac validation passes
- Shows: "✅ Real Data" (not mock warning)

✅ Location Data: COMPLETE
- City: Cahul
- Latitude: 45.9958°N
- Longitude: 28.1936°E
- Timezone: Europe/Chisinau

## Validation Rules

1. **Zodiac Comparison**: Uses canonical lowercase IDs (aries, libra, leo, etc.)
2. **Location Required**: Latitude, longitude, and timezone needed for full calculations
3. **Data Source**: Only marked as mock if zodiac validation fails
4. **Geocoding**: Auto-fills missing coordinates for known cities

## Testing

Test with debug panel in development mode:
- Visit `/raport` when logged in
- Yellow debug panel appears in bottom-right corner
- Displays: Birth data, planetary positions, zodiac validation, location data
- Shows exact canonical values for all zodiac signs
