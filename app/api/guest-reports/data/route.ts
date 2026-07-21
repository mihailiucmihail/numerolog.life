import { NextRequest, NextResponse } from "next/server"
import { getGuestReportByToken } from "@/lib/supabase/guest-reports"

export async function GET(request: NextRequest) {
  try {
    const guestToken = request.nextUrl.searchParams.get("guest_token")

    if (!guestToken) {
      return NextResponse.json(
        { error: "Missing guest_token parameter" },
        { status: 400 }
      )
    }

    // Token must be exactly 64 hex characters (32 bytes hashed via SHA-256)
    if (!/^[a-f0-9]{64}$/.test(guestToken)) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      )
    }

    // Get report by securely hashed token (server-side hash comparison)
    const guestReport = await getGuestReportByToken(guestToken)

    if (!guestReport) {
      // Uniform response to prevent token enumeration attacks
      return NextResponse.json(
        { error: "Guest report not found or has expired" },
        { status: 404 }
      )
    }

    const natalChartData = guestReport.natal_chart_data || {}
    const planets = Array.isArray(natalChartData.planets) ? natalChartData.planets : []
    const houses = Array.isArray(natalChartData.houses) ? natalChartData.houses : []
    const aspects = Array.isArray(natalChartData.aspects) ? natalChartData.aspects : []

    // Return the complete calculated chart. Both the normalized top-level fields
    // and the original nested object are kept so all report consumers receive
    // the same Swiss Ephemeris dataset after a redirect or page reload.
    return NextResponse.json({
      success: true,
      id: guestReport.id,
      full_name: guestReport.birth_name,
      birth_date: guestReport.birth_date,
      birth_time: guestReport.birth_time,
      birth_city: guestReport.birth_city,
      birth_country: guestReport.birth_country,
      sun_sign: guestReport.sun_sign,
      sun_degree: guestReport.sun_degree,
      moon_sign: guestReport.moon_sign,
      moon_degree: guestReport.moon_degree,
      ascendant_sign: guestReport.ascendant_sign,
      ascendant_degree: guestReport.ascendant_degree,
      midheaven_sign: guestReport.midheaven_sign,
      midheaven_degree: guestReport.midheaven_degree,
      planets,
      planetary_positions: planets,
      houses,
      aspects,
      ascendant: natalChartData.ascendant || null,
      midheaven: natalChartData.midheaven || null,
      natal_chart_data: natalChartData,
      julian_day: natalChartData.julianDay,
      sidereal_time: natalChartData.siderealTime,
      romanian_report: guestReport.preview_data?.romanian_report || guestReport.romanian_report,
      astrologyapi_response: guestReport.astrologyapi_response,
      preview_data: guestReport.preview_data,
      full_report_sections: guestReport.preview_data?.full_report_sections,
      data_source: guestReport.data_source,
    })
  } catch (error) {
    console.error("[v0] [GUEST-REPORT-DATA] Error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Failed to load guest report" },
      { status: 500 }
    )
  }
}
