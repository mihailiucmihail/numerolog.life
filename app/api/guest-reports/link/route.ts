import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { 
  linkGuestReportToUser, 
  getGuestReportByToken,
  convertGuestReportToNatalChart 
} from "@/lib/supabase/guest-reports"

/**
 * POST /api/guest-reports/link
 * Links a guest report to an authenticated user after signup/login
 * Converts the guest report into a permanent natal chart
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const traceId = `link-${Date.now()}`

    console.log(`\n[v0] [${traceId}] ========== LINK GUEST REPORT REQUEST ==========`)

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log(`[v0] [${traceId}] ✗ Not authenticated`)
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    console.log(`[v0] [${traceId}] ✓ User authenticated: ${user.id.substring(0, 8)}...`)

    const body = await request.json()
    const { guestToken } = body

    if (!guestToken) {
      console.log(`[v0] [${traceId}] ✗ Missing guestToken in request`)
      return NextResponse.json(
        { error: "Missing guestToken" },
        { status: 400 }
      )
    }

    console.log(`[v0] [${traceId}] Guest token provided: ${guestToken.substring(0, 8)}...`)

    // Link guest report to user
    const linkResult = await linkGuestReportToUser(guestToken, user.id)

    if (!linkResult.success) {
      console.error(`[v0] [${traceId}] ✗ Failed to link guest report:`, linkResult.error)
      return NextResponse.json(
        { error: linkResult.error },
        { status: 400 }
      )
    }

    console.log(`[v0] [${traceId}] ✓ Guest report linked to user successfully`)

    // Get the linked guest report
    const guestReport = await getGuestReportByToken(guestToken)

    if (!guestReport) {
      console.error(`[v0] [${traceId}] ✗ Could not retrieve linked guest report`)
      return NextResponse.json(
        { error: "Could not retrieve guest report" },
        { status: 500 }
      )
    }

    // Convert guest report to permanent natal chart
    console.log(`[v0] [${traceId}] Converting guest report to permanent natal chart...`)
    const chartResult = await convertGuestReportToNatalChart(guestReport, user.id)

    console.log(`[v0] [${traceId}] ✓ Conversion complete:`, {
      chartId: chartResult.id,
      isNew: chartResult.isNew,
    })

    console.log(`[v0] [${traceId}] ========== LINK GUEST REPORT SUCCESS ==========\n`)

    return NextResponse.json({
      success: true,
      message: "Guest report linked and converted to natal chart",
      chartId: chartResult.id,
      chartIsNew: chartResult.isNew,
      guestReportId: linkResult.reportId,
    })
  } catch (error: any) {
    const traceId = `link-${Date.now()}`
    console.error(`[v0] [${traceId}] ✗ Error linking guest report:`, error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to link guest report",
      },
      { status: 500 }
    )
  }
}
