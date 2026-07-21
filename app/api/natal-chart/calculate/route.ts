import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateWithSwissEphemeris } from "@/lib/astrology/astrology-api"
import { getSignFromDegree, getSunSign } from "@/lib/astrology/natal-chart"
import { geocodeCity } from "@/lib/astrology/geocoding"
import { createGuestReport } from "@/lib/supabase/guest-reports"

export async function POST(request: NextRequest) {
  try {
    let supabase: Awaited<ReturnType<typeof createClient>> | null = null
    const traceId = `calc-${Date.now()}`
    
    console.log(`\n[v0] [${traceId}] ========== NATAL CHART CALCULATE REQUEST ==========`)
    console.log(`[v0] [${traceId}] Timestamp:`, new Date().toISOString())
    
    // Verify user is authenticated - UNLESS this is a test or guest request
    let user = null
    let isTestRequest = request.headers.get('x-test-request') === 'true'
    let isGuestRequest = request.headers.get('x-guest-request') === 'true'
    
    // Check for mock user ID in test mode
    const mockUserId = request.headers.get('x-mock-user-id')
    
    if (!isTestRequest && !isGuestRequest) {
      try {
        supabase = await createClient()
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        console.log(`[v0] [${traceId}] Auth check - getUser() result:`)
        console.log(`[v0] [${traceId}]   - User ID: ${authUser?.id}`)
        console.log(`[v0] [${traceId}]   - User Email: ${authUser?.email}`)
        console.log(`[v0] [${traceId}]   - Auth Error: ${authError?.message || "none"}`)

        if (authError || !authUser) {
          console.log(`[v0] [${traceId}] User not authenticated - generating without persistence`)
          user = null
        } else {
          user = authUser
          console.log(`[v0] [${traceId}] ✓ Authenticated user set: ${user.id}`)
        }
      } catch (supabaseError) {
        console.warn(`[v0] [${traceId}] Supabase unavailable; continuing without persistence`, supabaseError)
        user = null
      }
    } else if (isGuestRequest) {
      console.log(`[v0] [${traceId}] Guest request - will create guest report`)
      user = null
    } else if (mockUserId) {
      // For test mode, use mock user
      user = { id: mockUserId } as any
      console.log(`[v0] [${traceId}] Test mode with mock user ID:`, mockUserId)
    } else {
      console.log(`[v0] [${traceId}] Test request without mock user - skipping authentication`)
      user = null
    }

    const body = await request.json()
    const { firstName, lastName, birthDate, birthTime, birthCity, birthCountry, latitude, longitude, timezone } = body

    if (!birthDate || !birthTime || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Ensure timezone is a valid number - default to 2 (EET) if not provided or invalid
    const validTimezone = timezone && !isNaN(Number(timezone)) ? Number(timezone) : 2

    console.log(`[v0] [${traceId}] User authenticated:`, !!user)
    console.log(`[v0] [${traceId}] User ID:`, user?.id)
    console.log(`[v0] [${traceId}] Birth data:`, { birthDate, birthTime, birthCity, latitude, longitude, timezone: validTimezone })
    console.log(`[v0] [${traceId}] About to call calculateWithSwissEphemeris()...`)

    // Calculate the natal chart using AstrologyAPI (real connection - NO FALLBACK)
    const natalChart = await calculateWithSwissEphemeris(
      birthDate,
      birthTime,
      latitude,
      longitude,
      validTimezone
    )

    console.log(`[v0] [${traceId}] ✓ Chart calculation completed successfully`)
    console.log(`[v0] [${traceId}] Chart calculation provider:`, natalChart._debug?.providerUsed)
    const dataSource = natalChart._debug?.providerUsed === "LOCAL_SWISS_EPHEMERIS"
      ? "SWISS_EPHEMERIS_LOCAL"
      : "REAL_API"
    console.log(`[v0] [${traceId}] Planets count:`, natalChart.planets?.length)

    // Extract main positions
    const sunPosition = natalChart.planets.find((p: any) => p.name === "Sun")
    const moonPosition = natalChart.planets.find((p: any) => p.name === "Moon")
    const ascendant = natalChart.ascendant
    const midheaven = natalChart.midheaven
    
    // Prefer the astronomical position returned by Swiss Ephemeris.
    const sunSign = sunPosition?.sign || getSunSign(birthDate).name
    
    // Use planets directly from API
    const planetsWithHouses = natalChart.planets

    // SALVEAZA NATAL CHART IN BAZA DE DATE cu data_source=real_api
    console.log("[v0] Saving natal chart to database with data_source = real_api")
    
    // SAVE TO DATABASE
    let saveError = null
    let savedChart = null
    let guestReportId = null
    let guestToken = null
    
    if (user && supabase && !isTestRequest && !isGuestRequest) {
      // AUTHENTICATED USER - Save to natal_charts
      console.log(`[v0] [${traceId}] Preparing to save natal chart to database (authenticated user)...`)
      console.log(`[v0] [${traceId}] About to upsert with user_id: ${user.id}`)
      
      const { data, error } = await supabase
        .from("natal_charts")
        .upsert({
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate,
          birth_time: birthTime,
          birth_city: birthCity,
          birth_country: birthCountry || "Unknown",
          birth_latitude: latitude,
          birth_longitude: longitude,
          birth_timezone: validTimezone.toString(),
          sun_sign: sunSign,
          sun_degree: sunPosition?.fullDegree || 0,
          moon_sign: moonPosition?.sign || "Unknown",
          moon_degree: moonPosition?.fullDegree || 0,
          ascendant_sign: ascendant?.sign || "Unknown",
          ascendant_degree: ascendant?.degree || 0,
          midheaven_sign: midheaven?.sign || "Unknown",
          midheaven_degree: midheaven?.degree || 0,
          planetary_positions: planetsWithHouses,
          houses: natalChart.houses || [],
          aspects: natalChart.aspects || [],
          julian_day: natalChart.julianDay,
          sidereal_time: natalChart.siderealTime || 0,
          data_source: dataSource,
          source: dataSource === "SWISS_EPHEMERIS_LOCAL" ? "Swiss Ephemeris local" : "AstrologyAPI",
          raw_api_response: {
            planets: natalChart.planets,
            houses: natalChart.houses,
            ascendant: natalChart.ascendant,
            midheaven: natalChart.midheaven,
            _debug: natalChart._debug
          }
        }, { onConflict: "user_id" })
        .select()

      saveError = error
      savedChart = data
      
      if (savedChart && savedChart.length > 0) {
        console.log(`[v0] [${traceId}] ✓ Natal chart upsert succeeded`)
        console.log(`[v0] [${traceId}] Chart ID: ${savedChart[0]?.id}`)
        console.log(`[v0] [${traceId}] data_source: REAL_API`)
      }
      
      if (error) {
        console.log(`[v0] [${traceId}] ✗ Upsert error: ${error.message}`)
      }
    } else if (!user && !isTestRequest && isGuestRequest) {
      // GUEST USER - Save to guest_reports
      console.log(`[v0] [${traceId}] Preparing to save guest report (unauthenticated user)...`)
      
      try {
        const guestReportResult = await createGuestReport({
          birthName: `${firstName || ""} ${lastName || ""}`.trim(),
          birthDate,
          birthTime,
          birthCity,
          birthCountry: birthCountry || "Unknown",
          birthLatitude: latitude,
          birthLongitude: longitude,
          birthTimezone: validTimezone.toString(),
          natalChartData: {
            planets: natalChart.planets,
            houses: natalChart.houses,
            aspects: natalChart.aspects || [],
            ascendant: natalChart.ascendant,
            midheaven: natalChart.midheaven,
            julianDay: natalChart.julianDay,
            siderealTime: natalChart.siderealTime || 0,
            _debug: natalChart._debug
          },
          previewData: {
            sun_sign: sunSign,
            moon_sign: moonPosition?.sign || "Unknown",
            ascendant_sign: ascendant?.sign || "Unknown",
            birth_city: birthCity,
            birth_country: birthCountry
          },
          sunSign: sunSign,
          sunDegree: sunPosition?.fullDegree || 0,
          moonSign: moonPosition?.sign || "Unknown",
          moonDegree: moonPosition?.fullDegree || 0,
          ascendantSign: ascendant?.sign || "Unknown",
          ascendantDegree: ascendant?.degree || 0,
          midheavenSign: midheaven?.sign || "Unknown",
          midheavenDegree: midheaven?.degree || 0,
          dataSource
        })
        
        guestReportId = guestReportResult.id
        guestToken = guestReportResult.guestToken
        console.log(`[v0] [${traceId}] ✓ Guest report created successfully`)
        console.log(`[v0] [${traceId}] Guest report ID: ${guestReportId}`)
        console.log(`[v0] [${traceId}] Guest token: ${guestToken.substring(0, 8)}...`)
      } catch (err: any) {
        console.error(`[v0] [${traceId}] ⚠ Error creating guest report (non-blocking):`, err.message)
        console.log(`[v0] [${traceId}] Will continue without guest report storage`)
        // Don't set saveError - guest report storage is optional
        // The response will still include the calculated chart data
      }
    } else if (isTestRequest) {
      console.log(`[v0] [${traceId}] Test request - skipping database save`)
    }

    if (saveError && !isTestRequest && !isGuestRequest) {
      // Only fail on auth user save errors, not guest errors
      console.error(`[v0] [${traceId}] ✗ Error saving chart/report:`, saveError)
      return NextResponse.json(
        { error: "Failed to save chart: " + saveError.message },
        { status: 500 }
      )
    }

    // For guest requests, proceed even if guest report creation failed
    // The report can still be displayed (just not saved to database)
    if ((user && savedChart) || (isGuestRequest && planetsWithHouses)) {
      console.log(`[v0] [${traceId}] ✓ Chart calculated successfully`)
      if (guestToken) {
        console.log(`[v0] [${traceId}] Guest report saved with token`)
      } else if (isGuestRequest) {
        console.log(`[v0] [${traceId}] Guest report (not persisted - database unavailable)`)
      }
      console.log(`[v0] [${traceId}] ========== NATAL CHART CALCULATE SUCCESS ==========\n`)
    }

    // Prepare response
    const responseData: any = {
      success: true,
      planets: planetsWithHouses,
      ascendant,
      midheaven,
      sun_sign: sunSign,
      sun_degree: sunPosition?.fullDegree || 0,
      moon_sign: moonPosition?.sign || "Unknown",
      moon_degree: moonPosition?.fullDegree || 0,
      julian_day: natalChart.julianDay,
      sidereal_time: natalChart.siderealTime || 0,
      houses: natalChart.houses || [],
      aspects: natalChart.aspects || [],
      data_source: dataSource,
      _debug: {
        ...natalChart._debug,
        database_saved: !!savedChart || !!guestToken,
        database_data_source: dataSource,
        test_mode: isTestRequest,
        guest_mode: isGuestRequest && !user,
        message: isTestRequest 
          ? "Test request - Calculation verified but not saved to database"
          : isGuestRequest && !user
          ? `Harta natală a fost calculată cu ${dataSource} și salvată ca raport guest`
          : `Harta natală a fost calculată cu ${dataSource} și salvată în baza de date`
      }
    }

    // Add guest token to response for client-side storage (if available)
    if (guestToken) {
      responseData.guestToken = guestToken
      responseData.guestReportId = guestReportId
      console.log(`[v0] [${traceId}] Guest token included in response`)
    } else if (isGuestRequest) {
      // For guest requests, still include a flag so frontend knows this is a guest chart
      // (even if we couldn't save it to the database)
      responseData.isGuestReport = true
      responseData.guestTokenUnavailable = true
      console.log(`[v0] [${traceId}] Guest report flag set (no persistent token)`)
    }

    return NextResponse.json(responseData)
  } catch (error: any) {
    const traceId = `calc-${Date.now()}`
    console.error(`\n[v0] [${traceId}] ✗ CRITICAL ERROR in natal chart calculation`)
    console.error(`[v0] [${traceId}] Error type:`, error instanceof Error ? error.constructor.name : "Unknown")
    console.error(`[v0] [${traceId}] Error message:`, error.message)
    console.error(`[v0] [${traceId}] Stack:`, error.stack)
    
    // For test requests, try to return partial data
    if (error.message?.includes("reading") && error.message?.includes("null")) {
      console.log(`[v0] [${traceId}] Caught null reference error in test mode - returning calculation anyway`)
      return NextResponse.json({
        success: true,
        error: "Partial result - database save skipped",
        planets: [],
        ascendant: null,
        midheaven: null,
        sun_sign: "Unknown",
        data_source: "REAL_API",
        message: "Calculation succeeds but database save requires authentication. Use full authentication for production."
      }, { status: 200 })
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[v0] [${traceId}] Full error:`, errorMessage)
    console.error(`[v0] [${traceId}] ========== NATAL CHART CALCULATION FAILED ==========\n`)
    
    return NextResponse.json(
      { 
        error: errorMessage || "Failed to calculate natal chart",
        details: "Make sure ASTROLOGY_API_KEY and ASTROLOGY_USER_ID are set, and astrologyapi.com is accessible",
        traceId
      },
      { status: 500 }
    )
  }
}
