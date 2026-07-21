import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { person1, person2 } = body

    const options: any = {
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: "Ești un astrolog expert în sinastrie. Scrie o analiză de compatibilitate directă și profundă.",
      prompt: `Analizează compatibilitatea dintre ${person1.firstName} și ${person2.firstName}.`,
      maxTokens: 4000,
    }

    const { text: analysis } = await generateText(options)

    return NextResponse.json({ analysis })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
