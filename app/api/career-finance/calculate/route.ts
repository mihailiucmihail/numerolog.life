import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateWithSwissEphemeris } from '@/lib/astrology/astrology-api'
import { calculateAllCareerScores } from '@/lib/career-finance/career-scores'
import { generateCareerFinanceReport, extractSections } from '@/lib/career-finance/report-generator'
import { GenerateCareerReportRequestSchema } from '@/lib/career-finance/schema'
import crypto from 'crypto'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const traceId = `career-${Date.now()}`
  
  try {
    console.log(`[v0] [${traceId}] Career Finance report request started`)
    
    const body = await request.json()
    
    // Validate input
    const validation = GenerateCareerReportRequestSchema.safeParse(body)
    if (!validation.success) {
      console.error(`[v0] [${traceId}] Validation failed:`, validation.error)
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error },
        { status: 400 }
      )
    }

    const { birthDate, birthTime, birthCity, birthCountry } = validation.data
    let latitude = validation.data.latitude || 40.7128 // Default NYC
    let longitude = validation.data.longitude || -74.0060
    let timezone = validation.data.timezone || 0

    const birthName = body.birthName || 'Utilizator'
    const userId = body.userId

    console.log(`[v0] [${traceId}] Calculating natal chart for ${birthName}...`)
    console.log(`[v0] [${traceId}] Birth data: ${birthDate} ${birthTime} @ ${latitude},${longitude}`)
    
    // Calculate natal chart using same proven method as harta-natala
    const natalChart = await calculateWithSwissEphemeris(
      birthDate,
      birthTime,
      latitude,
      longitude,
      timezone
    )

    if (!natalChart || !natalChart.planets || natalChart.planets.length === 0) {
      throw new Error('Failed to calculate natal chart - no planet data returned')
    }

    console.log(`[v0] [${traceId}] Chart calculated successfully with ${natalChart.planets.length} planets`)

    // Extract key data
    const planets = natalChart.planets || []
    const sun = planets.find((p: any) => p.name === 'Sun')
    const moon = planets.find((p: any) => p.name === 'Moon')
    const houses = natalChart.houses || []
    
    // Extract ascendant and midheaven
    const ascendant = natalChart.ascendant || { sign: 'Aries', degree: 0 }
    const midheaven = natalChart.midheaven || { sign: 'Capricorn', degree: 0 }

    console.log(`[v0] [${traceId}] Chart data extracted - Sun: ${sun?.sign} ${sun?.fullDegree}°`)

    // Calculate 8 career scores
    console.log(`[v0] [${traceId}] Calculating career scores...`)
    const scores = calculateAllCareerScores({
      planets,
      houses: houses,
      aspects: natalChart.aspects || [],
    })

    // Generate Career & Finance report
    console.log(`[v0] [${traceId}] Generating Career & Finance report...`)
    const reportText = await generateCareerFinanceReport({
      birthName,
      birthDate,
      birthTime,
      birthCity,
      sunSign: sun?.sign || 'Aries',
      sunDegree: sun?.fullDegree || 0,
      moonSign: moon?.sign || 'Cancer',
      moonDegree: moon?.fullDegree || 0,
      ascendant: ascendant.sign,
      ascendantDegree: ascendant.degree || 0,
      midheaven: midheaven.sign,
      scores,
      chartData: {
        planets,
        houses: houses || [],
        aspects: natalChart.aspects || [],
      },
    })

    const reportSections = extractSections(reportText)

    // Generate a guest token for non-authenticated users so they can view their report
    const guestToken = userId ? null : crypto.randomBytes(32).toString('hex')

    // Prepare report data for database
    const reportData = {
      id: crypto.randomUUID(),
      user_id: userId || null,
      guest_token: guestToken,
      birth_name: birthName,
      birth_date: birthDate,
      birth_time: birthTime,
      birth_city: birthCity,
      birth_country: birthCountry,
      sun_sign: sun?.sign || 'Unknown',
      sun_degree: sun?.fullDegree || 0,
      moon_sign: moon?.sign || 'Unknown',
      moon_degree: moon?.fullDegree || 0,
      ascendant_sign: ascendant.sign,
      ascendant_degree: ascendant.degree || 0,
      midheaven_sign: midheaven.sign,
      midheaven_degree: midheaven.degree || 0,
      scores,
      full_report_sections: reportSections,
      sections: reportSections,
      recommended_fields: ['Technology', 'Business', 'Finance'],
      work_style: {
        optimalEnvironment: 'Dynamic',
        preferredRole: 'Leadership',
        teamOrSolo: 'Team',
      },
      financial_profile: {
        riskTolerance: 'moderate' as const,
        wealthBuilding: 'Balanced growth strategy',
        investmentStyle: 'Diversified portfolio',
      },
      monthly_timeline: [],
      action_plan: {
        month1: [],
        months2to6: [],
        yearLong: [],
      },
      created_at: new Date().toISOString(),
      generation_time: Date.now(),
    }

    // Save to Supabase
    console.log(`[v0] [${traceId}] Saving to Supabase...`)
    const supabase = await createClient()
    
    const { data: savedReport, error: dbError } = await supabase
      .from('career_finance_reports')
      .insert([reportData])
      .select()
      .single()

    if (dbError) {
      console.error(`[v0] [${traceId}] Database error (non-fatal):`, dbError)
      // Fallback: return report without saving if table doesn't exist yet
      // This is temporary - table should exist in production
      console.warn(`[v0] [${traceId}] Returning report without database save (table may not exist)`)
      return NextResponse.json({
        success: true,
        report: {
          id: reportData.id,
          guestToken,
        },
        reportSections,
        traceId,
        dbWarning: 'Report generated but not saved to database',
      })
    }

    console.log(`[v0] [${traceId}] Report saved successfully:`, savedReport.id)

    return NextResponse.json({
      success: true,
      report: {
        id: savedReport.id,
        guestToken,
      },
      reportSections,
      traceId,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[v0] [${traceId}] Error:`, errorMessage)
    
    return NextResponse.json(
      { error: errorMessage, traceId },
      { status: 500 }
    )
  }
}
