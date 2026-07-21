# Report Generation - Complete Testing Guide

## Quick Start: How to Test

1. **Stop testing connection pages** - We're testing REAL report generation
2. **Visit `/raport`** in browser
3. **Open browser console** (F12)
4. **Check server logs** for `[API]` messages
5. **Look for which STEP fails**

## What Should Happen

User visits `/raport`:
1. Auto-generation triggered
2. System calls AstrologyAPI
3. Data saved to `natal_charts`
4. Report displays

## The 6 Steps (Exact Order)

### STEP 1: Input Validation
- Checks: date, time, coordinates, timezone provided
- Log: `[API] [${traceId}] ✓ Inputs valid`
- If fails: `[API] [${traceId}] ✗ FAILED: Missing required fields`

### STEP 2: Authentication  
- Checks: User is logged in
- Log: `[API] [${traceId}] ✓ User authenticated: ${userId}`
- If fails: `[API] [${traceId}] ✗ FAILED: Not authenticated`

### STEP 3: Call planets/tropical
- Makes HTTP GET request to AstrologyAPI
- URL: `https://json.astrologyapi.com/v1/planets/tropical?date=...&time=...&lat=...&lon=...&ttz=...`
- Expects: HTTP 200 with `{planets: {...}}`
- Log shows:
  - Full URL with all params
  - HTTP Status code
  - `Success: YES` or `Success: NO`
  - Response size
- If fails: `[API] [${traceId}] ✗ FAILED: planets/tropical returned ${statusCode}`

### STEP 4: Call house_cusps/tropical
- Makes HTTP GET request to AstrologyAPI
- URL: `https://json.astrologyapi.com/v1/house_cusps/tropical?date=...&time=...&lat=...&lon=...&ttz=...`
- Expects: HTTP 200 with `{houses: {...}}`
- Same logging as STEP 3
- If fails: `[API] [${traceId}] ✗ FAILED: house_cusps/tropical returned ${statusCode}`

### STEP 5: Combine Data
- Merges planets + houses responses
- Always succeeds if STEP 3+4 succeeded
- Log: `[API] [${traceId}] ✓ Data combined successfully`

### STEP 6: Insert into natal_charts
- Inserts combined data into database
- Logs all fields being inserted
- Expected output:
  ```
  [API] [${traceId}] ✓ SUCCESS: Chart inserted into database
  [API] [${traceId}] Chart ID: ${chartId}
  ```
- If fails: Shows error message and error code

## Expected Full Success Log

```
[API] ========== GENERATE-REPORT START ==========
[API] [gen-1234567890] STEP 1: Input Validation
[API] [gen-1234567890] ✓ Inputs valid
[API] [gen-1234567890] STEP 2: Authentication
[API] [gen-1234567890] ✓ User authenticated: user-123
[API] [gen-1234567890] STEP 3: Call planets/tropical (REQUIRED)
[API] [gen-1234567890] === PLANETS/TROPICAL REQUEST ===
[API] [gen-1234567890] Status: 200
[API] [gen-1234567890] Success: YES
[API] [gen-1234567890] ✓ planets/tropical SUCCESS (1245ms)
[API] [gen-1234567890] STEP 4: Call house_cusps/tropical (REQUIRED)
[API] [gen-1234567890] === HOUSE_CUSPS/TROPICAL REQUEST ===
[API] [gen-1234567890] Status: 200
[API] [gen-1234567890] Success: YES
[API] [gen-1234567890] ✓ house_cusps/tropical SUCCESS (1180ms)
[API] [gen-1234567890] STEP 5: Combine AstrologyAPI responses
[API] [gen-1234567890] ✓ Data combined successfully
[API] [gen-1234567890] STEP 6: Insert into natal_charts
[API] [gen-1234567890] ✓ SUCCESS: Chart inserted into database
[API] [gen-1234567890] Chart ID: chart-xyz-789
[API] [gen-1234567890] ========== GENERATE-REPORT SUCCESS ==========
[API] [gen-1234567890] SUMMARY:
[API] [gen-1234567890]   ✓ STEP 1: Input validation - SUCCESS
[API] [gen-1234567890]   ✓ STEP 2: Authentication - SUCCESS (userId: user-123)
[API] [gen-1234567890]   ✓ STEP 3: planets/tropical - SUCCESS (1245ms, 10 planets)
[API] [gen-1234567890]   ✓ STEP 4: house_cusps/tropical - SUCCESS (1180ms, 12 houses)
[API] [gen-1234567890]   ✓ STEP 5: Data combination - SUCCESS
[API] [gen-1234567890]   ✓ STEP 6: Database insert - SUCCESS (chartId: chart-xyz-789)
[API] [gen-1234567890] ========== END SUCCESS ==========
```

## Identifying Failures

### If STEP 3 fails:
```
[API] [gen-1234567890] Status: 401
[API] [gen-1234567890] Success: NO
[API] [gen-1234567890] ✗ FAILED: planets/tropical returned 401
```
Check: ASTROLOGY_API_KEY set? API key valid? Rate limit?

### If STEP 4 fails:
```
[API] [gen-1234567890] Status: 429
[API] [gen-1234567890] Success: NO
[API] [gen-1234567890] ✗ FAILED: house_cusps/tropical returned 429
```
Check: Rate limit exceeded? Wait and retry.

### If STEP 6 fails:
```
[API] [gen-1234567890] ✗ FAILED: Database insert error
[API] [gen-1234567890] Error message: duplicate key value violates unique constraint
[API] [gen-1234567890] Error code: 23505
```
Check: Database permissions? RLS policies? Constraint issues?

## Success Verification

After seeing "========== END SUCCESS ==========", verify:

1. Browser console shows: `[v0] [REPORT] ✓ Data loaded successfully`
2. Report page displays astrological data (not "No natal chart found")
3. Run: `GET /api/debug/natal-chart` - should show chartCount > 0
4. Database: `SELECT * FROM natal_charts WHERE user_id = ?` returns 1 row
5. Chart has `data_source: 'REAL_API'` and `source: 'AstrologyAPI'`

## Environment Check

Before testing:
1. Is `ASTROLOGY_API_KEY` set?
2. Can you visit other pages (auth works)?
3. Is database connection working?
4. Is `/api/report/data` endpoint accessible?

## No More Diagnostic Pages

This version has:
- No `/api/test/*` endpoints
- No `/debug/*` exploratory pages
- No fake data generation
- Only REAL report generation with step-by-step logging

Focus on the actual flow that happens when users visit `/raport`.
