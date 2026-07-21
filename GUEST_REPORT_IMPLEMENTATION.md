# Guest Report Flow Implementation - Complete

## Overview
Implemented a complete guest report system allowing visitors to generate natal chart previews without registration, with automatic account linking upon signup/login.

## Database Schema

### New Table: `guest_reports`
Created in `/supabase/migrations/003_guest_reports_table.sql`

**Structure**:
- `id` (UUID): Primary key
- `guest_token` (text, unique): Unique token for client-side storage
- `user_id` (UUID, nullable): Links to authenticated user when converted
- `birth_*` fields: Full birth data (date, time, city, country, coordinates, timezone)
- `natal_chart_data` (JSONB): Complete chart calculation data
- `preview_data` (JSONB): Summary data for initial preview
- `sun_sign, moon_sign, ascendant_sign`, etc.: Quick-access astrological signs
- `status` (text): 'guest', 'converted', or 'expired'
- `data_source` (text): 'real_api', 'fallback', or 'mock'
- `created_at, updated_at, expires_at`: Timestamps (7-day expiration by default)

**RLS Policies**:
- Anyone can view guest reports (not yet converted)
- Anyone can create guest reports
- Authenticated users can view reports linked to them
- Authenticated users can update reports to link them

---

## Implementation Files

### 1. Database Migration
**File**: `/supabase/migrations/003_guest_reports_table.sql`
- Creates `guest_reports` table with all required fields
- Sets up RLS policies for secure guest access
- Creates indexes on `guest_token`, `user_id`, `status`, `expires_at`

### 2. Guest Reports Utility
**File**: `/lib/supabase/guest-reports.ts`
- `generateGuestToken()`: Creates unique token using Node crypto
- `createGuestReport(data)`: Saves guest chart to database
- `getGuestReportByToken(token)`: Retrieves guest report
- `linkGuestReportToUser(token, userId)`: Links report to authenticated user
- `getConvertedReports(userId)`: Fetches user's converted reports
- `convertGuestReportToNatalChart(guestReport, userId)`: Creates permanent natal chart

### 3. Natal Chart Calculate Endpoint
**File**: `/app/api/natal-chart/calculate/route.ts` (Modified)

**New Features**:
- `x-guest-request` header support: Allows unauthenticated chart generation
- Dual save path:
  - Authenticated users → `natal_charts` table (permanent)
  - Guests → `guest_reports` table (temporary, 7-day expiration)
- Returns `guestToken` and `guestReportId` in response for client storage
- Comprehensive logging with trace IDs

**Flow**:
1. Check if user authenticated
2. If yes: Save to `natal_charts` (existing behavior)
3. If no: Create `guest_reports` entry with unique token
4. Return chart data + `guestToken` if guest
5. Client stores `guestToken` in localStorage/cookie

### 4. Guest Report Link Endpoint
**File**: `/app/api/guest-reports/link/route.ts` (New)

**Purpose**: Called after user signup/login with their guest token

**Process**:
1. Verify user is authenticated
2. Accept `guestToken` in request body
3. Call `linkGuestReportToUser(guestToken, userId)`
4. Call `convertGuestReportToNatalChart()` to create permanent chart
5. Return `chartId` for redirect

---

## User Flow

### 1. Unauthenticated Preview (Visitor)
```
1. Visitor goes to /harta-natala
2. Fills birth data
3. Clicks "Generează Raportul"
4. Frontend adds header: x-guest-request: true
5. POST /api/natal-chart/calculate
   ├─ Server: No authenticated user detected
   ├─ Server: Creates guest_reports entry
   ├─ Server: Generates unique guest_token
   ├─ Returns: { success: true, guestToken, planets, signs, ... }
6. Frontend stores guestToken in localStorage
7. Shows free preview of chart
8. Page suggests registration for full features
```

### 2. Registration/Login with Auto-Link
```
1. Visitor clicks "Create Account" or "Login"
2. Completes signup/login
3. Frontend retrieves guestToken from localStorage
4. Frontend calls POST /api/guest-reports/link
   ├─ Body: { guestToken }
   ├─ Auth header: Bearer {session_token}
5. Server:
   ├─ Verifies user authenticated (auth.uid())
   ├─ Finds guest_reports record by guestToken
   ├─ Updates: user_id = auth.uid(), status = 'converted'
   ├─ Creates natal_charts entry from guest_reports data
   ├─ Returns: { success: true, chartId }
6. Frontend clears localStorage guestToken
7. Frontend redirects to /raport
8. User sees their full report with complete data
```

### 3. Chart Retrieval After Linking
```
1. User loads /raport page
2. GET /api/report/data
   ├─ Authenticates user (auth.uid())
   ├─ Queries natal_charts WHERE user_id = auth.uid()
   ├─ Returns chart data
3. Page displays full report
```

---

## Key Features

### Guest Token Management
- Generated using Node.js crypto module (no external dependencies)
- 64-character hex string for high uniqueness
- Stored in browser localStorage/cookie
- Passed to server only during account linking
- Deleted after successful conversion

### Data Preservation
- All birth data captured during initial calculation
- Full natal chart data (planets, houses, aspects) stored
- Quick-access fields (sun_sign, moon_sign, etc.) for fast retrieval
- No need to recalculate or re-enter data at signup

