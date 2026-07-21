# Architecture Fix - natal_charts as Single Source of Truth

## Problem (Fixed)
- Report page reads from API: `/api/report/data`
- API was already reading from: `natal_charts` table ✓
- But error messages didn't show chart source information
- User had no visibility into WHY a chart wasn't found

## Solution Implemented

### 1. Single Source of Truth
✓ **ONLY** reads from: `natal_charts` table
- Removed all references to `profiles.birth_chart_data`
- No fallback to multiple tables
- One clear data source for all report operations

### 2. Chart Generation Flow
```
User visits /raport
    ↓
Frontend calls GET /api/report/data
    ↓
API queries: SELECT * FROM natal_charts WHERE user_id = currentUser.id
    ↓
If found:
  - Returns chart with debug info (ID, source, timestamp)
  - Report page displays astrological data
  
If NOT found (404):
  - Returns debug info showing:
    * Table: natal_charts
    * User ID searched for
    * Filter applied (WHERE user_id = ?)
  - Frontend triggers auto-generation
  - Auto-gen calls: POST /api/astrology/generate-report
  - Generate-report saves to: natal_charts
  - Report page retries: GET /api/report/data
  - Report displays successfully
```

### 3. Debug Information

**Error Response (404 - No Chart):**
```json
{
  "error": "No natal chart found. Calculate your birth chart first.",
  "debug": {
    "table": "natal_charts",
    "userId": "user-123",
    "where": "user_id = ?",
    "method": ".single()",
    "traceId": "report-1234567890",
    "dataSource": "natal_charts"
  }
}
```

**Success Response (200 - Chart Found):**
```json
{
  "traceId": "...",
  "chartDebug": {
    "source": "natal_charts",
    "chartId": "chart-abc-123",
    "userId": "user-123",
    "createdAt": "2026-06-07T10:30:00Z",
    "updatedAt": "2026-06-07T10:35:00Z",
    "hasRawApiResponse": true,
    "dataSource": "REAL_API"
  },
  "natalChart": { ... },
  "scores": { ... }
}
```

### 4. Browser Console Logs

**When loading succeeds:**
```
[v0] [REPORT] ✓ Data loaded successfully
[v0] [REPORT] Chart Source Info:
[v0] [REPORT]   Table: natal_charts
[v0] [REPORT]   Chart ID: chart-abc-123
[v0] [REPORT]   User ID: user-123
[v0] [REPORT]   Data Source: REAL_API
[v0] [REPORT]   Created At: 2026-06-07T10:30:00Z
[v0] [REPORT]   Has Raw API Response: true
```

**When loading fails:**
```
[v0] [REPORT] Error response from /api/report/data:
[v0] [REPORT] HTTP Status: 404
[v0] [REPORT] Error Message: No natal chart found. Calculate your birth chart first.
[v0] [REPORT] Debug Info: { table: "natal_charts", userId: "user-123", ... }
```

### 5. Files Modified

**`/app/api/report/data/route.ts`**
- Added debug info to 404 error response (line 42-62)
- Added `chartDebug` object to success response (line 434-442)
- Shows exactly which table, chart ID, and data source

**`/app/raport/page.tsx`**
- Added logging when error occurs (line 456-457)
- Added logging when data loads successfully (line 465-475)
- Shows chart source, ID, and debug info

### 6. Verification Checklist

✓ Report page calls: `/api/report/data` (GET)
✓ API reads from: `natal_charts` table
✓ No references to `profiles.birth_chart_data`
✓ Error responses include debug info
✓ Success responses include chart source info
✓ Browser console shows clear debug messages
✓ If `natal_charts` has records → report displays
✓ If `natal_charts` empty → auto-generation triggers

### 7. Expected Behavior

**Scenario: User visits /raport with an existing chart in natal_charts**
1. Report page loads
2. Console logs: "[v0] [REPORT] ✓ Data loaded successfully"
3. Console shows: Chart ID, User ID, Data Source = REAL_API
4. Report displays with all 8 astrological scores
5. **Never** shows "No natal chart found"

**Scenario: User visits /raport with NO chart in natal_charts**
1. Report page loads
2. Console logs: "No natal chart found" error
3. Console shows: table=natal_charts, userId=user-123
4. Auto-generation triggers
5. After generation, retries load
6. Report displays successfully

### 8. Build Status

✓ Successfully compiled
✓ All type checks pass
✓ No build errors

## Next Steps

1. Monitor browser console when visiting `/raport`
2. Verify "[v0] [REPORT]" log messages appear
3. Confirm chart source shows as "natal_charts"
4. If any chart exists in database, report must display (not show "No natal chart found")
