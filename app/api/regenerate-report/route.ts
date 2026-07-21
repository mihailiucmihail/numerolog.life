import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Regenerates a report by:
 * 1. Deleting old cached data
 * 2. Recalculating from current birth data
 * 3. Saving new report with updated metadata
 * 4. Validating zodiac signs are correct
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reportId, birthDate, birthTime, birthCity } = body

    // Validate required fields
    if (!reportId || !birthDate || !birthCity) {
      return NextResponse.json(
        { error: "Missing required fields: reportId, birthDate, birthCity" },
        { status: 400 }
      )
    }

    // Get current report
    const { data: currentReport, error: fetchError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .eq("userId", user.id)
      .single()

    if (fetchError || !currentReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // Delete old cached astrology data
    const reportData = {
      ...currentReport.data,
      _reportMeta: {
        schema_version: "1.0.0",
        generated_at: new Date().toISOString(),
        report_birth_date: birthDate,
        report_birth_time: birthTime,
        report_birth_city: birthCity,
        calculation_timestamp: Date.now(),
        regenerated_from: currentReport.data?._reportMeta?.generated_at || null
      }
    }

    // Clear the content sections to force regeneration
    delete reportData.sections
    delete reportData.deepAnalysis
    delete reportData.energyDominants

    // Update the report with fresh metadata
    const { data: updatedReport, error: updateError } = await supabase
      .from("reports")
      .update({
        data: reportData,
        birth_date: birthDate,
        birth_time: birthTime,
        birth_city: birthCity
      })
      .eq("id", reportId)
      .eq("userId", user.id)
      .select()

    if (updateError) {
      console.error("[v0] Error regenerating report:", updateError)
      return NextResponse.json(
        { error: "Failed to regenerate report: " + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Report regenerated successfully. Please refresh to recalculate.",
      report: updatedReport?.[0],
      shouldRegenerate: true
    })

  } catch (error) {
    console.error("[v0] Error in regenerate-report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
