# AstrologyAPI Debug - Minimal Version

## What Changed
Replaced complex generate-report with minimal version that ONLY:
1. Receives request
2. Calls AstrologyAPI
3. Returns raw response

Everything else temporarily disabled for debugging:
- ✗ OpenAI interpretation
- ✗ PDF generation
- ✗ Supabase save
- ✗ Scoring engine
- ✗ All async operations

## Debug Logging

### Frontend Console Logs
```
[FRONTEND] calling /api/astrology/generate-report
[FRONTEND] response status 200
[FRONTEND] response body: { success: true, data: { ... } }
```

### Server Console Logs
```
[API] generate-report route reached
[API] Inputs validated: { birthDate, birthTime, latitude, longitude, timezone }
[API] calling AstrologyAPI planets/tropical
[API] AstrologyAPI response status 200 (1245ms)
[API] AstrologyAPI response received successfully
[API] Returning raw AstrologyAPI response
```

## Request Flow

1. **Frontend** logs: "[FRONTEND] calling /api/astrology/generate-report"
2. **API Route** logs: "[API] generate-report route reached"
3. **Before API Call** logs: "[API] calling AstrologyAPI planets/tropical"
4. **After API Call** logs: "[API] AstrologyAPI response status 200"
5. **Response** returns: raw AstrologyAPI data

## Expected Behavior

### Success
- AstrologyAPI request counter increases by 1
- Response status 200
- Response body contains planets, houses, etc.
- All console logs appear

### Timeout
- After 15 seconds: request aborts
- Response status 504
- Response error: "AstrologyAPI request timed out (15s)"
- Console logs: "[API] ERROR: AbortError"

### Validation Error
- Response status 400
- Response error: "Missing required fields..."

## Testing

Open browser console (F12) and watch for logs:
1. "[FRONTEND] calling /api/astrology/generate-report" appears immediately
2. "[API] generate-report route reached" should appear in server logs
3. "[API] calling AstrologyAPI planets/tropical" should appear
4. "[API] AstrologyAPI response status 200 (Xms)" should appear
5. "[FRONTEND] response status 200" should appear

If any log is missing, that's where the flow breaks.

## Minimal API Code
- 148 lines total (was 300+)
- No async waits that could hang
- 15s hard timeout on AstrologyAPI request
- Clear error responses with step identification

Build: ✓ Successfully compiled
