import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Load all user data in parallel
    const [
      profileResult,
      natalChartResult,
      numerologyResult,
      destinyAnalysesResult,
      horoscopesResult,
      compatibilityResult
    ] = await Promise.all([
      // Profile
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single(),
      
      // Natal chart
      supabase
        .from("natal_charts")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      
      // Numerology profile
      supabase
        .from("numerology_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      
      // All destiny analyses (can have multiple)
      supabase
        .from("destiny_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      
      // All horoscopes
      supabase
        .from("horoscopes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      
      // All compatibility checks
      supabase
        .from("compatibility_checks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    ])

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profileResult.data || null,
      natalChart: natalChartResult.data || null,
      numerology: numerologyResult.data || null,
      destinyAnalyses: destinyAnalysesResult.data || [],
      horoscopes: horoscopesResult.data || [],
      compatibilityChecks: compatibilityResult.data || []
    })

  } catch (error) {
    console.error("Error loading user data:", error)
    return NextResponse.json(
      { error: "Failed to load user data" },
      { status: 500 }
    )
  }
}
