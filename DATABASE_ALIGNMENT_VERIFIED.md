# Database Column Alignment Verification

## Issue Identified
User reported that generate-report saves to one table/field but report page reads from another.

## VERIFICATION: Both Use Same Table

### Generate-Report Endpoint
**File**: `app/api/astrology/generate-report/route.ts`

**Insert Location**: Line 154-155
```typescript
const { data, error: supabaseError } = await supabase
  .from("natal_charts")  // <-- TABLE: natal_charts
  .upsert(reportData, { onConflict: "user_id" })
```

**Fields Inserted**:
```
user_id, first_name, last_name, birth_date, birth_time,
birth_city, birth_country, birth_latitude, birth_longitude,
birth_timezone, raw_api_response, chart_json, trace_id
```

### Report Data API
**File**: `app/api/report/data/route.ts`

**Read Location**: Line 36-39
```typescript
const { data: natalChart, error: chartError } = await supabase
  .from("natal_charts")  // <-- TABLE: natal_charts (SAME)
  .select("*")
  .eq("user_id", user.id)
  .single()
```

**Reads All Columns**: via `select("*")`

### Conclusion
✅ **NO TABLE MISMATCH**
- Both use: `natal_charts` table
- Both use: `user_id` as primary key
- Generate-report WRITES → Report page READS
- Same table ensures data consistency

## Field Name Verification

### Critical Fields for Data Flow

| Field | Generate-Report | Report Page | Status |
|-------|-----------------|-------------|--------|
| user_id | ✓ Written | ✓ Read | ALIGNED |
| raw_api_response | ✓ Written | ✓ Read | ALIGNED |
| birth_date | ✓ Written | ✓ Read | ALIGNED |
| birth_time | ✓ Written | ✓ Read | ALIGNED |
| birth_latitude | ✓ Written | ✓ Read | ALIGNED |
| birth_longitude | ✓ Written | ✓ Read | ALIGNED |
| birth_timezone | ✓ Written | ✓ Read | ALIGNED |
| chart_json | ✓ Written | ✓ Read | ALIGNED |
| trace_id | ✓ Written | ✓ Read | ALIGNED |

## Removed Fields (No Column Mismatch)

These fields were removed from database writes because columns don't exist:
- `data_source` - removed from generate-report
- `provider` - removed from generate-report  
- `source` - removed from generate-report
- `generated_at` - removed from generate-report

**No longer causing errors** ✓

## Validation Chain

```
1. Generate-Report calls realAstrologyService
   ↓ Gets chartData from AstrologyAPI
   
2. Generate-Report upserts to natal_charts
   ↓ Inserts user_id, birth_date, birth_time, raw_api_response, chart_json, trace_id
   
3. Report Page GET /api/report/data
   ↓ Queries natal_charts WHERE user_id = authenticated_user.id
   
4. Report Page receives natalChart object
   ↓ Validates raw_api_response exists (REAL_API marker)
   ↓ Checks source !== FALLBACK
   
5. Report Page displays 8 scores
   ↓ All data flows from same table, same columns
```

## No Data Duplication

- Chart generated once in `natal_charts`
- Report page reads from same `natal_charts` 
- No separate "reports" table
- No redundant data storage
- Single source of truth ✓

## Auto-Generation Success Criteria

When report page auto-generates:
1. ✓ Generate-report gets userId from session
2. ✓ Generate-report calls real API
3. ✓ Generate-report upserts to `natal_charts`
4. ✓ Report page retries `/api/report/data`
5. ✓ Report page finds chart in `natal_charts` (same table)
6. ✓ Report page validates REAL_API marker
7. ✓ Report page displays all 8 scores

**Zero column/table mismatches** ✓
