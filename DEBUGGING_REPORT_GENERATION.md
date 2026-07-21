# Debugging Report Generation - Complete Logging Guide

## Overview
The report generation flow has been instrumented with detailed step-by-step logging. This guide shows exactly what logs to look for to identify which step fails.

## The 6-Step Generation Flow

### STEP 1: Input Validation
```
[API] [gen-1234567890] STEP 1: Input Validation
[API] [gen-1234567890] ✓ Inputs valid:
[API] [gen-1234567890]   Date: 1990-05-15
[API] [gen-1234567890]   Time: 14:30:00
[API] [gen-1234567890]   Coords: 45.9042, 28.1944
[API] [gen-1234567890]   Timezone: 3
```

**Success indicator**: "✓ Inputs valid"  
**Failure**: "✗ FAILED: Missing required fields"

### STEP 2: Authentication
```
[API] [gen-1234567890] STEP 2: Authentication
[API] [gen-1234567890] ✓ User authenticated: user-abc-123
```

**Success indicator**: "✓ User authenticated"  
**Failure**: "✗ FAILED: Not authenticated"

### STEP 3: Call planets/tropical (CRITICAL)
```
[API] [gen-1234567890] STEP 3: Call planets/tropical (REQUIRED)
[API] [gen-1234567890] === PLANETS/TROPICAL REQUEST ===
[API] [gen-1234567890] URL: https://json.astrologyapi.com/v1/planets/tropical?date=1990-05-15&time=14:30:00&lat=45.9042&lon=28.1944&ttz=3
[API] [gen-1234567890] Method: GET
[API] [gen-1234567890] Auth: Bearer ***
[API] [gen-1234567890] Params: { date: '1990-05-15', time: '14:30:00', lat: 45.9042, lon: 28.1944, ttz: 3 }
[API] [gen-1234567890] === PLANETS/TROPICAL RESPONSE ===
[API] [gen-1234567890] Status: 200
[API] [gen-1234567890] Elapsed: 1245ms
[API] [gen-1234567890] Success: YES
[API] [gen-1234567890] Body (first 500 chars): {"planets": {...}}
[API] [gen-1234567890] ✓ planets/tropical SUCCESS (1245ms)
[API] [gen-1234567890] Planets returned: 10
```

**Success indicator**: "Success: YES" + "✓ planets/tropical SUCCESS"  
**Failure indicators**:
- "Success: NO" → Check the response body
- "✗ FAILED: planets/tropical returned 401" → Auth error
- "✗ FAILED: planets/tropical returned 429" → Rate limit
- "✗ FAILED: planets/tropical missing planets data" → Response missing data

### STEP 4: Call house_cusps/tropical (CRITICAL)
```
[API] [gen-1234567890] STEP 4: Call house_cusps/tropical (REQUIRED)
[API] [gen-1234567890] === HOUSE_CUSPS/TROPICAL REQUEST ===
[API] [gen-1234567890] URL: https://json.astrologyapi.com/v1/house_cusps/tropical?date=1990-05-15&time=14:30:00&lat=45.9042&lon=28.1944&ttz=3
[API] [gen-1234567890] Method: GET
[API] [gen-1234567890] Auth: Bearer ***
[API] [gen-1234567890] Params: { date: '1990-05-15', time: '14:30:00', lat: 45.9042, lon: 28.1944, ttz: 3 }
[API] [gen-1234567890] === HOUSE_CUSPS/TROPICAL RESPONSE ===
[API] [gen-1234567890] Status: 200
[API] [gen-1234567890] Elapsed: 1180ms
[API] [gen-1234567890] Success: YES
[API] [gen-1234567890] Body (first 500 chars): {"houses": {...}}
[API] [gen-1234567890] ✓ house_cusps/tropical SUCCESS (1180ms)
[API] [gen-1234567890] Houses returned: 12
```

**Success indicator**: "Success: YES" + "✓ house_cusps/tropical SUCCESS"  
**Failure indicators** (same as planets/tropical):
- "Success: NO" → Check response body
- HTTP 401, 429, etc.
- Missing houses data

### STEP 5: Data Combination
```
[API] [gen-1234567890] STEP 5: Combine AstrologyAPI responses
[API] [gen-1234567890] ✓ Data combined successfully
```

**Success indicator**: "✓ Data combined successfully"  
**This should always succeed if steps 3-4 succeeded**

### STEP 6: Database Insert (CRITICAL)
```
[API] [gen-1234567890] STEP 6: Insert into natal_charts
[API] [gen-1234567890] Upserting chart data:
[API] [gen-1234567890]   user_id: user-abc-123
[API] [gen-1234567890]   birth_date: 1990-05-15
[API] [gen-1234567890]   birth_time: 14:30:00
[API] [gen-1234567890]   birth_latitude: 45.9042
[API] [gen-1234567890]   birth_longitude: 28.1944
[API] [gen-1234567890]   birth_timezone: 3
[API] [gen-1234567890]   raw_api_response size: 4532 bytes
[API] [gen-1234567890]   trace_id: gen-1234567890
[API] [gen-1234567890]   source: AstrologyAPI
[API] [gen-1234567890]   data_source: REAL_API
[API] [gen-1234567890] ✓ SUCCESS: Chart inserted into database
[API] [gen-1234567890] Chart ID: chart-xyz-789
[API] [gen-1234567890] Rows affected: 1
```

