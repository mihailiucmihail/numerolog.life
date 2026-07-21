# Verification Checklist - Database Flow Fix

## Pre-Generation State
- [ ] User is logged in
- [ ] User has complete profile (birth date, time, city, coordinates, timezone)
- [ ] NO natal chart exists in database yet
- [ ] Report page shows "No natal chart found..."

## Generation Process (What Should Happen)
1. [ ] Console logs: "[FRONTEND] calling /api/astrology/generate-report"
2. [ ] Console logs: "[API] generate-report route reached"
3. [ ] Server logs: "[API] User authenticated: <userId>"
4. [ ] Server logs: "[API] calling AstrologyAPI planets/tropical"
5. [ ] Server logs: "[API] AstrologyAPI response status 200 (1245ms)"
6. [ ] Server logs: "[API] [traceId] Inserting into natal_charts..."
7. [ ] Server logs: "[API] [traceId] INSERT SUCCESS"
8. [ ] Server logs: "New chart ID: <chartId>"

## Database Insert Verification
- [ ] Call `GET /api/debug/natal-chart`
- [ ] Response shows: `chartCount: 1` (or more if not first)
- [ ] Response shows: `latestChart.id` (not null)
- [ ] Response shows: `latestChart.source: "AstrologyAPI"`
- [ ] Response shows: `latestChart.data_source: "REAL_API"`

## Report Page Reload
- [ ] After generation, page auto-reloads
- [ ] Console logs: "STEP 1: Load report data from API"
- [ ] Console logs: "Natal chart loaded from database"
- [ ] No "No natal chart found" error anymore
- [ ] Report displays all data

## Final State
- [ ] Browser console shows complete generation and load flow
- [ ] No errors in console
- [ ] Report page displays full astrological data
- [ ] All 8 scores visible
- [ ] User can download PDF
- [ ] User can share report

## Troubleshooting If Something Fails

### If "No natal chart found" still shows after generation:
1. Check server logs for errors in INSERT step
2. Run `GET /api/debug/natal-chart` - should show 1+ charts
3. Check if chartCount increased after generation
4. If chartCount didn't increase: INSERT failed silently
   - Check Supabase table permissions
   - Check if user_id is correct
   - Check if upsert conflict column matches

### If generation never starts:
1. Check browser console for errors
2. Check if profile fetch succeeded: `GET /api/user/profile` should return full data
3. If profile fetch fails: birth data not complete
   - Go to Profile > Edit
   - Ensure all birth fields filled in

### If AstrologyAPI call fails:
1. Check server logs for "[API] AstrologyAPI error"
2. Check if ASTROLOGY_API_KEY is set
3. Check if birth coordinates are valid
4. Check if timezone is correct (should be a number)

### If database logs show but chart doesn't load:
1. Verify table names match: both use "natal_charts" ✓
2. Verify column names match: both use "user_id" ✓
3. Run `SELECT * FROM natal_charts WHERE user_id = '<yourUserId>'`
4. Should return exactly 1 row (or more)

## Success Criteria
All of these must be true:
1. ✓ Database has 1+ natal_charts entries for current user
2. ✓ data_source column = "REAL_API"
3. ✓ source column = "AstrologyAPI"
4. ✓ Report page loads data from that table
5. ✓ Report page displays all astrological scores
6. ✓ No "No natal chart found" message
7. ✓ Browser console shows clean generation flow
8. ✓ No server errors in logs
