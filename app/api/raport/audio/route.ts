import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for audio generation

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

    const { report_id, chapter_id } = await request.json()

    if (!report_id || !chapter_id) {
      return NextResponse.json(
        { error: 'Missing report_id or chapter_id' },
        { status: 400 }
      )
    }

    // Fetch report to verify ownership
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .select('report_json')
      .eq('id', report_id)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Find the chapter
    const reportJson = report.report_json as any
    const chapter = reportJson.audio_chapters?.find(
      (c: any) => c.chapter_id === chapter_id
    )

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    console.log('[v0] Generating audio for chapter:', chapter_id)

    // Generate audio using OpenAI TTS
    const audioResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: chapter.script,
        voice: 'nova', // Neutral Romanian voice
        speed: 1.0,
      }),
    })

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text()
      console.error('[v0] OpenAI TTS error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: 500 }
      )
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    console.log('[v0] Audio generated:', audioBuffer.byteLength, 'bytes')

    // Return audio as MP3
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="chapter-${chapter_id}.mp3"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('[v0] Audio generation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Audio generation failed',
      },
      { status: 500 }
    )
  }
}