**Success indicator**: "✓ SUCCESS: Chart inserted into database" + "Chart ID: ..."  
**Failure indicators**:
- "✗ FAILED: Database insert error"
- Error message shown
- Error code shown

## Complete Success Flow

```
[API] ========== GENERATE-REPORT START ==========
[API] [gen-1234567890] STEP 1: Input Validation
[API] [gen-1234567890] ✓ Inputs valid
[API] [gen-1234567890] STEP 2: Authentication
[API] [gen-1234567890] ✓ User authenticated: user-abc-123
[API] [gen-1234567890] STEP 3: Call planets/tropical (REQUIRED)
[API] [gen-1234567890] === PLANETS/TROPICAL REQUEST ===
... request details ...
[API] [gen-1234567890] === PLANETS/TROPICAL RESPONSE ===
[API] [gen-1234567890] Status: 200
[API] [gen-1234567890] Success: YES
[API] [gen-1234567890] ✓ planets/tropical SUCCESS (1245ms)
[API] [gen-1234567890] Planets returned: 10
[API] [gen-1234567890] STEP 4: Call house_cusps/tropical (REQUIRED)
[API] [gen-1234567890] === HOUSE_CUSPS/TROPICAL REQUEST ===
... request details ...
[API] [gen-1234567890] === HOUSE_CUSPS/TROPICAL RESPONSE ===
[API] [gen-1234567890] Status: 200
[API] [gen-1234567890] Success: YES
[API] [gen-1234567890] ✓ house_cusps/tropical SUCCESS (1180ms)
[API] [gen-1234567890] Houses returned: 12
[API] [gen-1234567890] STEP 5: Combine AstrologyAPI responses
[API] [gen-1234567890] ✓ Data combined successfully
[API] [gen-1234567890] STEP 6: Insert into natal_charts
[API] [gen-1234567890] Upserting chart data:
... field details ...
[API] [gen-1234567890] ✓ SUCCESS: Chart inserted into database
[API] [gen-1234567890] Chart ID: chart-xyz-789
[API] [gen-1234567890] ========== GENERATE-REPORT SUCCESS ==========
[API] [gen-1234567890] SUMMARY:
[API] [gen-1234567890]   ✓ STEP 1: Input validation - SUCCESS
[API] [gen-1234567890]   ✓ STEP 2: Authentication - SUCCESS
[API] [gen-1234567890]   ✓ STEP 3: planets/tropical - SUCCESS (1245ms, 10 planets)
[API] [gen-1234567890]   ✓ STEP 4: house_cusps/tropical - SUCCESS (1180ms, 12 houses)
[API] [gen-1234567890]   ✓ STEP 5: Data combination - SUCCESS
[API] [gen-1234567890]   ✓ STEP 6: Database insert - SUCCESS (chartId: chart-xyz-789)
[API] [gen-1234567890] ========== END SUCCESS ==========
```

## Common Failure Scenarios

### Failure at STEP 3: planets/tropical
**What to look for:**
```
[API] [gen-1234567890] Status: 401
[API] [gen-1234567890] Success: NO
[API] [gen-1234567890] Body (first 500 chars): {"error":"Unauthorized"...}
[API] [gen-1234567890] ✗ FAILED: planets/tropical returned 401
```

**What to check:**
1. Is `ASTROLOGY_API_KEY` set in environment?
2. Is the API key valid?
3. Has the rate limit been exceeded?

### Failure at STEP 4: house_cusps/tropical
**What to look for:**
```
[API] [gen-1234567890] STEP 4: Call house_cusps/tropical (REQUIRED)
[API] [gen-1234567890] Status: 429
[API] [gen-1234567890] Success: NO
[API] [gen-1234567890] Body (first 500 chars): {"error":"Rate limit exceeded"...}
[API] [gen-1234567890] ✗ FAILED: house_cusps/tropical returned 429
```

**What to check:**
1. Is the rate limit exceeded?
2. Wait and retry

### Failure at STEP 6: Database Insert
**What to look for:**
```
[API] [gen-1234567890] STEP 6: Insert into natal_charts
[API] [gen-1234567890] Upserting chart data:
... fields ...
[API] [gen-1234567890] ✗ FAILED: Database insert error
[API] [gen-1234567890] Error message: duplicate key value violates unique constraint
[API] [gen-1234567890] Error code: 23505
[API] [gen-1234567890] Error details: {...}
```

**What to check:**
1. Are there permission issues with the table?
2. Is there a constraint violation?
3. Check Supabase RLS policies

## Testing Instructions

1. Open browser console (F12)
2. Visit `/raport`
3. Check server logs (where backend is running)
4. Look for logs starting with `[API]`
5. Find the trace ID (gen-TIMESTAMP)
6. Follow the entire flow from STEP 1 to SUMMARY
7. Note which step shows "✗ FAILED"

## Success Indicators

1. Browser console shows: "[v0] [REPORT] ✓ Data loaded successfully"
2. Server logs show all 6 steps completed with ✓
3. Report page displays astrological data
4. No "No natal chart found" error

## Next Steps if Everything Succeeds

1. Check `/api/debug/natal-chart` - should show chart count > 0
2. Check database directly - `SELECT * FROM natal_charts WHERE user_id = ?`
3. Chart should have `data_source: 'REAL_API'` and `source: 'AstrologyAPI'`
4. Chart should have complete `raw_api_response` with planets and houses
