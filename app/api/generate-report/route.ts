import { NextRequest, NextResponse } from "next/server"
import type { BirthChartData, GenerateReportResponse } from "@/lib/types"
import { getSunSign, getMoonSign, getRisingSign, generateReportPrompt } from "@/lib/astrology"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"
import { calculateAllScores } from "@/lib/astrology/score-calculator"

export async function POST(request: NextRequest): Promise<NextResponse<GenerateReportResponse>> {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const birthData: BirthChartData = body.birthData
    const personName = body.personName
    const userId = user.id

    // Validate required fields
    if (!birthData?.birthDate || !birthData?.birthTime || !birthData?.birthCity) {
      return NextResponse.json(
        { success: false, error: "Date de nastere incomplete" },
        { status: 400 }
      )
    }

    // Fetch real natal chart data from database
    const { data: natalChart, error: chartError } = await supabase
      .from("natal_charts")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (!natalChart) {
      return NextResponse.json(
        { success: false, error: "Natal chart data not found. Please recalculate your birth chart." },
        { status: 400 }
      )
    }

    // Calculate astrological scores from REAL birth chart data
    const scores = calculateAllScores({
      planets: natalChart.planetary_positions || [],
      houses: natalChart.houses || [],
      aspects: natalChart.aspects || [],
      midheaven: { sign: natalChart.midheaven_sign, degree: natalChart.midheaven_degree },
      ascendant: { sign: natalChart.ascendant_sign, degree: natalChart.ascendant_degree }
    })

    // Use OpenAI to generate personalized interpretation
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const chartSummary = `
      Birth Chart Data:
      - Sun: ${natalChart.sun_sign} ${natalChart.sun_degree.toFixed(1)}°
      - Moon: ${natalChart.moon_sign} ${natalChart.moon_degree.toFixed(1)}°
      - Ascendant: ${natalChart.ascendant_sign} ${natalChart.ascendant_degree.toFixed(1)}°
      - Midheaven: ${natalChart.midheaven_sign} ${natalChart.midheaven_degree.toFixed(1)}°
      
      Planetary Positions: ${JSON.stringify(natalChart.planetary_positions?.slice(0, 10), null, 2)}
      
      Aspects: ${JSON.stringify(natalChart.aspects?.slice(0, 15), null, 2)}
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `You are an expert astrologer providing deeply personalized astrological readings. 
          You MUST analyze the provided birth chart data and create a unique interpretation that:
          - Uses specific planetary positions, degrees, and aspects from the chart
          - References actual house placements
          - Links all interpretations directly to the real chart data
          - Never uses generic horoscope text
          - Makes it clear this reading is specific to this individual
          - Provides explanations for all scores based on actual chart elements
          Respond in Romanian.`
        },
        { 
          role: "user", 
          content: `Generate a personalized astrological report for ${personName} based on this birth chart:
          
          ${chartSummary}
          
          Create detailed sections for:
          1. Personality Profile (based on Sun, Moon, Rising, and their aspects)
          2. Love & Relationships (based on Venus, Moon, 5th/7th houses, and aspects)
          3. Career & Finance (based on Midheaven, Saturn, Jupiter, 10th/2nd/8th houses)
          4. Spiritual Path (based on Neptune, 12th house, North Node)
          5. 12-Month Forecast (based on upcoming transits)
          
          Make sure each interpretation references specific planetary placements and degrees.
          Include explanations for why certain patterns indicate specific life themes.`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    const aiContent = completion.choices[0]?.message?.content || ""

    const generatedReport = {
      id: `report_${Date.now()}`,
      personName: personName || "Necunoscut",
      birthData,
      sunSign: natalChart.sun_sign,
      moonSign: natalChart.moon_sign,
      risingSign: natalChart.ascendant_sign,
      scores,
      chartData: {
        sun: { sign: natalChart.sun_sign, degree: natalChart.sun_degree },
        moon: { sign: natalChart.moon_sign, degree: natalChart.moon_degree },
        ascendant: { sign: natalChart.ascendant_sign, degree: natalChart.ascendant_degree },
        midheaven: { sign: natalChart.midheaven_sign, degree: natalChart.midheaven_degree },
        planets: natalChart.planetary_positions,
        aspects: natalChart.aspects
      },
      aiInterpretation: aiContent,
      createdAt: new Date(),
      generationTimeMs: Date.now()
    }

    // TODO: In production, uncomment this to use OpenAI
    /*
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Esti un astrolog expert si empatic. Raspunzi intotdeauna in limba romana." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    const aiContent = completion.choices[0]?.message?.content
    */

    // AUTO-SAVE LOGIC START
    try {
      const saveResponse = await fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: personName,
          data: generatedReport,
          userId: userId
        }),
      });
      
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error("Save API failed:", saveResponse.status, errorText);
      } else {
        console.log("Report saved successfully for:", personName);
      }
    } catch (error) {
      console.error("Critical Save Error:", error);
    }
    // AUTO-SAVE LOGIC END

    return NextResponse.json({
      success: true,
      reportId: generatedReport.id,
      report: generatedReport as any
    })

  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { success: false, error: "Eroare la generarea raportului. Incearca din nou." },
      { status: 500 }
    )
  }
}


