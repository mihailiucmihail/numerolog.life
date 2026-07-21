import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/user/profile
 * Returns current user's profile data including birth information
 * Used by report page to get birth data for auto-generation
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }
    
    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    
    if (profileError) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }
    
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }
    
    // Return profile data
    return NextResponse.json({
      id: profile.id,
      email: user.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      birth_date: profile.birth_date,
      birth_time: profile.birth_time,
      birth_city: profile.birth_city,
      birth_country: profile.birth_country,
      birth_latitude: profile.birth_latitude,
      birth_longitude: profile.birth_longitude,
      birth_timezone: profile.birth_timezone,
      is_premium: profile.is_premium || false
    }, { status: 200 })
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[API] Error fetching profile:", errorMsg)
    
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}
