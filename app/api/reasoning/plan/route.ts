// Reasoning Plan API Route
// POST /api/reasoning/plan - Generate structured reasoning plan from indicators

import { NextRequest, NextResponse } from 'next/server'
import { generateReasoningPlan, ReasoningInput } from '@/lib/reasoning/engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ReasoningInput

    // Validate input
    if (!body.astrologyIndicators || !body.numerologyIndicators || !body.userProfile) {
      return NextResponse.json(
        { error: 'Missing required fields: astrologyIndicators, numerologyIndicators, userProfile' },
        { status: 400 }
      )
    }

    // Generate reasoning plan
    const plan = await generateReasoningPlan(body)

    return NextResponse.json({
      success: true,
      plan,
    })
  } catch (error) {
    console.error('[v0] Reasoning plan generation error:', error)
    return NextResponse.json(
      {
        error: 'Error generating reasoning plan: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Reasoning Plan API - POST with indicators to generate reasoning plan',
    endpoint: '/api/reasoning/plan',
    method: 'POST',
    example: {
      astrologyIndicators: {
        sunSign: 'Taurus',
        moonSign: 'Cancer',
        ascendant: 'Scorpio',
      },
      numerologyIndicators: {
        lifePathNumber: 9,
        expressionNumber: 11,
      },
      userProfile: {
        fullName: 'Full Name',
        birthDate: 'YYYY-MM-DD',
      },
    },
  })
}
