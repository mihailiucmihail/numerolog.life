# ASTROLOGY REPORT GENERATION AUDIT - CRITICAL FINDINGS

## EXECUTIVE SUMMARY
The astrology report generation pipeline contains **multiple cache layers and fallback mechanisms** that can return stale or incorrect data. The primary issue is the horoscope/report caching system that returns cached reports without recalculation.

---

## ISSUE #1: CACHED REPORTS SYSTEM (CRITICAL)

**Location:** `/app/api/horoscope/generate/route.ts` (lines 323-373)

**Problem:**
```typescript
// CHECK CACHE FIRST - return existing report if found
const { data: cachedReport } = await supabase
  .from("ai_reports")
  .select("*")
  .eq("user_id", userId)
  .eq("natal_chart_id", natalChart.id)
  .eq("report_type", "full")
  .single()

if (cachedReport) {
  // Return cached report with fresh transits/cycles
  return Response.json({
    interpretation: cachedReport.report_data,  // ← STALE DATA RETURNED HERE
    cached: true
  })
}
```

**Impact:**
- Old incorrect zodiac combinations can persist
- If Sun was calculated wrong initially, ALL future reports return the same error
- Users cannot force regeneration without manual database deletion

**Data Flow:**
```
Birth Data → Astrology Provider → AI Interpretation → Database Save
                                                              ↓
                                                        CACHE CHECK ← Returns stale data
                                                        (never recalculates)
```

---

## ISSUE #2: SESSION STORAGE CACHING

**Locations:**
- `/app/analiza-destinului/page.tsx` (lines 297, 387)
- `/app/analiza-destinului/rezultat/page.tsx` (lines 300, 330, 387)

**Problem:**
```typescript
// sessionStorage persists across page reloads
sessionStorage.setItem("destiny_analysis_result", JSON.stringify(result))

// Later, returns cached version without recalculation
const cachedResult = sessionStorage.getItem("destiny_analysis_result")
if (cachedResult) {
  return cached data  // ← Stale data
}
```

---

## ISSUE #3: MOCK PROVIDER IN FALLBACK

**Location:** `/lib/astrology/init.ts` & `/lib/astrology/mock-provider.ts`

**Problem:**
- Mock provider generates pseudo-random data
- Uses `seededRandom()` which produces **deterministic but INCORRECT positions**
- Sun position calculated as: `sunLongitude = ((dayOfYear / 365) * 360 + 280) % 360`
- This IGNORES actual ephemeris data

**Mock Provider Sun Calculation (WRONG):**
```typescript
// Simplified/wrong calculation - NOT based on real ephemeris
const dayOfYear = this.getDayOfYear(birthDate)
const sunLongitude = ((dayOfYear / 365) * 360 + 280) % 360 // APPROXIMATION
const sunSign = ZODIAC_SIGNS[Math.floor(sunLongitude / 30)]  // Potentially wrong
```

**Actual Calculation Needed for 1992-10-05:**
- October 5, 1992 = 279 day of year
- True Sun position = ~12° Libra (Balanță) at 288-289°
- Mock would calculate: ((279/365) * 360 + 280) % 360 ≈ 556.2 % 360 = 196.2° = Virgo (WRONG!)

---

## ISSUE #4: REPORT DATA API (Partial Issue)

**Location:** `/app/api/report/data/route.ts`

**Status:** ✓ GOOD - Gets fresh data from database
- Loads natal chart from Supabase
- Calculates scores from current chart data
- Marks source as `'real-astrology-engine'`

**Issue:** Scores can be incorrect if **natal chart data is wrong**

---

## ISSUE #5: DATA PERSISTENCE FLOW

**Chart:**
```
User Input (Birth Data)
        ↓
   Astrology Provider Selection:
   ├─ Real API Provider (if ASTROLOGY_API_KEY set)
   ├─ Mock Provider (if ALLOW_MOCK_ASTROLOGY=true)
   └─ Error (in production without API key)
        ↓
   Database Storage (natal_charts table)
        ↓
   [CACHE LAYER #1] - horoscope/generate checks ai_reports
        ↓
   [CACHE LAYER #2] - sessionStorage in destiny analysis
        ↓
   Frontend Render
```

---

## VALIDATION DATA

**Test Birth Date: 1992-10-05**
- ✓ Correct: Sun in Libra (Balanță) @ ~12°
- ✗ Mock would generate: Wrong Sun position (due to simplified calculation)
- ✗ Cached would return: Previous (possibly wrong) data

---

## ROOT CAUSES OF INCORRECT ZODIAC COMBINATIONS

1. **Cache Layer #1 (Horoscope API)** - Returns old ai_reports table data
2. **Cache Layer #2 (SessionStorage)** - Browser-side cache persists errors
3. **Mock Provider** - Fallback uses approximate calculations instead of ephemeris
4. **Stale Natal Chart** - If initial calculation was wrong, all derived data inherits the error
5. **No Validation** - System doesn't validate Sun ≠ Leo for 1992-10-05

---

## AFFECTED FILES

### Database Queries with Caching:
- ❌ `/app/api/horoscope/generate/route.ts` - Caches full reports
- `/app/api/report/data/route.ts` - Reads from database (not cached)

### Frontend Caching:
- ❌ `/app/analiza-destinului/page.tsx` - sessionStorage
- ❌ `/app/analiza-destinului/rezultat/page.tsx` - sessionStorage

### Astrology Engine:
- ⚠️ `/lib/astrology/mock-provider.ts` - Uses approximations
- ✓ `/lib/astrology/astrology-api-provider.ts` - Real calculations (if configured)
- ✓ `/lib/astrology/init.ts` - Provider initialization

### Score Calculation:
- ✓ `/lib/astrology/astrological-scores.ts` - Uses real data if provided

---

## RECOMMENDED FIXES

### Priority 1: Disable Horoscope Cache
- Remove cached report return logic from `/app/api/horoscope/generate/route.ts`
- Always recalculate reports from fresh natal chart data

### Priority 2: Remove SessionStorage Caching
- Delete sessionStorage usage in destiny analysis pages
- Fetch fresh data from API on each render

### Priority 3: Add Validation
- Validate Sun sign matches expected value for known dates
- Stop report generation if validation fails with clear error message

### Priority 4: Ensure Real Provider
- Set `ASTROLOGY_API_KEY` in production
- Never allow mock provider in production
- Log warnings if mock provider is active

### Priority 5: Force Fresh Generation
- Add "Regenerate Fresh Report" button that clears all caches
- Implement ignore-cache query parameter

---

## VALIDATION CHECKPOINT

For any report with birth_date = "1992-10-05":
- Must have `sun_sign = "Libra"` OR `sun_sign = "Balanță"`
- If `sun_sign = "Leo"` or `sun_sign = "Leu"` → INVALID DATA
- Stop rendering, show error: "Invalid astrology data detected. Please regenerate."
