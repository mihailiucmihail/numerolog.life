import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"

// Lazy initialize Supabase client
let supabaseClient: SupabaseClient | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return supabaseClient
}

export async function saveNatalChart(data: {
  userId: string
  firstName: string
  lastName: string
  birthDate: string
  birthTime: string
  birthCity: string
  birthCountry: string
  birthLatitude: number
  birthLongitude: number
  birthTimezone: string
  sunSign?: string
  sunDegree?: number
  moonSign?: string
  moonDegree?: number
  ascendantSign?: string
  ascendantDegree?: number
  midheavenSign?: string
  midheavenDegree?: number
  planetaryPositions?: any
  houses?: any
  aspects?: any
  julianDay?: number
  siderealTime?: number
  natalChartData?: any
  astrologyApiResponse?: any
  romanianReport?: string
  dataSource?: string
}) {
  console.log("[v0] [NATAL-CHART] Creating natal chart for user:", data.userId)

  const supabase = getSupabaseClient()

  // Extract sun, moon, ascendant data from astrologyApiResponse if available
  let chartData = data.natalChartData || {}

  const { data: chart, error } = await supabase
    .from("natal_charts")
    .insert({
      user_id: data.userId,
      first_name: data.firstName,
      last_name: data.lastName,
      birth_date: data.birthDate,
      birth_time: data.birthTime,
      birth_city: data.birthCity,
      birth_country: data.birthCountry,
      birth_latitude: data.birthLatitude,
      birth_longitude: data.birthLongitude,
      birth_timezone: data.birthTimezone,
      sun_sign: data.sunSign,
      sun_degree: data.sunDegree,
      moon_sign: data.moonSign,
      moon_degree: data.moonDegree,
      ascendant_sign: data.ascendantSign,
      ascendant_degree: data.ascendantDegree,
      midheaven_sign: data.midheavenSign,
      midheaven_degree: data.midheavenDegree,
      planetary_positions: data.planetaryPositions,
      houses: data.houses,
      aspects: data.aspects,
      julian_day: data.julianDay,
      sidereal_time: data.siderealTime,
      astrologyapi_response: data.astrologyApiResponse,
      romanian_report: data.romanianReport,
      data_source: data.dataSource || "real_api_with_ai_interpretation",
    })
    .select()

  if (error) {
    console.error("[v0] [NATAL-CHART] Error creating natal chart:")
    console.error("[v0] [NATAL-CHART] Error code:", error.code)
    console.error("[v0] [NATAL-CHART] Error message:", error.message)
    console.error("[v0] [NATAL-CHART] Full error:", JSON.stringify(error, null, 2))
    throw new Error(`Supabase insert error: ${error.message}`)
  }

  console.log("[v0] [NATAL-CHART] ✓ Natal chart saved successfully")
  console.log("[v0] [NATAL-CHART] Chart ID:", chart?.[0]?.id)

  return chart?.[0]
}

export async function getNatalChart(userId: string) {
  console.log("[v0] [NATAL-CHART] Fetching natal chart for user:", userId)

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("natal_charts")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    console.error("[v0] [NATAL-CHART] Error fetching natal chart:", error.message)
    return null
  }

  console.log("[v0] [NATAL-CHART] ✓ Natal chart fetched successfully")
  return data
}
