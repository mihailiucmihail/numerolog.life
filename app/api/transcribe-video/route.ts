import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST() {
  try {
    console.log('[v0] Transcriere video numerologie cu Whisper...')

    // Citește fișierul video din public folder
    const videoPath = join(process.cwd(), 'public', 'videos', 'numerologie_analiza.mp4')
    let videoBuffer

    try {
      videoBuffer = readFileSync(videoPath)
      console.log(`[v0] Video citit: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`)
    } catch (err) {
      console.error('[v0] Nu pot citi video din:', videoPath)
      return NextResponse.json(
        { error: 'Video file not found', path: videoPath },
        { status: 404 }
      )
    }

    // Apelează OpenAI Whisper API cu Blob/Buffer
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Crează FormData cu Buffer
    const formData = new FormData()
    const blob = new Blob([videoBuffer], { type: 'video/mp4' })
    formData.append('file', blob, 'numerologie_analiza.mp4')
    formData.append('model', 'whisper-1')
    formData.append('language', 'ro')

    console.log('[v0] Apelează OpenAI Whisper API...')
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[v0] Whisper error:', error)
      return NextResponse.json(
        { error: `Whisper error: ${error}` },
        { status: response.status }
      )
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
