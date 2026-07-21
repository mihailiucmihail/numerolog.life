import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Report versioning schema
const REPORT_SCHEMA_VERSION = "1.0.0"

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
    const { name, data, birthData } = body

    // Validate required fields
    if (!name || !data) {
      return NextResponse.json(
        { error: "Missing required fields: name, data" },
        { status: 400 }
      )
    }

    // Add report versioning metadata
    const reportData = {
      ...data,
      _reportMeta: {
        schema_version: REPORT_SCHEMA_VERSION,
        generated_at: new Date().toISOString(),
        report_birth_date: birthData?.birthDate || null,
        report_birth_time: birthData?.birthTime || null,
        report_birth_city: birthData?.birthCity || null,
        calculation_timestamp: Date.now()
      }
    }

    // Save report to Supabase
    const { data: insertData, error } = await supabase
      .from("reports")
      .insert({
        userId: user.id,
        name,
        data: reportData,
        birth_date: birthData?.birthDate,
        birth_time: birthData?.birthTime,
        birth_city: birthData?.birthCity
      })
      .select()

    if (error) {
      console.error("[v0] Error saving report:", error)
      return NextResponse.json(
        { error: "Failed to save report: " + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Report saved successfully",
      report: insertData?.[0]
    })

  } catch (error) {
    console.error("[v0] Error in save-report POST:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering/sorting
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Fetch user's reports from Supabase
    const { data, error, count } = await supabase
      .from("reports")
      .select("id, userId, name, data, created_at, birth_date, birth_time, birth_city", { count: "exact" })
      .eq("userId", user.id)
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("[v0] Error fetching reports:", error)
      return NextResponse.json(
        { error: "Failed to fetch reports: " + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reports: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false
      }
    })

  } catch (error) {
    console.error("[v0] Error in save-report GET:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const { reportId } = body

    // Validate required fields
    if (!reportId) {
      return NextResponse.json(
        { error: "Missing required field: reportId" },
        { status: 400 }
      )
    }

    // Verify the report belongs to the user before deleting
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("id, userId")
      .eq("id", reportId)
      .single()

    if (fetchError || !report) {
      console.error("[v0] Error fetching report:", fetchError)
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    if (report.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only delete your own reports" },
        { status: 403 }
      )
    }

    // Delete the report from Supabase
    const { error: deleteError } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId)

    if (deleteError) {
      console.error("[v0] Error deleting report:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete report: " + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully"
    })

  } catch (error) {
    console.error("[v0] Error in save-report DELETE:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { reportId, data, birthData } = body

    // Validate required fields
    if (!reportId || !data) {
      return NextResponse.json(
        { error: "Missing required fields: reportId, data" },
        { status: 400 }
      )
    }

    // Add updated report versioning metadata
    const reportData = {
      ...data,
      _reportMeta: {
        schema_version: REPORT_SCHEMA_VERSION,
        generated_at: new Date().toISOString(),
        report_birth_date: birthData?.birthDate || null,
        report_birth_time: birthData?.birthTime || null,
        report_birth_city: birthData?.birthCity || null,
        calculation_timestamp: Date.now()
      }
    }

    // Update the report
    const { data: updateData, error } = await supabase
      .from("reports")
      .update({
        data: reportData,
        birth_date: birthData?.birthDate,
        birth_time: birthData?.birthTime,
        birth_city: birthData?.birthCity
      })
      .eq("id", reportId)
      .eq("userId", user.id)
      .select()

    if (error) {
      console.error("[v0] Error updating report:", error)
      return NextResponse.json(
        { error: "Failed to update report: " + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Report updated successfully",
      report: updateData?.[0]
    })

  } catch (error) {
    console.error("[v0] Error in save-report PUT:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

