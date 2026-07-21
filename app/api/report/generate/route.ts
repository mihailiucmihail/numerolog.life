// Report Generation API Route - Main entry point for report generation

import { NextRequest, NextResponse } from 'next/server'
import { generateReport, validateReport } from '@/lib/report/orchestrator'
import { ReportGenerationRequest } from '@/lib/report/types'
import crypto from 'crypto'

export const maxDuration = 300 // 5 minutes for full report generation

export async function POST(request: NextRequest) {
  const traceId = crypto.randomUUID()

  try {
    console.log(`[v0] [${traceId}] Starting report generation request`)

    const body = (await request.json()) as ReportGenerationRequest

    // Validate request
    if (!body.userProfile?.fullName || !body.userProfile?.birthDate) {
      return NextResponse.json(
        { error: 'Full name and birth date required' },
        { status: 400 }
      )
    }

    if (!body.astrologyIndicators || !body.numerologyIndicators) {
      return NextResponse.json(
        { error: 'Astrology and numerology indicators required' },
        { status: 400 }
      )
    }

    console.log(`[v0] [${traceId}] Request validated for ${body.userProfile.fullName}`)

    // Generate report
    const report = await generateReport(body)

    // Validate generated report
    if (!validateReport(report)) {
      throw new Error('Generated report failed validation')
    }

    console.log(`[v0] [${traceId}] Report generated: ${report.metadata.totalWordCount} words`)

    // Attempt to save report to database (optional - continue even if fails)
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
        await supabase.from('generated_reports').insert({
          id: report.id,
          user_id: null,
          input_snapshot: {
            profile: body.userProfile,
            indicators: {
              astrology: body.astrologyIndicators,
              numerology: body.numerologyIndicators,
            },
          },
          report_json: report,
          generation_model: report.metadata.generationModel,
          status: 'completed',
        })
        console.log(`[v0] [${traceId}] Report saved to database`)
      }
    } catch (dbError) {
      console.warn(`[v0] [${traceId}] Database save failed (continuing anyway):`, dbError)
    }

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        wordCount: report.metadata.totalWordCount,
        chapterCount: report.chapters.length,
        generationTimeMs: report.metadata.generationTimeMs,
      },
      chapters: report.chapters,
      metadata: report.metadata,
    })
  } catch (error) {
    console.error(`[v0] [${traceId}] Report generation failed:`, error)

    return NextResponse.json(
      {
        error: 'Report generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        traceId,
      },
      { status: 500 }
    )
  }
}