### No Duplicate Charts
- When converting guest report to natal chart:
  1. Check if chart already exists for user
  2. If exists: Skip creation (return existing chart ID)
  3. If not exists: Create new chart from guest report
- Prevents duplicate data entry

### Automatic Expiration
- Guest reports expire after 7 days
- No manual cleanup needed (can add cron for hard deletes)
- Keeps database clean of unused guest data

### Security
- RLS policies prevent unauthorized access
- User_id nullable but checked during conversion
- Only authenticated users can link reports
- Guest token is opaque and unique per report

---

## Logging Added

### Guest Report Creation (calculate endpoint)
```
[v0] [calc-{timestamp}] Guest request - will create guest report
[v0] [calc-{timestamp}] Preparing to save guest report (unauthenticated user)...
[v0] [calc-{timestamp}] ✓ Guest report created successfully
[v0] [calc-{timestamp}] Guest report ID: {id}
[v0] [calc-{timestamp}] Guest token: {first-8-chars}...
```

### Guest Report Linking (link endpoint)
```
[v0] [link-{timestamp}] ========== LINK GUEST REPORT REQUEST ==========
[v0] [link-{timestamp}] ✓ User authenticated: {first-8-chars}...
[v0] [link-{timestamp}] Guest token provided: {first-8-chars}...
[v0] [link-{timestamp}] Linking guest report to user: {...}
[v0] [link-{timestamp}] ✓ Guest report linked to user successfully
[v0] [link-{timestamp}] Converting guest report to permanent natal chart...
[v0] [link-{timestamp}] ✓ Conversion complete: { chartId, isNew }
[v0] [link-{timestamp}] ========== LINK GUEST REPORT SUCCESS ==========
```

### Database Operations
```
[v0] [GUEST-REPORT] Guest report created: { id, guest_token, expires_at }
[v0] [GUEST-REPORT] Guest report successfully linked to user
[v0] [GUEST-REPORT] Natal chart created from guest report: { chartId, userId }
```

---

## API Endpoints

### POST /api/natal-chart/calculate
**For Guests**:
- Headers: `x-guest-request: true`
- Response includes: `guestToken`, `guestReportId`
- Chart data saved to `guest_reports` table (7-day expiration)

**For Authenticated Users**:
- Normal headers (authenticated session)
- Response includes chart data only
- Chart saved to `natal_charts` table (permanent)

### POST /api/guest-reports/link
**Purpose**: Convert guest report to permanent chart after signup
- **Requires**: Authentication + `guestToken` in body
- **Returns**: `{ success, chartId, chartIsNew, guestReportId }`
- **Side Effects**: 
  - Updates guest_reports: `user_id`, `status = 'converted'`
  - Creates natal_charts entry (if doesn't exist)

---

## Next Steps for Frontend Integration

### 1. Modify `/app/hatra-natala/page.tsx`
```typescript
// When user not authenticated and clicks "Generate Report":
const handleSubmit = async (e) => {
  // Add header for guest request
  const response = await fetch("/api/natal-chart/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-guest-request": "true"  // NEW
    },
    body: JSON.stringify({...})
  })
  
  const data = await response.json()
  
  // NEW: Store guest token
  if (data.guestToken) {
    localStorage.setItem("guestToken", data.guestToken)
    console.log("[v0] Guest token stored")
  }
  
  // Show preview + "Create Account" button
}
```

### 2. Modify Auth Sign-up/Sign-in Success
```typescript
// After successful signup or login:
useEffect(() => {
  const guestToken = localStorage.getItem("guestToken")
  
  if (guestToken) {
    // Link guest report to account
    fetch("/api/guest-reports/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestToken })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.removeItem("guestToken")
        // Redirect to /raport
        router.push("/raport")
      }
    })
  }
}, [])
```

### 3. Update `/app/raport/page.tsx`
```typescript
// Already works with existing code - just queries natal_charts
// No changes needed
```

---

## Database Queries Reference

### Get Guest Report
```sql
SELECT * FROM guest_reports 
WHERE guest_token = 'abc123...' 
AND status = 'guest' 
AND expires_at > now();
```

### Link Guest Report to User
```sql
UPDATE guest_reports 
SET user_id = 'user-id', status = 'converted', updated_at = now()
WHERE guest_token = 'abc123...';
```

### Get User's Converted Reports
```sql
SELECT * FROM guest_reports 
WHERE user_id = 'user-id' 
AND status = 'converted';
```

### Check for Duplicate Charts
```sql
SELECT * FROM natal_charts 
WHERE user_id = 'user-id' LIMIT 1;
```

---

## Build Status

✓ **Successfully compiled** - No TypeScript errors  
✓ **All endpoints routing correctly**  
✓ **Ready for frontend integration** - All backend infrastructure in place

---

## Summary

| Component | Status | Location |
|-----------|--------|----------|
| Database schema | ✓ Created | `/supabase/migrations/003_guest_reports_table.sql` |
| Guest reports utility | ✓ Created | `/lib/supabase/guest-reports.ts` |
| Natal chart endpoint updated | ✓ Updated | `/app/api/natal-chart/calculate/route.ts` |
| Guest report link endpoint | ✓ Created | `/app/api/guest-reports/link/route.ts` |
| Logging | ✓ Added | All endpoints + utility functions |
| Build | ✓ Success | No errors |
| Frontend integration | ○ Pending | User needs to update `/hatra-natala` and auth pages |

