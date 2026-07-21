import { NextRequest, NextResponse } from 'next/server'
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface TranslationRequest {
  text: string
  context?: 'dashboard' | 'aspects' | 'events' | 'forecast' | 'general'
}

interface TranslationResponse {
  original: string
  translated: string
  context: string
}

/**
 * POST /api/translate-report
 * Traduce textul raportului astrologic în limba română folosind LLM
 * Menține terminologia astrologică și tonul profesional
 */
export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json()

    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      )
    }

    const context = body.context || 'general'

    // Prompt specific pentru context
    const contextPrompts: Record<string, string> = {
      dashboard:
        'Ești un traducător expert în astrologie. Traduce următorul text din engleză în limba română, păstrând terminologia astrologică precisă și tonul profesional.',
      aspects:
        'Ești un traducător expert în astrologie. Traduce următorul text despre aspecte planetare din engleză în limba română, păstrând precizia terminologiei și tonul poetic dar academic.',
      events:
        'Ești un traducător expert în astrologie. Traduce următorul text despre evenimente din viață din engleză în limba română, menținând profunzimea și inspirația.',
      forecast:
        'Ești un traducător expert în astrologie. Traduce următoarea previziune din engleză în limba română, păstrând tonul optimist și inspirator.',
      general:
        'Ești un traducător expert în astrologie. Traduce următorul text din engleză în limba română, menținând precizia și tonul profesional.',
    }

    const systemPrompt = contextPrompts[context] || contextPrompts.general

    // Apelează LLM pentru traducere folosind cel mai bun model disponibil pentru română
    // Nota: Claude 3.5 Sonnet sau GPT-4o sunt excelente pentru română nativă.
    const { text: translated } = await generateText({
      model: openai("gpt-4o"), // Folosim gpt-4o pentru stabilitate și calitate nativă în română
      system: `${systemPrompt}

REGULI IMPORTANTE:
1. Traduce și ADAPTEAZĂ textul pentru a suna cât mai natural și nativ în limba română.
2. Păstrează structura și formatarea originalului.
3. Folosește terminologia astrologică standard română (ex: "Ascendent", "Conjuncție", "Trigon").
4. Menține tonul profesional, dar adaugă profunzime și nuanță lingvistică.
5. Răspunde DOAR cu textul tradus, fără alte comentarii sau explicații.`,
      prompt: `Tradu și adaptează următorul text astrologic în limba română:\n\n${body.text}`,
      temperature: 0.3,
      maxOutputTokens: 4000,
    })

    return NextResponse.json({
      original: body.text,
      translated: translated.trim(),
      context,
    } as TranslationResponse)
  } catch (error) {
    console.error('[TRANSLATE_REPORT] Error:', error)

    const message = error instanceof Error ? error.message : 'Translation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
