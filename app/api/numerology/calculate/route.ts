import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateNumerologyProfile } from "@/lib/numerology"

/**
 * Parse date in multiple formats (ISO, European DD.MM.YYYY, US MM/DD/YYYY)
 */
function parseDate(dateString: string): Date {
  let date: Date
  
  if (dateString.includes('-')) {
    // ISO format: YYYY-MM-DD
    date = new Date(dateString)
  } else if (dateString.includes('/')) {
    // Format: MM/DD/YYYY or DD/MM/YYYY
    const parts = dateString.split('/')
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      date = new Date(dateString)
    } else if (parts[2].length === 4) {
      // MM/DD/YYYY or DD/MM/YYYY - assume MM/DD/YYYY for US format
      date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
    } else {
      date = new Date(dateString)
    }
  } else if (dateString.includes('.')) {
    // European format: DD.MM.YYYY
    const parts = dateString.split('.')
    if (parts.length === 3 && parts[2].length === 4) {
      date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
    } else {
      date = new Date(dateString)
    }
  } else {
    date = new Date(dateString)
  }
  
  // Fallback if date parsing fails
  if (isNaN(date.getTime())) {
    console.warn(`[v0] Invalid birth date format: ${dateString}. Using today's date.`)
    return new Date()
  }
  
  return date
}

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
    const { fullName, birthDate } = body

    // Validate input
    if (!fullName || !birthDate) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, birthDate" },
        { status: 400 }
      )
    }

    // Calculate the full numerology profile
    const profile = calculateNumerologyProfile(fullName, parseDate(birthDate))

    // Prepare data for storage
    const numerologyData = {
      user_id: user.id,
      full_name: fullName,
      birth_date: birthDate,
      life_path_number: profile.lifePathNumber,
      destiny_number: profile.destinyNumber,
      soul_number: profile.soulNumber,
      personality_number: profile.personalityNumber,
      is_master_life_path: profile.isMasterLifePath,
      is_master_destiny: profile.isMasterDestiny
    }

    // Upsert the numerology profile
    const { data, error } = await supabase
      .from("numerology_profiles")
      .upsert(numerologyData, { onConflict: "user_id" })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to save numerology profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      numerologyProfile: data,
      calculations: {
        lifePathNumber: profile.lifePathNumber,
        destinyNumber: profile.destinyNumber,
        soulNumber: profile.soulNumber,
        personalityNumber: profile.personalityNumber,
        isMasterLifePath: profile.isMasterLifePath,
        isMasterDestiny: profile.isMasterDestiny
      }
    })

  } catch (error) {
    console.error("Error calculating numerology profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the user's numerology profile
    const { data, error } = await supabase
      .from("numerology_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Database error:", error)
      return NextResponse.json(
        { error: "Failed to fetch numerology profile" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "No numerology profile found. Please complete onboarding first." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      numerologyProfile: data
    })

  } catch (error) {
    console.error("Error fetching numerology profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
