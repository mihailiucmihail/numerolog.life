import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createHash, randomBytes } from "crypto"

// Generate a secure random token (32 bytes = 256 bits -> 64 hex chars)
export function generateGuestToken(): string {
  return randomBytes(32).toString("hex")
}

// Hash token using SHA-256 for storage
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

// Create a guest report with secure token
export async function createGuestReport(data: {
  birthName: string
  birthDate: string
  birthTime: string
  birthCity: string
  birthCountry: string
  birthLatitude: number
  birthLongitude: number
  birthTimezone: string
  natalChartData: any
  astrologyApiResponse?: any
  romanianReport?: string
  previewData: any
  sunSign?: string
  sunDegree?: number
  moonSign?: string
  moonDegree?: number
  ascendantSign?: string
  ascendantDegree?: number
  midheavenSign?: string
  midheavenDegree?: number
  dataSource?: string
}) {
  // Guest reports are created by unauthenticated visitors, so we use the
  // service-role admin client to bypass RLS. Access is protected solely by the
  // cryptographically random token (only its SHA-256 hash is stored).
  const supabase = createAdminClient()
  const plainToken = generateGuestToken()
  const tokenHash = hashToken(plainToken)

  // Token expires in 30 days
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const { data: report, error } = await supabase
    .from("guest_reports")
    .insert({
      guest_token_hash: tokenHash,
      token_created_at: new Date().toISOString(),
      token_expires_at: expiresAt.toISOString(),
      birth_name: data.birthName,
      birth_date: data.birthDate,
      birth_time: data.birthTime,
      birth_city: data.birthCity,
      birth_country: data.birthCountry,
      birth_latitude: data.birthLatitude,
      birth_longitude: data.birthLongitude,
      birth_timezone: data.birthTimezone,
      natal_chart_data: data.natalChartData,
      astrologyapi_response: data.astrologyApiResponse,
      romanian_report: data.romanianReport,
      preview_data: data.previewData,
      sun_sign: data.sunSign,
      sun_degree: data.sunDegree,
      moon_sign: data.moonSign,
      moon_degree: data.moonDegree,
      ascendant_sign: data.ascendantSign,
      ascendant_degree: data.ascendantDegree,
      midheaven_sign: data.midheavenSign,
      midheaven_degree: data.midheavenDegree,
      data_source: data.dataSource || "real_api",
    })
    .select()

  if (error) {
    console.error("[v0] [GUEST-REPORT] Error creating guest report:", error.message)
    throw new Error(`Failed to create guest report: ${error.message}`)
  }

  console.log("[v0] [GUEST-REPORT] Guest report created securely")

  return {
    id: report?.[0]?.id,
    guestToken: plainToken, // Return plain token only once to client
    expiresAt: expiresAt.toISOString(),
  }
}

// Get guest report by plain token (server-side only, validates hash).
// Uses the admin client because guests are unauthenticated; the hashed token
// is the authorization mechanism.
export async function getGuestReportByToken(plainToken: string) {
  const supabase = createAdminClient()
  const tokenHash = hashToken(plainToken)

  const { data: report, error } = await supabase
    .from("guest_reports")
    .select("*")
    .eq("guest_token_hash", tokenHash)
    .gt("token_expires_at", new Date().toISOString()) // Check expiration
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] [GUEST-REPORT] Error fetching guest report:", error.message)
    return null
  }

  if (!report) {
    console.warn("[v0] [GUEST-REPORT] Guest report not found or expired")
    return null
  }

  // Increment access count for rate limiting
  const { error: updateError } = await supabase
    .from("guest_reports")
    .update({
      access_count: (report.access_count || 0) + 1,
      last_accessed_at: new Date().toISOString(),
    })
    .eq("id", report.id)

  if (updateError) {
    console.error("[v0] [GUEST-REPORT] Error updating access count:", updateError.message)
  }

  return report
}

// Link guest report to authenticated user
export async function linkGuestReportToUser(
  plainToken: string,
  userId: string
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  // The guest report still has a null user_id at this point, so the update must
  // run with the admin client. The caller (route handler) has already verified
  // the authenticated userId server-side via supabase.auth.getUser().
  const supabase = createAdminClient()

  // Get and validate guest report
  const guestReport = await getGuestReportByToken(plainToken)

  if (!guestReport) {
    return {
      success: false,
      error: "Guest report not found or has expired",
    }
  }

  // Update report to link with user
  const { error: updateError } = await supabase
    .from("guest_reports")
    .update({
      user_id: userId,
      status: "converted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", guestReport.id)

  if (updateError) {
    console.error("[v0] [GUEST-REPORT] Error linking report:", updateError.message)
    return {
      success: false,
      error: updateError.message,
    }
  }

  console.log("[v0] [GUEST-REPORT] Guest report linked to user")

  return {
    success: true,
    reportId: guestReport.id,
  }
}

// Get converted reports for authenticated user (RLS enforced)
export async function getConvertedReports(userId: string) {
  const supabase = await createClient()

  const { data: reports, error } = await supabase
    .from("guest_reports")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "converted")

  if (error) {
    console.error("[v0] [GUEST-REPORT] Error fetching reports:", error.message)
    throw error
  }

  return reports || []
}

// Convert guest report to permanent natal chart
export async function convertGuestReportToNatalChart(
  guestReport: any,
  userId: string
) {
  const supabase = await createClient()

  // Check if chart already exists
  const { data: existingChart } = await supabase
    .from("natal_charts")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (existingChart) {
    console.log("[v0] [GUEST-REPORT] Natal chart already exists for user")
    return { id: existingChart.id, isNew: false }
  }

  // Create new natal chart
  const { data: newChart, error } = await supabase
    .from("natal_charts")
    .insert({
      user_id: userId,
      first_name: guestReport.birth_name?.split(" ")[0] || "",
      last_name: guestReport.birth_name?.split(" ").slice(1).join(" ") || "",
      birth_date: guestReport.birth_date,
      birth_time: guestReport.birth_time,
      birth_city: guestReport.birth_city,
      birth_country: guestReport.birth_country,
      birth_latitude: guestReport.birth_latitude,
      birth_longitude: guestReport.birth_longitude,
      birth_timezone: guestReport.birth_timezone,
      sun_sign: guestReport.sun_sign,
      sun_degree: guestReport.sun_degree,
      moon_sign: guestReport.moon_sign,
      moon_degree: guestReport.moon_degree,
      ascendant_sign: guestReport.ascendant_sign,
      ascendant_degree: guestReport.ascendant_degree,
      midheaven_sign: guestReport.midheaven_sign,
      midheaven_degree: guestReport.midheaven_degree,
      planetary_positions: guestReport.natal_chart_data?.planets || [],
      houses: guestReport.natal_chart_data?.houses || [],
      aspects: guestReport.natal_chart_data?.aspects || [],
      julian_day: guestReport.natal_chart_data?.julianDay,
      sidereal_time: guestReport.natal_chart_data?.siderealTime,
      data_source: guestReport.data_source || "real_api",
    })
    .select()

  if (error) {
    console.error("[v0] [GUEST-REPORT] Error creating natal chart:", error.message)
    throw error
  }

  console.log("[v0] [GUEST-REPORT] Natal chart created from guest report")

  return {
    id: newChart?.[0]?.id,
    isNew: true,
  }
}
