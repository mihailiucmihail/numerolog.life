import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await request.json()
    const { messages, chartContext } = body

    const options: any = {
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: `Tu ești un astrolog profesionist. Cunoști harta natală: ${chartContext}`,
      messages,
      maxTokens: 1000,
    }

    const { text: response } = await generateText(options)

    return NextResponse.json({ response })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
