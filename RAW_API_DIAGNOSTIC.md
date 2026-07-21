# Raw AstrologyAPI Diagnostic Endpoint

## Purpose
Shows EXACTLY what is sent to and received from AstrologyAPI with zero interpretation or formatting.

## Access
Visit: `/api/debug/raw-astrology`

## Output Format
Plain text showing:
1. Exact URL called
2. Exact request headers (API key masked)
3. Exact request method (GET)
4. Exact HTTP status code
5. Exact raw response body (no parsing)

## Example Success Output
```
═══════════════════════════════════════════════════════════════
RAW ASTROLOGYAPI DIAGNOSTIC
═══════════════════════════════════════════════════════════════

URL:
https://json.astrologyapi.com/v1/planets/tropical?date=1992-10-05&time=08:39:00&lat=46.0&lon=28.19&ttz=2

REQUEST METHOD:
GET

REQUEST HEADERS:
Authorization: Bearer xxxxxxx...
Accept: application/json

REQUEST PAYLOAD:
(none - GET request)

═══════════════════════════════════════════════════════════════

HTTP STATUS:
200

RESPONSE BODY:
{
  "planets": {
    "Sun": { ... },
    "Moon": { ... },
    ...
  }
}

═══════════════════════════════════════════════════════════════
```

## Example Failure Output
```
HTTP STATUS:
401

RESPONSE BODY:
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
```

## What to Check

### If HTTP 200:
- AstrologyAPI received the request successfully
- API key is valid
- Response body contains the data

### If HTTP 401:
- API key is invalid or missing
- Check `ASTROLOGY_API_KEY` environment variable
- Verify API key hasn't expired

### If HTTP 429:
- Rate limit exceeded
- Wait before retrying

### If HTTP 500+:
- AstrologyAPI server error
- Try again later

### If REQUEST FAILED:
- Network connectivity issue
- Firewall blocking astrologyapi.com
- DNS resolution problem

## No Interpretation
This endpoint shows:
- ✓ Raw response body as-is
- ✓ Exact HTTP status
- ✓ Exact URL and headers
- ✗ NO parsing
- ✗ NO success/failure labels
- ✗ NO data transformation
- ✗ NO REAL_API markings

Use this to debug exactly what AstrologyAPI is responding with.
