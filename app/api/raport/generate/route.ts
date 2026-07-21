import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { AstroAIReport, ReportGenerationInput } from '@/lib/astrology/report-types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const input: ReportGenerationInput = await request.json()

    // Validate input
    if (!input.user_profile?.display_name || !input.user_profile?.birth_date) {
      return NextResponse.json(
        { error: 'Missing required user profile fields' },
        { status: 400 }
      )
    }

    if (!input.normalized_astrology || !input.normalized_numerology) {
      return NextResponse.json(
        { error: 'Missing normalized astrology or numerology data' },
        { status: 400 }
      )
    }

    console.log(
      '[v0] Generating AstroAI report for:',
      input.user_profile.display_name
    )

    // Generate report using Claude with structured output
    const reportPrompt = `
Generate a comprehensive astrology and numerology report in Romanian (Română) following this exact JSON structure:

User: ${input.user_profile.display_name}
Birth Date: ${input.user_profile.birth_date}
${input.user_profile.birth_time ? `Birth Time: ${input.user_profile.birth_time}` : ''}
${input.user_profile.birth_place ? `Birth Place: ${input.user_profile.birth_place}` : ''}

ASTROLOGY DATA:
- Sun: ${input.normalized_astrology.sun.sign} ${input.normalized_astrology.sun.degree}°
- Moon: ${input.normalized_astrology.moon.sign} ${input.normalized_astrology.moon.degree}°
- Ascendant: ${input.normalized_astrology.ascendant.sign} ${input.normalized_astrology.ascendant.degree}°
- Midheaven: ${input.normalized_astrology.midheaven.sign} ${input.normalized_astrology.midheaven.degree}°

NUMEROLOGY DATA:
- Life Path: ${input.normalized_numerology.lifePathNumber}
- Expression: ${input.normalized_numerology.expressionNumber}
- Soul: ${input.normalized_numerology.soulNumber}
- Personality: ${input.normalized_numerology.personalityNumber}
- Destiny: ${input.normalized_numerology.destinyNumber}
- Personal Year: ${input.normalized_numerology.personalYear}

Generate a report with:
1. Executive summary (2-3 sentences)
2. 3-4 astrology sections with title, main text, balanced expression, challenge expression, and recommendation
3. 3-4 numerology sections with similar structure
4. 2-3 integrated synthesis sections combining both systems
5. 5-6 practical recommendations by life area
6. 6-8 audio chapters with scripts and estimated duration

Every paragraph MUST include evidence tracking with evidence_ids. Structure must be valid JSON matching the AstroAIReport interface.

Use categories like: personality, career, finance, relationships, transformation, spirituality, destiny.

Return ONLY valid JSON.
`

    const { text: reportJson } = await generateText({
      model: 'gpt-4-turbo',
      prompt: reportPrompt,
      temperature: 0.7,
    })

    let report: AstroAIReport
    try {
      report = JSON.parse(reportJson)
    } catch {
      console.error('[v0] Failed to parse report JSON:', reportJson.substring(0, 200))
      return NextResponse.json(
        { error: 'Failed to generate valid report structure' },
        { status: 500 }
      )
    }

    // Store report in database
    const { data: storedReport, error: insertError } = await supabase
      .from('generated_reports')
      .insert({
        user_id: user.id,
        input_snapshot: input,
        normalized_astrology: input.normalized_astrology,
        normalized_numerology: input.normalized_numerology,
        report_json: report,
        generation_model: 'gpt-4-turbo',
        status: 'completed',
      })
      .select()
      .single()

    if (insertError) {
      console.error('[v0] Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save report' },
        { status: 500 }
      )
    }

    console.log('[v0] Report generated and saved:', storedReport.id)

    return NextResponse.json({
      success: true,
      report_id: storedReport.id,
      report,
    })
  } catch (error) {
    console.error('[v0] Report generation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Report generation failed',
      },
      { status: 500 }
    )
  }
}
