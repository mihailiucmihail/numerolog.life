import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'

export async function POST() {
  try {
    console.log('[v0] Transcriere video numerologie cu Whisper...')

    // Citește fișierul video din public folder
    const videoPath = join(process.cwd(), 'public', 'videos', 'numerologie_analiza.mp4')
    const videoBuffer = readFileSync(videoPath)

    // Apelează OpenAI Whisper API - creează FormData în runtime
    const formData = new FormData()
    const blob = new Blob([videoBuffer], { type: 'video/mp4' })
    formData.append('file', blob, 'numerologie.mp4')
    formData.append('model', 'whisper-1')
    formData.append('language', 'ro')

    // Apelează OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const result = await response.json()
    console.log('[v0] Transcriere completă')

    return NextResponse.json({
      success: true,
      transcription: result.text,
      language: 'ro',
    })
  } catch (error) {
    console.error('[v0] Eroare transcriere:', error)
    return NextResponse.json(
      { error: `Transcriere eșuată: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
