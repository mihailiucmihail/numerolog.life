import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * STRICT AstrologyAPI Integration
 * Only uses confirmed working endpoints:
 * - planets/tropical (REQUIRED)
 * - house_cusps/tropical (REQUIRED)
 * No fallbacks, no fake data generation.
 */

interface AstrologyApiResponse {
  success?: boolean
  code?: number
  response?: any
  result?: any
  planets?: any
  houses?: any
  error?: string
}

async function callAstrologyEndpoint(
  endpoint: string,
  params: Record<string, string | number>,
  traceId: string
): Promise<{ status: number; body: AstrologyApiResponse; elapsed: number }> {
  const baseUrl = "https://json.astrologyapi.com/v1"
  const url = `${baseUrl}/${endpoint}?${new URLSearchParams(params as any).toString()}`

  console.log(`[API] [${traceId}] === ${endpoint.toUpperCase()} REQUEST ===`)
  console.log(`[API] [${traceId}] URL: ${url}`)
  console.log(`[API] [${traceId}] Method: GET`)
  console.log(`[API] [${traceId}] Auth: Bearer ${process.env.ASTROLOGY_API_KEY ? "***" : "MISSING"}`)
  console.log(`[API] [${traceId}] Params:`, params)

  const startTime = Date.now()

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.ASTROLOGY_API_KEY}`,
        "Accept": "application/json"
      }
    })

    const elapsed = Date.now() - startTime
    const body = await response.json() as AstrologyApiResponse

    console.log(`[API] [${traceId}] === ${endpoint.toUpperCase()} RESPONSE ===`)
    console.log(`[API] [${traceId}] Status: ${response.status}`)
    console.log(`[API] [${traceId}] Elapsed: ${elapsed}ms`)
    console.log(`[API] [${traceId}] Success: ${response.status === 200 ? "YES" : "NO"}`)
    console.log(`[API] [${traceId}] Body (first 500 chars):`, JSON.stringify(body).substring(0, 500))
    if (JSON.stringify(body).length > 500) {
      console.log(`[API] [${traceId}] Body length: ${JSON.stringify(body).length} chars`)
    }

    return { status: response.status, body, elapsed }
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.log(`[API] [${traceId}] ERROR during ${endpoint} call:`, error)
    throw new Error(`${endpoint} request failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function POST(request: Request) {
  const traceId = `gen-${Date.now()}`

  try {
    console.log(`\n[API] ========== GENERATE-REPORT START ==========`)
    console.log(`[API] [${traceId}] Trace ID: ${traceId}`)

    // ====== PRE-CHECK: Verify API Credentials ======
    if (!process.env.ASTROLOGY_API_KEY) {
      console.error(`[API] [${traceId}] ✗ CRITICAL: ASTROLOGY_API_KEY not set in environment`)
      return NextResponse.json(
        {
          success: false,
          step: "credentials",
          error: "ASTROLOGY_API_KEY environment variable is not set. Please contact support.",
          traceId
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { birthDate, birthTime, latitude, longitude, timezone, birthCity = "", birthCountry = "" } = body

    // ====== STEP 1: Validate Inputs ======
    console.log(`\n[API] [${traceId}] STEP 1: Input Validation`)
    if (!birthDate || !birthTime || latitude === undefined || longitude === undefined || timezone === undefined) {
      console.log(`[API] [${traceId}] ✗ FAILED: Missing required fields`)
      return NextResponse.json(
        {
          success: false,
          step: "validation",
          error: "Missing required fields: birthDate, birthTime, latitude, longitude, timezone",
          traceId
        },
        { status: 400 }
      )
    }

    console.log(`[API] [${traceId}] ✓ Inputs valid:`)
    console.log(`[API] [${traceId}]   Date: ${birthDate}`)
    console.log(`[API] [${traceId}]   Time: ${birthTime}`)
    console.log(`[API] [${traceId}]   Coords: ${latitude}, ${longitude}`)
    console.log(`[API] [${traceId}]   Timezone: ${timezone}`)

    // ====== STEP 2: Authenticate ======
    console.log(`\n[API] [${traceId}] STEP 2: Authentication`)
    const supabase = await createClient()
    
    // Check if user_id was passed as header (from internal API call)
    const headerUserId = request.headers.get('x-user-id')
    const authContext = request.headers.get('x-auth-context')
    
    let user
    if (headerUserId && authContext === 'internal-api-call') {
      // Use the user ID from header (internal API call from /api/report/data)
      user = { id: headerUserId }
      console.log(`[API] [${traceId}] ✓ Using user ID from internal API header: ${headerUserId}`)
    } else {
      // Normal authentication flow
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        console.log(`[API] [${traceId}] ✗ FAILED: Not authenticated`)
        return NextResponse.json(
          { success: false, step: "authentication", error: "Not authenticated", traceId },
          { status: 401 }
        )
      }

      user = authUser
      console.log(`[API] [${traceId}] ✓ User authenticated via session: ${user.id}`)
    }

    // Format time
    let timeStr = birthTime
    if (birthTime.length === 8) {
      timeStr = birthTime
    } else if (birthTime.includes(":")) {
      timeStr = `${birthTime}:00`
    } else {
      const hours = Math.floor(Number(birthTime) / 100)
      const minutes = Number(birthTime) % 100
      timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
    }

    const apiParams = {
      date: birthDate,
      time: timeStr,
      lat: latitude,
      lon: longitude,
      ttz: timezone
    }

    // ====== STEP 3: Call planets/tropical ======
    console.log(`\n[API] [${traceId}] STEP 3: Call planets/tropical (REQUIRED)`)
    let planetsResult
    try {
      planetsResult = await callAstrologyEndpoint("planets/tropical", apiParams, traceId)
    } catch (error) {
      console.log(`[API] [${traceId}] ✗ FAILED: planets/tropical request error`)
      return NextResponse.json(
        {
          success: false,
          step: "planets_tropical",
          error: error instanceof Error ? error.message : String(error),
          traceId
        },
        { status: 502 }
      )
    }

    if (planetsResult.status !== 200) {
      console.log(`[API] [${traceId}] ✗ FAILED: planets/tropical returned ${planetsResult.status}`)
      return NextResponse.json(
        {
          success: false,
          step: "planets_tropical",
          error: `planets/tropical returned HTTP ${planetsResult.status}`,
          httpStatus: planetsResult.status,
          responseBody: planetsResult.body,
          traceId
        },
        { status: 502 }
      )
    }

    const planetsData = planetsResult.body
    if (!planetsData || !planetsData.planets) {
      console.log(`[API] [${traceId}] ✗ FAILED: planets/tropical missing planets data`)
      return NextResponse.json(
        {
          success: false,
          step: "planets_tropical",
          error: "planets/tropical response missing planets data",
          responseBody: planetsData,
          traceId
        },
        { status: 502 }
      )
    }

    console.log(`[API] [${traceId}] ✓ planets/tropical SUCCESS (${planetsResult.elapsed}ms)`)
    console.log(`[API] [${traceId}] Planets returned: ${Object.keys(planetsData.planets || {}).length}`)

    // ====== STEP 4: Call house_cusps/tropical ======
    console.log(`\n[API] [${traceId}] STEP 4: Call house_cusps/tropical (REQUIRED)`)
    let housesCupsResult
    try {
      housesCupsResult = await callAstrologyEndpoint("house_cusps/tropical", apiParams, traceId)
    } catch (error) {
      console.log(`[API] [${traceId}] ✗ FAILED: house_cusps/tropical request error`)
      return NextResponse.json(
        {
          success: false,
          step: "house_cusps_tropical",
          error: error instanceof Error ? error.message : String(error),
          traceId
        },
        { status: 502 }
      )
    }

    if (housesCupsResult.status !== 200) {
      console.log(`[API] [${traceId}] ✗ FAILED: house_cusps/tropical returned ${housesCupsResult.status}`)
      return NextResponse.json(
        {
          success: false,
          step: "house_cusps_tropical",
          error: `house_cusps/tropical returned HTTP ${housesCupsResult.status}`,
          httpStatus: housesCupsResult.status,
          responseBody: housesCupsResult.body,
          traceId
        },
        { status: 502 }
      )
    }

    const housesData = housesCupsResult.body
    if (!housesData || !housesData.houses) {
      console.log(`[API] [${traceId}] ✗ FAILED: house_cusps/tropical missing houses data`)
      return NextResponse.json(
        {
          success: false,
          step: "house_cusps_tropical",
          error: "house_cusps/tropical response missing houses data",
          responseBody: housesData,
          traceId
        },
        { status: 502 }
      )
    }

    console.log(`[API] [${traceId}] ✓ house_cusps/tropical SUCCESS (${housesCupsResult.elapsed}ms)`)
    console.log(`[API] [${traceId}] Houses returned: ${Object.keys(housesData.houses || {}).length}`)

    // ====== STEP 5: Combine Data ======
    console.log(`\n[API] [${traceId}] STEP 5: Combine AstrologyAPI responses`)
    const combinedAstroData = {
      planets: planetsData.planets,
      houses: housesData.houses,
      source: "AstrologyAPI",
      endpoints: {
        planets_tropical: { status: 200, elapsed: planetsResult.elapsed },
        house_cusps_tropical: { status: 200, elapsed: housesCupsResult.elapsed }
      }
    }
    console.log(`[API] [${traceId}] ✓ Data combined successfully`)

    // ====== STEP 6: Insert into natal_charts ======
    console.log(`\n[API] [${traceId}] STEP 6: Insert into natal_charts`)
    console.log(`[API] [${traceId}] Upserting chart data:`)
    console.log(`[API] [${traceId}]   user_id: ${user.id}`)
    console.log(`[API] [${traceId}]   birth_date: ${birthDate}`)
    console.log(`[API] [${traceId}]   birth_time: ${birthTime}`)
    console.log(`[API] [${traceId}]   birth_latitude: ${latitude}`)
    console.log(`[API] [${traceId}]   birth_longitude: ${longitude}`)
    console.log(`[API] [${traceId}]   birth_timezone: ${timezone}`)
    console.log(`[API] [${traceId}]   raw_api_response size: ${JSON.stringify(combinedAstroData).length} bytes`)
    console.log(`[API] [${traceId}]   trace_id: ${traceId}`)
    console.log(`[API] [${traceId}]   source: AstrologyAPI`)
    console.log(`[API] [${traceId}]   data_source: REAL_API`)
    
    const { data: insertData, error: insertError } = await supabase
      .from("natal_charts")
      .upsert(
        {
          user_id: user.id,
          birth_date: birthDate,
          birth_time: birthTime,
          birth_city: birthCity,
          birth_country: birthCountry,
          birth_latitude: latitude,
          birth_longitude: longitude,
          birth_timezone: timezone,
          raw_api_response: combinedAstroData,
          trace_id: traceId,
          source: "AstrologyAPI",
          data_source: "REAL_API"
        },
        { onConflict: "user_id" }
      )
      .select()

    if (insertError) {
      console.log(`[API] [${traceId}] ✗ FAILED: Database insert error`)
      console.log(`[API] [${traceId}] Error message: ${insertError.message}`)
      console.log(`[API] [${traceId}] Error code: ${insertError.code || "N/A"}`)
      console.log(`[API] [${traceId}] Error details: ${JSON.stringify(insertError)}`)
      return NextResponse.json(
        {
          success: false,
          step: "database_insert",
          error: insertError.message,
          errorCode: insertError.code,
          errorDetails: insertError,
          traceId
        },
        { status: 500 }
      )
    }

    const chartId = insertData?.[0]?.id
    console.log(`[API] [${traceId}] ✓ SUCCESS: Chart inserted into database`)
    console.log(`[API] [${traceId}] Chart ID: ${chartId}`)
    console.log(`[API] [${traceId}] Rows affected: ${insertData?.length || 0}`)

    // ====== SUCCESS ======
    console.log(`\n[API] [${traceId}] ========== GENERATE-REPORT SUCCESS ==========`)
    console.log(`[API] [${traceId}] SUMMARY:`)
    console.log(`[API] [${traceId}]   ✓ STEP 1: Input validation - SUCCESS`)
    console.log(`[API] [${traceId}]   ✓ STEP 2: Authentication - SUCCESS (userId: ${user.id})`)
    console.log(`[API] [${traceId}]   ✓ STEP 3: planets/tropical - SUCCESS (${planetsResult.elapsed}ms, ${Object.keys(planetsData.planets || {}).length} planets)`)
    console.log(`[API] [${traceId}]   ✓ STEP 4: house_cusps/tropical - SUCCESS (${housesCupsResult.elapsed}ms, ${Object.keys(housesData.houses || {}).length} houses)`)
    console.log(`[API] [${traceId}]   ✓ STEP 5: Data combination - SUCCESS`)
    console.log(`[API] [${traceId}]   ✓ STEP 6: Database insert - SUCCESS (chartId: ${chartId})`)
    console.log(`[API] [${traceId}] ========== END SUCCESS ==========\n`)

    return NextResponse.json(
      {
        success: true,
        traceId,
        userId: user.id,
        chartId,
        message: "Chart generated with confirmed AstrologyAPI endpoints",
        astrologyData: {
          source: "AstrologyAPI",
          endpoints: {
            planets_tropical: "✓ OK",
            house_cusps_tropical: "✓ OK"
          },
          planetsCount: Object.keys(planetsData.planets || {}).length,
          housesCount: Object.keys(housesData.houses || {}).length
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.log(`\n[API] [${traceId}] ========== GENERATE-REPORT FATAL ERROR ==========`)
    console.log(`[API] [${traceId}] Error Type: ${error instanceof Error ? error.name : "Unknown"}`)
    console.log(`[API] [${traceId}] Error Message: ${error instanceof Error ? error.message : String(error)}`)
    console.log(`[API] [${traceId}] Stack Trace:`, error instanceof Error ? error.stack : "N/A")
    console.log(`[API] [${traceId}] ========== END FATAL ERROR ==========\n`)

    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        step: "fatal_error",
        error: errorMsg,
        traceId
      },
      { status: 500 }
    )
  }
}
